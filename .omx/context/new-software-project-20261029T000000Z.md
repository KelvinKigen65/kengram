# Deep Interview Context: New Software Project

## Task statement

Interview the user before writing code, scaffolding, or an implementation plan for a new software project.

## Desired outcome

An execution-ready product specification, explicit assumptions, and open risks; then ask whether to turn it into an implementation plan.

## Stated solution

Use a senior technical-cofounder interview: small topic-grouped batches, challenge vague answers with concrete options, and prioritize high-leverage questions.

## Probable intent hypothesis

Prevent expensive product and architecture rework by making product scope, decision boundaries, and success criteria explicit before planning.

## Known facts / evidence

- This workspace contains a minimal Expo 57 / React Native 0.86 starter named `kengram`.
- Expo Router is configured; routes live under `src/app/`.
- `src/app/index.tsx` contains only the default starter screen.
- The product is **Roamly**, an AI-powered travel-planning mobile app.
- The supplied brief envisions destination discovery, AI itinerary generation, flight/hotel/activity organization, saved places, day-by-day schedules, recommendations, collaboration, memories, budgets, and sharing.
- The design direction is a light-first, premium editorial travel aesthetic with immersive photography, ocean-blue accents, rounded cards, and an iPhone-style mobile experience.
- The brief enumerates splash, authentication, preference onboarding, explore, AI planner, trip details, itinerary, places, budget, memories, saved trips, and profile screens.
- The primary v1 user is couples or groups organizing micro-trips, weekend getaways, and joint vacations.
- Roamly's v1 promise is realistic, high-vibe, paced itineraries generated in seconds rather than generic, overloaded lists.
- V1 must excell at prompt-to-itinerary generation, granular drag-and-drop edits, and a daily interactive route view.
- The default trip-creation form collects destination, dates, budget tier, travel vibe, plus optional special requests/must-see places.
- Partners may asynchronously vote and comment on stops or day blocks, and add places to a suggestions tray; only the creator can change the canonical itinerary.
- Public secret links are anonymous and view-only. Invited, signed-in collaborators may vote, comment, and suggest places.
- V1 sign-in methods are Sign in with Apple, Google Sign-In, and passwordless email magic links.
- Finalization moves an itinerary to a confirmed state: it closes new feedback, produces PDF/image and `.ics` calendar-export assets, and switches to an active-trip mode with navigation links, offline map views, and reservation reminders.
- The owner may reopen a confirmed itinerary. Existing feedback remains; feedback on replaced or removed stops is archived as past feedback.
- V1 launches in roughly 20 dense global tourist destinations; English is the sole UI language. Activity estimates support USD, EUR, GBP, JPY, AUD, and CAD.
- The requested integration design is Google Places for POI data plus Mapbox for map rendering, travel times, and cached maps. Offline support is a downloadable trip brief with static daily map images; full offline maps/search/navigation are deferred.
- The revised map/data direction is Mapbox-first, with Supabase Auth and PostgreSQL/Prisma. POI candidates include Mapbox Search/Places, Overture/Open Places, and Foursquare.
- The operating budget is $100–500/month for the initial active-user phase.
- When venue data is unavailable or constraints conflict, the AI emits a marked partial itinerary plus 2–3 local, vibe-matched alternatives in a Suggested Swap tray.
- Opening-hours and reservation guidance is explicitly best-effort, with a freshness label and a direct external link for user verification and booking.
- Location permission is requested only after an active-trip user invokes Explore Near My Current Location. There is no background location collection or tracking.
- Public secret links hide collaborator identities and feedback by default and optionally mask exact dates.
- Account deletion immediately removes personal profile/auth/preferences and sole-owned trips. For active group trips, ownership transfers to the oldest active collaborator and the deleting user’s feedback is removed.
- If V1 scope must shrink, standalone destination discovery is cut first and active-trip nearby suggestions second; exports and offline daily briefs are protected.
- Launch success gates are: 90% of generation requests complete in at most 30 seconds including geocoding/AI/route calculations; all schedules enforce travel and buffer checks with no more than four core stops per day; at least 80% of pilot groups complete creator-to-feedback collaboration unaided; and no unresolved P0/P1 defects affect creation, editing, or finalization.
- Distribution is a closed TestFlight plus Google Play internal-test pilot of 100–250 active beta users (30–50 groups), followed by public store listings.
- Reservation badges link to venues or booking services with affiliate tracking, but affiliate revenue is only an experiment rather than a launch gate.
- Decision rights are delegated for the stated Expo/React Native, Node/TypeScript, PostgreSQL/Prisma, AI, maps, analytics, and monitoring stack choices, except where a material cost or compliance issue requires a decision.
- UI implementation must use Expo Router native tabs and NativeWind. The installed Expo Router 57 uses the `expo-router/unstable-native-tabs` import, so native-tabs API stability is a managed dependency risk. NativeWind v4.2.7 is the current stable release documented as compatible with Expo SDK 57; NativeWind v5 is a release candidate and is excluded unless explicitly chosen later.
- The root navigation is native `[Trips] [Plan] [Profile]`. Discovery is contextual to an itinerary rather than a root destination.
- The closed TestFlight/Google Play pilot begins 23 November 2026 for 100–250 testers across five validation cities (Paris, Tokyo, New York, London, and Rome). The public-store target is 21 December 2026 and expands to 20 cities.
- Itinerary generation prioritizes geographic clustering, transit/walk-time realism, a maximum of 3–4 core stops per day with buffers, venue operating hours, and reservation/ticket warnings.
- The intended happy path ends when the creator finalizes an itinerary after partner feedback.
- V1 targets native iOS and Android. Web is limited to a lightweight, read-only itinerary-sharing link.
- Real booking, live inventory/prices, social networks, simultaneous collaborative editing, manual expense/currency splitting, and travel-photo journals are deferred.

