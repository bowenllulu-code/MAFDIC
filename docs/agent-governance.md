# Agent Governance

## Purpose

MAFDIC agents should behave like auditable operational workers, not unrestricted automation. Every agent action must have a clear permission boundary, data source, output artifact, risk level, and human-review rule.

## Agent Categories

- Data analysis agent
- Report agent
- Scheduling agent
- Email agent
- Configuration agent
- Risk agent
- Knowledge agent

## Governance Rules

Each agent must define:

- Allowed actions
- Forbidden actions
- Required data sources
- Maximum risk level
- Human-review requirement
- Audit requirement

## Human Review

Human review is required when an agent action:

- Changes or proposes to change configuration
- Creates a scheduled task
- Drafts external email
- Exports sensitive report data
- Closes or changes a risk event
- Has high operational risk

## Audit Record

Every agent task should keep:

- Triggering user
- Agent name
- Action name
- Input context
- Data sources accessed
- Execution steps
- Output artifact
- Human-review status
- External effect
- Timestamp

## Safety Boundary

AI can:

- Generate explanations
- Draft reports
- Draft emails
- Draft configuration approval summaries
- Explain validation blockers
- Create task previews

AI cannot:

- Send external emails without human approval
- Make configurations effective
- Modify audit logs
- Close risk events automatically
- Export sensitive data without approval
- Bypass role permissions or approval workflows
