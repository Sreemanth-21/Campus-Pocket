const GEMINI_API_KEY = import.meta.env.VITE_GEMINI_API_KEY

async function callGemini(prompt) {
  if (!GEMINI_API_KEY || GEMINI_API_KEY === 'your_gemini_api_key') return null

  const models = ['gemini-1.5-flash', 'gemini-2.0-flash', 'gemini-1.5-pro']
  for (const model of models) {
    try {
      const res = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${GEMINI_API_KEY}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contents: [{ parts: [{ text: prompt }] }],
            generationConfig: { temperature: 0.4, maxOutputTokens: 1500 },
          }),
        }
      )
      const data = await res.json()
      if (data.error) { console.warn(`[Gemini] ${model}:`, data.error.message); continue }
      const text = data.candidates?.[0]?.content?.parts?.[0]?.text
      if (text) return text
    } catch (e) { console.error(`[Gemini] ${model} fetch error:`, e) }
  }
  return null
}

// ── AI INSIGHTS ──────────────────────────────────────────────
export async function getAIInsights(studentData) {
  const prompt = `Analyze this student's academic and attendance data and return structured insights in JSON format.
Student: ${studentData.name}, Class: ${studentData.class}
Attendance: ${studentData.attendance_percentage}%
Grades: ${JSON.stringify(studentData.grades)}
Return JSON with: { "strengths": [], "weaknesses": [], "recommendations": [], "overall_score": 0, "summary": "" }`

  const text = await callGemini(prompt)
  if (text) {
    const match = text.match(/\{[\s\S]*\}/)
    if (match) { try { return JSON.parse(match[0]) } catch {} }
  }
  return getMockInsights(studentData)
}

function getMockInsights(studentData) {
  const att = studentData.attendance_percentage
  const grades = studentData.grades || []
  const avgScore = grades.length ? Math.round(grades.reduce((s, g) => s + g.score, 0) / grades.length) : 75
  const strengths = [], weaknesses = [], recommendations = []
  if (att >= 90) strengths.push('Excellent attendance record')
  else if (att >= 75) strengths.push('Satisfactory attendance')
  else weaknesses.push(`Low attendance at ${att}% — below the 75% threshold`)
  const subjectScores = {}
  grades.forEach(g => { if (!subjectScores[g.subject]) subjectScores[g.subject] = []; subjectScores[g.subject].push(g.score) })
  Object.entries(subjectScores).forEach(([subject, scores]) => {
    const avg = Math.round(scores.reduce((a, b) => a + b, 0) / scores.length)
    if (avg >= 85) strengths.push(`Strong performance in ${subject} (avg ${avg}%)`)
    else if (avg < 70) weaknesses.push(`Needs improvement in ${subject} (avg ${avg}%)`)
  })
  if (avgScore >= 85) strengths.push('Consistently high academic performance')
  if (avgScore < 70) recommendations.push('Consider extra tutoring sessions for weaker subjects')
  if (att < 75) recommendations.push('Prioritize attendance — aim for at least 85%')
  recommendations.push('Review past exam papers to identify recurring weak areas')
  recommendations.push('Set weekly study goals and track progress with a planner')
  if (strengths.length === 0) strengths.push('Shows potential for improvement with consistent effort')
  return {
    strengths: strengths.slice(0, 3), weaknesses: weaknesses.slice(0, 3),
    recommendations: recommendations.slice(0, 3),
    overall_score: Math.round(avgScore * 0.6 + att * 0.4),
    summary: `${studentData.name} has an average score of ${avgScore}% with ${att}% attendance.`,
  }
}

// ── STUDY MATERIAL GENERATOR ─────────────────────────────────
export async function generateStudyMaterial(subject, chapter, chapterContent) {
  const prompt = `You are a Class 10 tutor. Generate structured study material for the following chapter.
Subject: ${subject}, Chapter: ${chapter}
Chapter Content: ${chapterContent}
Return a JSON object with exactly:
{
  "summary": "2-3 paragraph summary",
  "keyPoints": ["point1","point2","point3","point4","point5"],
  "importantQuestions": [{"q":"question","a":"answer"},{"q":"question","a":"answer"},{"q":"question","a":"answer"}],
  "shortNotes": "concise notes under 150 words"
}`

  const text = await callGemini(prompt)
  if (text) {
    const match = text.match(/\{[\s\S]*\}/)
    if (match) { try { return JSON.parse(match[0]) } catch {} }
  }
  return localStudyMaterial(subject, chapter, chapterContent)
}

