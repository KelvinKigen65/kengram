# RALPLAN Context: Roamly Implementation Plan

## Task statement

Convert the completed Roamly product specification into a consensus-reviewed implementation plan. Do not start implementation.

## Desired outcome

An actionable, consensus-reviewed plan with sequencing, file-level touchpoints, test strategy, ADRs, risks, and future execution staffing guidance.

## Known facts and evidence

- The validated product spec is at `.omx/specs/deep-interview-roamly.md`.
- The repository is a minimal Expo SDK 57 / Expo Router starter. `src/app/index.tsx` is still a default starter screen.
- Required UI constraints are Expo Router native tabs and NativeWind v4.2.7.
- The product includes authentication, share links, user/location privacy, account deletion, affiliate links, and external data providers; consensus planning therefore uses deliberate review.

## Constraints

- Planning only; no app code, dependency changes, or scaffolding.
- Native iOS and Android scope; lightweight read-only web sharing only.
- Closed pilot target: 23 November 2026; public target: 21 December 2026.
- Budget: $100–500/month during initial active-user phase.

## Open risks

- Schedule-duration arithmetic conflict documented in the product spec.
- POI licensing, data freshness/coverage, native-tabs API stability, and native map/device build requirements.

## Likely codebase touchpoints

- `src/app/` router layouts and screens.
- `app.json`, `package.json`, and new NativeWind configuration files.
- New backend/database project and deployment configuration, which do not currently exist in this repository.
