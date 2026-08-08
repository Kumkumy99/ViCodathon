import { useCallback, useEffect, useRef, useState } from 'react'
import MessageBubble, { BOT_NAME } from './MessageBubble'
import TypingIndicator from './TypingIndicator'
import FeedbackCard from './FeedbackCard'
import { mockFeedback, mockMessages, mockAiReplies } from '../data/mockData'

const TOTAL_QUESTIONS = 8

let replyIndex = 0

/**
 * Placeholder for backend integration.
 * Replace the mock delay/reply logic with your API call.
 */
 const SESSION_ID = crypto.randomUUID()

async function sendMessage(message) {
  const response = await fetch("https://vi-codathon-vww2.vercel.app/api/interview", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      sessionId: SESSION_ID,
      message: message,
    }),
  })

  if (!response.ok) {
    throw new Error(`API error: ${response.status}`)
  }

  const data = await response.json()

  return {
    id: crypto.randomUUID(),
    sender: "ai",
    text: data.reply,
    timestamp: new Date(),
    done: data.done,
    feedback: data.feedback,
  }
}

function ThemeToggle({ isDark, onToggle }) {
  return (
    <button
      type="button"
      onClick={onToggle}
      aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
      className="rounded-full p-2 text-[#b0a8c0] transition-colors hover:bg-[#1e1438] hover:text-white dark:hover:bg-[#1e1438]"
    >
      {isDark ? (
        <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z"
          />
        </svg>
      ) : (
        <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z"
          />
        </svg>
      )}
    </button>
  )
}

function ProgressTracker({ current, total, isDark }) {
  return (
    <div className="flex items-center gap-3">
      <div className="flex gap-1.5">
        {Array.from({ length: total }, (_, i) => (
          <span
            key={i}
            className={`h-1.5 rounded-full transition-all ${
              i < current
                ? 'gradient-accent w-5'
                : isDark
                  ? 'w-3 bg-[#1e1438]'
                  : 'w-3 bg-[#e8e4f0]'
            }`}
          />
        ))}
      </div>
      <span className="whitespace-nowrap text-xs font-medium text-[#b0a8c0] dark:text-[#b0a8c0]">
        Question {current} of {total}
      </span>
    </div>
  )
}

function HeaderBadge() {
  return (
    <span className="gradient-accent hidden rounded-full px-3 py-1 text-[11px] font-semibold text-white sm:inline-block">
      {BOT_NAME}
    </span>
  )
}