// ── DOUBT SOLVER ─────────────────────────────────────────────
export async function solveDoubt(subject, chapter, chapterContent, question) {
  const prompt = `You are a Class 10 tutor. Answer ONLY from the chapter "${chapter}" in ${subject}.
Do NOT include information outside this chapter. Be clear and simple for a Class 10 student.
Chapter Content: ${chapterContent}
Student Question: ${question}
Answer:`

  const text = await callGemini(prompt)
  if (text) return text.trim()
  return localDoubtAnswer(subject, chapter, chapterContent, question)
}

// ── LOCAL DOUBT ENGINE — reads chapter content directly ──────
function localDoubtAnswer(subject, chapter, chapterContent, question) {
  const q = question.toLowerCase().trim()
  const sentences = chapterContent
    .split(/(?<=[.!?])\s+/)
    .map(s => s.trim())
    .filter(s => s.length > 20)

  // Score sentences by keyword overlap with question
  const stopWords = new Set(['what','when','where','which','does','this','that','with','from',
    'have','will','your','about','explain','define','give','tell','how','why','the','and','for'])
  const qWords = q.replace(/[^a-z0-9 ]/g, '').split(' ')
    .filter(w => w.length > 3 && !stopWords.has(w))

  const scored = sentences
    .map(s => ({ s, score: qWords.reduce((acc, w) => acc + (s.toLowerCase().includes(w) ? 1 : 0), 0) }))
    .sort((a, b) => b.score - a.score)

  const topSentences = scored.filter(x => x.score > 0).slice(0, 4).map(x => x.s)

  // Off-topic question
  if (topSentences.length === 0) {
    return `This question doesn't appear to be directly covered in "${chapter}" (${subject}).\n\n` +
      `This chapter mainly covers:\n${sentences.slice(0, 3).map(s => '• ' + s).join('\n')}\n\n` +
      `Please ask a question related to these topics.`
  }

  const body = topSentences.join(' ')

  // Format by question type
  if (/^(what is|what are|define|meaning of)/i.test(q)) {
    return `📖 From "${chapter}" — ${subject}\n\n${body}\n\n💡 This is a key definition to remember for your exams.`
  }
  if (/^how|calculate|find|solve|steps/i.test(q)) {
    return `🔢 Method from "${chapter}"\n\n${body}\n\n📝 Key steps:\n` +
      topSentences.slice(0, 3).map((s, i) => `${i + 1}. ${s}`).join('\n')
  }
  if (/^why|reason|because/i.test(q)) {
    return `🤔 Reason — "${chapter}"\n\n${body}\n\n✅ Understanding the reason helps you apply this in problems.`
  }
  if (/difference|compare|vs|versus/i.test(q)) {
    return `⚖️ Comparison from "${chapter}"\n\n${topSentences.join('\n\n')}\n\n📌 Both concepts are important for exams.`
  }
  if (/example|instance|illustrate/i.test(q)) {
    return `📌 Example from "${chapter}"\n\n${body}\n\n💡 Practice similar examples from your textbook exercises.`
  }

  return `📚 "${chapter}" — ${subject}\n\n${body}\n\n🎯 Revise this concept before your exam!`
}

// ── AI TIMETABLE GENERATOR ───────────────────────────────────
/**
 * Generates a weekly class timetable using Gemini AI.
 *
 * @param {import('../pages/admin/AdminTimetableGenerator').ClassConfig} config
 * @param {import('../pages/admin/AdminTimetableGenerator').SubjectRow[]} subjects
 * @returns {Promise<import('../pages/admin/AdminTimetableGenerator').WeeklySchedule | null>}
 */
