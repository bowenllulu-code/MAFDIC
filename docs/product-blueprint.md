# Product Blueprint

## Product Name

**MAFDIC**: Multi-Agent Fund Distribution Insight Claw

## Positioning

MAFDIC is a fund distribution operation system for institutional investor business. It provides a unified operational workspace for data analysis, investor configuration, transaction tracing, revenue insight, opportunity performance attribution, and intelligent assistant-driven automation.

The product should feel like a professional operation console: dense, reliable, auditable, and efficient for repeated daily use.

## Primary User Groups

### Operations Staff

Operations staff are responsible for daily configuration, data verification, report preparation, transaction inquiry, and business follow-up. They need fast query tools, clear exception visibility, safe configuration workflows, and repeatable report output.

### Senior Managers

Senior managers need high-level business visibility, trend analysis, revenue insight, opportunity conversion views, and timely alerts. They care less about raw workflows and more about decision-grade summaries.

## Product Capability Layers

### Unified Entry Layer

- Integrated workspace
- Customer 360 view
- Risk and exception dashboard
- Business performance dashboard
- AI assistant workspace

### Business Capability Layer

- Customer and account center
- Transaction and asset center
- Transaction confirmation and clearing center
- Risk and exception center
- Operational configuration center
- Sales opportunity and performance attribution center
- Task and case center
- Approval and authorization center
- Knowledge and quality inspection center

### Shared Capability Layer

- Workflow orchestration engine
- Rule and configuration engine
- Message and delivery engine
- Search and knowledge engine
- AI orchestration and decision-support engine
- Task scheduling and reporting engine
- Metric definition and governance

### Data And Integration Foundation

- External business API adapter layer
- Master data layer
- Transaction fact layer
- Asset fact layer
- Operation fact layer
- Event center
- Document repository
- Knowledge and experience repository
- Metric and reporting datasets

### Security And Governance Layer

- Authentication and authorization
- Role and data permissions
- Approval traceability
- AI behavior audit
- Configuration version audit
- Data lineage
- Compliance risk control
- Operation traceability

## Major Business Domains

### Data Statistics And Analysis

- Investor-level statistics
- Fund-level statistics
- Distribution channel statistics
- Transaction trend analysis
- Revenue and performance analysis
- Opportunity conversion and attribution analysis

### Investor Advance Funding Configuration

- Investor advance funding rules
- Funding limits and effective periods
- Approval and audit history
- Rule validation and conflict detection

### Advance Funding Bank Maintenance

- Bank master data
- Bank status and availability
- Supported investor or channel relationships
- Operational change history

### Interest Accrual Configuration

- Interest accrual rules
- Effective date management
- Rule versioning
- Exception review

### Transaction And Holding Query

- Investor transaction records
- Fund holdings
- Historical transaction tracing
- Filtered search by investor, fund, channel, date range, and transaction type

### Revenue Data

- Revenue summary
- Revenue breakdown by investor, fund, channel, and opportunity
- Period comparison
- Abnormal fluctuation detection

### Sales Opportunities

- Opportunity lifecycle management
- Opportunity to investor and fund relationship
- Linked transaction tracking
- Post-transaction performance attribution

### Operational Configuration

- Investor advance funding configuration
- Advance funding bank maintenance
- Interest accrual configuration
- Fee rule configuration
- Effective period and version management
- Configuration approval and audit history

### Revenue And Performance Attribution

- Revenue and fee records
- Opportunity-linked transactions
- Attribution rules
- Performance results by customer, channel, product, and sales owner
- Traceable path from opportunity to transaction to performance

### Intelligent Assistant

The assistant should behave like an operational co-worker:

- Answer questions about business data
- Generate reports through conversation
- Configure scheduled tasks
- Prepare and push emails
- Explain data changes
- Surface anomalies and follow-up suggestions
- Coordinate specialized agents for analysis, reporting, notification, and task execution

The assistant should be implemented as an AI assistant workspace, not only a chat box. It should support analysis, task creation, report generation, email drafting, SOP recommendation, and human-reviewed execution.

## First Product Principle

MAFDIC should optimize for operational trust. Every automated action should be traceable, configurable, reviewable, and safe to repeat.

## Initial MVP Boundary

The first runnable version should focus on:

- A professional dashboard shell
- Mocked operational data
- Investor transaction and holding query pages
- Revenue and opportunity analysis pages
- Configuration management pages for advance funding, banks, and interest accrual
- Sales opportunity and performance attribution views
- An AI assistant workspace capable of conversational mock workflows, report generation previews, scheduled task previews, and email draft previews
- Human-reviewed operation queues for AI actions and configuration changes
- A configuration center prototype covering advance funding, funding banks, interest accrual, fee rules, and risk rules
- A foundation that can later connect to real APIs, scheduled jobs, and agent orchestration

## External API Assumption

Business source APIs will be provided later for transaction records, fund market data, customer information, sales opportunity information, and related operational datasets. The MVP should not attempt to rebuild those backends. Instead, it should model the required domain data, run with mock providers, and keep the access layer ready for API adaptation.
