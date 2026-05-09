import * as XLSX from 'xlsx'
import type { HouseId, Voter, VoterType } from '../types/election'
import { generateVotingId } from './electionStore'
import { normalizeHouse } from './houses'

export interface VoterImportRow {
  rowNumber: number
  voterName: string
  voterType?: VoterType
  classSection?: string
  rollNumber?: string
  departmentOrRole?: string
  house?: HouseId | 'all'
  notes?: string
  votingId?: string
  errors: string[]
  warnings: string[]
}

export interface VoterImportPreview {
  totalRows: number
  validRows: number
  errorRows: number
  warningRows: number
  rows: VoterImportRow[]
}

const columnAliases: Record<string, string[]> = {
  voterName: ['voter name', 'name', 'student name', 'teacher name'],
  voterType: ['voter type', 'type'],
  classSection: ['class & section', 'class section', 'class', 'class/sec', 'class and section'],
  rollNumber: ['roll number / admission number', 'roll number', 'admission number', 'roll no', 'roll no.', 'sr no', 'sr number'],
  house: ['house', 'student house'],
  departmentOrRole: ['department / role', 'department', 'role', 'staff role'],
  notes: ['notes', 'note'],
}

function normalizeHeader(header: string) {
  return header.trim().toLowerCase().replace(/\s+/g, ' ')
}

function readCell(row: Record<string, unknown>, field: keyof typeof columnAliases) {
  const aliases = columnAliases[field]
  const key = Object.keys(row).find((header) => aliases.includes(normalizeHeader(header)))
  return String(key ? row[key] ?? '' : '').trim()
}

function normalizeVoterType(value: string): VoterType | undefined {
  const raw = value.trim().toLowerCase()
  if (raw === 'student') return 'student'
  if (raw === 'teacher') return 'teacher'
  return undefined
}

function duplicateUploadKey(row: VoterImportRow) {
  return `${row.voterName.trim().toLowerCase()}|${row.classSection?.trim().toLowerCase() ?? ''}|${row.rollNumber?.trim().toLowerCase() ?? ''}`
}

function existingRollClassKey(voter: Voter) {
  if (!voter.classSection || !voter.rollNumber) return ''
  return `${voter.classSection.trim().toLowerCase()}|${voter.rollNumber.trim().toLowerCase()}`
}

export async function previewVoterImport(file: File, existingVoters: Voter[]): Promise<VoterImportPreview> {
  const buffer = await file.arrayBuffer()
  const workbook = XLSX.read(buffer, { type: 'array' })
  const sheet = workbook.Sheets[workbook.SheetNames[0]]
  const rawRows = XLSX.utils.sheet_to_json<Record<string, unknown>>(sheet, { defval: '' })
  const existingIds = existingVoters.map((voter) => voter.votingId)
  const generatedIds = [...existingIds]
  const seenUploadKeys = new Map<string, number>()
  const existingRollKeys = new Set(existingVoters.map(existingRollClassKey).filter(Boolean))

  const rows = rawRows.map((rawRow, index) => {
    const voterName = readCell(rawRow, 'voterName')
    const voterTypeRaw = readCell(rawRow, 'voterType')
    const voterType = normalizeVoterType(voterTypeRaw)
    const classSection = readCell(rawRow, 'classSection')
    const rollNumber = readCell(rawRow, 'rollNumber')
    const departmentOrRole = readCell(rawRow, 'departmentOrRole')
    const houseRaw = readCell(rawRow, 'house')
    const normalizedHouse = normalizeHouse(houseRaw)
    const row: VoterImportRow = {
      rowNumber: index + 2,
      voterName,
      voterType,
      classSection,
      rollNumber,
      departmentOrRole,
      house: normalizedHouse,
      notes: readCell(rawRow, 'notes'),
      errors: [],
      warnings: [],
    }

    if (!voterName) row.errors.push('Missing Voter Name')
    if (!voterTypeRaw) row.errors.push('Missing Voter Type')
    else if (!voterType) row.errors.push('Invalid Voter Type')

    if (voterType === 'student') {
      if (!houseRaw) row.errors.push('Student missing House')
      else if (!normalizedHouse || normalizedHouse === 'all') row.errors.push('Student has invalid House')
      if (!rollNumber) row.warnings.push('Missing roll number')

      const existingKey = classSection && rollNumber ? `${classSection.trim().toLowerCase()}|${rollNumber.trim().toLowerCase()}` : ''
      if (existingKey && existingRollKeys.has(existingKey)) row.warnings.push('Existing voter with same class and roll number')
    }

    if (voterType === 'teacher') {
      if (!classSection) row.warnings.push('Missing class for teacher')
      if (!departmentOrRole) row.warnings.push('Missing department for teacher')
      if (!houseRaw) row.warnings.push('Teacher house blank')
      row.house = normalizedHouse === 'all' ? 'all' : undefined
    }

    const uploadKey = duplicateUploadKey(row)
    const seenAt = seenUploadKeys.get(uploadKey)
    if (seenAt) row.errors.push(`Duplicate row with row ${seenAt}`)
    else seenUploadKeys.set(uploadKey, row.rowNumber)

    if (row.errors.length === 0) {
      row.votingId = generateVotingId(generatedIds)
      generatedIds.push(row.votingId)
    }

    return row
  })

  return {
    totalRows: rows.length,
    validRows: rows.filter((row) => row.errors.length === 0).length,
    errorRows: rows.filter((row) => row.errors.length > 0).length,
    warningRows: rows.filter((row) => row.warnings.length > 0).length,
    rows,
  }
}

export function importRowsToVoters(rows: VoterImportRow[]): Array<Omit<Voter, 'id' | 'hasVoted' | 'active'>> {
  return rows
    .filter((row) => row.errors.length === 0 && row.voterType && row.votingId)
    .map((row) => ({
      voterName: row.voterName,
      voterType: row.voterType as VoterType,
      classSection: row.classSection,
      rollNumber: row.rollNumber,
      departmentOrRole: row.departmentOrRole,
      house: row.house,
      votingId: row.votingId as string,
    }))
}
