/**
 * Parse a CSV file into an array of student objects.
 *
 * Expected CSV columns (header row required):
 *   name, email, username, password, class, section,
 *   admission_number, date_of_birth, gender, guardian_name,
 *   contact, blood_group, address
 *
 * Usage:
 *   const students = await parseStudentCSV(file)
 *   const result   = await bulkImportViaEdge(students, schoolId)
 */
export function parseStudentCSV(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = (e) => {
      try {
        const text  = e.target.result
        const lines = text.split('\n').map(l => l.trim()).filter(Boolean)
        if (lines.length < 2) throw new Error('CSV must have a header row and at least one data row')

        const headers = lines[0].split(',').map(h => h.trim().toLowerCase().replace(/\s+/g, '_'))
        const students = []

        for (let i = 1; i < lines.length; i++) {
          const values = parseCSVLine(lines[i])
          if (values.length !== headers.length) continue

          const row = {}
          headers.forEach((h, idx) => { row[h] = values[idx]?.trim() || '' })

          // Validate required fields
          if (!row.email || !row.name || !row.password) continue

          students.push({
            name:             row.name,
            email:            row.email,
            username:         row.username || row.email.split('@')[0],
            password:         row.password,
            classId:          row.class_id || null,
            admissionNumber:  row.admission_number || null,
            dateOfBirth:      row.date_of_birth || null,
            gender:           row.gender || null,
            guardianName:     row.guardian_name || null,
            contact:          row.contact || null,
            bloodGroup:       row.blood_group || null,
            address:          row.address || null,
          })
        }

        resolve(students)
      } catch (err) {
        reject(err)
      }
    }
    reader.onerror = () => reject(new Error('Failed to read file'))
    reader.readAsText(file)
  })
}

/** Handle quoted CSV values correctly */
function parseCSVLine(line) {
  const result = []
  let current  = ''
  let inQuotes = false

  for (let i = 0; i < line.length; i++) {
    const ch = line[i]
    if (ch === '"') {
      inQuotes = !inQuotes
    } else if (ch === ',' && !inQuotes) {
      result.push(current)
      current = ''
    } else {
      current += ch
    }
  }
  result.push(current)
  return result
}

/** Generate a sample CSV template string */
export function generateCSVTemplate() {
  const headers = [
    'name', 'email', 'username', 'password', 'class_id',
    'admission_number', 'date_of_birth', 'gender',
    'guardian_name', 'contact', 'blood_group', 'address',
  ]
  const sample = [
    'Alex Johnson', 'alex@school.edu', 'alex.johnson', 'Pass@123', '',
    'ADM-2024-001', '2008-04-15', 'Male',
    'Robert Johnson', '+1 555 0123', 'O+', '42 Maple St',
  ]
  return [headers.join(','), sample.join(',')].join('\n')
}

/** Trigger CSV template download in browser */
export function downloadCSVTemplate() {
  const csv  = generateCSVTemplate()
  const blob = new Blob([csv], { type: 'text/csv' })
  const url  = URL.createObjectURL(blob)
  const a    = document.createElement('a')
  a.href     = url
  a.download = 'student_import_template.csv'
  a.click()
  URL.revokeObjectURL(url)
}

