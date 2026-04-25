/**
 * Campus Pocket — WhatsApp Notify Edge Function
 *
 * POST /functions/v1/whatsapp-notify
 * Body: {
 *   parent_phone: string,       // e.g. "+919876543210"
 *   student_name: string,
 *   alert_type: "attendance" | "fee" | "exam",
 *   details: object             // e.g. { percentage: 68 } or { term: "Term 2", status: "OVERDUE" }
 * }
 *
 * Flow: Gemini generates message → Twilio sends WhatsApp
 *
 * Deploy: supabase functions deploy whatsapp-notify
 * Secrets: supabase secrets set TWILIO_ACCOUNT_SID=... TWILIO_AUTH_TOKEN=... TWILIO_WHATSAPP_NUMBER=... GEMINI_API_KEY=...
 */

const TWILIO_ACCOUNT_SID     = Deno.env.get('TWILIO_ACCOUNT_SID')!
const TWILIO_AUTH_TOKEN      = Deno.env.get('TWILIO_AUTH_TOKEN')!
const TWILIO_WHATSAPP_NUMBER = Deno.env.get('TWILIO_WHATSAPP_NUMBER') || '+14155238886'
const GEMINI_API_KEY         = Deno.env.get('GEMINI_API_KEY')!

const corsHeaders = {
  'Access-Control-Allow-Origin':  '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

// ── Gemini: generate personalised WhatsApp message ────────────────────────
async function generateMessage(
  studentName: string,
  alertType: string,
  details: Record<string, unknown>
): Promise<string> {
  const prompt =
    `Generate a brief, caring WhatsApp message to a parent about their child ${studentName}. ` +
    `Alert type: ${alertType}. Details: ${JSON.stringify(details)}. ` +
    `Keep it under 100 words. Be warm but urgent if needed. ` +
    `Sign off as Campus Pocket.`

  const models = [
    { name: 'gemini-1.5-flash', version: 'v1' },
    { name: 'gemini-1.5-flash-latest', version: 'v1' },
    { name: 'gemini-2.0-flash-lite', version: 'v1beta' },
  ]

  for (const { name: model, version } of models) {
    try {
      const res = await fetch(
        `https://generativelanguage.googleapis.com/${version}/models/${model}:generateContent?key=${GEMINI_API_KEY}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contents: [{ parts: [{ text: prompt }] }],
            generationConfig: { temperature: 0.7, maxOutputTokens: 200 },
          }),
        }
      )
      const data = await res.json()
      if (data.error) { console.warn(`[Gemini] ${model} error:`, JSON.stringify(data.error)); continue }
      const text = data.candidates?.[0]?.content?.parts?.[0]?.text
      if (text) { console.log(`[Gemini] ${model} success`); return text.trim() }
      console.warn(`[Gemini] ${model} no text:`, JSON.stringify(data))
    } catch (e) {
      console.error(`[Gemini] ${model} error:`, e)
    }
  }

  // Fallback message if Gemini fails
  return fallbackMessage(studentName, alertType, details)
}

function fallbackMessage(
  studentName: string,
  alertType: string,
  details: Record<string, unknown>
): string {
  if (alertType === 'attendance') {
    return `Dear Parent, this is a gentle reminder that ${studentName}'s attendance has dropped to ${details.percentage}%, which is below the required 75%. Please ensure regular attendance. We're here to help if needed. — Campus Pocket`
  }
  if (alertType === 'fee') {
    return `Dear Parent, ${studentName}'s ${details.term} fee (₹${details.amount}) is currently ${details.status}. Please clear the dues at your earliest convenience to avoid any inconvenience. — Campus Pocket`
  }
  if (alertType === 'exam') {
    return `Dear Parent, ${studentName} has an upcoming ${details.subject} exam on ${details.date}. Please ensure they are well-prepared. Wishing them all the best! — Campus Pocket`
  }
  return `Dear Parent, this is an important update regarding ${studentName} from Campus Pocket. Please log in to the portal for details.`
}

// ── Twilio: send WhatsApp message ─────────────────────────────────────────
async function sendWhatsApp(to: string, body: string): Promise<{ sid: string }> {
  const credentials = btoa(`${TWILIO_ACCOUNT_SID}:${TWILIO_AUTH_TOKEN}`)
  const fromNumber  = `whatsapp:${TWILIO_WHATSAPP_NUMBER}`
  const toNumber    = `whatsapp:${to}`

  const params = new URLSearchParams()
  params.append('From', fromNumber)
  params.append('To',   toNumber)
  params.append('Body', body)

  const res = await fetch(
    `https://api.twilio.com/2010-04-01/Accounts/${TWILIO_ACCOUNT_SID}/Messages.json`,
    {
      method:  'POST',
      headers: {
        'Authorization': `Basic ${credentials}`,
        'Content-Type':  'application/x-www-form-urlencoded',
      },
      body: params.toString(),
    }
  )

  const data = await res.json()
  if (!res.ok) {
    throw new Error(data.message || `Twilio error ${res.status}`)
  }
  return { sid: data.sid }
}

// ── Main handler ──────────────────────────────────────────────────────────
Deno.serve(async (req) => {
  // CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  if (req.method !== 'POST') {
    return new Response('Method not allowed', { status: 405, headers: corsHeaders })
  }

  try {
    const { parent_phone, student_name, alert_type, details } = await req.json()

    // Validate required fields
    if (!parent_phone || !student_name || !alert_type) {
      return new Response(
        JSON.stringify({ error: 'Missing required fields: parent_phone, student_name, alert_type' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Validate alert_type
    if (!['attendance', 'fee', 'exam'].includes(alert_type)) {
      return new Response(
        JSON.stringify({ error: 'alert_type must be one of: attendance, fee, exam' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    console.log(`[whatsapp-notify] Sending ${alert_type} alert for ${student_name} to ${parent_phone}`)

    // Step 1: Generate message with Gemini
    const message = await generateMessage(student_name, alert_type, details || {})
    console.log(`[whatsapp-notify] Generated message: ${message.slice(0, 80)}...`)

    // Step 2: Send via Twilio
    const { sid } = await sendWhatsApp(parent_phone, message)
    console.log(`[whatsapp-notify] Sent! Twilio SID: ${sid}`)

    return new Response(
      JSON.stringify({ success: true, sid, message }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )

  } catch (err) {
    console.error('[whatsapp-notify] Error:', err)
    return new Response(
      JSON.stringify({ error: err instanceof Error ? err.message : 'Unknown error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})
