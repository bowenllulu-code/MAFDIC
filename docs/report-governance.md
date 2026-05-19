# Report And Scheduled Task Governance

## Purpose

Reports, exports, and scheduled pushes are operational outputs. MAFDIC should govern them with template ownership, metric versions, approval status, delivery scope, and audit records.

## Governed Objects

- Report templates
- Report generation records
- Scheduled report tasks
- Output artifacts
- Delivery recipients
- Metric definition versions

## Safety Rules

- Reports containing customer, transaction, revenue, or attribution data require human approval before export or push.
- AI may generate report previews and scheduled-task drafts, but cannot enable delivery automatically.
- Every report output should bind to a metric version.
- Failed report runs should keep failure reason and retry context.
- Recipient scope must be reviewed before scheduled push is enabled.

## Lifecycle

```text
Template definition
  -> Preview
  -> Generation task
  -> Approval
  -> Export or push
  -> Audit record
  -> Retry or archive
```

## Required Fields

- Template id and name
- Report type
- Owner role
- Cadence
- Data sources
- Sensitivity level
- Metric version
- Trigger user
- Output artifact
- Approval status
- Delivery status
- Failure reason

## Agent Boundary

Report Agent can:

- Generate previews
- Explain metric definitions
- Create scheduled task drafts
- Summarize failure reasons

Report Agent cannot:

- Export sensitive reports without approval
- Enable scheduled delivery without human confirmation
- Add external recipients without permission
- Change metric definitions silently
