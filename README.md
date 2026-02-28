# 🚀 ResearchPilot – AI-Powered Research Intelligence Platform

ResearchPilot is a full-stack AI-powered research intelligence platform that transforms raw academic search results into structured, actionable insights.

It integrates real-time academic metadata retrieval with AI-driven trend analysis, research gap identification, research question generation, personalized behavioral analytics, and opportunity forecasting.

---

## 🎯 Problem Statement

Academic databases provide large volumes of research papers but lack structured insight, gap detection, trend synthesis, and personalized research guidance.

Researchers face:

- Information overload
- Manual literature review burden
- Difficulty identifying research gaps
- No behavioral research analytics
- No strategic topic recommendations

ResearchPilot solves this by combining:
- Academic metadata APIs
- AI-powered summarization
- Intelligent analytics
- Personalized opportunity detection

---

## 🧠 Key Features

### 🔎 AI Research Search
- Fetches live academic data using Crossref API
- Generates structured AI trend summary
- Identifies research gaps
- Suggests high-quality research questions

### 📊 Trend Visualization
- Publication trend by year
- Top authors analysis
- Keyword extraction and frequency

### 📁 Recent Activity
- Stores research history in database
- Persistent across sessions
- Timestamped research logs

### 📈 Research Insights
- Total searches count
- Most explored topic
- Research span analysis
- Activity intensity score
- Behavioral classification

### 🔥 Opportunity Radar
- AI-generated emerging research opportunities
- Based on user’s historical searches
- Click-to-search intelligent suggestions

---

## 🏗 Tech Stack

### Backend
- FastAPI
- SQLAlchemy ORM
- SQLite Database
- JWT Authentication
- OpenAPI (Swagger Docs)

### AI & External APIs
- OpenAI GPT-4o-mini
- Crossref Academic API

### Frontend
- React
- React Router
- Axios
- Recharts
- Tailwind CSS
- Lucide Icons

---

## 🧩 System Architecture

User → React Frontend → FastAPI Backend  
→ Crossref API (Academic Data)  
→ OpenAI API (AI Analysis)  
→ SQLite Database (Persistence)  
→ Back to React (Visualization)

---

## 🔐 Authentication

- JWT-based authentication
- Token stored in localStorage
- Protected routes via middleware
- Secure API access using Bearer tokens

---

## 📊 API Endpoints

| Method | Endpoint | Description |
|--------|----------|------------|
| POST | `/research/search` | Search and analyze research topic |
| GET | `/research/history` | Fetch user search history |
| GET | `/research/insights` | Generate behavioral analytics |
| GET | `/research/opportunities` | AI-based opportunity suggestions |

Interactive API documentation available at:
