# Roamly Implementation Plan

## Status and planning evidence

- **Status:** implementation-ready draft; no application code has been changed.
- **Source specification:** `.omx/specs/deep-interview-roamly.md`.
- **Planning context:** `.omx/context/roamly-implementation-plan-20261029T000000Z.md`.
- **Repository baseline:** `package.json:1-43` is a minimal npm Expo SDK 57 app; `src/app/_layout.tsx:1-5` is a single Stack and `src/app/index.tsx:1-17` is the untouched starter screen. `app.json:1-42` already configures Expo Router and a custom URL scheme; `tsconfig.json:1-20` has strict mode and `@/` aliases.
- **Review limitation:** native Planner/Architect/Critic role agents could not launch because their configured models are unsupported by the connected account. A local Claude reviewer was also unavailable after timeout; see `.omx/artifacts/claude-roamly-plan-review-20261029T000000Z.md`. This plan is self-reviewed against the acceptance criteria and needs one independent architecture/security review before implementation begins.

## Requirements summary

Build Roamly as an Expo 57 iOS/Android application for couples/groups to create, asynchronously review, and finalize realistic multi-day itineraries. V1 uses native bottom tabs (**Trips**, **Plan**, **Profile**), NativeWind, Supabase Auth/PostgreSQL with Prisma, Mapbox-first maps/routing, and a persistable open-data POI baseline. It must generate paced itineraries, allow owner-only edits, support invited collaborator votes/comments/suggestions, produce privacy-filtered public views, and create protected offline daily briefs.

The pilot serves Paris, Tokyo, New York, London, and Rome on 23 November 2026. The public target is 21 December 2026, expanding to roughly 20 cities. The launch budget is $100–500/month.

## RALPLAN-DR deliberation

### Principles

1. **Itinerary quality over feature breadth:** a credible, editable plan matters more than destination-browsing volume.
2. **Truthful travel data:** never imply that best-effort POI details are live availability.
3. **Server-enforced trust boundaries:** clients render state; the API/RLS enforce roles, lifecycle locks, share access, and deletion.
4. **Native feel without platform divergence:** use platform-native tabs and shared NativeWind design tokens while isolating unstable/native integration boundaries.
5. **Prove the pilot path first:** build only what is necessary for structured creation → partner feedback → confirmation → offline brief.

### Decision drivers

1. Comply with POI/map-data storage and display terms while retaining itinerary data and exports.
2. Meet a 30-second p90 generation target at the given budget.
3. Preserve a high-confidence, group-planning experience within the short pilot window.

### Viable options

| Option | Pros | Cons | Decision |
| --- | --- | --- | --- |
| **A. Mapbox-first + persistable Overture/Open Places baseline** | Supports Mapbox maps, stored itinerary snapshots, static exports, predictable cost, and no Google-map lock-in. | Incomplete/stale venue facts; needs freshness UI and city coverage QA. | **Chosen.** It fits persistent itineraries and the budget. |
| B. Google Maps + Google Places end-to-end | Strong POI coverage and familiar user data. | Constrains rendering/storage/export behavior and loses Mapbox-first product direction. | Rejected: conflicts with the chosen visual/map architecture and durable itinerary artifacts. |
| C. Paid commercial POI/data-delivery contract | Potentially richer, fresher venue data and support. | Pricing/rights risk can exceed budget; procurement slows pilot. | Defer: use only after a pilot data-quality review and explicit rights/cost approval. |
| D. Supabase-only BaaS functions | Fewer moving parts at first. | Conflicts with the chosen Node/Prisma business-logic layer and makes complex job/versioning logic less portable. | Rejected: Node API remains the service boundary. |

### Pre-mortem

| Failure scenario | Early warning | Mitigation / owner |
| --- | --- | --- |
| The 23 Nov pilot slips because scope spans auth, AI, maps, collaboration, exports, and two platforms. | Core create/edit flow is not device-tested by the end of week 2. | Freeze P0 at trip creation/editor/collaboration/finalize/offline brief; cut standalone discovery first, then nearby suggestions. Product lead owns scope gate. |
| Generated schedules appear implausible or use stale/closed venues. | Validation rejects >15% of candidate schedules or pilot users repeatedly swap the same classes of stops. | Validate every generated activity against coordinates, travel/buffer windows, and freshness metadata; display warnings and Suggested Swap alternatives; QA the first five cities weekly. Data/AI lead owns. |
| POI/provider terms or usage push costs beyond budget. | Cache/storage review finds noncompliant fields, or usage reaches 70% of plan quota. | Store only permitted open-data fields/attribution; meter every external request; adopt hard quotas and a circuit breaker; require written approval before a paid data contract. Backend lead owns. |

