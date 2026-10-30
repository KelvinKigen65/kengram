# Roamly — Execution-Ready Product Specification

## Metadata

- Interview profile: standard
- Interview rounds: 9
- Final ambiguity: 5% (target: 20%)
- Context: Expo 57 brownfield starter; product work is greenfield
- Context snapshot: `.omx/context/new-software-project-20261029T000000Z.md`
- Pressure pass: the initial read-only shared-link description conflicted with write actions. Resolved as anonymous public view-only links plus signed-in, invited collaborators for feedback writes.

## Product and intent

Roamly is a premium mobile companion for couples and groups planning micro-trips, weekend getaways, and joint vacations. Its promise is: **realistic, high-vibe itineraries in seconds—not generic, overloaded lists.**

It differentiates from text chat, maps, and manual itinerary tools by generating a pace-aware, geographically clustered, day-by-day plan that a group can review asynchronously.

## V1 scope

### In scope

- Native iOS and Android app, English UI only.
- Native root tabs: **Trips**, **Plan**, and **Profile**.
- Passwordless email, Google, and Sign in with Apple authentication through Supabase Auth.
- Structured trip-generation wizard: destination, dates, budget tier, travel vibe, and optional must-see/special requests.
- AI generation of a structured itinerary, with a 3–4 core-stop maximum on standard full days, travel/buffer calculations, geographic clustering, best-effort venue facts, and reservation warnings.
- Flexible shorter schedules for arrival/departure or constraint-limited days.
- Owner-only drag-and-drop/manual activity edits, additions, removals, swaps, and reordering.
- Daily interactive Mapbox route view.
- Invited collaborators can vote, comment, and place suggestions in a separate tray; the owner accepts suggestions and exclusively edits the canonical itinerary.
- Anonymous public secret links are view-only, omit collaborator identities/feedback, and can hide exact dates.
- Finalize/reopen lifecycle: confirmed trips close feedback, create PDF/image + ICS artifacts, switch to active-trip mode, and retain/archive feedback as activities change.
- Offline daily brief with finalized route, addresses, phone/reservation details where available, and static map snapshots.
- Best-effort place freshness badges and external booking/venue links with affiliate click tracking.
- Active-trip-only, user-triggered current-location suggestions; no background tracking.
- Account deletion: immediately delete profile, credentials, preferences, and sole-owned trips; transfer an active group trip to its oldest active collaborator and remove the deleting user’s feedback.
- Product analytics with PostHog and crash/error monitoring with Sentry.

### Explicitly out of scope

- Flight/hotel booking, live prices, inventory sync, or payment flows.
- Public social feeds, follower networks, public profiles, photo journals, and scrapbooks.
- Simultaneous real-time collaborative editing.
- Manual expense tracking, splitting, and currency conversion.
- Full offline maps, offline place search, and turn-by-turn navigation.
- Full web application. A lightweight public, read-only share page is permitted.
- Standalone discovery is the first scope cut; active-trip nearby suggestions are the second. Exports and offline daily briefs are protected launch scope.

## Primary flow

1. A creator authenticates and starts Plan.
2. They enter the structured trip inputs and optional must-sees.
3. The backend obtains candidates/routing data, asks the AI for strict structured output, validates the proposed schedule, and returns a ready-to-edit itinerary. If constraints cannot be satisfied, it returns a marked partial plan and a 2–3 item Suggested Swap tray.
4. The creator edits the itinerary and invites collaborators.
5. Collaborators sign in to vote, comment, and suggest places; public-link viewers only view.
6. The creator finalizes the itinerary, creating export assets and closing new feedback.
7. During the trip, the app uses the active-trip view and an offline daily brief. The creator can reopen the trip, retaining current feedback and archiving feedback attached to replaced activities.

## Core data model

| Entity | Key relationships and behavior |
| --- | --- |
| User / Profile | Supabase identity; user preferences, currency, privacy choices. |
| Trip | Creator-owned state machine: draft, planning, collaborative, confirmed, reopened, archived. |
| TripMember | Role is owner or collaborator; invited member feedback requires authenticated membership. |
| PublicShareLink | Opaque revocable token, read-only permissions, optional date masking. |
| ItineraryVersion / Day / Activity | Versioned canonical schedule; activities have timing, place reference, route/buffer metadata, and change history. |
| PlaceSnapshot | Persistable open-data identity/details plus source, freshness timestamp, attribution, and reliability metadata. |
| Suggestion, Vote, Comment | Attached to a trip, day, or activity; comments/votes become archived feedback when their activity is replaced. |
| FinalizationArtifact | PDF/image brief, ICS, static-map image, and generation status. |
| AffiliateLinkEvent | Outbound booking/venue-link attribution; never a booking transaction. |
| Audit / Deletion record | Authorization-sensitive ownership transfer and deletion actions. |

