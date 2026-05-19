# Architecture Draft

## Architecture Goals

- Support a professional operational console for institutional investor fund distribution work
- Separate user-facing workflows from business domain logic
- Keep configuration changes auditable and versioned
- Prepare for multi-agent automation without coupling agents directly to UI components
- Allow staged development with mocked data first and external API adapters later

## Proposed System Layers

### Web Console

The web console is the primary interface for operations staff and managers.

Expected areas:

- Integrated workspace
- Customer 360 view
- Risk and exception dashboard
- Business performance dashboard
- AI assistant workspace
- Customer and account center
- Transaction and asset center
- Confirmation and clearing center
- Operational configuration center
- Sales opportunity and performance attribution center
- Task and case center
- Approval and authorization center
- Knowledge and quality inspection center
- Task and report center

### Application API

The application API should provide workflow-oriented endpoints for the web console when MAFDIC needs to own a workflow or persist internal state. Business source data APIs will be supplied later and should be integrated through adapters instead of being recreated in the initial version.

Expected responsibilities:

- Authentication and authorization
- Query orchestration
- Configuration command handling
- Configuration versioning and audit
- Report task creation
- Assistant session management
- Audit log access

### External Business API Adapters

The following business APIs are expected to be provided later by the business domain owner:

- Transaction records
- Fund market data
- Customer and investor information
- Sales opportunity information
- Holdings, revenue, fee, and attribution inputs
- Risk events and confirmation or clearing details

The first implementation should keep these integrations behind typed data-access boundaries. The web console can use mocked data with the same domain shape, and later replace the mock providers with real API clients.

Adapter responsibilities:

- Normalize external API response fields into MAFDIC domain models
- Hide source-specific pagination, filtering, and error formats
- Preserve raw source identifiers for traceability
- Provide stable query methods for UI and agent workflows
- Keep room for caching, permission filtering, and audit logging

### Domain Services

Domain services own business rules and should stay independent from presentation details.

Initial domains:

- Investor operations
- Customer and account management
- Transaction and asset inquiry
- Transaction confirmation and clearing
- Risk and exception handling
- Operational configuration, including advance funding, funding banks, interest accrual, and fee rules
- Revenue analytics and performance attribution
- Sales opportunities
- Task and case workflows
- Approval and authorization
- Knowledge and quality inspection
- Reporting
- Agent task orchestration

### Data Layer

The first version should use mocked data or local fixtures for source business data. MAFDIC should only persist data it owns. Later versions can introduce persistent storage for:

- Internal configuration versions
- Scheduled tasks
- Assistant conversations
- Audit logs
- Report definitions and generated report metadata
- Metric definitions and report datasets owned by MAFDIC
- Optional snapshots or caches derived from external source APIs

External source systems should remain the authority for customer, transaction, fund market, opportunity, holding, and revenue source data unless a specific synchronization requirement is defined later.

### Shared Capability Layer

Shared capabilities should be implemented as reusable services or frontend/service boundaries, not as page-specific logic.

Expected engines:

- Workflow orchestration engine
- Rule and configuration engine
- Message and delivery engine
- Search and knowledge engine
- AI orchestration and decision-support engine
- Task scheduling and reporting engine
- Metric definition and governance

### Agent Layer

Agents should be modeled as task workers with clear permissions and review states.

Candidate agents:

- Data analyst agent
- Report generation agent
- Scheduled task agent
- Email drafting and delivery agent
- Configuration assistant agent
- Anomaly detection agent
- Risk explanation agent
- Knowledge retrieval agent

AI-generated actions that change configuration, create scheduled tasks, send external emails, close risk events, or export sensitive data must require human review before execution.

## Suggested Initial Tech Direction

This can be adjusted before implementation, but a pragmatic starting point is:

- Frontend: React + TypeScript + Vite
- UI: Tailwind CSS + component primitives
- Backend: defer full implementation until required; reserve an API/adapters boundary
- Data model first: local fixtures plus typed domain models
- Agent orchestration: service boundary prepared early, implementation staged later

## Key Non-Functional Requirements

- Role-based access control
- Auditability for configuration and automated actions
- Data lineage for reports
- Safe preview-before-execute behavior for assistant actions
- Clear status tracking for scheduled tasks and report jobs
- Export-ready analytics tables and charts
