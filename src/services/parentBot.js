/**
 * Parent Bot — answers natural language queries about children
 * Uses Gemini API when available, falls back to local NLP engine
 */

const GEMINI_API_KEY = import.meta.env.VITE_GEMINI_API_KEY

// ── Build rich context string from child data ─────────────────
export function buildChildContext(children, childData, attendance, grades, fees, exams) {
  const lines = []

  children.forEach(child => {
    const att   = attendance[child.id] || []
    const gr    = grades[child.id]    || []
    const fe    = fees[child.id]      || []
    const ex    = exams[child.id]     || []
    const cd    = childData[child.id] || {}

    const present  = att.filter(a => a.status === 'present').length
    const absent   = att.filter(a => a.status === 'absent').length
    const late     = att.filter(a => a.status === 'late').length
    const total    = att.length
    const attPct   = total ? Math.round(((present + late) / total) * 100) : child.attendance_percentage

    const avgGrade = gr.length ? Math.round(gr.reduce((s, g) => s + g.score, 0) / gr.length) : 0

    const subjectMap = {}
    gr.forEach(g => {
      if (!subjectMap[g.subject]) subjectMap[g.subject] = []
      subjectMap[g.subject].push(g.score)
    })
    const subjectAvgs = Object.entries(subjectMap).map(([sub, scores]) => ({
      subject: sub,
      avg: Math.round(scores.reduce((a, b) => a + b, 0) / scores.length),
    }))

    const paidFees    = fe.filter(f => f.status === 'PAID')
    const pendingFees = fe.filter(f => f.status === 'PENDING')
    const overdueFees = fe.filter(f => f.status === 'OVERDUE')

    const completedExams = ex.filter(e => e.score !== null)
    const upcomingExams  = ex.filter(e => e.score === null && new Date(e.date) >= new Date())
    const missedExams    = ex.filter(e => e.score === null && new Date(e.date) < new Date())

    lines.push(`
STUDENT: ${child.name}
- Class: ${child.class}, Section: ${child.section}
- Admission Number: ${child.admission_number || 'N/A'}
- Gender: ${child.gender || 'N/A'}
- Guardian: ${child.guardian_name || 'N/A'}
- Contact: ${child.contact || 'N/A'}

ATTENDANCE (${child.name}):
- Total school days recorded: ${total}
- Present: ${present} days
- Absent: ${absent} days
- Late: ${late} days
- Attendance percentage: ${attPct}%
- Status: ${attPct >= 85 ? 'GOOD' : attPct >= 75 ? 'WARNING' : 'CRITICAL - below 75%'}

GRADES (${child.name}):
- Overall average: ${avgGrade}%
- Subject-wise averages: ${subjectAvgs.map(s => `${s.subject}: ${s.avg}%`).join(', ') || 'No data'}
- Total assessments: ${gr.length}

FEES (${child.name}):
- Paid terms: ${paidFees.map(f => f.term).join(', ') || 'None'}
- Pending terms: ${pendingFees.map(f => f.term).join(', ') || 'None'}
- Overdue terms: ${overdueFees.map(f => f.term).join(', ') || 'None'}
- Total paid: ₹${paidFees.reduce((s, f) => s + f.amount, 0).toLocaleString()}
- Total due: ₹${[...pendingFees, ...overdueFees].reduce((s, f) => s + f.amount, 0).toLocaleString()}

EXAMS (${child.name}):
- Completed exams: ${completedExams.length} (avg score: ${completedExams.length ? Math.round(completedExams.reduce((s, e) => s + e.score, 0) / completedExams.length) : 0}%)
- Upcoming exams: ${upcomingExams.length} (${upcomingExams.map(e => `${e.subject} on ${e.date}`).join(', ') || 'none'})
- Missed/skipped exams: ${missedExams.length} (${missedExams.map(e => e.subject).join(', ') || 'none'})
`)
  })

  return lines.join('\n---\n')
}

// ── Call Gemini API ───────────────────────────────────────────
async function callGemini(systemPrompt, userMessage) {
  if (!GEMINI_API_KEY || GEMINI_API_KEY === 'your_gemini_api_key') return null

  const models = ['gemini-1.5-flash', 'gemini-2.0-flash']
  for (const model of models) {
    try {
      const res = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${GEMINI_API_KEY}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contents: [
              { role: 'user', parts: [{ text: systemPrompt }] },
              { role: 'model', parts: [{ text: 'Understood. I am ready to answer questions about your children.' }] },
              { role: 'user', parts: [{ text: userMessage }] },
            ],
            generationConfig: { temperature: 0.3, maxOutputTokens: 600 },
          }),
        }
      )
      const data = await res.json()
      if (data.error) { console.warn('[Bot Gemini]', data.error.message); continue }
      const text = data.candidates?.[0]?.content?.parts?.[0]?.text
      if (text) return text.trim()
    } catch (e) { console.error('[Bot Gemini]', e) }
  }
  return null
}