export async function generateClassTimetable(config, subjects) {
  const { className, periodsPerDay, days, startTime, periodDuration } = config

  // Determine lunch period: period 4, or middle period when periodsPerDay !== 6
  const lunchPeriod = periodsPerDay <= 2 ? periodsPerDay : Math.ceil(periodsPerDay / 2)

  const subjectList = subjects
    .map(s => `  - ${s.subject} (Teacher: ${s.teacher}, ${s.periodsPerWeek} periods/week)`)
    .join('\n')

  const prompt = `You are a school timetable scheduler. Generate a complete weekly timetable as a JSON object.

Class: ${className}
Periods per day: ${periodsPerDay}
Active days: ${days.join(', ')}
Start time: ${startTime}
Period duration: ${periodDuration} minutes
Subjects:
${subjectList}

Rules:
1. No subject repeats more than twice per day.
2. Insert a LUNCH break at period ${lunchPeriod} on every day with subject "Lunch" and teacher "—".
3. Distribute subjects evenly across the week, matching each subject's periods/week count exactly.
4. Calculate each period's time slot from the start time and period duration (e.g. if start is 08:00 and duration is 60 min, period 1 is "08:00–09:00", period 2 is "09:00–10:00", etc.).
5. Return ONLY valid JSON — no markdown, no explanation, no code fences.

Required JSON format:
{
  "Monday": [
    { "period": 1, "time": "08:00–09:00", "subject": "Mathematics", "teacher": "Mr. Smith" },
    { "period": 2, "time": "09:00–10:00", "subject": "Science", "teacher": "Ms. Jones" }
  ],
  "Tuesday": [ ... ]
}`

  // Call Gemini with a higher token budget to fit a full weekly schedule
  if (!GEMINI_API_KEY || GEMINI_API_KEY === 'your_gemini_api_key') return null

  const models = ['gemini-1.5-flash', 'gemini-2.0-flash', 'gemini-1.5-pro']
  let rawText = null

  for (const model of models) {
    try {
      const res = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${GEMINI_API_KEY}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contents: [{ parts: [{ text: prompt }] }],
            generationConfig: { temperature: 0.4, maxOutputTokens: 2500 },
          }),
        }
      )
      const data = await res.json()
      if (data.error) { console.warn(`[Gemini/timetable] ${model}:`, data.error.message); continue }
      const text = data.candidates?.[0]?.content?.parts?.[0]?.text
      if (text) { rawText = text; break }
    } catch (e) {
      console.error(`[Gemini/timetable] ${model} fetch error:`, e)
    }
  }

  if (!rawText) return null

  // Extract JSON — handle plain JSON or markdown code fences (```json ... ```)
  const match = rawText.match(/```(?:json)?\s*([\s\S]*?)```/) || rawText.match(/(\{[\s\S]*\})/)
  if (!match) {
    console.error('[Gemini/timetable] No JSON found in response:', rawText.slice(0, 200))
    return null
  }

  try {
    const parsed = JSON.parse(match[1] ?? match[0])
    return parsed
  } catch (e) {
    console.error('[Gemini/timetable] JSON parse error:', e)
    return null
  }
}

// ── LOCAL STUDY MATERIAL ENGINE ──────────────────────────────
function localStudyMaterial(subject, chapter, content) {
  const sentences = content.split(/(?<=[.!?])\s+/).map(s => s.trim()).filter(s => s.length > 15)

  // Summary: intro + middle + conclusion
  const summary = [
    sentences.slice(0, 2).join(' '),
    sentences.slice(Math.floor(sentences.length / 2), Math.floor(sentences.length / 2) + 2).join(' '),
    sentences.slice(-2).join(' '),
  ].filter(Boolean).join('\n\n')

  // Key points: sentences with formulas, numbers, or definitions
  const formulaSentences = sentences.filter(s =>
    /[=+\-×÷√%]|formula|theorem|law|rule|type|method|\d+/i.test(s)
  ).slice(0, 5)
  const keyPoints = formulaSentences.length >= 3
    ? formulaSentences
    : sentences.filter((_, i) => i % Math.max(1, Math.floor(sentences.length / 5)) === 0).slice(0, 5)

  // Q&A from content
  const importantQuestions = [
    {
      q: `What is the main concept of "${chapter}"? Explain briefly.`,
      a: sentences.slice(0, 2).join(' ')
    },
    {
      q: `What are the key types or classifications in "${chapter}"?`,
      a: sentences.find(s => /type|kind|class|categor|form/i.test(s)) || sentences[Math.floor(sentences.length / 3)]
    },
    {
      q: `State an important formula, theorem, or rule from "${chapter}".`,
      a: sentences.find(s => /formula|theorem|law|rule|equation|=/.test(s)) || sentences[Math.floor(sentences.length / 2)]
    },
    {
      q: `Why is "${chapter}" important? Give a real-life application.`,
      a: sentences.find(s => /application|use|example|real|practical/i.test(s)) || sentences[sentences.length - 2]
    },
  ]

  // Key terms
  const keyTerms = [...new Set(content.match(/[A-Z][a-z]+(?:\s[A-Z][a-z]+)*/g) || [])]
    .filter(t => t.length > 4).slice(0, 8)

  const shortNotes =
    `📌 ${chapter} — Quick Revision\n\n` +
    sentences.filter(s => s.length > 30 && s.length < 200).slice(0, 6).map(s => `• ${s}`).join('\n') +
    (keyTerms.length ? `\n\n🔑 Key Terms: ${keyTerms.join(', ')}` : '')

  return { summary, keyPoints, importantQuestions, shortNotes }
}