PostgreSQL is the application source of truth. POI sources are inputs whose source, timestamp, attribution, and retention rights are preserved with each stored snapshot.

## Architecture and integrations

- **Mobile:** Expo SDK 57, React Native, Expo Router, NativeWind v4.2.7, and platform-native tabs. Expo 57's native-tabs import is `expo-router/unstable-native-tabs`; isolate it in the navigation layer.
- **Backend:** Node.js + TypeScript application API, PostgreSQL, Prisma, Supabase Auth, and Supabase Row Level Security.
- **AI:** provider abstraction selecting a currently supported structured-JSON model from OpenAI or Anthropic; backend only holds provider credentials.
- **Maps/routing:** Mapbox-first renderer and routing. Persisted POI data must come from a source whose terms allow it; do not combine Google Places content with Mapbox maps.
- **POI data:** begin with a persistable open-data source such as Overture/Open Places; use only best-effort freshness signals, never claim live availability. Rich paid data may be considered later only after rights/cost review.
- **Exports:** server-side asynchronous generation of PDF/image/ICS/static snapshots, stored in approved object storage and surfaced with job state/retry behavior.
- **Analytics/observability:** PostHog for key funnel events; Sentry for fatal/crash and performance error tracking. Avoid sending secret links, email addresses, raw free-text prompts, or precise location history to analytics.
- **External links:** venue/direct-booking/affiliate URLs open outside the app; no booking confirmation is implied.

## Security, privacy, and authorization

- All trusted provider calls, secret tokens, and export jobs run server-side.
- RLS and API authorization enforce owner-only itinerary changes and confirmed-state feedback locks.
- Link tokens are opaque, revocable, and scoped to read-only access.
- Current location is requested only after the user invokes nearby exploration in active-trip mode; no background location collection.
- Public links hide names, email addresses, vote totals, and comment threads; exact dates are owner-configurable.
- Account deletion transfers qualifying group-trip ownership before hard deletion; deletion must be transactional and auditable.

## Launch, quality, and operations

- **Pilot:** TestFlight and Google Play internal testing on 23 November 2026 with 100–250 active testers / 30–50 group trips. Validate Paris, Tokyo, New York, London, and Rome first.
- **Public launch:** target 21 December 2026; expand to roughly 20 tourist destinations.
- **Budget:** $100–500/month for initial active users, including AI, mapping/POI, Supabase, analytics, and monitoring.
- **Acceptance gates:**
  - 90% of itinerary generations finish within 30 seconds including geocoding, structured AI generation, and routing calculations.
  - Every generated schedule honors route/buffer validation and has at most four core stops per day.
  - At least 80% of pilot groups complete create → share → collaborator feedback without help.
  - No unresolved P0/P1 issues affect generation, editing, or finalization.

## Assumptions

1. NativeWind v4.2.7 is accepted as the stable Expo 57 choice; NativeWind v5 remains out of scope while it is a release candidate.
2. POI persistence initially uses Overture/Open Places or an equivalently permitted source; Foursquare standard API data will not be cached server-side unless paid terms expressly permit it.
3. "Hours verified" is never presented as real-time verification; it is a best-effort freshness label with an external confirmation path.
4. The implementation team may choose the current structured-output AI model and the background-job mechanism within the stated budget.
5. The public share page is a minimal web surface solely for viewing, not a web-product launch.
6. The exact public-launch city list and the app-store account/legal copy are selected during implementation/release preparation.

## Open risks

1. **Schedule conflict:** from 29 October to 23 November 2026 is about 3.6 weeks, not the stated six-week sprint. The interval to 21 December is four weeks, not the stated two-week patch window.
2. **Data completeness:** open POI data may lack enough current hours, phone details, photos, or reservation data for consistently high-quality recommendations across all 20 cities.
3. **Map/source rights:** provider terms must be revalidated before production; no Google Places content may be used on or alongside a Mapbox map without explicit compliant rights.
4. **Native-tabs stability:** Expo SDK 57 exposes the chosen tab navigator via an unstable import; pin and regression-test it before every SDK upgrade.
5. **Native map integration:** Mapbox and offline support require native development builds and device testing, not Expo Go-only validation.
6. **AI reliability and cost:** enforcing strict schema, validation, fallbacks, and a 30-second p90 target may require asynchronous jobs, retries, quotas, and model/prompt tuning.
7. **Release readiness:** App Store / Play account setup, Sign in with Apple configuration, privacy policy, location disclosure, affiliate disclosure, and tester recruitment remain external dependencies.
