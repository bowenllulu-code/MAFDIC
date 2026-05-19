# Roadmap

## Phase 0: Foundation

- Define product scope and first user workflows
- Choose frontend technology stack and reserve backend adapter boundaries
- Create repository structure
- Add development scripts and baseline quality checks
- Build mocked data model for transaction records, fund market data, customer information, and sales opportunities
- Define external API adapter contracts for later integration
- Confirm the product solution capability layers
- Confirm MVP scope, information architecture, domain model, and API adapter contracts

## Phase 1: First Runnable Console

- Build app shell and navigation
- Create integrated workspace
- Add customer 360 view
- Add transaction and asset query pages
- Add business performance dashboard
- Add risk and exception dashboard
- Add operational configuration center placeholder
- Add sales opportunity and performance attribution views
- Add AI assistant workspace with mocked conversations, report previews, scheduled task previews, and email draft previews
- Use mock providers behind replaceable data-access interfaces

## Phase 2: Operational Configuration

- Implement advance funding configuration
- Implement advance funding bank maintenance
- Implement interest accrual configuration
- Implement fee rule configuration placeholder
- Add validation and change history
- Add audit log view

## Phase 3: Opportunity Attribution, Analytics And Reporting

- Add richer filters and drill-down views
- Add report templates
- Add export workflows
- Add scheduled report task creation
- Add opportunity-linked performance attribution
- Add metric definition and reporting dataset model

Current frontend prototype coverage:

- Business performance dashboard includes report templates and metric definitions
- Sales opportunity attribution includes contribution summary, attribution rules, and attribution details
- Report template previews can enter the mock confirmation queue

## Phase 4: Multi-Agent Workflows

- Introduce agent task model
- Add assistant-to-task conversion
- Add scheduled task execution
- Add report generation agent
- Add email drafting and push workflow
- Add configuration assistant agent
- Add risk explanation agent
- Add action preview, approval, and execution tracking

Current frontend prototype coverage:

- AI assistant actions generate mock previews
- Saved previews create mock operation queue records
- Saved previews create mock Agent tasks
- Agent task orchestration view is available in the AI assistant workspace

## Phase 5: Operational Interaction Closure

- Add customer, transaction, risk, opportunity, and configuration cross-navigation
- Add search, filter, and status views for repeated operations work
- Add operation queue state transitions
- Add human confirmation, rejection, completion, and audit trail placeholders
- Add business action entry points from detail drawers and AI previews

Current frontend prototype coverage:

- Customer list supports keyword search
- Transaction page supports keyword and confirmation-status filtering
- Risk page supports severity filtering
- AI-generated operation records can move through draft, pending confirmation, confirmed, rejected, and completed states
- Operation queue is visible from the workspace and AI assistant

## Phase 6: Configuration Center Prototype

- Model advance funding configuration, funding bank, interest accrual, fee rule, and risk rule records
- Add configuration category filtering
- Add draft configuration creation workflow
- Add configuration approval explanation preview
- Add configuration approval path and effective-state placeholders

Current frontend prototype coverage:

- Operational configuration page includes summary metrics, category filters, and extended configuration records
- Configuration change workspace can create mock drafts and generate approval previews
- Configuration approval path is visible as draft, rule validation, manual approval, and effective audit stages

## Phase 7: Mock API Layer

- Define unified API response and error envelope
- Add a replaceable console API client
- Move UI reads from static provider access to an API-backed data snapshot
- Add mock latency, trace id, source marker, loading state, error state, and manual refresh
- Keep mock provider available as the local data source behind the API client
- Add module-level mock APIs for customers, orders, holdings, risks, opportunities, configs, tasks, metrics, reports, attribution, and agent tasks
- Add query objects with keyword, paging, status, severity, customer, and configuration-type filters
- Add table empty states for query results

Current frontend prototype coverage:

- `ConsoleDataSnapshot` represents the UI-facing data contract
- `mockApiClient.getConsoleSnapshot()` returns a unified `ApiResponse`
- `mockApiClient` also exposes module-level search and list methods that return `PageResult<T>`
- App shell loads data through the mock API client and shows loading, source, trace id, and refresh controls
- App shell now builds the console data snapshot by calling module APIs in parallel
- Console pages and detail drawer now consume the API-backed snapshot instead of direct static module constants

## Phase 8: Permission And Role Model

- Add role definitions for operations staff, clearing staff, configuration staff, risk operators, managers, and administrators
- Add page-level permission checks
- Add operation-level permission checks
- Add data-scope placeholders
- Add AI action authorization boundaries
- Add readonly and forbidden states

Current frontend prototype coverage:

- Top bar can switch between operations, clearing, configuration, risk, manager, and administrator roles
- Role data scope is visible beside the role selector
- Sidebar pages are disabled when the active role has no page-level permission
- Configuration drafts are editable only for roles with configuration edit permission
- Operation queue approval buttons are shown only for roles with operation approval permission
- AI preview save actions are blocked for roles without AI execution permission

