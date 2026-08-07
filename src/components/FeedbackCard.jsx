import { useState } from 'react'

function BulletList({ items, iconColor }) {
  return (
    <ul className="mt-3 space-y-2.5">
      {items.map((item, index) => (
        <li
          key={index}
          className="flex items-start gap-3 rounded-2xl bg-[#0a0515]/40 px-3 py-2.5 text-sm leading-relaxed text-white/90 dark:bg-[#0a0515]/40"
        >
          <span className={`mt-1.5 h-2 w-2 shrink-0 rounded-full ${iconColor}`} />
          <span>{item}</span>
        </li>
      ))}
    </ul>
  )
}

function feedbackToMarkdown(feedback) {
  const { summary, strengths, gaps, nextSteps } = feedback
  const section = (title, items) =>
    items ? `\n## ${title}\n${items.map((i) => `- ${i}`).join('\n')}` : ''

  return `# Interview Feedback\n\n## Summary\n${summary}${section('Strengths', strengths)}${section('Gaps', gaps)}${section('Next Steps', nextSteps)}`
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
  const { summary, strengths, gaps, nextSteps } = feedback
  const [copied, setCopied] = useState(false)

  const handleCopy = async () => {
    const text = feedbackToMarkdown(feedback)
    await navigator.clipboard.writeText(text)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const handleExport = (format) => {
    const content =
      format === 'json' ? JSON.stringify(feedback, null, 2) : feedbackToMarkdown(feedback)
    const mime = format === 'json' ? 'application/json' : 'text/markdown'
    const ext = format === 'json' ? 'json' : 'md'
    const blob = new Blob([content], { type: mime })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = `interview-feedback.${ext}`
    link.click()
    URL.revokeObjectURL(url)
  }

  return (
    <div className="animate-fade-in mx-auto w-full max-w-2xl">
      <div className="overflow-hidden rounded-3xl border border-[#7a29ff]/20 bg-[#1e1438] shadow-2xl shadow-[#7a29ff]/10">
        <div className="gradient-accent px-6 py-5">
          <h2 className="text-xl font-semibold text-white">Interview Feedback</h2>
          <p className="mt-1 text-sm text-white/80">Your performance summary from ABTalks</p>
        </div>

        <div className="space-y-5 p-5 sm:p-6">
          <section className="rounded-2xl bg-[#0a0515]/50 p-4">
            <h3 className="gradient-text text-sm font-semibold uppercase tracking-wider">Summary</h3>
            <p className="mt-2 text-sm leading-relaxed text-[#b0a8c0]">{summary}</p>
          </section>

          <section className="rounded-2xl bg-[#0a0515]/50 p-4">
            <h3 className="text-sm font-semibold text-[#d83bd2]">Strengths</h3>
            <BulletList items={strengths} iconColor="bg-[#d83bd2]" />
          </section>

          <section className="rounded-2xl bg-[#0a0515]/50 p-4">
            <h3 className="text-sm font-semibold text-[#7a29ff]">Gaps</h3>
            <BulletList items={gaps} iconColor="bg-[#7a29ff]" />
          </section>

          <section className="rounded-2xl bg-[#0a0515]/50 p-4">
            <h3 className="text-sm font-semibold text-white">Next Steps</h3>
            <BulletList items={nextSteps} iconColor="gradient-accent" />
          </section>

          <div className="flex flex-wrap gap-2 pt-1">
            <ActionButton onClick={handleCopy}>
              {copied ? (
                <>
                  <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                  </svg>
                  Copied!
                </>
              ) : (
                <>
                  <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"
                    />
                  </svg>
                  Copy
                </>
              )}
            </ActionButton>
            <ActionButton onClick={() => handleExport('json')}>Export JSON</ActionButton>
            <ActionButton onClick={() => handleExport('markdown')}>Export Markdown</ActionButton>
          </div>
        </div>

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
    </div>
  )
}
