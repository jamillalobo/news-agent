# News Agent - Article Processing and Query System

A system for ingesting, processing, and querying news articles using RAG (Retrieval-Augmented Generation).

## Key Features
- Article processing from CSV URLs
- Content extraction and cleaning using LLMs
- Vector storage in PostgreSQL with pgvector
- Semantic search through embeddings
- Contextual responses with source citations

## Initialize project
- Docker and Docker Compose installed
- Get an Gemini API key
- Create a .env file based on .env.example
- Add your gemini api-key and pg connection
```
OPENAI_API_KEY=your_key_here
PG_CONNECTION_STRING=postgres://postgres:password@postgres:5432/newsdb
```
- Build and start containers
```
docker-compose up -d --build
```
- Test the endpoint POST /api/agent - RAG query

```
{
  "query": "What is this article about?"
}

```
## Usage examples
```
# Semantic similarity query
curl -X POST http://localhost:3000/api/agent \
  -H "Content-Type: application/json" \
  -d '{"query":"Latest tech news"}'

# Response:
{
  "answer": "The latest tech news includes...",
  "sources": [
    {
      "title": "OpenAI's new model announced",
      "url": "https://example.com/tech",
      "date": "2025-03-01"
    }
  ]
}
```
## Project Structure
```
news-agent/
├── data/               # Data files (CSV)
├── src/
│   ├── config/         # Configuration
│   ├── controllers/    # Endpoint logic
│   ├── models/         # Data types and models
│   ├── services/       # Business logic
│   ├── utils/          # Utilities
│   ├── app.ts          # Express config
│   └── server.ts       # Entry point
├── docker-compose.yml  # Docker config
├── Dockerfile          # Application build
└── tsconfig.json       # TypeScript config
```