## Phase 9: Real API Integration Readiness

- Add API integration readiness workspace
- Track API module owner, priority, contract status, field mapping status, mock endpoint, real endpoint, and blockers
- Track integration checklist across contract, field, security, joint testing, and acceptance work
- Define suggested integration order before real API documents arrive

Current frontend prototype coverage:

- New integration readiness page is available to manager and administrator roles
- API modules show P0/P1/P2 priority, mapping status, target endpoints, and blockers
- Integration checklist shows category, owner, and readiness status
- Dashboard metrics summarize P0 modules, contract confirmation, mapping completion, and checklist completion

## Phase 10: BFF Adapter And Performance Strategy

- Define frontend lightweight mapping versus BFF/backend heavy mapping boundaries
- Add performance risk attributes to each API integration module
- Track data volume, mapping layer, query pushdown, cache strategy, and performance risk
- Add BFF performance boundary view to the integration readiness workspace
- Document query, cache, materialized snapshot, and async computation principles

Current frontend prototype coverage:

- Integration readiness page shows performance risk for each API module
- Integration readiness page shows BFF responsibility and frontend boundary per scenario
- `docs/integration-performance-strategy.md` describes mapping boundaries, query rules, cache rules, and real API acceptance criteria
- Architecture document now includes BFF/backend adapter responsibilities

## Phase 11: Configuration Approval And Version Governance

- Deepen configuration data fields for advance funding, funding bank, interest accrual, fee rules, and risk rules
- Add validation results with pass, warning, and blocking levels
- Add approval flow nodes, assignees, opinions, and timestamps
- Add configuration version records and rollback preview entry points
- Add configuration audit logs
- Keep AI configuration assistant in preview-and-explain mode only

Current frontend prototype coverage:

- Operational configuration page shows validation blockers and draft versions
- Configuration governance detail table shows parameters, validation, approval, versions, and latest audit
- Configuration detail drawer shows key fields, validation results, approval flow, version history, and audit records
- Configuration detail drawer can generate approval explanation and rollback preview drafts
- `docs/config-governance.md` defines lifecycle, validation, versioning, and AI boundaries

## Phase 12: Agent Governance And Execution Audit

- Define agent governance rules for allowed actions, forbidden actions, data sources, risk, and review requirements
- Extend agent tasks with input sources, execution steps, output artifacts, and human-review status
- Add agent audit logs with trigger user, accessed data, output, review status, and external effect
- Add AI safety boundary to prevent automatic external effects
- Keep high-risk Agent actions in human-reviewed draft mode

Current frontend prototype coverage:

- AI assistant page shows Agent task, pending review, high-risk task, and external-draft metrics
- AI assistant page shows Agent governance boundaries
- AI assistant page shows Agent audit records
- AI assistant page shows explicit AI safety constraints
- `docs/agent-governance.md` defines governance rules, audit records, and safety boundaries

## Phase 13: Report And Scheduled Task Governance

- Add report template governance fields, including sensitivity, data sources, approval requirement, and metric version
- Add report generation records with output artifact, approval, delivery, and failure state
- Add scheduled report tasks with recipients, data scope, status, and next run
- Bind report output to metric definition versions
- Keep Report Agent in preview and draft mode for sensitive outputs

Current frontend prototype coverage:

- Business performance page shows report governance metrics
- Business performance page shows report generation history
- Business performance page shows scheduled report tasks
- Business performance page shows report safety boundaries
- `docs/report-governance.md` defines report, export, scheduled push, and Report Agent boundaries

## Phase 14: API Switching And Joint Testing Shell

- Add API mode switch for mock, hybrid, and real modes
- Add real API client placeholder that returns `REAL_API_NOT_CONFIGURED`
- Add API client factory for mode-based client selection
- Add source mode selector in the app shell
- Add module-level switching plan in the integration readiness workspace
- Document rollback and joint testing strategy

Current frontend prototype coverage:

- Top bar can switch between Mock, Hybrid, and Real data modes
- Real mode fails safely with a configured error and keeps the previous snapshot
- Hybrid mode is represented as a module-level switching plan while still using mock data
- Integration readiness page shows switching condition and rollback strategy by module
- `docs/api-switching-strategy.md` documents switching modes, rollout rules, rollback, and required environment inputs

## Phase 15: Production Integration

- Connect external APIs for transaction records, fund market data, customer information, sales opportunities, holdings, revenue, and attribution inputs
- Replace mock providers with API adapters
- Add authentication and authorization
- Add persistent storage for MAFDIC-owned configuration, task, assistant, audit, and report metadata
- Add monitoring and operational alerts
- Harden permission controls and audit trails

## Immediate Next Step

Add the permission and role model before connecting real APIs, so authentication, data scope, and AI action approval can be mapped cleanly during integration.
