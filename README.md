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
- **Frontend:** [https://frontend.yourapp.com](#)
- **Backend API:** [https://backend.yourapp.com/docs](#)

## Local Installation
```bash
poetry install
uvicorn app.server:app --reload

