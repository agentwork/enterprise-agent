# Feature Specification: Analytics & Business Intelligence

## 1. Overview
The **Analytics & BI** module enables non-technical users to query business data using natural language, turning questions into SQL queries and interactive visualizations. It bridges the gap between data silos and decision-makers, allowing for instant insights without waiting for data analysts.

## 2. Target Audience
- **Executives**: Tracking KPIs (Revenue, Churn, Growth).
- **Analysts**: Exploring trends, anomalies, and ad-hoc data requests.
- **Sales Teams**: Monitoring personal performance and pipeline metrics.

## 3. Key Functionality

### 3.1 Text-to-SQL Engine
- **Description**: Translates natural language questions into safe, executable SQL queries against the Supabase database.
- **Capabilities**:
    - **Schema Awareness**: Understands table relationships (`clients` -> `deals`).
    - **Query Validation**: Ensures generated SQL is read-only (SELECT) and valid.
    - **Error Handling**: Automatically correct syntax errors or clarify ambiguous questions.

- **Key Flow (Query)**:
    1.  User asks: "Show me monthly revenue for Q3 2024."
    2.  Agent receives schema definition (tables, columns).
    3.  Agent prompts LLM to generate SQL: `SELECT ... FROM deals ...`.
    4.  System validates SQL (Read-only check).
    5.  System executes SQL against Supabase.
    6.  Results are returned as JSON.

### 3.2 Generative Data Visualization
- **Description**: Automatically chooses the best chart type for the data and renders it.
- **Capabilities**:
    - **Chart Selection**: Line for time-series, Bar for comparison, Pie for composition.
    - **Interactive Components**: Tooltips, zooming, and filtering on rendered charts.
    - **Export**: Download charts as PNG/SVG for reports.

- **Key Flow (Visualization)**:
    1.  Agent analyzes the JSON result from the SQL query.
    2.  Agent determines the best visualization (e.g., Bar Chart for categorical data).
    3.  Agent calls the Generative UI Registry with `type="bar-chart"` and data.
    4.  UI renders the `<DataChart />` component.

### 3.3 Dashboard Generation
- **Description**: Create persistent views from ad-hoc queries.
- **Capabilities**:
    - **Save to Dashboard**: "Add this chart to my Q3 Review dashboard."
    - **Auto-Refresh**: Update data when the dashboard is viewed.

## 4. Data & Schema
- **Database Access**: Read-only access to `crm` and `analytics` schemas via a specialized database role.
- **Dependencies**:
    - `@modelcontextprotocol/sdk` (Postgres MCP).
    - `recharts` or `visx` for frontend rendering.
    - `zod` for schema definition.

## 5. Integration Points
- **Input**: Chat Interface (Agent Core).
- **Output**: Generative UI Components (`<DataChart />`, `<KPICard />`, `<DataTable />`).
- **External**: Google Analytics MCP (Planned), Stripe MCP (Planned).

## 6. User Scenarios
- **Scenario A**: Revenue Analysis.
    - User: "Show me monthly revenue for Q3 2024 by industry."
    - Agent: Generates SQL -> `SELECT industry, SUM(amount) FROM deals WHERE... GROUP BY industry`.
    - Agent: Executes SQL -> Returns JSON data.
    - UI: Renders a Bar Chart comparing industries.

- **Scenario B**: Pipeline Health Check.
    - User: "How many deals are stuck in 'Negotiation' for more than 30 days?"
    - Agent: Generates SQL -> `SELECT COUNT(*) FROM deals WHERE stage='Negotiation' AND updated_at < NOW() - INTERVAL '30 days'`.
    - Agent: Returns a single number -> "12 Deals".
    - UI: Renders a KPI Card with the number 12 in red (alert color).

## 7. Future Roadmap
- **Predictive Analytics**: Forecast future revenue based on historical trends using simple regression models.
- **Anomaly Detection**: Alert users when metrics deviate significantly from the norm (e.g., sudden drop in leads).
- **Natural Language Explanations**: Agent explains *why* a trend is happening based on data correlation.
