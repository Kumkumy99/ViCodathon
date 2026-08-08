 import { useCallback, useEffect, useRef, useState } from 'react'
import MessageBubble, { BOT_NAME } from './MessageBubble'
import TypingIndicator from './TypingIndicator'
import FeedbackCard from './FeedbackCard'
import { mockFeedback } from '../data/mockData'
import candidatesData from '../data/candidates.json'

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000'
const TOTAL_QUESTIONS = 8

// -----------------------------------------------------------------------------
// BACKEND API CALL WITH HISTORY SYNC
// -----------------------------------------------------------------------------

async function sendMessage(message, sessionId, candidate, history = []) {
  // Normalize candidate profile object structure
  const normalizedCandidate = candidate?.member 
    ? { ...candidate, ...candidate.member } 
    : candidate;

  const response = await fetch(
    `${API_BASE_URL}/api/interview`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        sessionId,
        candidate: normalizedCandidate,
        message,
        history, // Sync history to prevent serverless session drops
      }),
    }
  )

  if (!response.ok) {
    throw new Error(`API error: ${response.status}`)
  }

  const data = await response.json()
  const episodeSaved = response.headers.get('X-Breeth-Episode-Saved') === 'true'

  return {
    id: crypto.randomUUID(),
    sender: 'ai',
    text: data.reply,
    timestamp: new Date(),
    done: data.done,
    feedback: data.feedback,
    episodeSaved,
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
        <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <circle cx="12" cy="12" r="4" />
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 2v2m0 16v2M4.93 4.93l1.41 1.41m11.32 11.32l1.41 1.41M2 12h2m16 0h2M4.93 19.07l1.41-1.41M17.66 6.34l1.41-1.41" />
        </svg>
      ) : (
        <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M21 12.79A9 9 0 1111.21 3 7 7 0 0021 12.79z" />
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

function HeaderBadge() {
  return (
    <div className="flex items-center gap-2">
      <div className="h-2.5 w-2.5 rounded-full bg-[#d83bd2]" />
      <span className="text-sm font-semibold">{BOT_NAME}</span>
    </div>
  )
}

function CandidatePreview({ candidate, isDark }) {
  if (!candidate) return null

  const profile = candidate.member || candidate

  return (
    <div
      className={`mt-4 rounded-2xl border p-4 ${
        isDark
          ? 'border-[#7a29ff]/20 bg-[#120b25]'
          : 'border-[#7a29ff]/15 bg-[#f8f6fc]'
      }`}
    >
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-sm font-semibold">{profile.name}</p>
          <p className={`text-xs ${isDark ? 'text-[#b0a8c0]' : 'text-[#6b6280]'}`}>
            {profile.jobRole}
          </p>
        </div>
        <span className="rounded-full bg-[#d83bd2]/15 px-2.5 py-1 text-[11px] font-medium text-[#d83bd2]">
          Ready
        </span>
      </div>

      <div className={`mt-3 grid gap-2 text-sm ${isDark ? 'text-[#dcd7eb]' : 'text-[#4b3d67]'}`}>
        <div className="flex items-center justify-between gap-2">
          <span>Experience</span>
          <span className="font-medium">{profile.yearsExperience} yrs</span>
        </div>
        <div className="flex items-center justify-between gap-2">
          <span>Education</span>
          <span className="font-medium">{profile.education}</span>
        </div>
      </div>
    </div>
  )
}

// -----------------------------------------------------------------------------
// MAIN CHAT WINDOW COMPONENT
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
  const [finalFeedback, setFinalFeedback] = useState(null)
  const [isDark, setIsDark] = useState(true)
  
  // Dynamic Session ID generator
  const [sessionId, setSessionId] = useState(() => crypto.randomUUID())

  const [selectedCandidate, setSelectedCandidate] = useState('')
  const [interviewStarted, setInterviewStarted] = useState(false)

  const messagesEndRef = useRef(null)
  const inputRef = useRef(null)

  const candidatesList = candidatesData.candidates || candidatesData || []
  const selectedCandidateProfile = candidatesList.find(
    (c) => (c.member?.id || c.id) === selectedCandidate
  )

  // Question Progress Counter
  const aiQuestionCount = messages.filter((m) => m.sender === 'ai').length
  const currentQuestion = Math.min(Math.max(aiQuestionCount, 1), TOTAL_QUESTIONS)

  useEffect(() => {
    document.documentElement.classList.toggle('dark', isDark)
  }, [isDark])

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, isTyping, showFeedback])

  // FIX: Reset with fresh sessionId
  const handleRestart = useCallback(() => {
    setMessages([])
    setInput('')
    setIsTyping(false)
    setIsLoading(false)
    setShowFeedback(false)
    setFinalFeedback(null)
    setInterviewStarted(false)
    setSelectedCandidate('')
    setSessionId(crypto.randomUUID())
  }, [])

  // Send Candidate Message
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
      const candidatesList = candidatesData.candidates || candidatesData || []
      const rawCandidate = candidatesList.find(
        (c) => c.member?.id === selectedCandidate || c.id === selectedCandidate
      )

      // Map chat history for LLM
      const formattedHistory = messages.map((m) => ({
        role: m.sender === 'ai' ? 'assistant' : 'user',
        content: m.text,
      }))

      const aiMessage = await sendMessage(
        trimmed,
        sessionId,
        rawCandidate,
        formattedHistory
      )

      setMessages((prev) => [
        ...prev.map((m) =>
          m.id === candidateMessage.id
            ? { ...m, savedEpisode: aiMessage.episodeSaved }
            : m
        ),
        aiMessage,
      ])

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
  }, [input, isLoading, showFeedback, selectedCandidate, sessionId, messages])

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  const handleEndInterview = () => {
    if (finalFeedback) {
      setShowFeedback(true)
    }
  }

  const shellClass = isDark ? 'bg-[#0a0515] text-white' : 'bg-[#f4f2f8] text-[#1a1030]'
  const headerClass = isDark ? 'border-[#7a29ff]/15 bg-[#0a0515]/95' : 'border-[#7a29ff]/10 bg-white/95'

  // FEEDBACK SCREEN
  if (showFeedback) {
    return (
      <div className={`flex h-full min-h-screen flex-col ${shellClass}`}>
        <header className={`flex items-center justify-between border-b px-4 py-3 backdrop-blur-md sm:px-6 ${headerClass}`}>
          <div className="flex items-center gap-3">
            <HeaderBadge />
            <span className="text-xs text-[#b0a8c0]">Session complete</span>
          </div>
          <ThemeToggle isDark={isDark} onToggle={() => setIsDark((d) => !d)} />
        </header>

        <main className="flex-1 overflow-y-auto p-4 sm:p-6">
          <FeedbackCard
            feedback={finalFeedback || feedback}
            onClose={() => setShowFeedback(false)}
            onRestart={handleRestart}
          />
        </main>
      </div>
    )
  }

  // CANDIDATE SELECTION SCREEN
  if (!interviewStarted) {
    return (
      <div className={`flex h-full min-h-screen items-center justify-center px-4 ${shellClass}`}>
        <div className="w-full max-w-md rounded-2xl border border-[#7a29ff]/20 bg-[#1e1438]/60 p-6 shadow-xl backdrop-blur-md">
          <HeaderBadge />

          <h1 className="mt-6 text-2xl font-bold">AI Technical Interview</h1>

          <p className="mt-2 text-sm text-[#b0a8c0]">
            Select your candidate profile to begin your personalized interview.
          </p>

          <CandidatePreview candidate={selectedCandidateProfile} isDark />

          <div className="mt-4 rounded-xl border border-[#7a29ff]/15 bg-[#120b25]/80 p-3 text-sm text-[#dcd7eb]">
            <p className="font-semibold">What to expect</p>
            <ul className="mt-2 space-y-1.5 text-xs text-[#b0a8c0]">
              <li>• Tailored questions based on the candidate profile</li>
              <li>• Live follow-up prompts for deeper technical discussion</li>
              <li>• A structured feedback summary at the end</li>
            </ul>
          </div>

          <select
            value={selectedCandidate}
            onChange={(e) => setSelectedCandidate(e.target.value)}
            className="mt-6 w-full rounded-xl border border-[#7a29ff]/20 bg-[#1e1438] px-4 py-3 text-white outline-none"
          >
            <option value="">Select candidate</option>
            {candidatesList.map((cand, idx) => {
              const id = cand.member?.id || cand.id || idx
              const name = cand.member?.name || cand.name || `Candidate ${idx + 1}`
              return (
                <option key={id} value={id}>
                  {name}
                </option>
              )
            })}
          </select>

          <button
            type="button"
            disabled={!selectedCandidate}
            onClick={async () => {
              const rawCandidate = candidatesList.find(
                (c) => (c.member?.id || c.id) === selectedCandidate
              )
              const normalizedCand = rawCandidate?.member ? { ...rawCandidate, ...rawCandidate.member } : rawCandidate

              setInterviewStarted(true)
              setIsLoading(true)
              setIsTyping(true)

              try {
                const response = await fetch(
                  `${API_BASE_URL}/api/interview`,
                  {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                      sessionId,
                      candidate: normalizedCand,
                    }),
                  }
                )

                if (!response.ok) throw new Error(`API error: ${response.status}`)
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
                console.error('Interview initialization failed:', error)
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

  // MAIN CHAT UI
  return (
    <div className={`flex h-full min-h-screen flex-col ${shellClass}`}>
      <header className={`shrink-0 border-b backdrop-blur-md ${headerClass}`}>
        <div className="flex items-center justify-between px-4 py-3 sm:px-6">
          <div className="flex items-center gap-3">
            <HeaderBadge />
            <span className="text-xs text-[#b0a8c0]">
              {isTyping ? 'Typing…' : 'Online'}
            </span>
          </div>

          <div className="flex items-center gap-1 sm:gap-2">
            {selectedCandidateProfile && (
              <div
                className={`hidden rounded-full border px-2.5 py-1 text-[11px] font-medium sm:inline-flex ${
                  isDark
                    ? 'border-[#7a29ff]/20 bg-[#1e1438] text-[#dcd7eb]'
                    : 'border-[#7a29ff]/15 bg-[#f8f6fc] text-[#4b3d67]'
                }`}
              >
                {selectedCandidateProfile.member?.name || selectedCandidateProfile.name}
              </div>
            )}

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

            <ThemeToggle isDark={isDark} onToggle={() => setIsDark((d) => !d)} />
          </div>
        </div>

        <div className="border-t border-[#7a29ff]/10 px-4 py-2.5 sm:px-6">
          <ProgressTracker
            current={currentQuestion}
            total={TOTAL_QUESTIONS}
            isDark={isDark}
          />
        </div>
      </header>

      <main className="flex-1 overflow-y-auto px-4 py-5 sm:px-6">
        <div className="mx-auto flex max-w-3xl flex-col gap-5">
          {messages.length === 0 && !isTyping && (
            <div
              className={`animate-fade-in rounded-2xl border px-4 py-4 text-sm ${
                isDark
                  ? 'border-[#7a29ff]/20 bg-[#1e1438]/70 text-[#dcd7eb]'
                  : 'border-[#7a29ff]/15 bg-white text-[#4b3d67] shadow-sm'
              }`}
            >
              <p className="font-semibold">You’re ready to begin</p>
              <p className="mt-1 text-[#b0a8c0]">
                Share your answer naturally and I’ll guide the conversation from there.
              </p>
            </div>
          )}

          {messages.map((message) => (
            <MessageBubble key={message.id} message={message} isDark={isDark} />
          ))}
          {isTyping && <TypingIndicator />}
          <div ref={messagesEndRef} />
        </div>
      </main>

      <footer className={`shrink-0 px-4 py-4 sm:px-6 ${isDark ? 'bg-[#0a0515]' : 'bg-[#f4f2f8]'}`}>
        <div className="mx-auto max-w-3xl">
          <div className={`flex items-center gap-2 rounded-full px-3 py-2 ${isDark ? 'bg-[#1e1438]' : 'border border-[#7a29ff]/15 bg-white shadow-sm'}`}>
            <textarea
              ref={inputRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Type your answer…"
              rows={1}
              disabled={isLoading}
              className={`max-h-24 min-h-[36px] flex-1 resize-none bg-transparent px-3 py-2 text-sm placeholder-[#b0a8c0] focus:outline-none disabled:opacity-60 ${
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
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.343 5.824 3.515 7.938l2.485-2.647z" />
                </svg>
              ) : (
                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                </svg>
              )}
            </button>
          </div>
        </div>
      </footer>
    </div>
  )
}

export { sendMessage }