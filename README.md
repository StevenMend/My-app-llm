# AI PDF Reader

A full-stack application for uploading and analyzing PDF documents using artificial intelligence.

## Features
- Authentication with JWT
- Backend: FastAPI, LangChain, PostgreSQL, pgvector
- PDF processing and segmentation with Unstructured
- Analysis using language models (OpenAI or Mixtral via Ollama)
- Frontend: Next.js, TailwindCSS, Zustand
- Deployment on Railway and Vercel

## Demo
- **Frontend:** [frontend-production-77dd.up.railway.app](#)
- **Backend API:** [my-app-llm-production.up.railway.app](#)

## Local Installation
```bash
poetry install
uvicorn app.server:app --reload

