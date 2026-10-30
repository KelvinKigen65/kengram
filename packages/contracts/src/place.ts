import type { EntityId, UtcInstant } from "./common";

export type PlaceCategory =
  | "attraction"
  | "cafe"
  | "restaurant"
  | "bar"
  | "museum"
  | "park"
  | "shopping"
  | "lodging"
  | "transport"
  | "other";

export type PlaceDataSource = "overture" | "foursquare" | "manual" | "owner";

export interface Coordinates {
  latitude: number;
  longitude: number;
}

/**
 * A rights-cleared, point-in-time copy of data used by an itinerary. It never
 * represents real-time availability, opening hours, or a completed booking.
 */
export interface PlaceSnapshot {
  id: EntityId;
  source: PlaceDataSource;
  sourcePlaceId: string | null;
  displayName: string;
  category: PlaceCategory;
  coordinates: Coordinates;
  address: string | null;
  phoneNumber: string | null;
  websiteUrl: string | null;
  attribution: string | null;
  fetchedAt: UtcInstant;
  /** A visible explanation when information may be stale or incomplete. */
  freshnessNote: string | null;
  coordinateConfidence: "high" | "medium" | "low";
}

export interface PlaceSearchResult extends PlaceSnapshot {
  externalBookingUrl: string | null;
}
