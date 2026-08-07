export const mockMessages = [
  {
    id: '1',
    sender: 'ai',
    text: "Hello! I'm your AI interviewer today. We'll discuss your experience with React and frontend development. Ready to begin?",
    timestamp: new Date(Date.now() - 300000),
  },
  {
    id: '2',
    sender: 'candidate',
    text: "Yes, I'm ready. I've been working with React for about three years, mostly on enterprise dashboards and customer-facing apps.",
    timestamp: new Date(Date.now() - 240000),
  },
  {
    id: '3',
    sender: 'ai',
    text: 'Great. Can you walk me through how you manage state in a complex React application? When would you reach for Context vs. a dedicated state library?',
    timestamp: new Date(Date.now() - 180000),
  },
  {
    id: '4',
    sender: 'candidate',
    text: 'For local UI state I use useState and useReducer. Context works well for theme, auth, and other app-wide values that change infrequently. For complex async flows or shared server cache, I prefer TanStack Query combined with Zustand when needed.',
    timestamp: new Date(Date.now() - 120000),
  },
]

export const mockAiReplies = [
  "That's a solid approach. How do you ensure accessibility in the components you build?",
  'Interesting. Can you describe a performance issue you diagnosed and how you resolved it?',
  'Thank you for sharing. One last question: how do you approach testing React components?',
  "Excellent. That wraps up our technical discussion. I'll prepare your feedback shortly.",
]

export const mockFeedback = {
  summary:
    'Strong frontend fundamentals with clear reasoning around state management and tooling choices. Communication was structured and confident throughout the interview.',
  strengths: [
    'Articulates trade-offs between Context, local state, and dedicated libraries',
    'Demonstrates practical experience with modern React patterns',
    'Provides concrete examples rather than abstract definitions',
    'Maintains a professional, collaborative tone',
  ],
  gaps: [
    'Could expand on accessibility testing workflows and tooling',
    'Limited discussion of performance profiling techniques',
    'No mention of error boundaries or production monitoring practices',
  ],
  nextSteps: [
    'Review WCAG guidelines and implement axe-core in a sample project',
    'Practice explaining React Profiler and Core Web Vitals optimization',
    'Prepare a short case study on a challenging bug or refactor',
    'Schedule a follow-up mock interview focused on system design',
  ],
}
