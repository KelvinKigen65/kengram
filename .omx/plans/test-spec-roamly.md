# Roamly Test Specification

## Required test layers

### Unit

- Itinerary validation: stop cap, lower-count days, chronological timings, route/buffer windows, clustering, low-freshness warnings, partial-plan conversion.
- Domain state machine: draft/generating/collaborative/confirmed/reopened/archived transitions.
- Authorization: owner/collaborator/public scopes, confirmed feedback lock, share token revocation, account-deletion transfer.
- Contract validation, idempotency keys, version conflicts, vote uniqueness, feedback archiving, ICS time zones, artifact authorization.

### Integration

- Empty-database migration and seed fixtures for all five pilot cities.
- Supabase JWT verification, RLS/API authorization matrix, magic-link/OAuth redirect configuration.
- Generation job: POI/routing/AI mocks → deterministic validation → persisted itinerary version.
- Two-user collaboration, filtered public share route, finalize/reopen/export/deletion workflows.
- Provider quota, timeout, stale-data, and job-retry paths.

### Device E2E

- Physical iOS/Android development builds: auth, native tabs, plan wizard, editor, map route, invite/deep-link, comment/vote, finalize, offline brief, public share, reopen.
- Permission deny/grant behavior for active-trip nearby action; no unsolicited/background location request.
- City scenarios: arrival day, restaurant/museum day, stale/closed venue, transit-heavy day, unavailable provider/AI partial result.
- Accessibility: VoiceOver/TalkBack labels/order, dynamic type, contrast, touch targets, keyboard, error recovery.

### Performance and observability

- Synthetic load proves p90 generation latency ≤30 seconds with stage-level timing for POI, routing, AI, validation, and persistence.
- Analytics proves ≥80% group completion of create → share → feedback.
- Budget meter validates 70% warn / 90% throttle nonessential / 100% clear fallback.
- Sentry alerts verify P0/P1 detection for the core flow.

## Release commands and evidence

- `npx expo lint`
- `npx tsc --noEmit`
- API/contract lint, typecheck, migration, unit, integration, and E2E commands selected and pinned in Phase 0.
- `npx expo-doctor`
- Physical device smoke-test evidence for iOS and Android.

## Pilot release blockers

1. Any P0/P1 issue in generation, owner edit, finalization, or artifact access.
2. Any city misses the documented quality threshold without being removed/clearly unavailable.
3. Missing provider rights/attribution approval for persisted/exported POI fields.
4. No evidence for p90 latency, collaboration completion, budget safety, or device smoke tests.
