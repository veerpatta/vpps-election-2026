import { useEffect, useState } from 'react'
import { cn } from '../../lib/utils'

export type ClassValue = '8' | '9' | '10' | '11' | '12' | 'other' | ''
export type StreamValue = 'Arts' | 'Science' | 'Commerce' | ''

const STREAMS: StreamValue[] = ['Arts', 'Science', 'Commerce']
const STREAM_CLASSES: ClassValue[] = ['11', '12']

interface ClassSectionInputProps {
  value: string
  onChange: (next: string) => void
  className?: string
}

interface Parsed {
  classValue: ClassValue
  stream: StreamValue
  custom: string
}

export function parseClassSection(input: string): Parsed {
  const raw = (input ?? '').trim()
  if (!raw) return { classValue: '', stream: '', custom: '' }

  const lower = raw.toLowerCase()
  // "Class 8/9/10" form
  const classMatch = lower.match(/^class\s*(\d{1,2})$/)
  if (classMatch) {
    const num = classMatch[1] as ClassValue
    if (['8', '9', '10', '11', '12'].includes(num)) {
      return { classValue: num, stream: '', custom: '' }
    }
  }

  // "11 Arts" / "12 Science" form
  const streamMatch = lower.match(/^(\d{1,2})\s+(arts|science|commerce)$/)
  if (streamMatch) {
    const num = streamMatch[1] as ClassValue
    const streamWord = streamMatch[2]
    const stream = streamWord.charAt(0).toUpperCase() + streamWord.slice(1) as StreamValue
    if (['11', '12'].includes(num)) {
      return { classValue: num, stream, custom: '' }
    }
  }

  // Plain "8" / "9" / "10" / "11" / "12"
  if (['8', '9', '10', '11', '12'].includes(raw)) {
    return { classValue: raw as ClassValue, stream: '', custom: '' }
  }

  return { classValue: 'other', stream: '', custom: raw }
}

export function formatClassSection({ classValue, stream, custom }: Parsed): string {
  if (classValue === 'other') return custom.trim()
  if (!classValue) return ''
  if (STREAM_CLASSES.includes(classValue)) {
    return stream ? `${classValue} ${stream}` : `${classValue}`
  }
  return `Class ${classValue}`
}

export function ClassSectionInput({ value, onChange, className }: ClassSectionInputProps) {
  const [parsed, setParsed] = useState<Parsed>(() => parseClassSection(value))

  useEffect(() => {
    const next = parseClassSection(value)
    if (
      next.classValue !== parsed.classValue ||
      next.stream !== parsed.stream ||
      next.custom !== parsed.custom
    ) {
      setParsed(next)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value])

  function update(next: Parsed) {
    setParsed(next)
    onChange(formatClassSection(next))
  }

  const requiresStream = STREAM_CLASSES.includes(parsed.classValue as ClassValue)

  return (
    <div className={cn('grid gap-2 sm:grid-cols-2', className)}>
      <select
        value={parsed.classValue}
        onChange={(event) => {
          const classValue = event.target.value as ClassValue
          const nextStream = STREAM_CLASSES.includes(classValue) ? parsed.stream : ''
          update({
            classValue,
            stream: nextStream,
            custom: classValue === 'other' ? parsed.custom : '',
          })
        }}
        className="h-11 rounded-xl border border-vpps-line bg-white px-3.5 text-sm text-vpps-navy shadow-inset focus:border-vpps-navy/40"
        aria-label="Class"
      >
        <option value="">Select class…</option>
        <option value="8">Class 8</option>
        <option value="9">Class 9</option>
        <option value="10">Class 10</option>
        <option value="11">Class 11</option>
        <option value="12">Class 12</option>
        <option value="other">Other / Custom</option>
      </select>

      {parsed.classValue === 'other' ? (
        <input
          type="text"
          value={parsed.custom}
          onChange={(event) => update({ ...parsed, custom: event.target.value })}
          placeholder="e.g. Pre-Primary"
          className="h-11 rounded-xl border border-vpps-line bg-white px-3.5 text-sm text-vpps-navy shadow-inset focus:border-vpps-navy/40"
          aria-label="Custom class label"
        />
      ) : requiresStream ? (
        <select
          value={parsed.stream}
          onChange={(event) => update({ ...parsed, stream: event.target.value as StreamValue })}
          className="h-11 rounded-xl border border-vpps-line bg-white px-3.5 text-sm text-vpps-navy shadow-inset focus:border-vpps-navy/40"
          aria-label="Stream"
        >
          <option value="">Select stream…</option>
          {STREAMS.map((stream) => (
            <option key={stream} value={stream}>
              {stream}
            </option>
          ))}
        </select>
      ) : (
        <div className="grid h-11 place-items-center rounded-xl border border-dashed border-vpps-line bg-vpps-soft px-3.5 text-xs font-medium text-vpps-mute">
          {parsed.classValue ? 'No section needed' : '—'}
        </div>
      )}
    </div>
  )
}
