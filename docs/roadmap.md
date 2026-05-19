# Roadmap

## Phase 0: Foundation

- Define product scope and first user workflows
- Choose frontend technology stack and reserve backend adapter boundaries
- Create repository structure
- Add development scripts and baseline quality checks
- Build mocked data model for transaction records, fund market data, customer information, and sales opportunities
- Define external API adapter contracts for later integration

## Phase 1: First Runnable Console

- Build app shell and navigation
- Create dashboard overview
- Add transaction query page
- Add fund holding page
- Add revenue analysis page
- Add sales opportunity analysis page
- Add configuration center placeholder
- Add assistant panel with mocked conversations and actions
- Use mock providers behind replaceable data-access interfaces

## Phase 2: Operational Configuration

- Implement advance funding configuration
- Implement advance funding bank maintenance
- Implement interest accrual configuration
- Add validation and change history
- Add audit log view

## Phase 3: Analytics And Reporting

- Add richer filters and drill-down views
- Add report templates
- Add export workflows
- Add scheduled report task creation
- Add opportunity-linked performance attribution

## Phase 4: Multi-Agent Workflows

- Introduce agent task model
- Add assistant-to-task conversion
- Add scheduled task execution
- Add report generation agent
- Add email drafting and push workflow
- Add action preview, approval, and execution tracking

## Phase 5: Production Integration

- Connect external APIs for transaction records, fund market data, customer information, sales opportunities, holdings, revenue, and attribution inputs
- Replace mock providers with API adapters
- Add authentication and authorization
- Add persistent storage for MAFDIC-owned configuration, task, assistant, audit, and report metadata
- Add monitoring and operational alerts
- Harden permission controls and audit trails

## Immediate Next Step

Create the first runnable web console with mocked data and typed adapter boundaries.