## Target architecture

### Repository layout

Keep the existing Expo application at the repository root to avoid a disruptive starter relocation. Add a separately deployable Node service and shared contracts:

```text
src/app/                         # Expo Router routes
src/components/                  # Reusable mobile UI
src/features/                    # Domain UI, hooks, view models
src/lib/                         # API client, auth, linking, config
src/styles/                      # NativeWind tokens and global CSS
server/                          # Node TypeScript API and worker
server/prisma/                   # Prisma schema and migrations
server/src/modules/              # auth, trips, itinerary, collaboration, shares, exports
server/src/jobs/                 # durable generation/finalization job handlers
packages/contracts/              # shared request/response and domain types
scripts/                         # POI city ingest/quality scripts
docs/                            # API, data provenance, runbooks, privacy/release docs
```

Keep package boundaries explicit rather than relocating the Expo app: the root npm package remains mobile, `server/` owns its own lockfile/deployable package, and it links `packages/contracts` through a local `file:` dependency. Do not duplicate TypeScript domain shapes between mobile and server.

### System boundaries and data flow

1. **Mobile app:** authenticates with Supabase, calls only the Node API for business operations, renders read models, and stores downloaded offline artifacts locally. It never holds privileged keys or creates canonical itinerary data directly.
2. **Node API:** verifies Supabase JWTs, applies membership/state rules, submits generation/finalization jobs, exposes authenticated trip APIs, serves revocable public-share read models, and records audit/affiliate events.
3. **PostgreSQL/Prisma:** the canonical source for accounts, trips, membership, versions, activities, feedback, share-link hashes, artifacts, and lifecycle/audit records. RLS protects direct Supabase paths; API authorization duplicates critical role checks.
4. **AI orchestration:** turns validated trip inputs plus candidate POIs into a versioned strict JSON itinerary; deterministic validators reject invalid structure, route/buffer violations, too many core stops, or unsupported place references before persistence.
5. **POI and Mapbox services:** a periodic city-scoped ingest creates a permitted local POI snapshot with source/freshness/attribution. Mapbox supplies map rendering and route-time computation at request/generation time. Treat all hours/reservation facts as best effort.
6. **Background jobs:** use a durable database-backed job record/state machine for generation, artifact rendering, and retryable provider calls. The client observes job status through short polling initially; do not introduce realtime infrastructure before the pilot proves a need.
7. **Read-only sharing:** an opaque, high-entropy token resolves to a deliberately filtered view model that omits identities, comments, vote breakdowns, and optionally dates. A collaborator must authenticate and be a TripMember for any feedback write.

### Lifecycle state machine

`draft → generating → collaborative → confirmed → reopened → collaborative`, with `archived` available from non-generating states. Confirmation closes feedback writes; reopening creates a new itinerary version. Replaced activities retain archived feedback rather than deleting it. Every transition is transactional and recorded in audit data.

### Initial API contract surface

Version the Node API under `/v1`; use stable resource reads plus explicit command endpoints for lifecycle-sensitive writes.

| Area | Initial endpoints / commands |
| --- | --- |
| Profile | `GET/PATCH /me`, `DELETE /me` |
| Trips | `GET/POST /trips`, `GET /trips/:tripId`, `PATCH /trips/:tripId` |
| Generation | `POST /trips/:tripId/generation`, `GET /jobs/:jobId` |
| Itinerary editing | `POST /trips/:tripId/itinerary/commands` carrying a version precondition and `add`, `move`, `remove`, `swap`, or `reschedule` command |
| Collaboration | `POST /trips/:tripId/invites`, `POST /activities/:activityId/{votes,comments}`, `POST /trips/:tripId/suggestions` |
| Sharing | `POST /trips/:tripId/share-links`, `DELETE /share-links/:shareLinkId`, `GET /public/share/:token` |
| Lifecycle / exports | `POST /trips/:tripId/{finalize,reopen}`, `GET /trips/:tripId/artifacts/:artifactId` |
| Contextual discovery | `GET /trips/:tripId/places` and `GET /trips/:tripId/nearby` only after explicit client location intent |

