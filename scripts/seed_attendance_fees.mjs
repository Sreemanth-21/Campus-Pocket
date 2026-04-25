import { createClient } from '@supabase/supabase-js'

const sb = createClient(
  'https://vyxotymuqnpzgcdguvbe.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZ5eG90eW11cW5wemdjZGd1dmJlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzcwMjU4MjMsImV4cCI6MjA5MjYwMTgyM30.AfHjHFabIrruxRAtVThlluTl-3gp5EWdoTohi29gAcA'
)

const ALEX_ID  = '2189483b-ebb7-4210-b6e8-27c904eb6c53'
const PRIYA_ID = '661f8630-bafd-4817-8a0b-009ad414fa4d'

async function run() {
  console.log('\n📊 Seeding attendance and fees...\n')

  // ── FEES ─────────────────────────────────────────────────
  console.log('Seeding fees...')
  const { error: feeErr } = await sb.from('fees').insert([
    { student_id: ALEX_ID,  term: 'Term 1 2024', status: 'PAID',    amount: 15000 },
    { student_id: ALEX_ID,  term: 'Term 2 2024', status: 'PAID',    amount: 15000 },
    { student_id: ALEX_ID,  term: 'Term 3 2024', status: 'PENDING', amount: 15000 },
    { student_id: PRIYA_ID, term: 'Term 1 2024', status: 'PAID',    amount: 15000 },
    { student_id: PRIYA_ID, term: 'Term 2 2024', status: 'OVERDUE', amount: 15000 },
    { student_id: PRIYA_ID, term: 'Term 3 2024', status: 'OVERDUE', amount: 15000 },
  ])
  if (feeErr) console.error('  ✗ fees:', feeErr.message)
  else console.log('  ✓ 6 fee records seeded')

  // ── ATTENDANCE ───────────────────────────────────────────
  console.log('Seeding attendance (60 weekdays)...')
  const attData = []
  const today = new Date()

  for (let i = 59; i >= 0; i--) {
    const d = new Date(today)
    d.setDate(today.getDate() - i)
    if (d.getDay() === 0 || d.getDay() === 6) continue
    const dateStr = d.toISOString().split('T')[0]

    // Alex ~82% attendance
    const r1 = Math.random() * 100
    attData.push({
      student_id: ALEX_ID,
      date: dateStr,
      status: r1 < 77 ? 'present' : r1 < 87 ? 'late' : 'absent'
    })

    // Priya ~68% attendance
    const r2 = Math.random() * 100
    attData.push({
      student_id: PRIYA_ID,
      date: dateStr,
      status: r2 < 63 ? 'present' : r2 < 73 ? 'late' : 'absent'
    })
  }

  // Insert in batches of 50
  for (let i = 0; i < attData.length; i += 50) {
    const batch = attData.slice(i, i + 50)
    const { error } = await sb.from('attendance').upsert(batch, { onConflict: 'student_id,date' })
    if (error) { console.error('  ✗ attendance batch:', error.message); break }
  }
  console.log(`  ✓ ${attData.length} attendance records seeded`)

  // ── UPDATE attendance_percentage on students ─────────────
  console.log('Updating attendance percentages...')

  for (const [studentId, target] of [[ALEX_ID, 82], [PRIYA_ID, 68]]) {
    const { error } = await sb
      .from('students')
      .update({ attendance_percentage: target })
      .eq('id', studentId)
    if (error) console.error('  ✗ update student:', error.message)
  }
  console.log('  ✓ attendance_percentage updated')

  console.log('\n✅ Done! Refresh the app — fees and attendance will now show real data.\n')
}

run().catch(console.error)
