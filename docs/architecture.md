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

- Dashboard
- Investor analytics
- Transaction records
- Fund holdings
- Revenue analysis
- Sales opportunities
- Configuration center
- Assistant workspace
- Task and report center

### Application API

The application API should provide workflow-oriented endpoints for the web console when MAFDIC needs to own a workflow or persist internal state. Business source data APIs will be supplied later and should be integrated through adapters instead of being recreated in the initial version.

Expected responsibilities:

- Authentication and authorization
- Query orchestration
- Configuration command handling
- Report task creation
- Assistant session management
- Audit log access

### External Business API Adapters

The following business APIs are expected to be provided later by the business domain owner:

- Transaction records
- Fund market data
- Customer and investor information
- Sales opportunity information
- Related business data required for revenue, holdings, and performance attribution

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
- Advance funding configuration
- Advance funding bank maintenance
- Interest accrual configuration
- Transactions and holdings
- Revenue analytics
- Sales opportunities
- Reporting
- Agent task orchestration

### Data Layer

The first version should use mocked data or local fixtures for source business data. MAFDIC should only persist data it owns. Later versions can introduce persistent storage for:

- Internal configuration versions
- Scheduled tasks
- Assistant conversations
- Audit logs
- Report definitions and generated report metadata
- Optional snapshots or caches derived from external source APIs

External source systems should remain the authority for customer, transaction, fund market, opportunity, holding, and revenue source data unless a specific synchronization requirement is defined later.

### Agent Layer

Agents should be modeled as task workers with clear permissions and review states.

Candidate agents:

- Data analyst agent
- Report generation agent
- Scheduled task agent
- Email drafting and delivery agent
- Configuration assistant agent
- Anomaly detection agent

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
