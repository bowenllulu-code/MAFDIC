# Configuration Governance

## Purpose

MAFDIC configuration data should be treated as owned operational state. Even when source business APIs arrive later, configuration drafts, approvals, versions, rollback previews, and audit logs should remain governed by MAFDIC.

## Scope

Initial governance covers:

- Advance funding configuration
- Funding bank maintenance
- Interest accrual rules
- Fee rules
- Risk rules

## Lifecycle

```text
Draft
  -> Validation
  -> Human Review
  -> Approval
  -> Effective
  -> Version Archive
  -> Rollback Preview
```

## Required Governance Data

Each configuration item should keep:

- Key parameters
- Validation results
- Approval flow nodes
- Approval opinions
- Version records
- Audit logs
- Effective range
- Owner role
- Change reason

## Validation Types

- Field completeness
- Limit and threshold checks
- Effective-date overlap
- Customer and product scope impact
- Rule conflict detection
- Approval path completeness

Validation levels:

- `通过`: can continue
- `提醒`: can continue with reviewer awareness
- `阻断`: cannot become effective until fixed

## Versioning Rules

- A draft never overwrites the effective version.
- Approval creates a versioned immutable record.
- Rollback must produce a preview and approval request.
- Every version must preserve changedBy, changedAt, summary, and status.

## AI Boundary

AI can:

- Explain configuration impact
- Generate approval summaries
- Highlight validation conflicts
- Draft rollback explanations

AI cannot:

- Make a configuration effective
- Bypass approval nodes
- Modify audit logs
- Roll back a version without human confirmation
