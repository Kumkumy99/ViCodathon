 # 🤖 AI Interview Assistant

**AI Interview Assistant** is an AI-powered technical interview platform that conducts personalized mock interviews, evaluates candidate responses, and generates an intelligent performance report.

The platform combines a conversational interview experience with AI-powered evaluation and **Breeth-powered memory**, allowing interview interactions to be captured as meaningful memory rather than only as raw conversation history.

---

## 🚀 Live Demo

### 🌐 Frontend

https://vi-codathon-uvzc.vercel.app/

### ⚙️ Backend

https://vi-codathon-vww2.vercel.app/

---

## 📌 Introduction

Traditional mock interviews often rely on static questions and generic feedback.

**AI Interview Assistant** provides a more interactive approach by using AI to conduct a multi-turn technical interview based on the candidate's profile, curriculum, previous responses, and interview context.

The system:

1. Takes the candidate's profile as context.
2. Generates technical questions dynamically.
3. Evaluates each response.
4. Handles requests for hints.
5. Maintains interview conversation context.
6. Adapts question difficulty based on candidate performance.
7. Conducts an 8-question technical interview.
8. Stores interview episodes using Breeth as a memory layer.
9. Generates a personalized AI evaluation report.

The final report provides a structured assessment of the candidate's:

* Core fundamentals
* System architecture knowledge
* Problem-solving ability
* Technical strengths
* Knowledge gaps
* Recommended next steps

---

# ✨ Features

## 🎯 Personalized Interviews

Candidates select their profile before starting the interview.

The AI uses candidate information and curriculum data to personalize the interview experience.

---

## 💬 Interactive AI Interview

The interview is conducted through a conversational chat interface.

The AI asks **one technical question at a time** and uses the candidate's previous responses to determine the next question.

The interview contains **8 questions** with adaptive difficulty.

---

## 🧠 Dynamic Question Generation

Questions are generated dynamically using:

* Candidate profile
* Curriculum
* Previous conversation history
* Candidate responses
* Current interview performance

This prevents the interview from being a simple predefined questionnaire.

---

## 💡 Intelligent Hint Handling

If the candidate:

* Says they don't know
* Gets stuck
* Requests a hint

the AI provides a conceptual hint and allows the candidate to retry rather than immediately revealing the complete answer.

---

## 🧠 Breeth Memory Layer

**Breeth is used as the memory layer for the AI interview agent.**

While Groq/Llama is responsible for reasoning and generating interview responses, Breeth captures interview interactions as structured memory.

The flow is:

```text
Candidate Answer
       ↓
Interview Episode
       ↓
      Breeth
       ↓
Meaningful Memory
```

Instead of treating an interview as only a long transcript, the memory layer can capture the important information contained in interview episodes, including relevant entities, relationships, and cognitive patterns.

This creates a foundation for maintaining meaningful candidate memory across interview interactions.

### Current Breeth Integration

The current implementation records interview episodes and sends them to Breeth as the memory layer.

```text
Candidate
    ↓
AI Interviewer
    ↓
Candidate Response
    ↓
Breeth Memory
```

This provides a foundation for future long-term candidate memory and context retrieval.

---

## 🛡️ Prompt Injection Protection

The AI interviewer is provided with security guardrails to prevent candidates from manipulating the interview through instructions such as:

* Ignoring system instructions
* Requesting maximum scores
* Bypassing interview questions
* Attempting to override evaluation rules

---

## 📊 AI-Powered Evaluation

After the 8-question interview, the complete interview is evaluated by the AI.

The evaluation includes:

### Performance Scores

* **Core Fundamentals**
* **System Architecture**
* **Problem Solving**

### Qualitative Feedback

* **Summary**
* **Strengths**
* **Gaps**
* **Next Steps**

---

## 📤 Feedback Export

Candidates can:

* Copy their feedback
* Export the evaluation as JSON
* Export the evaluation as Markdown

---

## 🌙 Responsive Interface

The application provides:

* Responsive chat UI
* Candidate selection
* Interview progress tracking
* Dark/light mode
* Typing indicator
* Feedback dashboard

---

# 🔄 Application Workflow

