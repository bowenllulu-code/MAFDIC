# API Switching Strategy

## Purpose

MAFDIC should be able to move from mock data to real business APIs module by module. The switch must be reversible and visible to operators during joint testing.

## Modes

- `mock`: all modules use local Mock API.
- `hybrid`: selected modules can use real APIs while the rest remain on Mock API.
- `real`: all modules attempt real API clients.

The current prototype implements the switching shell. Real API calls return `REAL_API_NOT_CONFIGURED` until endpoints and credentials are provided.

## Switching Rules

- P0 modules switch first: customer, transaction, operational configuration.
- Each module needs sample responses before switching.
- Large list modules must support server-side pagination, filters, and sorting.
- Role and data-scope behavior must be confirmed before real data is shown.
- Failed real calls should preserve the previous snapshot and show a traceable error.

## Rollback Strategy

- Keep Mock API available in every environment.
- Preserve the last successful console snapshot in UI state.
- Allow module-level fallback to mock or hybrid mode.
- Record error code, trace id, and failed module during joint testing.

## Required Environment Inputs

- Real API base URL
- Auth token or session integration
- Source-system timeout policy
- Module enablement flags
- Error-code mapping table
- Status-code mapping table
- Field mapping table
