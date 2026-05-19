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

### Intelligent Assistant

The assistant should behave like an operational co-worker:

- Answer questions about business data
- Generate reports through conversation
- Configure scheduled tasks
- Prepare and push emails
- Explain data changes
- Surface anomalies and follow-up suggestions
- Coordinate specialized agents for analysis, reporting, notification, and task execution

## First Product Principle

MAFDIC should optimize for operational trust. Every automated action should be traceable, configurable, reviewable, and safe to repeat.

## Initial MVP Boundary

The first runnable version should focus on:

- A professional dashboard shell
- Mocked operational data
- Investor transaction and holding query pages
- Revenue and opportunity analysis pages
- Configuration management pages for advance funding, banks, and interest accrual
- An assistant panel capable of conversational mock workflows
- A foundation that can later connect to real APIs, scheduled jobs, and agent orchestration

## External API Assumption

Business source APIs will be provided later for transaction records, fund market data, customer information, sales opportunity information, and related operational datasets. The MVP should not attempt to rebuild those backends. Instead, it should model the required domain data, run with mock providers, and keep the access layer ready for API adaptation.