```text
                    ┌──────────────────────┐
                    │   Candidate Profile  │
                    │       Selection      │
                    └──────────┬───────────┘
                               │
                               ▼
                    ┌──────────────────────┐
                    │   Start Interview    │
                    └──────────┬───────────┘
                               │
                               ▼
                 ┌────────────────────────────┐
                 │       AI Interviewer       │
                 │                            │
                 │ Candidate Profile          │
                 │ Curriculum                 │
                 │ Conversation History       │
                 └─────────────┬──────────────┘
                               │
                               ▼
                    ┌──────────────────────┐
                    │   Technical Question │
                    └──────────┬───────────┘
                               │
                               ▼
                    ┌──────────────────────┐
                    │ Candidate's Answer   │
                    └──────────┬───────────┘
                               │
                    ┌──────────┴───────────┐
                    ▼                      ▼
          ┌──────────────────┐   ┌──────────────────┐
          │  AI Evaluation   │   │  Breeth Memory   │
          │  & Adaptation    │   │     Layer        │
          └────────┬─────────┘   └──────────────────┘
                   │
                   ▼
          ┌──────────────────────┐
          │ Feedback / Next      │
          │ Technical Question   │
          └──────────┬───────────┘
                     │
                     ▼
                 Repeat for
                 8 Questions
                     │
                     ▼
          ┌──────────────────────┐
          │   Final Evaluation   │
          └──────────┬───────────┘
                     │
                     ▼
          ┌─────────────────────────────┐
          │      Feedback Dashboard     │
          │                             │
          │ • Summary                   │
          │ • Performance Scores        │
          │ • Strengths                 │
          │ • Gaps                      │
          │ • Recommended Next Steps    │
          └─────────────────────────────┘
```

---

# 🏗️ System Architecture

```text
┌─────────────────────────────────┐
│            FRONTEND             │
│                                 │
│  Candidate Selection            │
│  Chat Interface                 │
│  Progress Tracker               │
│  Feedback Dashboard             │
└───────────────┬─────────────────┘
                │
                │ HTTPS / REST API
                ▼
┌─────────────────────────────────┐
│             BACKEND             │
│                                 │
│       /api/interview            │
│                                 │
│  Session Management             │
│  Candidate Context              │
│  Curriculum Context             │
│  Conversation History           │
│  Interview Flow                 │
│  AI Evaluation                  │
└───────────────┬─────────────────┘
                │
        ┌───────┴────────┐
        │                │
        ▼                ▼
┌───────────────┐  ┌─────────────────┐
│     GROQ      │  │     BREETH      │
│               │  │                 │
│ Llama 3.3 70B │  │ Memory Layer    │
│       ↓       │  │                 │
│ Llama 3.1 8B  │  │ Episode Storage │
│   Fallback    │  │                 │
└───────────────┘  └─────────────────┘
```

### Component Responsibilities

| Component           | Responsibility                                             |
| ------------------- | ---------------------------------------------------------- |
| **React Frontend**  | Candidate selection, chat interface, progress, feedback    |
| **Next.js Backend** | API, sessions, interview orchestration                     |
| **Groq / Llama**    | Question generation, response evaluation, final assessment |
| **Breeth**          | Interview memory and episode storage                       |
| **Vercel**          | Deployment and serverless execution                        |

---

# 🧠 AI Interview Pipeline

## 1. Candidate Initialization

The candidate selects their profile from the available candidate data.

The candidate information is passed to the backend as context.

---

## 2. Interview Session Creation

A unique session ID is generated for every interview.

The backend maintains the current interview state, including:

* Candidate information
* Turn count
* Conversation history
* Maximum number of turns

---

## 3. First Question Generation

The AI receives:

* Candidate details
* Curriculum
* Interview instructions

It then generates a personalized greeting and the first technical question.

---

## 4. Multi-Turn Interview

For every candidate response:

```text
Candidate Answer
       ↓
Conversation History
       ↓
AI Evaluation
       ↓
Feedback / Hint
       ↓
Next Technical Question
       ↓
Breeth Episode Memory
```

The interview continues for **8 questions**.

---

## 5. Memory Layer

Interview interactions are recorded as episodes and sent to Breeth.

```text
Interview Interaction
        ↓
Episode
        ↓
Breeth
        ↓
Memory Representation
```

Breeth serves as the dedicated memory layer, separating **AI reasoning** from **AI memory**.

---

## 6. Final Evaluation

After eight questions, the interview is evaluated by the AI evaluation pipeline.

The AI returns a structured JSON response containing:

* Summary
* Performance scores
* Strengths
* Knowledge gaps
* Recommended next steps

The generated evaluation is then displayed directly in the frontend.

---

# 🛠️ Tech Stack

## Frontend

* **React**
* **JavaScript**
* **Tailwind CSS**
* **Fetch API**
* Responsive UI
* Component-based architecture

## Backend

* **Next.js**
* **Next.js API Routes**
* **JavaScript**
* REST API
* In-memory session management

## AI / LLM

* **Groq API**
* **Llama 3.3 70B Versatile**
* **Llama 3.1 8B Instant** as fallback
* Structured JSON evaluation

## Memory

* **Breeth**
* AI agent memory layer
* Interview episode storage

## Data

* JSON-based candidate profiles
* JSON-based curriculum data

## Deployment & Development

* **GitHub**
* **Vercel**
* Git-based deployment

---

# 📂 Project Structure

```text
AI-Interview-Assistant/
│
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── ChatWindow.jsx
│   │   │   ├── FeedbackCard.jsx
│   │   │   ├── MessageBubble.jsx
│   │   │   └── TypingIndicator.jsx
│   │   │
│   │   ├── data/
│   │   │   └── candidates.json
│   │   │
│   │   └── ...
│   │
│   └── ...
│
├── backend/
│   ├── app/
│   │   └── ...
│   ├── data/
│   │   ├── candidates.json
│   │   └── curriculum.json
│   └── ...
│
├── prompts.md
└── README.md
```