// ── Local NLP engine ─────────────────────────────────────────
function localAnswer(question, children, childData, attendance, grades, fees, exams) {
  const q = question.toLowerCase()

  // Identify which child is being asked about
  let targetChild = children[0] // default to first child
  children.forEach(child => {
    if (q.includes(child.name.toLowerCase().split(' ')[0].toLowerCase())) {
      targetChild = child
    }
  })

  const childName = targetChild?.name?.split(' ')[0] || 'your child'
  const att   = attendance[targetChild?.id] || []
  const gr    = grades[targetChild?.id]    || []
  const fe    = fees[targetChild?.id]      || []
  const ex    = exams[targetChild?.id]     || []

  const present  = att.filter(a => a.status === 'present').length
  const absent   = att.filter(a => a.status === 'absent').length
  const late     = att.filter(a => a.status === 'late').length
  const total    = att.length
  const attPct   = total ? Math.round(((present + late) / total) * 100) : targetChild?.attendance_percentage || 0

  const avgGrade = gr.length ? Math.round(gr.reduce((s, g) => s + g.score, 0) / gr.length) : 0

  const subjectMap = {}
  gr.forEach(g => {
    if (!subjectMap[g.subject]) subjectMap[g.subject] = []
    subjectMap[g.subject].push(g.score)
  })

  const completedExams = ex.filter(e => e.score !== null)
  const upcomingExams  = ex.filter(e => e.score === null && new Date(e.date) >= new Date())
  const missedExams    = ex.filter(e => e.score === null && new Date(e.date) < new Date())

  const paidFees    = fe.filter(f => f.status === 'PAID')
  const pendingFees = fe.filter(f => f.status === 'PENDING')
  const overdueFees = fe.filter(f => f.status === 'OVERDUE')

  // ── ATTENDANCE queries ──
  if (q.match(/absent|skip|miss|bunk|not attend|days missed/)) {
    if (q.match(/exam|test/)) {
      return `📝 **${childName}'s Missed Exams**\n\n${childName} has missed **${missedExams.length}** exam${missedExams.length !== 1 ? 's' : ''}${missedExams.length > 0 ? ':\n' + missedExams.map(e => `• ${e.subject} (${new Date(e.date).toLocaleDateString()})`).join('\n') : '.'}`
    }
    return `📅 **${childName}'s Absences**\n\n${childName} has been absent for **${absent} days** out of ${total} school days recorded.\n\n• Present: ${present} days\n• Late: ${late} days\n• Absent: ${absent} days\n• Attendance rate: **${attPct}%**\n\n${attPct < 75 ? '⚠️ Attendance is below 75% — this may affect eligibility for exams.' : attPct < 85 ? '⚠️ Attendance is in the warning zone. Try to improve.' : '✅ Attendance is good!'}`
  }

  if (q.match(/attend|present|school|come to/)) {
    return `📅 **${childName}'s Attendance**\n\n• Attendance rate: **${attPct}%**\n• Present: ${present} days\n• Absent: ${absent} days\n• Late: ${late} days\n• Total days: ${total}\n\n${attPct >= 85 ? '✅ Excellent attendance!' : attPct >= 75 ? '⚠️ Attendance is satisfactory but could be better.' : '🔴 Attendance is critically low. Please ensure regular attendance.'}`
  }

  // ── GRADE queries ──
  if (q.match(/grade|mark|score|perform|result|subject|math|science|english|history|physics|chemistry/)) {
    // Specific subject
    const subjectMatch = Object.keys(subjectMap).find(s => q.includes(s.toLowerCase()))
    if (subjectMatch) {
      const scores = subjectMap[subjectMatch]
      const subAvg = Math.round(scores.reduce((a, b) => a + b, 0) / scores.length)
      return `📊 **${childName}'s ${subjectMatch} Performance**\n\n• Average score: **${subAvg}%**\n• Assessments: ${scores.length}\n• Scores: ${scores.join('%, ')}%\n\n${subAvg >= 85 ? '🌟 Excellent performance!' : subAvg >= 70 ? '👍 Good performance.' : subAvg >= 55 ? '📚 Average — needs more practice.' : '⚠️ Needs significant improvement in this subject.'}`
    }
    // Best/worst subject
    if (q.match(/best|top|strong|highest/)) {
      const best = Object.entries(subjectMap).map(([s, sc]) => ({ s, avg: Math.round(sc.reduce((a,b)=>a+b,0)/sc.length) })).sort((a,b)=>b.avg-a.avg)[0]
      return `🏆 **${childName}'s Best Subject**\n\n${childName} performs best in **${best?.s}** with an average of **${best?.avg}%**.`
    }
    if (q.match(/weak|worst|low|poor|struggle/)) {
      const worst = Object.entries(subjectMap).map(([s, sc]) => ({ s, avg: Math.round(sc.reduce((a,b)=>a+b,0)/sc.length) })).sort((a,b)=>a.avg-b.avg)[0]
      return `📉 **${childName}'s Weakest Subject**\n\n${childName} needs improvement in **${worst?.s}** with an average of **${worst?.avg}%**.\n\nConsider extra tutoring or practice sessions.`
    }
    // Overall
    const subjectLines = Object.entries(subjectMap).map(([s, sc]) => `• ${s}: **${Math.round(sc.reduce((a,b)=>a+b,0)/sc.length)}%**`).join('\n')
    return `📊 **${childName}'s Academic Performance**\n\n• Overall average: **${avgGrade}%**\n\nSubject-wise:\n${subjectLines}\n\n${avgGrade >= 85 ? '🌟 Outstanding performance!' : avgGrade >= 70 ? '👍 Good overall performance.' : '📚 Needs improvement in some areas.'}`
  }

  // ── EXAM queries ──
  if (q.match(/exam|test|upcoming|schedule/)) {
    if (q.match(/upcoming|next|schedule|when/)) {
      if (upcomingExams.length === 0) return `📝 **Upcoming Exams**\n\n${childName} has no upcoming exams scheduled right now.`
      return `📝 **${childName}'s Upcoming Exams**\n\n${upcomingExams.map(e => `• **${e.subject}** — ${new Date(e.date).toLocaleDateString('en-US', { weekday:'long', month:'long', day:'numeric' })}`).join('\n')}\n\nMake sure ${childName} is well prepared!`
    }
    if (q.match(/miss|skip|absent|not appear/)) {
      return `📝 **${childName}'s Missed Exams**\n\n${missedExams.length === 0 ? `${childName} has not missed any exams. ✅` : `${childName} has missed **${missedExams.length}** exam${missedExams.length !== 1 ? 's' : ''}:\n${missedExams.map(e => `• ${e.subject} (${new Date(e.date).toLocaleDateString()})`).join('\n')}`}`
    }
    if (q.match(/result|score|how did|performance/)) {
      if (completedExams.length === 0) return `📝 No exam results available for ${childName} yet.`
      const examAvg = Math.round(completedExams.reduce((s, e) => s + e.score, 0) / completedExams.length)
      return `📝 **${childName}'s Exam Results**\n\n• Average exam score: **${examAvg}%**\n\n${completedExams.map(e => `• ${e.subject}: **${e.score}%**`).join('\n')}`
    }
    return `📝 **${childName}'s Exam Summary**\n\n• Completed: ${completedExams.length} exams\n• Upcoming: ${upcomingExams.length} exams\n• Missed: ${missedExams.length} exams\n• Exam average: ${completedExams.length ? Math.round(completedExams.reduce((s,e)=>s+e.score,0)/completedExams.length) : 0}%`
  }

  // ── FEE queries ──
  if (q.match(/fee|pay|due|pending|overdue|amount|money|paid/)) {
    if (q.match(/overdue|late|unpaid/)) {
      if (overdueFees.length === 0) return `💰 No overdue fees for ${childName}. ✅`
      return `⚠️ **${childName}'s Overdue Fees**\n\n${overdueFees.map(f => `• ${f.term}: ₹${f.amount.toLocaleString()}`).join('\n')}\n\n**Total overdue: ₹${overdueFees.reduce((s,f)=>s+f.amount,0).toLocaleString()}**\n\nPlease clear these to avoid penalties.`
    }
    if (q.match(/pending/)) {
      if (pendingFees.length === 0) return `💰 No pending fees for ${childName}. ✅`
      return `💰 **${childName}'s Pending Fees**\n\n${pendingFees.map(f => `• ${f.term}: ₹${f.amount.toLocaleString()}`).join('\n')}\n\n**Total pending: ₹${pendingFees.reduce((s,f)=>s+f.amount,0).toLocaleString()}**`
    }
    const totalDue = [...pendingFees, ...overdueFees].reduce((s,f)=>s+f.amount,0)
    return `💰 **${childName}'s Fee Status**\n\n• Paid: ${paidFees.length} term${paidFees.length!==1?'s':''} (₹${paidFees.reduce((s,f)=>s+f.amount,0).toLocaleString()})\n• Pending: ${pendingFees.length} term${pendingFees.length!==1?'s':''}\n• Overdue: ${overdueFees.length} term${overdueFees.length!==1?'s':''}\n• Total due: **₹${totalDue.toLocaleString()}**\n\n${totalDue > 0 ? '⚠️ Please clear pending dues.' : '✅ All fees are paid!'}`
  }

  // ── CHILDREN list ──
  if (q.match(/how many child|my child|my kid|my son|my daughter|children/)) {
    return `👨‍👩‍👧 **Your Children**\n\n${children.map(c => `• **${c.name}** — Class ${c.class}${c.section}, Attendance: ${c.attendance_percentage}%`).join('\n')}\n\nYou have **${children.length}** child${children.length !== 1 ? 'ren' : ''} linked to your account.`
  }

  // ── SUMMARY / OVERVIEW ──
  if (q.match(/summary|overview|overall|how is|doing|progress|report/)) {
    return `📋 **${childName}'s Overall Summary**\n\n📅 **Attendance:** ${attPct}% (${absent} absences)\n📊 **Avg Grade:** ${avgGrade}%\n📝 **Exams:** ${completedExams.length} completed, ${upcomingExams.length} upcoming\n💰 **Fees:** ${overdueFees.length > 0 ? `${overdueFees.length} overdue` : pendingFees.length > 0 ? `${pendingFees.length} pending` : 'All paid ✅'}\n\n${attPct < 75 ? '⚠️ Attendance needs urgent attention.' : avgGrade < 60 ? '📚 Academic performance needs improvement.' : '✅ Overall doing well!'}`
  }

  // ── HELP ──
  if (q.match(/help|what can|what do|how to|guide/)) {
    return `👋 **I can answer questions like:**\n\n• "How many days did Alex miss school?"\n• "What is Priya's attendance percentage?"\n• "How did Alex perform in Mathematics?"\n• "Are there any upcoming exams?"\n• "What fees are pending?"\n• "Give me a summary of Alex's progress"\n• "Which subject is Alex weakest in?"\n• "Did Priya miss any exams?"\n\nJust ask naturally — I understand!`
  }

  // ── DEFAULT ──
  return `🤔 I'm not sure about that. Try asking:\n\n• Attendance: "How many days did ${childName} miss?"\n• Grades: "What are ${childName}'s grades?"\n• Exams: "Any upcoming exams?"\n• Fees: "Are there any pending fees?"\n• Summary: "Give me ${childName}'s progress report"\n\nOr type **help** to see all I can do.`
}

