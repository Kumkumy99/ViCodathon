  import { useState } from 'react'

function BulletList({ items = [], iconColor }) {
  if (!items || items.length === 0) return null

  return (
    <div className="mt-3 space-y-3">
      {items.map((item, index) => (
        <div key={index} className="flex items-start gap-3">
          <span className={`mt-1.5 h-2 w-2 shrink-0 rounded-full ${iconColor}`} />
          <span className="text-sm leading-relaxed text-[#b0a8c0]">
            {item}
          </span>
        </div>
      ))}
    </div>
  )
}

function ScoreCard({ label, score }) {
  const safeScore = typeof score === 'number' ? Math.min(Math.max(score, 0), 100) : 0

  return (
    <div className="rounded-2xl bg-[#0a0515]/50 p-4">
      <div className="flex items-center justify-between gap-3">
        <span className="text-sm font-medium text-[#b0a8c0]">
          {label}
        </span>
        <span className="text-xl font-bold text-white">
          {safeScore}
          <span className="text-sm font-normal text-[#b0a8c0]">/100</span>
        </span>
      </div>

      <div className="mt-3 h-2 overflow-hidden rounded-full bg-[#1e1438]">
        <div
          className="gradient-accent h-full rounded-full transition-all duration-700"
          style={{ width: `${safeScore}%` }}
        />
      </div>
    </div>
  )
}

function feedbackToMarkdown(feedback) {
  const {
    summary = '',
    scores = {},
    strengths = [],
    gaps = [],
    next = [],
  } = feedback || {}

  const section = (title, items) =>
    items.length ? `\n## ${title}\n${items.map((i) => `- ${i}`).join('\n')}` : ''

  const scoreSection = `
## Scores
- Core Fundamentals: ${scores.coreFundamentals ?? 'N/A'}/100
- System Architecture: ${scores.systemArchitecture ?? 'N/A'}/100
- Problem Solving: ${scores.problemSolving ?? 'N/A'}/100
`

  return `# Interview Feedback

## Summary
${summary}
${scoreSection}
${section('Strengths', strengths)}
${section('Gaps', gaps)}
${section('Next Steps', next)}`
}

function ActionButton({ children, onClick, variant = 'secondary' }) {
  const base =
    'inline-flex items-center justify-center gap-2 rounded-full px-4 py-2 text-xs font-medium transition-all sm:text-sm'

  const styles =
    variant === 'primary'
      ? 'gradient-accent glow-accent text-white hover:opacity-90'
      : 'border border-[#7a29ff]/30 bg-[#1e1438] text-[#b0a8c0] hover:border-[#d83bd2]/50 hover:text-white'

  return (
    <button type="button" onClick={onClick} className={`${base} ${styles}`}>
      {children}
    </button>
  )
}

export default function FeedbackCard({ feedback, onClose, onRestart }) {
  const {
    summary = 'No summary available.',
    scores = {},
    strengths = [],
    gaps = [],
    next = [],
  } = feedback || {}

  const [copied, setCopied] = useState(false)

  const handleCopy = async () => {
    const text = feedbackToMarkdown(feedback)

    try {
      if (navigator?.clipboard?.writeText) {
        await navigator.clipboard.writeText(text)
      } else {
        const textArea = document.createElement('textarea')
        textArea.value = text
        document.body.appendChild(textArea)
        textArea.select()
        document.execCommand('copy')
        document.body.removeChild(textArea)
      }
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch (error) {
      console.error('Copy failed:', error)
    }
  }

  const handleExport = (format) => {
    const content =
      format === 'json'
        ? JSON.stringify(feedback, null, 2)
        : feedbackToMarkdown(feedback)

    const mime = format === 'json' ? 'application/json' : 'text/markdown'
    const ext = format === 'json' ? 'json' : 'md'

    const blob = new Blob([content], { type: mime })
    const url = URL.createObjectURL(blob)

    const link = document.createElement('a')
    link.href = url
    link.download = `interview-feedback.${ext}`

    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)
  }

  return (
    <div className="mx-auto w-full max-w-3xl overflow-hidden rounded-2xl border border-[#7a29ff]/20 bg-[#1e1438]/40 shadow-xl">
      {/* HEADER */}
      <div className="border-b border-[#7a29ff]/15 px-5 py-5 sm:px-6">
        <h2 className="gradient-text text-xl font-bold sm:text-2xl">
          Interview Feedback
        </h2>
        <p className="mt-1 text-sm text-[#b0a8c0]">
          Your performance summary
        </p>
      </div>

      <div className="space-y-5 p-5 sm:p-6">
        {/* SUMMARY */}
        <section className="rounded-2xl bg-[#0a0515]/50 p-4">
          <h3 className="gradient-text text-sm font-semibold uppercase tracking-wider">
            Summary
          </h3>
          <p className="mt-2 text-sm leading-relaxed text-[#b0a8c0]">
            {summary}
          </p>
        </section>

        {/* SCORES */}
        <section>
          <h3 className="mb-3 text-sm font-semibold uppercase tracking-wider text-white">
            Performance Scores
          </h3>
          <div className="grid gap-3 sm:grid-cols-3">
            <ScoreCard
              label="Core Fundamentals"
              score={scores.coreFundamentals}
            />
            <ScoreCard
              label="System Architecture"
              score={scores.systemArchitecture}
            />
            <ScoreCard
              label="Problem Solving"
              score={scores.problemSolving}
            />
          </div>
        </section>

        {/* STRENGTHS */}
        {strengths.length > 0 && (
          <section className="rounded-2xl bg-[#0a0515]/50 p-4">
            <h3 className="text-sm font-semibold text-[#d83bd2]">Strengths</h3>
            <BulletList items={strengths} iconColor="bg-[#d83bd2]" />
          </section>
        )}

        {/* GAPS */}
        {gaps.length > 0 && (
          <section className="rounded-2xl bg-[#0a0515]/50 p-4">
            <h3 className="text-sm font-semibold text-[#7a29ff]">Gaps</h3>
            <BulletList items={gaps} iconColor="bg-[#7a29ff]" />
          </section>
        )}

        {/* NEXT STEPS */}
        {next.length > 0 && (
          <section className="rounded-2xl bg-[#0a0515]/50 p-4">
            <h3 className="text-sm font-semibold text-white">Next Steps</h3>
            <BulletList items={next} iconColor="gradient-accent" />
          </section>
        )}

        {/* ACTIONS */}
        <div className="flex flex-wrap gap-2 pt-1">
          <ActionButton onClick={handleCopy}>
            {copied ? 'Copied!' : 'Copy'}
          </ActionButton>
          <ActionButton onClick={() => handleExport('json')}>
            Export JSON
          </ActionButton>
          <ActionButton onClick={() => handleExport('markdown')}>
            Export Markdown
          </ActionButton>
        </div>
      </div>

      {/* FOOTER */}
      <div className="flex flex-col gap-2 border-t border-[#7a29ff]/15 px-5 py-4 sm:flex-row sm:px-6">
        {onClose && (
          <button
            type="button"
            onClick={onClose}
            className="flex-1 rounded-full border border-[#7a29ff]/30 px-4 py-2.5 text-sm font-medium text-[#b0a8c0] transition-colors hover:border-[#d83bd2]/50 hover:text-white"
          >
            Back to Chat
          </button>
        )}
        {onRestart && (
          <button
            type="button"
            onClick={onRestart}
            className="gradient-accent glow-accent flex-1 rounded-full px-4 py-2.5 text-sm font-medium text-white transition-opacity hover:opacity-90"
          >
            Restart Interview
          </button>
        )}
      </div>
    </div>
  )
}