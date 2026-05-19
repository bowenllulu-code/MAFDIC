# Integration Performance Strategy

## Purpose

MAFDIC will receive real business APIs later. Because actual source fields and query shapes may differ from the current domain model, MAFDIC needs an adapter layer. That adapter layer must not become a frontend-only mapping bottleneck.

The goal is to keep the web console responsive while still allowing external APIs to evolve independently.

## Core Principle

Use the frontend adapter only for lightweight presentation mapping. Put heavy normalization, query orchestration, permission filtering, caching, aggregation, and precomputation in the MAFDIC BFF or backend adapter.

```text
External business APIs
  -> MAFDIC BFF / Backend Adapter
  -> Domain DTOs and query services
  -> Web console / Agent workflows
```

## Mapping Boundary

### Frontend Can Handle

- Field rename for display DTOs
- Status label conversion for already-normalized status codes
- Empty value fallback
- Current-page formatting
- Small dictionary lookup

### BFF Should Handle

- External field normalization
- Source-system status mapping
- Pagination, sorting, and filter pushdown
- Permission and data-scope filtering
- Multi-API orchestration
- Error envelope normalization
- Trace id and source id preservation
- Cache and stale-data strategy

### Backend Or Async Jobs Should Handle

- Large-volume aggregation
- Transaction, holding, and quote joins
- Revenue and opportunity attribution
- Report datasets
- Agent-readable analytical snapshots
- Materialized views and precomputed indicators

## Module Strategy

| Module | Data Volume | Required Strategy |
| --- | --- | --- |
| Customer and account | Medium | BFF normalization plus dictionary cache |
| Transaction and confirmation | Large | Mandatory query pushdown, paging, short cache |
| Holding and fund quote | Large | Backend precomputation or materialized snapshot |
| Opportunity attribution | Medium | BFF orchestration plus async attribution result |
| Operational configuration | Small | MAFDIC-owned persistence, audit, and versioning |
| Agent and reporting | Medium | Task-based async execution and output metadata |

## Query Rules

- Never fetch all transactions or holdings into the browser for local filtering.
- Every large list must support server-side pagination.
- Date range, customer, status, and channel filters must be pushed down.
- Sorting should be done by the API or BFF for large result sets.
- Frontend should keep previous data visible when refresh fails.

## Cache Rules

- Stable dictionaries can use versioned cache.
- Transaction and risk lists may use short cache for repeated navigation.
- Report, attribution, and asset explanation should use generated snapshots.
- Configuration data should be strongly consistent for edit and approval flows.

## Acceptance Criteria Before Real API Integration

- Each P0 module has sample response payloads.
- Each external status code has a mapping table.
- Each large list has pagination and filter parameters.
- Each API response includes traceability fields or equivalent metadata.
- Permission and data-scope handling is agreed with backend/security owners.
- High-cost analytics have either summary endpoints or async jobs.
