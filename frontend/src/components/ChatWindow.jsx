
import { useCallback, useEffect, useRef, useState } from 'react'
import MessageBubble, { BOT_NAME } from './MessageBubble'
import TypingIndicator from './TypingIndicator'
import FeedbackCard from './FeedbackCard'
import { mockFeedback } from '../data/mockData'
import candidatesData from '../data/candidates.json'

const TOTAL_QUESTIONS = 8

// -----------------------------------------------------------------------------
// BACKEND API
// -----------------------------------------------------------------------------

async function sendMessage(message, sessionId, candidate) {
  const response = await fetch(
    'https://vi-codathon-vww2.vercel.app/api/interview',
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        sessionId,
        candidate,
        message,
      }),
    }
  )

  if (!response.ok) {
    throw new Error(`API error: ${response.status}`)
  }

  const data = await response.json()

  return {
    id: crypto.randomUUID(),
    sender: 'ai',
    text: data.reply,
    timestamp: new Date(),
    done: data.done,
    feedback: data.feedback,
  }
}

// -----------------------------------------------------------------------------
// THEME TOGGLE
// -----------------------------------------------------------------------------

function ThemeToggle({ isDark, onToggle }) {
  return (
    <button
      type="button"
      onClick={onToggle}
      aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
      className="rounded-full p-2 text-[#b0a8c0] transition-colors hover:bg-[#1e1438] hover:text-white"
    >
      {isDark ? (
        <svg
          className="h-5 w-5"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={2}
        >
          <circle cx="12" cy="12" r="4" />
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M12 2v2m0 16v2M4.93 4.93l1.41 1.41m11.32 11.32l1.41 1.41M2 12h2m16 0h2M4.93 19.07l1.41-1.41M17.66 6.34l1.41-1.41"
          />
        </svg>
      ) : (
        <svg
          className="h-5 w-5"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={2}
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M21 12.79A9 9 0 1111.21 3 7 7 0 0021 12.79z"
          />
        </svg>
      )}
    </button>
  )
}

// -----------------------------------------------------------------------------
// PROGRESS TRACKER
// -----------------------------------------------------------------------------

function ProgressTracker({ current, total, isDark }) {
  return (
    <div className="flex items-center justify-between gap-3">
      <div className="flex items-center gap-1.5">
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

      <span className="text-xs text-[#b0a8c0]">
        Question {Math.min(current, total)} of {total}
      </span>
    </div>
  )
}

// -----------------------------------------------------------------------------
// HEADER BADGE
// -----------------------------------------------------------------------------

function HeaderBadge() {
  return (
    <div className="flex items-center gap-2">
      <div className="h-2.5 w-2.5 rounded-full bg-[#d83bd2]" />
      <span className="text-sm font-semibold">{BOT_NAME}</span>
    </div>
  )
}

// -----------------------------------------------------------------------------
// CHAT WINDOW
// -----------------------------------------------------------------------------

