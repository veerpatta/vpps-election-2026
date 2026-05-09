import fs from 'node:fs/promises'
import path from 'node:path'
import process from 'node:process'
import { fileURLToPath } from 'node:url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
const rootDir = path.resolve(__dirname, '..')

const TEACHER_CSV = path.resolve(
  process.env.VPPS_TEACHER_CSV ??
    'D:\\OneDrive - Veer Patta Public School\\Desktop\\Elections 2026\\VPPS_Election_2026_Teacher_Voter_ID_List.csv',
)
const STUDENT_CSV = path.resolve(
  process.env.VPPS_STUDENT_CSV ??
    'D:\\OneDrive - Veer Patta Public School\\Desktop\\Elections 2026\\VPPS_Election_2026_Voter_ID_List_Class_8_to_12_With_Houses.csv',
)
const OUTPUT_FILE = path.join(rootDir, 'src/data/officialVoters.ts')

const HOUSE_MAP = {
  red: ['rana pratap house', 'red'],
  blue: ['rana kumbha house', 'blue'],
  green: ['bappa rawal house', 'green'],
  yellow: ['rana sanga house', 'yellow'],
}

function parseCsv(text) {
  const lines = text.split(/\r?\n/).filter((line) => line.trim().length > 0)
  if (lines.length === 0) return { headers: [], rows: [] }
  const headers = splitCsvLine(lines[0])
  const rows = lines.slice(1).map((line) => {
    const cells = splitCsvLine(line)
    const record = {}
    headers.forEach((header, idx) => {
      record[header.trim()] = (cells[idx] ?? '').trim()
    })
    return record
  })
  return { headers, rows }
}

function splitCsvLine(line) {
  const result = []
  let current = ''
  let inQuotes = false
  for (let i = 0; i < line.length; i += 1) {
    const ch = line[i]
    if (ch === '"') {
      if (inQuotes && line[i + 1] === '"') {
        current += '"'
        i += 1
      } else {
        inQuotes = !inQuotes
      }
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

function normalizeHouse(value) {
  const raw = (value ?? '').toLowerCase().trim()
  if (!raw) return ''
  for (const [houseId, aliases] of Object.entries(HOUSE_MAP)) {
    if (aliases.includes(raw)) return houseId
  }
  // Fallback: try color word inside text
  for (const [houseId, aliases] of Object.entries(HOUSE_MAP)) {
    if (aliases.some((alias) => raw.includes(alias))) return houseId
  }
  return ''
}

function titleCase(name) {
  return name
    .replace(/\s+/g, ' ')
    .trim()
    .toLowerCase()
    .split(' ')
    .map((part) => {
      if (!part) return part
      if (part === '.') return part
      return part.charAt(0).toUpperCase() + part.slice(1)
    })
    .join(' ')
    .replace(/\s+\.\s+/g, ' ')
}

function tsString(value) {
  return JSON.stringify(value ?? '')
}

function emitVoter(voter) {
  const lines = [
    `    id: ${tsString(voter.id)}`,
    `    voterName: ${tsString(voter.voterName)}`,
    `    voterType: ${tsString(voter.voterType)}`,
  ]
  if (voter.classSection) lines.push(`    classSection: ${tsString(voter.classSection)}`)
  if (voter.rollNumber) lines.push(`    rollNumber: ${tsString(voter.rollNumber)}`)
  if (voter.departmentOrRole) lines.push(`    departmentOrRole: ${tsString(voter.departmentOrRole)}`)
  if (voter.house) lines.push(`    house: ${tsString(voter.house)}`)
  lines.push(`    votingId: ${tsString(voter.votingId)}`)
  lines.push(`    hasVoted: ${voter.hasVoted ? 'true' : 'false'}`)
  lines.push(`    active: true`)
  return `  {\n${lines.join(',\n')},\n  }`
}

async function main() {
  const teacherText = await fs.readFile(TEACHER_CSV, 'utf8')
  const studentText = await fs.readFile(STUDENT_CSV, 'utf8')

  const teacherCsv = parseCsv(teacherText)
  const studentCsv = parseCsv(studentText)

  const voters = []
  const seenVotingIds = new Set()

  for (const row of teacherCsv.rows) {
    const votingId = (row['Voting ID'] ?? '').trim()
    const name = titleCase(row['Teacher Name'] ?? '')
    if (!votingId || !name) continue
    if (!/^\d{6}$/.test(votingId)) continue
    if (seenVotingIds.has(votingId)) continue
    seenVotingIds.add(votingId)
    voters.push({
      id: `voter-teacher-${votingId}`,
      voterName: name,
      voterType: 'teacher',
      house: 'all',
      votingId,
      hasVoted: false,
    })
  }

  for (const row of studentCsv.rows) {
    const votingId = (row['Voting ID'] ?? '').trim()
    const name = titleCase(row['Student Name'] ?? '')
    const classLabel = (row['Class'] ?? '').trim()
    const houseRaw = (row['House'] ?? '').trim()
    const houseColorRaw = (row['House Color'] ?? '').trim()
    if (!votingId || !name) continue
    if (!/^\d{6}$/.test(votingId)) continue
    if (seenVotingIds.has(votingId)) continue
    seenVotingIds.add(votingId)
    const house = normalizeHouse(houseRaw) || normalizeHouse(houseColorRaw)
    voters.push({
      id: `voter-student-${votingId}`,
      voterName: name,
      voterType: 'student',
      classSection: classLabel || undefined,
      house: house || undefined,
      votingId,
      hasVoted: false,
    })
  }

  const teacherCount = voters.filter((voter) => voter.voterType === 'teacher').length
  const studentCount = voters.filter((voter) => voter.voterType === 'student').length
  const unassignedHouse = voters.filter((voter) => voter.voterType === 'student' && !voter.house)

  const body = voters.map(emitVoter).join(',\n')
  const content = `import type { Voter } from '../types/election'

// Generated by scripts/import-official-voters.mjs from the official VPPS 2026 voter rolls.
// Edit the CSV files in Desktop/Elections 2026/ and rerun: npm run import:official-voters
// Stored hasVoted/active in localStorage is preserved when this dataset is re-imported.
export const OFFICIAL_VOTER_DATASET_VERSION = 'vpps-2026-official-1'

export const officialVoters: Voter[] = [
${body},
]

export const officialVotersSummary = {
  teachers: ${teacherCount},
  students: ${studentCount},
  studentsWithoutHouse: ${unassignedHouse.length},
} as const
`

  await fs.writeFile(OUTPUT_FILE, content)
  console.log(`Wrote ${path.relative(rootDir, OUTPUT_FILE)}`)
  console.log(`  Teachers : ${teacherCount}`)
  console.log(`  Students : ${studentCount}`)
  console.log(`  Students without house : ${unassignedHouse.length}`)
  if (unassignedHouse.length) {
    for (const voter of unassignedHouse) {
      console.log(`    - ${voter.voterName} (${voter.classSection ?? 'unknown class'}, ${voter.votingId})`)
    }
  }
}

main().catch((error) => {
  console.error(error)
  process.exit(1)
})