---

# 🔌 API

## Interview Endpoint

```text
POST /api/interview
```

### Request

```json
{
  "sessionId": "unique-session-id",
  "candidate": {
    "member": {
      "id": "candidate-id"
    }
  },
  "message": "Candidate's answer"
}
```

### During Interview

```json
{
  "reply": "AI generated feedback and next question",
  "done": false
}
```

### Final Evaluation

```json
{
  "reply": "Thank you for completing the technical interview!",
  "done": true,
  "feedback": {
    "summary": "Overall candidate evaluation",
    "scores": {
      "coreFundamentals": 85,
      "systemArchitecture": 75,
      "problemSolving": 80
    },
    "strengths": [],
    "gaps": [],
    "next": []
  }
}
```

---

# 🌐 Deployment

The application is deployed using **Vercel**.

### Frontend

https://vi-codathon-uvzc.vercel.app/

### Backend

https://vi-codathon-vww2.vercel.app/

The frontend communicates with the deployed backend through:

```text
/api/interview
```

The backend is configured with CORS to allow requests from the deployed frontend.

---

# 🔐 Environment Variables

The Groq API key is stored only on the backend.

```text
GROQ_API_KEY=your_groq_api_key
```

The API key is never exposed to the frontend.

Breeth credentials/configuration are also kept server-side and are not exposed to the frontend.

---

# 💻 Local Development

## Prerequisites

Make sure you have:

* Node.js
* npm
* Git
* Groq API key
* Breeth credentials/configuration

## Clone Repository

```bash
git clone <repository-url>
cd AI-Interview-Assistant
```

## Install Dependencies

```bash
npm install
```

## Configure Environment Variables

Create a `.env.local` file for the backend:

```text
GROQ_API_KEY=your_groq_api_key
```

Configure the required Breeth environment variables according to your Breeth setup.

## Start Development Server

```bash
npm run dev
```

Open the application in your browser and select a candidate to start the interview.

---

# 🔒 Security

The application includes several security considerations:

* Groq API credentials remain server-side.
* Breeth credentials remain server-side.
* CORS is configured on the backend.
* Prompt injection attempts are addressed through interviewer system instructions.
* AI evaluation is constrained to a predefined JSON structure.
* Each interview uses a unique session ID.
* Candidate responses remain associated with their active interview session.

---

# 👩‍💻 Team

| Member            | GitHub      | Role                   | Contributions                                                                                                                                                                     |
| ----------------- | ----------- | ---------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Kumkum Yadav**  | `kumkumy99` | Frontend & Integration | Frontend UI/UX, React interface, candidate selection, chat interface, feedback dashboard, frontend-backend integration, deployment and Vercel configuration                       |
| **Kriti Dwivedi** | `kriti05`   | Backend & AI           | Backend development, Groq AI integration, interview engine, multi-turn interview logic, AI evaluation pipeline, Breeth memory integration, MCP integration and backend deployment |

---

# 🎯 Future Improvements

Potential future enhancements include:

* Persistent interview history
* Database-backed sessions
* Resume-based interview personalization
* Voice-based interviews
* Multiple difficulty levels
* Role-specific interview tracks
* Interview analytics dashboard
* Long-term candidate progress tracking
* **Breeth-based long-term candidate memory retrieval**
* Advanced MCP-based context retrieval
* More detailed competency analysis

---

# 💡 Why AI Interview Assistant?

Most traditional mock interview platforms rely on static questions and generic feedback.

**AI Interview Assistant** makes the experience more dynamic by combining:

```text
Candidate Profile
        +
Curriculum
        +
Conversation History
        +
Candidate Responses
        +
Breeth Memory
        ↓
   AI Interviewer
        ↓
Adaptive Interview
        ↓
Personalized Evaluation
```

The goal is not simply to determine whether a candidate answered a question correctly.

The system aims to identify:

* What the candidate understands
* How they approach technical problems
* Where their knowledge gaps exist
* Which areas they should improve next
* What information from the interview should be retained as memory

This transforms a mock interview from a simple question-answer session into a **personalized AI-powered learning, assessment, and memory experience**.

---

# 🏆 Built for ABTalks Vibe Code Hackathon

Built collaboratively by:

**Kumkum Yadav** · `kumkumy99`
**Kriti Dwivedi** · `kriti05`

### 🔗 Quick Links

* 🌐 **Live Demo:** https://vi-codathon-uvzc.vercel.app/
* ⚙️ **Backend:** https://vi-codathon-vww2.vercel.app/
* 💻 **GitHub:** Add your repository URL here

---

## ⭐ Thank You

Thank you for checking out **AI Interview Assistant**!

We hope it demonstrates how conversational AI can make technical interview preparation more personalized, interactive, and actionable.