// ── Main bot function ─────────────────────────────────────────
export async function askParentBot(question, children, childData, attendance, grades, fees, exams) {
  const context = buildChildContext(children, childData, attendance, grades, fees, exams)

  const systemPrompt = `You are a helpful school assistant bot for parents. You have access to the following data about the parent's children. Answer questions clearly and concisely using this data. Use emojis sparingly. Format with markdown bold for key numbers.

CHILDREN DATA:
${context}

RULES:
- Only answer questions about the children's school data
- Be specific with numbers (days, percentages, amounts)
- If asked about a specific child by name, focus on that child
- Keep answers under 150 words
- Use bullet points for lists`

  // Try Gemini first
  const geminiAnswer = await callGemini(systemPrompt, question)
  if (geminiAnswer) return { text: geminiAnswer, source: 'gemini' }

  // Fall back to local NLP
  const localAns = localAnswer(question, children, childData, attendance, grades, fees, exams)
  return { text: localAns, source: 'local' }
}

// ── Suggested questions ───────────────────────────────────────
export function getSuggestedQuestions(children) {
  const name = children[0]?.name?.split(' ')[0] || 'my child'
  return [
    `How many days did ${name} miss school?`,
    `What is ${name}'s attendance percentage?`,
    `How is ${name} performing in studies?`,
    `Are there any upcoming exams?`,
    `What fees are pending or overdue?`,
    `Give me ${name}'s overall progress report`,
    `Which subject is ${name} weakest in?`,
    `Did ${name} miss any exams?`,
  ]
}

