# Feature Specification: Proposal Generator

## 1. Overview
The **Proposal Generator** automates the creation of professional documents, sales proposals, and reports. It combines structured client data from the CRM with unstructured content from the Knowledge Base to produce high-quality drafts in minutes, significantly reducing the time-to-proposal.

## 2. Target Audience
- **Sales Teams**: Creating custom proposals for prospects.
- **Account Managers**: Generating QBRs (Quarterly Business Reviews).
- **Marketing**: Creating campaign briefs and case studies.

## 3. Key Functionality

### 3.1 Template Management
- **Description**: Standardize document structure and branding.
- **Capabilities**:
    - **Variables**: Dynamic placeholders (`{{client_name}}`, `{{deal_amount}}`, `{{date}}`).
    - **Sections**: Modular blocks (Introduction, Problem Statement, Solution, Pricing, Terms).
    - **Styles**: Consistent font, color, and layout.

### 3.2 Content Generation (AI)
- **Description**: Use LLMs to draft sections based on context.
- **Capabilities**:
    - **Context Injection**: Use RAG to pull relevant case studies ("Include 2 similar projects from Retail").
    - **Tone Adjustment**: Professional, Persuasive, concise.
    - **Draft Iteration**: "Make the executive summary punchier."

- **Key Flow (Drafting)**:
    1.  User says: "Draft a proposal for Nike based on our Q3 strategy meeting."
    2.  Agent fetches client data (CRM) and meeting notes (Activity Log).
    3.  Agent retrieves the "Standard Proposal Template".
    4.  Agent iterates through template sections, generating content for each using the context.
    5.  Agent compiles the sections into a draft document.

### 3.3 Export & Formatting
- **Description**: Convert generated content into deliverable formats.
- **Capabilities**:
    - **PDF Generation**: High-fidelity PDF output using `react-pdf` or server-side rendering.
    - **DOCX Export**: Editable Word documents for further manual refinement.

## 4. Data & Schema
- **Database Tables**:
    - `templates`:
        - `id`: UUID
        - `name`: Text
        - `structure`: JSONB (List of sections and prompts)
        - `created_by`: UUID
    - `proposals`:
        - `id`: UUID
        - `client_id`: UUID
        - `template_id`: UUID
        - `status`: Enum ('draft', 'review', 'sent')
        - `content`: JSONB (The generated content for each section)
        - `created_at`: Timestamp

## 5. Integration Points
- **Input**: Chat Interface (Agent Core), CRM Context.
- **Output**: Document Viewer (`<PDFPreview />`), Download Link.
- **External**: Google Docs MCP (Planned), DocuSign MCP (Planned).

## 6. User Scenarios
- **Scenario A**: Create a Proposal for Nike.
    1.  User: "Draft a proposal for Nike based on our Q3 strategy meeting."
    2.  Agent: Fetches client data (CRM) -> Fetches meeting notes (Activity Log).
    3.  Agent: Selects "Standard Proposal Template" -> Fills sections.
    4.  UI: Displays a draft document for review in a split-screen view.
    5.  User: "Add a case study about Adidas." -> Agent updates the "Relevant Work" section.
    6.  User: "Export to PDF." -> Download triggered.

## 7. Future Roadmap
- **eSignature**: Send proposals directly for signature via DocuSign/HelloSign.
- **Version Control**: Track changes and revisions made by different users.
- **Interactive Proposals**: Web-based proposals with embedded analytics (track when client opens).
