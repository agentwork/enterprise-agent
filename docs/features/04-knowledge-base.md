# Feature Specification: Knowledge Base & RAG

## 1. Overview
The **Knowledge Base** (Retrieval-Augmented Generation) empowers agents to answer complex business questions by accessing internal documents, policies, and historical data. It transforms unstructured data (PDFs, Docs, Emails) into actionable intelligence using semantic search.

## 2. Target Audience
- **Strategy Teams**: Searching past campaigns and market research.
- **Support Teams**: Looking up product specs and troubleshooting guides.
- **Sales Teams**: Finding relevant case studies and sales assets.

## 3. Key Functionality

### 3.1 Document Ingestion
- **Description**: Upload and process documents into searchable chunks.
- **Capabilities**:
    - **Multi-Format Support**: PDF, DOCX, TXT, MD, HTML (Web Scraping).
    - **Chunking**: Smart splitting by paragraphs or sections (LangChain).
    - **Metadata Extraction**: Title, Author, Date, Keywords.

- **Key Flow (Ingestion)**:
    1.  User uploads a file (e.g., `Q3_Report.pdf`).
    2.  System saves file to Supabase Storage.
    3.  Background job parses text from the file.
    4.  Text is split into chunks (e.g., 500 tokens).
    5.  Chunks are embedded using OpenAI `text-embedding-3-small`.
    6.  Vectors are stored in `document_chunks` table via `pgvector`.

### 3.2 Semantic Search (RAG)
- **Description**: Find relevant information based on meaning, not just keywords.
- **Capabilities**:
    - **Vector Embeddings**: Store document chunks in `pgvector` (Supabase).
    - **Similarity Search**: Cosine similarity to rank relevant chunks.
    - **Hybrid Search**: Combine keyword match with semantic match for better accuracy.

- **Key Flow (Search)**:
    1.  User asks: "What is our travel reimbursement policy?"
    2.  Agent converts query to vector embedding.
    3.  Database performs vector similarity search against `document_chunks`.
    4.  Top 5 relevant chunks are retrieved.
    5.  Agent synthesizes an answer using the chunks as context.

### 3.3 Answer Generation
- **Description**: Synthesize answers from retrieved context.
- **Capabilities**:
    - **Citation**: Provide links to source documents (e.g., "According to [Q3 Report, p.12]...").
    - **Context Awareness**: Consider user role (e.g., Marketing vs. Finance view).

## 4. Data & Schema
- **Database Tables**:
    - `documents`:
        - `id`: UUID
        - `name`: Text
        - `url`: Text (Supabase Storage URL)
        - `type`: Text (MIME type)
        - `uploaded_by`: UUID
        - `created_at`: Timestamp
    - `document_chunks`:
        - `id`: UUID
        - `document_id`: UUID
        - `content`: Text
        - `embedding`: Vector(1536)
        - `metadata`: JSONB (Page number, Section title)
- **Dependencies**:
    - `pgvector` extension for PostgreSQL.
    - OpenAI Embeddings API (`text-embedding-3-small`).

## 5. Integration Points
- **Input**: File Upload UI, URL Input.
- **Output**: Search Results (`<DocumentCard />`), Generated Answers with Citations.
- **External**: Google Drive MCP (Planned), SharePoint MCP (Planned).

## 6. User Scenarios
- **Scenario A**: Case Study Retrieval.
    - User: "Find me examples of successful FMCG campaigns."
    - Agent: Embeds query -> Searches `document_chunks` -> Ranks results.
    - Agent: Retrieves top 3 case studies -> Summarizes key metrics.
    - UI: Displays summaries with links to original PDFs.

- **Scenario B**: Policy Question.
    - User: "What is our travel reimbursement policy?"
    - Agent: Searches HR Handbook -> Extracts relevant section.
    - Agent: "Expenses up to $50/day are covered without receipt..." (Cites Handbook).

## 7. Future Roadmap
- **Real-time Indexing**: Automatically index new files added to a shared drive.
- **Multi-Modal RAG**: Search images and charts within PDFs.
- **User Feedback Loop**: "Was this answer helpful?" to improve ranking.
