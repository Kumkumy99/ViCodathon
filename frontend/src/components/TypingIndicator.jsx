import { BOT_NAME } from './MessageBubble'

function AiAvatar() {
  return (
    <div className="gradient-accent glow-accent flex h-9 w-9 shrink-0 items-center justify-center rounded-full">
      <svg className="h-4 w-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} aria-hidden="true">
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
        />
      </svg>
    </div>
  )
}

export default function TypingIndicator() {
  return (
    <div className="animate-slide-in-left flex justify-start gap-2.5 sm:gap-3">
      <AiAvatar />

      <div className="flex max-w-[82%] flex-col gap-1 sm:max-w-[72%]">
        <span className="px-1 text-xs font-medium text-[#d83bd2]">{BOT_NAME}</span>

        <div className="flex items-center gap-3 rounded-2xl rounded-bl-md bg-[#1e1438]/80 px-4 py-3 backdrop-blur-sm">
          <svg
            className="h-4 w-4 animate-spin text-[#d83bd2]"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            aria-hidden="true"
          >
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            />
          </svg>
          <span className="text-sm text-[#b0a8c0]">AI is thinking…</span>
          <span className="flex items-center gap-1" aria-hidden="true">
            {[0, 1, 2].map((i) => (
              <span
                key={i}
                className="inline-block h-1.5 w-1.5 rounded-full bg-[#7a29ff] animate-bounce-dot"
                style={{ animationDelay: `${i * 0.15}s` }}
              />
            ))}
          </span>
        </div>
      </div>
    </div>
  )
}
