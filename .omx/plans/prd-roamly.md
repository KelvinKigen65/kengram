# Roamly PRD

## Objective

Deliver a premium Expo iOS/Android app for couples and groups to create, review, finalize, and use realistic travel itineraries. The v1 proof is structured plan generation followed by asynchronous partner feedback and an offline daily brief.

## Pilot scope

- Closed TestFlight / Google Play Internal pilot: 23 November 2026.
- 100–250 active testers across 30–50 groups.
- Validation cities: Paris, Tokyo, New York, London, Rome.
- Public target: 21 December 2026; expand only to city data that meets quality gates.

## User stories

### US-001 — Authenticate and enter the app

As a traveler, I sign in with Apple, Google, or email magic link so my trips and feedback are secure.

Acceptance criteria:

- Unauthenticated users see auth routes; authenticated users see native Trips, Plan, and Profile tabs.
- OAuth/magic-link redirect works on physical iOS and Android development builds.
- Profile exposes currency/privacy preferences and controlled account deletion.

### US-002 — Generate a realistic itinerary

As a trip creator, I enter destination, dates, budget, vibe, and optional must-sees so Roamly proposes a usable day-by-day plan.

Acceptance criteria:

- 90% of representative requests finish within 30 seconds including POI/routing/AI/validation work.
- Standard days contain no more than four core stops; arrival/departure or constrained days can contain fewer.
- Schedules enforce chronology, route/buffer checks, clustering, and explicit best-effort venue warnings.
- Invalid/unavailable data produces a marked partial plan and 2–3 Suggested Swap choices.

### US-003 — Edit the canonical trip

As the owner, I add, remove, swap, reschedule, and reorder stops so the itinerary reflects group decisions.

Acceptance criteria:

- Owner edits are versioned, conflict-aware, and recoverable after app restart.
- Collaborators cannot mutate itinerary activities through any UI, deep link, or API call.

### US-004 — Collaborate asynchronously

As an invited collaborator, I vote, comment, and suggest a place so I can influence a trip without live co-editing.

Acceptance criteria:

- Signed-in members can vote/comment/suggest; owner is the only canonical editor.
- At least 80% of pilot groups complete creator → share → collaborator feedback without help.
- Votes/comments for replaced activities are archived, not lost.

### US-005 — Share safely and finalize

As the owner, I share a filtered view and finalize the agreed schedule so the group can use it while traveling.

Acceptance criteria:

- Anonymous secret links are read-only and hide identities/comments/vote details; owner can mask dates and revoke links.
- Finalization blocks new feedback and creates access-controlled PDF/image, ICS, and static-map offline artifacts.
- Owner reopening creates an editable version and preserves/archives appropriate feedback.

### US-006 — Respect privacy and data rights

As a traveler, my location and account data are handled transparently.

Acceptance criteria:

- Location permission is requested only after active-trip nearby intent; no background tracking.
- Account deletion deletes personal/sole-owned data and safely transfers eligible active group trips.
- Stored/exported POI fields comply with the selected provider’s rights and carry required attribution/freshness metadata.

## Scope limits

Excluded: booking/payment, live prices or inventory, social feeds/profiles, live collaborative editing, expense splitting, journals, full offline maps/search/navigation, and a full web app. Standalone discovery is the first scope cut; nearby suggestions are second. Offline daily briefs remain P0.

## Non-functional gates

- $100–500 monthly operating envelope for initial active use.
- Zero unresolved P0/P1 defects in generation, owner editing, finalization, or artifact access.
- Each supported pilot city: ≥95% sampled candidate POIs have valid coordinate/category/permitted name, and ≥80% have either an external verification URL or an explicit unavailable-details fallback.
