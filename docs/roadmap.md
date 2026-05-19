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

## Phase 7: Production Integration

- Connect external APIs for transaction records, fund market data, customer information, sales opportunities, holdings, revenue, and attribution inputs
- Replace mock providers with API adapters
- Add authentication and authorization
- Add persistent storage for MAFDIC-owned configuration, task, assistant, audit, and report metadata
- Add monitoring and operational alerts
- Harden permission controls and audit trails

## Immediate Next Step

Continue toward a mock API layer so the frontend can switch from static mock providers to replaceable service endpoints before real API integration.