All mutation commands require authenticated actor context, idempotency keys where retries are possible, and a current itinerary-version precondition. Return a typed `409` conflict read model instead of silently overwriting a newer owner edit.

## Implementation sequence

### 0. Establish delivery baseline and provider proof points

**Files:** update `package.json`, `app.json`, `README.md`; add `.env.example`, `docs/architecture.md`, `docs/provider-data-policy.md`, `docs/release-runbook.md`, `docs/test-tooling.md`.

- Preserve npm because `package-lock.json` exists; use `npx expo install` for Expo-compatible packages.
- Replace placeholder app identity in `app.json:3-9` with Roamly name/slug/scheme, set iOS/Android bundle identifiers, and add config-plugin/permission configuration only after exact SDK 57 docs are checked.
- Create a cost/rights spike: verify the chosen open POI source permits the exact fields stored/exported, record required attribution, and measure first-five-city coverage. Do not ingest any field before this record exists.
- Define pilot-city coverage thresholds: at least 95% of sampled candidate POIs must have a valid coordinate, normalized category, and permitted display name; at least 80% must expose an external verification URL or a visible "details unavailable" fallback. A city that misses either threshold cannot be advertised as supported.
- Create provider-budget counters and hard monthly thresholds for AI, Mapbox, and POI requests; 70% warns, 90% throttles nonessential work, 100% returns an intelligible fallback.
- Select and pin the current Expo-57-compatible mobile unit-test stack, a Node/contract test runner, and a device E2E runner; record exact versions and commands in `docs/test-tooling.md` before adding test files.
- Reconcile dates with stakeholders: the calendar grants about 3.6 weeks to the pilot, not six. Publish the actual sprint milestones and scope-cut trigger.

**Exit criteria:** environment variables are documented; mobile/API development and release requirements are enumerated; provider rights and pilot-city coverage have a written go/no-go result.

### 1. Create shared contracts and durable backend foundation

**New files:** `packages/contracts/{package.json,tsconfig.json,src/{trip,place,itinerary,share,errors}.ts}`, `server/package.json`, `server/tsconfig.json`, `server/src/{app,config,auth,db}.ts`, `server/prisma/schema.prisma`, `server/prisma/migrations/*`, `server/src/modules/*`.

- Create typed request/response shapes and error codes before endpoint implementation. Model `UserProfile`, `Trip`, `TripMember`, `ShareLink`, `ItineraryVersion`, `ItineraryDay`, `Activity`, `PlaceSnapshot`, `Suggestion`, `Vote`, `Comment`, `Artifact`, `AffiliateClick`, `AuditEvent`, and `Job`.
- Use UTC instants plus an IANA trip timezone; derive day-local display values instead of storing ambiguous local timestamps.
- Add unique constraints and indexes for token hashes, trip memberships, itinerary ordering, one vote per member/target, active-share links, job deduplication keys, and idempotent lifecycle transitions.
- Write migrations and seed fixtures for one group trip in each of the five pilot cities.
- Implement configuration validation; fail fast if privileged provider/auth keys are absent.

**Exit criteria:** a local API can migrate an empty database, seed fixtures, and return typed health/auth failures without exposing secrets.

### 2. Secure authentication, authorization, privacy, and account deletion

**Mobile files:** `src/app/(auth)/*`, `src/lib/supabase.ts`, `src/lib/api.ts`, `src/app/_layout.tsx`.

**Server files:** `server/src/modules/auth/*`, `server/src/modules/trips/authorization.ts`, `server/src/modules/privacy/*`, `server/prisma/schema.prisma`.

- Configure Supabase Auth for email magic links, Google, and Apple; register the Roamly scheme/redirect URLs and test on real iOS/Android builds.
- Replace the root Stack in `src/app/_layout.tsx:1-5` with an auth gate, protected app group, and share-route boundary.
- Encode owner and collaborator permissions server-side and with RLS; prohibit client-side role inference from being authoritative.
- Add token hashing/revocation/expiry for public links. Public view models must exclude all hidden fields by construction, not conditional rendering alone.
- Implement transactional account deletion: identify transferable group trips, transfer to the oldest active collaborator, remove the departing user’s feedback, delete sole-owned trips/artifacts, then delete profile/auth identity. Record a non-PII audit result.
- Add foreground-only location permission logic; request only after active-trip user intent and never schedule background location.