export default function ChatWindow({
  initialMessages = [],
  feedback = mockFeedback,
}) {
  const [messages, setMessages] = useState(initialMessages)
  const [input, setInput] = useState('')
  const [isTyping, setIsTyping] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  const [showFeedback, setShowFeedback] = useState(false)

  // IMPORTANT:
  // This stores the ACTUAL feedback returned by the backend.
  const [finalFeedback, setFinalFeedback] = useState(null)

  const [isDark, setIsDark] = useState(true)
  const [sessionId] = useState(() => crypto.randomUUID())

  const [selectedCandidate, setSelectedCandidate] = useState('')
  const [interviewStarted, setInterviewStarted] = useState(false)

  const messagesEndRef = useRef(null)
  const inputRef = useRef(null)

  // Count AI questions
  const aiQuestionCount = messages.filter(
    (message) => message.sender === 'ai'
  ).length

  const currentQuestion = Math.min(
    Math.max(aiQuestionCount, 1),
    TOTAL_QUESTIONS
  )

  // ---------------------------------------------------------------------------
  // DARK MODE
  // ---------------------------------------------------------------------------

  useEffect(() => {
    document.documentElement.classList.toggle('dark', isDark)
  }, [isDark])

  // ---------------------------------------------------------------------------
  // AUTO SCROLL
  // ---------------------------------------------------------------------------

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({
      behavior: 'smooth',
    })
  }, [messages, isTyping, showFeedback])

  // ---------------------------------------------------------------------------
  // RESTART
  // ---------------------------------------------------------------------------

  const handleRestart = useCallback(() => {
    setMessages(initialMessages)
    setInput('')
    setIsTyping(false)
    setIsLoading(false)
    setShowFeedback(false)
    setFinalFeedback(null)
    setInterviewStarted(false)
    setSelectedCandidate('')
    inputRef.current?.focus()
  }, [initialMessages])

  // ---------------------------------------------------------------------------
  // SEND ANSWER
  // ---------------------------------------------------------------------------

  const handleSend = useCallback(async () => {
    const trimmed = input.trim()

    if (!trimmed || isLoading || showFeedback) {
      return
    }

    const candidateMessage = {
      id: crypto.randomUUID(),
      sender: 'candidate',
      text: trimmed,
      timestamp: new Date(),
    }

    // Immediately show candidate's message
    setMessages((prev) => [...prev, candidateMessage])
    setInput('')
    setIsLoading(true)
    setIsTyping(true)

    try {
      const candidate = candidatesData.candidates.find(
        (c) => c.member.id === selectedCandidate
      )

      const aiMessage = await sendMessage(
        trimmed,
        sessionId,
        candidate
      )

      // Show AI response
      setMessages((prev) => [...prev, aiMessage])

      // -----------------------------------------------------------------------
      // IMPORTANT FIX:
      //
      // When backend says done === true, it sends:
      //
      // {
      //   done: true,
      //   feedback: {
      //      summary: "...",
      //      scores: {...},
      //      strengths: [...],
      //      gaps: [...],
      //      next: [...]
      //   }
      // }
      //
      // Store that REAL feedback in state.
      // -----------------------------------------------------------------------

      if (aiMessage.done && aiMessage.feedback) {
        setFinalFeedback(aiMessage.feedback)
        setShowFeedback(true)
      }
    } catch (error) {
      console.error('Failed to send message:', error)

      const errorMessage = {
        id: crypto.randomUUID(),
        sender: 'ai',
        text: 'Sorry, something went wrong while processing your answer. Please try again.',
        timestamp: new Date(),
      }

      setMessages((prev) => [...prev, errorMessage])
    } finally {
      setIsTyping(false)
      setIsLoading(false)
      inputRef.current?.focus()
    }
  }, [
    input,
    isLoading,
    showFeedback,
    selectedCandidate,
    sessionId,
  ])

  // ---------------------------------------------------------------------------
  // ENTER KEY
  // ---------------------------------------------------------------------------

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  // ---------------------------------------------------------------------------
  // END INTERVIEW
  // ---------------------------------------------------------------------------

  const handleEndInterview = () => {
    /*
     * Do NOT immediately show FeedbackCard here.
     *
     * The old code did:
     *
     * setShowFeedback(true)
     *
     * which caused:
     *
     * finalFeedback === null
     *        ↓
     * mockFeedback
     *        ↓
     * MOCK SUMMARY
     *
     * Now we only show feedback after the backend returns
     * actual feedback.
     */

    if (finalFeedback) {
      setShowFeedback(true)
    }
  }

  // ---------------------------------------------------------------------------
  // STYLES
  // ---------------------------------------------------------------------------

  const shellClass = isDark
    ? 'bg-[#0a0515] text-white'
    : 'bg-[#f4f2f8] text-[#1a1030]'

  const headerClass = isDark
    ? 'border-[#7a29ff]/15 bg-[#0a0515]/95'
    : 'border-[#7a29ff]/10 bg-white/95'

  // ---------------------------------------------------------------------------
  // FEEDBACK SCREEN
  // ---------------------------------------------------------------------------

  if (showFeedback) {
    return (
      <div
        className={`flex h-full min-h-screen flex-col ${shellClass}`}
      >
        <header
          className={`flex items-center justify-between border-b px-4 py-3 backdrop-blur-md sm:px-6 ${headerClass}`}
        >
          <div className="flex items-center gap-3">
            <HeaderBadge />

            <span className="text-xs text-[#b0a8c0]">
              Session complete
            </span>
          </div>

          <ThemeToggle
            isDark={isDark}
            onToggle={() => setIsDark((d) => !d)}
          />
        </header>

        <main className="flex-1 overflow-y-auto p-4 sm:p-6">
          <FeedbackCard
            /*
             * IMPORTANT:
             * Actual AI feedback comes first.
             *
             * The mock feedback is ONLY a fallback for cases where
             * the component was rendered without backend feedback.
             */
            feedback={finalFeedback || feedback}
            onClose={() => setShowFeedback(false)}
            onRestart={handleRestart}
          />
        </main>
      </div>
    )
  }

  // ---------------------------------------------------------------------------
  // CANDIDATE SELECTION
  // ---------------------------------------------------------------------------

  if (!interviewStarted) {
    return (
      <div
        className={`flex h-full min-h-screen items-center justify-center px-4 ${shellClass}`}
      >
        <div className="w-full max-w-md rounded-2xl border border-[#7a29ff]/20 bg-[#1e1438]/60 p-6 shadow-xl backdrop-blur-md">
          <HeaderBadge />

          <h1 className="mt-6 text-2xl font-bold">
            AI Technical Interview
          </h1>

          <p className="mt-2 text-sm text-[#b0a8c0]">
            Select your candidate profile to begin your personalized
            interview.
          </p>

          <select
            value={selectedCandidate}
            onChange={(e) => setSelectedCandidate(e.target.value)}
            className="mt-6 w-full rounded-xl border border-[#7a29ff]/20 bg-[#1e1438] px-4 py-3 text-white outline-none"
          >
            <option value="">Select candidate</option>

            {candidatesData.candidates.map((candidate) => (
              <option
                key={candidate.member.id}
                value={candidate.member.id}
              >
                {candidate.member.name}
              </option>
            ))}
          </select>

          <button
            type="button"
            disabled={!selectedCandidate}
            onClick={async () => {
              const candidate = candidatesData.candidates.find(
                (c) => c.member.id === selectedCandidate
              )

              setInterviewStarted(true)
              setIsLoading(true)
              setIsTyping(true)

              try {
                const response = await fetch(
                  'https://vi-codathon-vww2.vercel.app/api/interview',
                  {
                    method: 'POST',
                    headers: {
                      'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                      sessionId,
                      candidate,
                    }),
                  }
                )

                if (!response.ok) {
                  throw new Error(
                    `API error: ${response.status}`
                  )
                }

                const data = await response.json()

                if (data.reply) {
                  setMessages([
                    {
                      id: crypto.randomUUID(),
                      sender: 'ai',
                      text: data.reply,
                      timestamp: new Date(),
                    },
                  ])
                }
              } catch (error) {
                console.error(
                  'Interview initialization failed:',
                  error
                )

                setInterviewStarted(false)
              } finally {
                setIsTyping(false)
                setIsLoading(false)
              }
            }}
            className="gradient-accent mt-5 w-full rounded-xl px-4 py-3 font-semibold text-white disabled:cursor-not-allowed disabled:opacity-40"
          >
            Start Interview
          </button>
        </div>
      </div>
    )
  }

  // ---------------------------------------------------------------------------
  // MAIN INTERVIEW UI
  // ---------------------------------------------------------------------------

  return (
    <div
      className={`flex h-full min-h-screen flex-col ${shellClass}`}
    >
      {/* HEADER */}

      <header
        className={`shrink-0 border-b backdrop-blur-md ${headerClass}`}
      >
        <div className="flex items-center justify-between px-4 py-3 sm:px-6">
          <div className="flex items-center gap-3">
            <HeaderBadge />

            <span className="text-xs text-[#b0a8c0]">
              {isTyping ? 'Typing…' : 'Online'}
            </span>
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
              disabled={!finalFeedback}
              className="hidden rounded-full border border-[#7a29ff]/30 px-3 py-1.5 text-xs font-medium text-[#b0a8c0] transition-colors hover:border-[#d83bd2]/50 hover:text-white disabled:cursor-not-allowed disabled:opacity-40 sm:inline-block"
            >
              End Interview
            </button>

            <ThemeToggle
              isDark={isDark}
              onToggle={() => setIsDark((d) => !d)}
            />

            <button
              type="button"
              aria-label="More options"
              className="rounded-full p-1.5 text-[#b0a8c0] transition-colors hover:bg-[#1e1438] hover:text-white"
            >
              <svg
                className="h-5 w-5"
                fill="currentColor"
                viewBox="0 0 24 24"
              >
                <path d="M12 8c1.1 0 2-.9 2-2s-.9-2-2-2-2 .9-2 2 .9 2 2 2zm0 2c-1.1 0-2 1-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zm0 6c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2z" />
              </svg>
            </button>
          </div>
        </div>

        {/* PROGRESS */}

        <div className="border-t border-[#7a29ff]/10 px-4 py-2.5 sm:px-6">
          <ProgressTracker
            current={currentQuestion}
            total={TOTAL_QUESTIONS}
            isDark={isDark}
          />
        </div>
      </header>

      {/* CHAT */}

      <main className="flex-1 overflow-y-auto px-4 py-5 sm:px-6">
        <div className="mx-auto flex max-w-3xl flex-col gap-5">
          {messages.map((message) => (
            <MessageBubble
              key={message.id}
              message={message}
              isDark={isDark}
            />
          ))}

          {isTyping && <TypingIndicator />}

          <div ref={messagesEndRef} />
        </div>
      </main>

      {/* INPUT */}

      <footer
        className={`shrink-0 px-4 py-4 sm:px-6 ${
          isDark ? 'bg-[#0a0515]' : 'bg-[#f4f2f8]'
        }`}
      >
        <div className="mx-auto max-w-3xl">
          <div
            className={`flex items-center gap-2 rounded-full px-3 py-2 ${
              isDark
                ? 'bg-[#1e1438]'
                : 'border border-[#7a29ff]/15 bg-white shadow-sm'
            }`}
          >
            {/* ATTACH BUTTON */}

            <button
              type="button"
              aria-label="Attach"
              className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-[#b0a8c0] transition-colors hover:text-[#d83bd2]"
            >
              <svg
                className="h-5 w-5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M12 4v16m8-8H4"
                />
              </svg>
            </button>

            {/* TEXT INPUT */}

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

            {/* SEND BUTTON */}

            <button
              type="button"
              onClick={handleSend}
              disabled={!input.trim() || isLoading}
              className="gradient-accent glow-accent flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-white transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-40"
              aria-label="Send message"
            >
              {isLoading ? (
                <svg
                  className="h-5 w-5 animate-spin"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  />

                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.343 5.824 3.515 7.938l2.485-2.647z"
                  />
                </svg>
              ) : (
                <svg
                  className="h-5 w-5"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={2}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"
                  />
                </svg>
              )}
            </button>
          </div>

          {/* MOBILE CONTROLS */}

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
                disabled={!finalFeedback}
                className="text-xs font-medium text-[#b0a8c0] hover:text-[#d83bd2] disabled:cursor-not-allowed disabled:opacity-40"
              >
                End Interview
              </button>
            </div>

            <span className="text-[11px] text-[#b0a8c0]">
              Enter to send
            </span>
          </div>
        </div>
      </footer>
    </div>
  )
}

export { sendMessage }
