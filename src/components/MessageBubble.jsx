function formatTime(date) {
  return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
}

function UserAvatar({ isDark }) {
  return (
    <div
      className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full ring-2 ring-[#7a29ff]/30 ${
        isDark ? 'bg-[#2a1f4a]' : 'bg-[#ede8f5]'
      }`}
    >
      <svg className="h-4 w-4 text-[#d83bd2]" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
        <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" />
      </svg>
    </div>
  )
}

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

const BOT_NAME = 'ABTalks Interview Assistant'

export default function MessageBubble({ message, isDark = true }) {
  const isCandidate = message.sender === 'candidate'

  const bubbleClass = isDark
    ? 'bg-[#1e1438] text-white'
    : 'border border-[#7a29ff]/15 bg-white text-[#1a1030] shadow-sm'

  return (
    <div
      className={`flex w-full gap-2.5 sm:gap-3 ${
        isCandidate ? 'animate-slide-in-right justify-end' : 'animate-slide-in-left justify-start'
      }`}
    >
      {!isCandidate && <AiAvatar />}

      <div
        className={`flex max-w-[82%] flex-col gap-1 sm:max-w-[72%] ${
          isCandidate ? 'items-end' : 'items-start'
        }`}
      >
        {!isCandidate && (
          <span className="px-1 text-xs font-medium text-[#d83bd2]">{BOT_NAME}</span>
        )}

        <div
          className={`rounded-2xl px-4 py-3 text-sm leading-relaxed sm:text-[15px] ${
            isCandidate ? 'rounded-br-md' : 'rounded-bl-md'
          } ${bubbleClass}`}
        >
          {message.text}
        </div>

        <span className={`px-1 text-[11px] ${isDark ? 'text-[#b0a8c0]' : 'text-[#6b6280]'}`}>
          {formatTime(message.timestamp)}
        </span>
      </div>

      {isCandidate && <UserAvatar isDark={isDark} />}
    </div>
  )
}

export { BOT_NAME }