**Exit criteria:** authorization tests prove that a public viewer, unrelated user, collaborator, confirmed-trip collaborator, owner, and deleting owner each receive the intended behavior.

### 3. Install NativeWind and build the application shell

**Files:** `package.json`, `tailwind.config.js`, `metro.config.js`, `babel.config.js`, `global.css`, `nativewind-env.d.ts`, `src/styles/tokens.ts`, `src/app/(tabs)/_layout.tsx`, `src/app/(tabs)/{trips,plan,profile}.tsx`.

- Use NativeWind v4.2.7 with Tailwind v3 configuration because it is the documented Expo 57-compatible stable line. Keep v5 out of pilot scope.
- Use `expo-router/unstable-native-tabs` only inside `src/app/(tabs)/_layout.tsx`; add a small navigation adapter so later import/API changes do not reach feature screens.
- Configure exactly Trips, Plan, and Profile native-tab triggers with platform-appropriate icons/labels and safe-area behavior. Keep share pages and generation/editor stacks outside tab ownership where navigation state requires it.
- Define a tokenized, light-first editorial system: colors, typography, radii, spacing, shadows, state colors, accessibility focus/error styles. NativeWind handles composition; use native styles only where the native tab/map APIs require them.
- Replace `src/app/index.tsx:1-17` starter UI with a deterministic route redirect to the authenticated tab/app flow.

**Exit criteria:** native iOS and Android development builds render the three tabs; unauthenticated users cannot access protected tabs; lint/typecheck pass.

### 4. Deliver Trips, Plan, and the local editor with versioned state

**New files:** `src/features/trips/*`, `src/features/plan/*`, `src/features/itinerary/*`, `src/components/{TripCard,ItineraryTimeline,ActivityCard,ItineraryEditor}.tsx`, `src/app/trips/[tripId].tsx`, `src/app/trips/[tripId]/edit.tsx`.

- Trips tab: active, upcoming, confirmed, archived lists and empty states. Do not introduce a standalone discovery tab.
- Plan tab: the four-step destination → dates → budget → vibe flow plus optional free-text must-sees. Validate date ordering, max trip length, selected currency, and prompt limits locally before submission.
- Implement editor operations as explicit commands: add, remove, move, swap, and change time. Send a version/ETag with mutations; return a conflict resolution read model if the trip changed since the owner last loaded it.
- Persist a new itinerary version only after valid changes. Prevent collaborators from reaching owner mutations through deep links/API calls.

**Exit criteria:** an owner can create a draft, submit generation, recover after an interrupted app session, and perform every supported edit with stable ordering and version history.

### 5. Build POI ingestion, routing, and the realism validation engine

**New files:** `scripts/poi/*`, `server/src/modules/places/*`, `server/src/modules/routing/*`, `server/src/modules/itinerary/{generator,validator,normalizer}.ts`, `docs/city-coverage.md`.

- Implement a source adapter that returns only rights-cleared, attributed fields. Persist source name, source ID, fetched-at timestamp, source-specific attribution, coordinate confidence, and omission reason.
- Ingest and quality-score the initial five cities first. Measure category coverage, coordinate validity, duplicate rate, and percentage of activities lacking a website/contact/freshness signal. Do not expand to 20 cities until thresholds are met.
- Create deterministic validation independent of AI output: no more than four core stops; lower counts allowed; valid time sequence; transit/walk buffer between sequential activities; geographic clustering threshold; place coordinates must exist; warnings for low freshness/booking risk.
- If validation cannot repair a schedule, save a partial result with machine-readable warnings and 2–3 Suggested Swap candidates. Never silently substitute an unknown place.
- Cache only permitted routing computations and retain no unapproved third-party POI fields.

**Exit criteria:** fixture itineraries for all five cities pass validation; deliberately impossible plans become partial itineraries with specific warnings rather than opaque failures.

### 6. Add asynchronous AI generation and transparent failure handling

**New files:** `server/src/jobs/{enqueue,worker,generation}.ts`, `server/src/modules/ai/*`, `server/src/modules/jobs/*`, `src/features/generation/*`.