## Constraints

- No code, scaffolding, or final implementation plan during the interview.
- Prefer the existing Expo / React Native setup unless the user explicitly chooses otherwise.
- Version-sensitive Expo decisions must be grounded in Expo 57 documentation before implementation.
- Collaboration in v1 must not require simultaneous Google-Docs-style editing.
- Public-secret-link access is intentionally view-only; all feedback writes require a signed-in invitee identity.
- V1 needs a clear definition of offline map views and a data-provider strategy for place search, operating hours, routes, travel times, and reservation warnings.
- The proposed Google Places + Mapbox model has a material licensing/compliance risk: Google Places policy says Places content shown on a map must be shown on a Google Map and generally restricts storage/caching other than place IDs. This needs an explicit provider-architecture decision before implementation.
- The launch-cutline priority and measurable definition of done remain unresolved across a broad V1 feature set.
- The stated six-week development sprint conflicts with the calendar: 29 October to 23 November 2026 is about 3.6 weeks. The stated two-week beta window also conflicts with the 28 days between 23 November and 21 December. These are schedule risks rather than unresolved product requirements.
- Provider validation: Mapbox Search Box can return POIs but does not permit permanent storage; Mapbox's Places API is a public preview with a 1,000-record/account/month quota. Foursquare's non-enterprise API terms prohibit caching of ordinary place attributes. Overture/Open Places data can form a persistable POI base but does not by itself guarantee current opening hours, phone numbers, reservation availability, ratings, or photos.

## Unknowns / open questions

- Exact creation, invite/review, and edit user flows for a group itinerary.
- The scope and technical behavior of asynchronous collaboration.
- Launch geography, data source-of-truth, mapping/place-data integrations, business model, and delivery constraints.

## Decision-boundary unknowns

- Which product and technical decisions the user delegates to the team versus retains for approval.

## Likely codebase touchpoints

- `src/app/` for future screens and Expo Router navigation.
- `app.json` for future app configuration and native permission metadata.
- `package.json` for currently installed Expo SDK 57 dependencies.