export default function ChatWindow({
  initialMessages = [],
  feedback = mockFeedback,
}) {
  const [messages, setMessages] = useState(initialMessages)
  const [input, setInput] = useState('')
  const [isTyping, setIsTyping] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [showFeedback, setShowFeedback] = useState(false)
  const [isDark, setIsDark] = useState(true)
  const [sessionId] = useState(() => crypto.randomUUID())
  const [selectedCandidate, setSelectedCandidate] = useState('')
const [interviewStarted, setInterviewStarted] = useState(false)

  const messagesEndRef = useRef(null)
  const inputRef = useRef(null)

  const aiQuestionCount = messages.filter((m) => m.sender === 'ai').length
  const currentQuestion = Math.min(Math.max(aiQuestionCount, 1), TOTAL_QUESTIONS)

  useEffect(() => {
    document.documentElement.classList.toggle('dark', isDark)
  }, [isDark])

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, isTyping, showFeedback])

  const handleRestart = useCallback(() => {
    replyIndex = 0
    setMessages(initialMessages)
    setInput('')
    setIsTyping(false)
    setIsLoading(false)
    setShowFeedback(false)
    inputRef.current?.focus()
  }, [initialMessages])

  const handleSend = useCallback(async () => {
    const trimmed = input.trim()
    if (!trimmed || isLoading || showFeedback) return

    const candidateMessage = {
      id: crypto.randomUUID(),
      sender: 'candidate',
      text: trimmed,
      timestamp: new Date(),
    }

    setMessages((prev) => [...prev, candidateMessage])
    setInput('')
    setIsLoading(true)
    setIsTyping(true)

    try {
      const aiMessage = await sendMessage(trimmed, [...messages, candidateMessage])
      setMessages((prev) => [...prev, aiMessage])
    } finally {
      setIsTyping(false)
      setIsLoading(false)
      inputRef.current?.focus()
    }
  }, [input, isLoading, messages, showFeedback])

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  const handleEndInterview = () => {
    setShowFeedback(true)
  }

  const shellClass = isDark
    ? 'bg-[#0a0515] text-white'
    : 'bg-[#f4f2f8] text-[#1a1030]'

  const headerClass = isDark
    ? 'border-[#7a29ff]/15 bg-[#0a0515]/95'
    : 'border-[#7a29ff]/10 bg-white/95'

  if (showFeedback) {
    return (
      <div className={`flex h-full min-h-screen flex-col ${shellClass}`}>
        <header className={`flex items-center justify-between border-b px-4 py-3 backdrop-blur-md sm:px-6 ${headerClass}`}>
          <div>
            <h1 className="text-base font-semibold sm:text-lg">{BOT_NAME}</h1>
            <p className="text-xs text-[#b0a8c0]">Session complete</p>
          </div>
          <ThemeToggle isDark={isDark} onToggle={() => setIsDark((d) => !d)} />
        </header>

        <main className="flex-1 overflow-y-auto p-4 sm:p-6">
          <FeedbackCard feedback={feedback} onClose={() => setShowFeedback(false)} onRestart={handleRestart} />
        </main>
      </div>
    )
  }

  return (
    <div className={`flex h-full min-h-screen flex-col ${shellClass}`}>
      <header className={`shrink-0 border-b backdrop-blur-md ${headerClass}`}>
        <div className="flex items-center justify-between px-4 py-3 sm:px-6">
          <div className="flex items-center gap-2 sm:gap-3">
            <button
              type="button"
              aria-label="Back"
              className="rounded-full p-1.5 text-[#b0a8c0] transition-colors hover:bg-[#1e1438] hover:text-white"
            >
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            <HeaderBadge />
            <div className="sm:hidden">
              <h1 className="text-sm font-semibold">{BOT_NAME}</h1>
              <p className="text-[11px] text-[#b0a8c0]">{isTyping ? 'Typing…' : 'Online'}</p>
            </div>
          </div>

          <div className="flex items-center gap-1 sm:gap-2">
            <button
              type="button"
              onClick={handleRestart}
              className="hidden rounded-full border border-[#7a29ff]/30 px-3 py-1.5 text-xs font-medium text-[#b0a8c0] transition-colors hover:border-[#d83bd2]/50 hover:text-white sm:inline-block"
            >
              Restart
            </button>
            <button
              type="button"
              onClick={handleEndInterview}
              className="hidden rounded-full border border-[#7a29ff]/30 px-3 py-1.5 text-xs font-medium text-[#b0a8c0] transition-colors hover:border-[#d83bd2]/50 hover:text-white sm:inline-block"
            >
              End Interview
            </button>
            <ThemeToggle isDark={isDark} onToggle={() => setIsDark((d) => !d)} />
            <button
              type="button"
              aria-label="More options"
              className="rounded-full p-1.5 text-[#b0a8c0] transition-colors hover:bg-[#1e1438] hover:text-white"
            >
              <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 8c1.1 0 2-.9 2-2s-.9-2-2-2-2 .9-2 2 .9 2 2 2zm0 2c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zm0 6c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2z" />
              </svg>
            </button>
          </div>
        </div>

        <div className="border-t border-[#7a29ff]/10 px-4 py-2.5 sm:px-6">
          <ProgressTracker current={currentQuestion} total={TOTAL_QUESTIONS} isDark={isDark} />
        </div>
      </header>

      <main className="flex-1 overflow-y-auto px-4 py-5 sm:px-6">
        <div className="mx-auto flex max-w-3xl flex-col gap-5">
          {messages.map((message) => (
            <MessageBubble key={message.id} message={message} isDark={isDark} />
          ))}
          {isTyping && <TypingIndicator />}
          <div ref={messagesEndRef} />
        </div>
      </main>

      <footer className={`shrink-0 px-4 py-4 sm:px-6 ${isDark ? 'bg-[#0a0515]' : 'bg-[#f4f2f8]'}`}>
        <div className="mx-auto max-w-3xl">
          <div
            className={`flex items-center gap-2 rounded-full px-3 py-2 ${
              isDark ? 'bg-[#1e1438]' : 'border border-[#7a29ff]/15 bg-white shadow-sm'
            }`}
          >
            <button
              type="button"
              aria-label="Attach"
              className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-[#b0a8c0] transition-colors hover:text-[#d83bd2]"
            >
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
              </svg>
            </button>

            <textarea
              ref={inputRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Type your answer…"
              rows={1}
              disabled={isLoading}
              className={`max-h-24 min-h-[36px] flex-1 resize-none bg-transparent px-1 py-2 text-sm placeholder-[#b0a8c0] focus:outline-none disabled:opacity-60 ${
                isDark ? 'text-white' : 'text-[#1a1030]'
              }`}
            />

            <button
              type="button"
              onClick={handleSend}
              disabled={!input.trim() || isLoading}
              className="gradient-accent glow-accent flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-white transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-40"
              aria-label="Send message"
            >
              {isLoading ? (
                <svg className="h-5 w-5 animate-spin" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  />
                </svg>
              ) : (
                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                </svg>
              )}
            </button>
          </div>

          <div className="mt-2.5 flex items-center justify-between sm:hidden">
            <div className="flex gap-3">
              <button
                type="button"
                onClick={handleRestart}
                className="text-xs font-medium text-[#b0a8c0] hover:text-[#d83bd2]"
              >
                Restart
              </button>
              <button
                type="button"
                onClick={handleEndInterview}
                className="text-xs font-medium text-[#b0a8c0] hover:text-[#d83bd2]"
              >
                End Interview
              </button>
            </div>
            <span className="text-[11px] text-[#b0a8c0]">Enter to send</span>
          </div>
        </div>
      </footer>
    </div>
  )
}

export { sendMessage }