- Submit a deduplicated generation job with an idempotency key derived from trip/version/input hash. Poll the API for status initially using bounded backoff.
- Build provider adapters for one active structured-output model and a configurable fallback. Keep prompt templates/version IDs server-side and log only redacted metadata.
- Enforce a JSON schema, maximum prompt/output size, timeout budget, retry classification, and cost attribution per job.
- Compose the final plan only after deterministic POI/routing validation. Surface queued, generating, partial, completed, and retryable/terminal error states in the app.
- Emit latency spans so p50/p90 are measured end-to-end (place lookup, route calls, model, validation, persistence).

**Exit criteria:** a representative request completes in under 30 seconds at p90 under pilot-like load, while provider timeout/quota errors return an actionable partial/retry state.

### 7. Implement collaboration, public views, finalization, and exports

**New files:** `server/src/modules/{collaboration,shares,finalization,exports}/*`, `src/features/collaboration/*`, `src/app/share/[token].tsx`, `src/app/trips/[tripId]/{members,finalize,offline}.tsx`.

- Owner invites users, tracks pending/active membership, and grants collaborators only feedback/suggestion rights.
- Implement idempotent vote toggles, inline comment threads, suggestions tray, and archive-on-activity-replacement behavior. Confirmed trips reject feedback writes with a clear state-specific error.
- Public routes return only filtered data; date masking happens in the server projection. Include revoke/rotate share-link actions for owners.
- Finalization uses a lock/state transition plus a durable artifact job: create PDF/image brief, `.ics`, and static map images; artifact downloads are access-controlled and retryable.
- Reopening produces a new editable version and changes the active-trip UI safely without erasing historical feedback.

**Exit criteria:** create → invite → vote/comment/suggest → finalize → public view → reopen works across two physical devices; unauthorized or locked feedback writes fail safely.

### 8. Add active-trip behavior, external links, observability, and release controls

**Files:** `src/features/active-trip/*`, `src/lib/{linking,analytics,monitoring}.ts`, `server/src/modules/{affiliates,telemetry}/*`, `docs/{privacy,incident-response,pilot-playbook}.md`, `app.json`.

- Implement offline artifact download/storage with integrity/version checks and a clear last-updated label. It is not a full offline map/search product.
- Implement explicit "Explore near my current location" permission/use flow only in an active trip; use operating-system map links for navigation rather than in-app turn-by-turn navigation.
- Centralize affiliate URL allowlists and redirect telemetry; label outbound booking actions and do not imply a reservation succeeded.
- Track only approved product events: generation requested/completed/partial, validation warning, edit, invite, feedback, finalize, offline download, outward booking click, share view, and deletion. Redact prompts, credentials, share tokens, email addresses, and exact location history.
- Configure Sentry severity/alerting for P0/P1 failures and a pilot dashboard for p90 generation, validation-failure rate, collaboration completion, cost, and city coverage.
- Prepare EAS development/preview/production profiles and physical-device smoke test matrices. Map/native modules require development builds, not Expo Go-only validation.

**Exit criteria:** the pilot dashboard can prove all four success gates; crash/error reporting and a rollback/kill-switch runbook are tested before pilot invite distribution.

## Test strategy

### Unit tests

- Domain state transitions, membership authorization, token hashing/revocation, transfer-on-delete rules, vote uniqueness, archive rules, `.ics` time-zone output, and artifact access rules.
- Itinerary normalization/validation: stop cap, lower-count days, chronology, route/buffer math, geographic cluster, unsupported places, stale venue warnings, and partial-plan fallback.
- Provider adapters: attribution propagation, field allowlists, quota/circuit-breaker behavior, timeout/error normalization, and idempotency key generation.
- Mobile view models: form validation, route redirects, state-specific UI, redaction, and tab/navigation adapter behavior.

### Integration tests

- Prisma migrations against an empty database and fixture seed; RLS/API authorization matrix.
- Supabase JWT verification and OAuth/magic-link redirect handling in preview configuration.
- Node API → job → AI mock → routing/POI mock → validator → persisted version path.
- Collaborator/public-share/finalization/reopen/deletion workflow with two users and a revoked token.
- Export job verification: PDF/image/ICS/static snapshot generation, authorization, retry, and expiry behavior.

### End-to-end/device tests

- iOS and Android development-build flows: auth, native tabs, trip creation, editor, map route, invite/deep link, comment/vote, finalization, offline download, public share, and reopen.
- Permission-denied and permission-granted active-trip nearby flow; confirm no location prompt appears before explicit intent.
- Five-city scenario suite covering short arrival day, restaurant/museum day, closed/stale venue warning, transit-heavy route, and unavailable provider/AI fallback.
- Accessibility: screen-reader labels/order, dynamic text, contrast, touch targets, keyboard behavior, and error recovery.

### Observability and release checks

- Synthetic generation/load test proves p90 ≤30s and records stage-level latency/cost.
- Dashboard verifies ≥80% pilot-group creator → share → collaborator-feedback success.
- Severity triage proves no unresolved P0/P1 defect in generation, owner editing, finalization, or artifact access.
- Run `npx expo lint`, `npx tsc --noEmit`, API typecheck/lint/test commands, migration checks, and `npx expo-doctor` before each release candidate.

## Testable acceptance criteria

1. An authenticated owner can create an itinerary for any pilot city using structured inputs; 90% of representative runs finish within 30 seconds end-to-end.
2. Every persisted generated day has at most four core stops and passes chronology/route/buffer validation; arrival/departure/constraint-conflict days may have fewer.
3. A collaborator cannot alter itinerary activities but can submit a vote, comment, and suggestion; an unauthenticated public viewer cannot write or view identities/comments/vote details.
4. Confirming a trip closes feedback, creates authorized PDF/image/ICS/static-map artifacts, and supports later owner reopening with feedback history preserved/archived correctly.
5. The offline brief is available after download with its version/freshness label and contains only permitted, access-controlled data.
6. The app asks for device location only after the active-trip nearby action and never requests background location.
7. Account deletion atomically handles a sole owner and a group owner according to the product rules, leaving no accessible deleted-user data.
8. On physical iOS and Android builds, Trips/Plan/Profile native tabs are usable and protected routes/auth redirects behave correctly.
9. Before pilot expansion, each supported city meets the Phase 0 threshold: at least 95% valid-coordinate/category/name coverage and at least 80% external-verification URL coverage or an explicit details-unavailable fallback; any poor coverage yields labels/fallbacks instead of false confidence.
10. No P0/P1 defects remain in core generation, owner editing, finalization, or artifact-access paths at pilot launch.

## ADRs

### ADR-001 — Mapbox-first with a persistable open POI baseline

- **Decision:** Render/rout with Mapbox and persist only POI data whose source/license allows it; begin with city-scoped Overture/Open Places data.
- **Drivers:** Mapbox-first UX, export/offline requirements, storage compliance, budget.
- **Alternatives considered:** Google Maps/Places end-to-end; paid data-delivery provider.
- **Why chosen:** avoids Google-content/display/storage conflicts and permits itinerary persistence.
- **Consequences:** venue data is best effort; city coverage/freshness quality gates are mandatory.
- **Follow-ups:** validate exact terms/attribution per source before storing fields; revisit paid enrichment after pilot.

### ADR-002 — Node API and PostgreSQL are the canonical business boundary

- **Decision:** Use Supabase Auth/PostgreSQL with Prisma through a Node TypeScript API; RLS is defense in depth, not the sole authorization layer.
- **Drivers:** lifecycle complexity, durable jobs, auditable account deletion, stable typed contract.
- **Alternatives considered:** client-to-Supabase-only operations; Supabase functions only.
- **Why chosen:** server-owned validation and jobs reduce client tampering and improve portability.
- **Consequences:** an additional deployable service and operational responsibility.
- **Follow-ups:** define deployment/SLO/secret-management provider before Phase 1 implementation.

### ADR-003 — Asynchronous feedback, versioned owner edits

- **Decision:** collaborators write feedback/suggestions; only owner edits itinerary versions.
- **Drivers:** product scope, simple conflict management, accountable feedback.
- **Alternatives considered:** live co-editing; view-only all users.
- **Why chosen:** delivers group value without realtime-sync complexity.
- **Consequences:** clear version/feedback archive model is required.
- **Follow-ups:** measure suggestion adoption before considering realtime collaboration.

### ADR-004 — Native tabs plus a NativeWind design system

- **Decision:** three Expo Router native tabs contained behind a navigation adapter; NativeWind v4.2.7 for shared visual tokens.
- **Drivers:** mandated native behavior, premium mobile UX, Expo 57 compatibility.
- **Alternatives considered:** JavaScript tabs; NativeWind v5 RC.
- **Why chosen:** native platform feel with stable documented styling support.
- **Consequences:** native tabs are exposed through an unstable Expo 57 import and require upgrade regression testing.
- **Follow-ups:** pin compatible versions and test tab behavior after every Expo SDK upgrade.

### ADR-005 — Strict validation after AI output

- **Decision:** AI proposes structured itineraries, but deterministic services validate and persist only compliant plans or explicit partial results.
- **Drivers:** realism promise, safety against hallucinated/overloaded schedules, measurable quality.
- **Alternatives considered:** display raw AI output; manual-only itinerary building.
- **Why chosen:** combines speed with enforceable guardrails.
- **Consequences:** more backend work and a managed candidate/validation pipeline.
- **Follow-ups:** tune prompt/model/provider fallback from pilot validation data without logging raw personal prompts.

## Risks and mitigation

- **Calendar mismatch:** treat 23 November as the actual pilot date and make it a scope gate; otherwise rebaseline dates before code work.
- **POI quality:** launch only five validated cities; expand only after coverage/freshness reports pass.
- **Provider/legal change:** preserve source metadata, isolate adapters, schedule terms review before release.
- **AI latency/cost:** job state machine, timeouts, quotas, model fallback, and per-stage telemetry.
- **Native integration:** use development builds early; verify map/OAuth/deep links on physical devices.
- **Privacy/security:** threat-model share tokens, deletion, OAuth redirects, location permission, and analytics redaction before pilot.
- **Scope creep:** protect offline briefs; cut standalone discovery then nearby suggestions according to the agreed hierarchy.

## Verification sequence

1. Re-read provider terms and city-quality report before adding/storing any POI fields.
2. Verify clean database migration/seed and authorization matrix before mobile feature work.
3. Verify the Plan → generation → deterministic-validation path under mocks before live provider credentials.
4. Verify owner/collaborator/public/share/finalization/deletion paths through integration tests before UI polish.
5. Verify physical iOS/Android development builds including native tabs, OAuth, deep links, Mapbox, and offline artifacts.
6. Run full lint, TypeScript checks, unit/integration/e2e suites, Expo Doctor, accessibility pass, performance load test, and pilot analytics dry run.
7. Block pilot if a P0/P1 issue exists or any success-gate evidence is missing.

## Available-agent-types roster and execution guidance

### Recommended roles

- **architect (high):** own provider rights/data topology, deployment boundaries, and ADR validation.
- **executor (high):** mobile shell/features, API/domain implementation, and shared contracts; split ownership by directory.
- **security-reviewer (medium):** RLS/API authorization, share tokens, OAuth/deep links, deletion, data redaction.
- **test-engineer (medium):** fixture strategy, mobile/device E2E, load/performance harness, release gates.
- **dependency-expert (high):** Expo 57/NativeWind/Mapbox compatibility and licensing checks before installation.
- **verifier (high):** independent acceptance evidence and pilot readiness sign-off.

### Ralph path — sequential completion loop

Use when one owner should sequence the provider spike, backend schema, app shell, and verification tightly:

```text
$ralph "Execute .omx/plans/roamly-implementation-plan.md in phases. Keep the 23 Nov pilot scope gate, preserve the listed ADRs, and do not expand beyond P0 without evidence."
```

Begin with architect/dependency-expert verification, then executor lanes, then security-reviewer and test-engineer gates. Ralph should run the verification sequence above before declaring each phase complete.

### Team path — coordinated parallel execution

Use after Phase 0 resolves provider/data rights and exact build dependencies:

```text
$team "Execute the approved Roamly plan at .omx/plans/roamly-implementation-plan.md. Staff: architect + dependency-expert for Phase 0; two executors split mobile vs server/contracts; security-reviewer; test-engineer; verifier."
```

**Team verification path:** the mobile lane proves physical-device routes/tabs/auth/map/offline behavior; the server lane proves migrations/API/jobs/RLS; security proves access/deletion/share-token cases; the test lane proves fixtures/latency/acceptance gates; verifier independently reads all evidence and runs final regression commands. Ralph, if used after team handoff, validates unresolved cross-lane defects and release evidence only.

## Plan changelog

- Grounded initial planning against the existing Expo starter rather than assuming a backend or existing feature structure.
- Added a Phase 0 provider/rights and calendar gate to address the two largest pre-implementation risks.
- Added explicit delayed-scope ordering, background-job behavior, data attribution, and device-build verification.
- Recorded independent-review unavailability instead of representing this draft as externally approved consensus.
