import type { CurrencyCode, EntityId, IanaTimezone, UtcInstant } from "./common";
import type { ItineraryVersion } from "./itinerary";
import type { PlaceSnapshot } from "./place";

export type TripStatus = "draft" | "generating" | "collaborative" | "confirmed" | "reopened" | "archived";
export type TripMemberRole = "owner" | "collaborator";
export type TripMemberStatus = "invited" | "active" | "removed";
export type BudgetTier = "budget" | "moderate" | "premium" | "luxury";
export type TripVibe = "relaxed" | "foodie" | "culture" | "adventure" | "nightlife" | "family" | "mixed";

export interface UserProfile {
  id: EntityId;
  displayName: string | null;
  avatarUrl: string | null;
  defaultCurrency: CurrencyCode;
  createdAt: UtcInstant;
  updatedAt: UtcInstant;
}

export interface Trip {
  id: EntityId;
  ownerId: EntityId;
  title: string;
  destinationName: string;
  destinationPlace: PlaceSnapshot | null;
  timezone: IanaTimezone;
  startsOn: string;
  endsOn: string;
  currency: CurrencyCode;
  budgetTier: BudgetTier;
  vibe: TripVibe;
  specialRequests: string | null;
  status: TripStatus;
  currentVersionNumber: number | null;
  createdAt: UtcInstant;
  updatedAt: UtcInstant;
}

export interface TripMember {
  id: EntityId;
  tripId: EntityId;
  userId: EntityId;
  role: TripMemberRole;
  status: TripMemberStatus;
  joinedAt: UtcInstant | null;
  createdAt: UtcInstant;
}

export interface Suggestion {
  id: EntityId;
  tripId: EntityId;
  submittedByMemberId: EntityId;
  place: PlaceSnapshot;
  note: string | null;
  status: "open" | "accepted" | "dismissed" | "archived";
  createdAt: UtcInstant;
}

export interface Vote {
  id: EntityId;
  memberId: EntityId;
  activityId: EntityId | null;
  suggestionId: EntityId | null;
  value: "up" | "down";
  createdAt: UtcInstant;
  updatedAt: UtcInstant;
}

export interface Comment {
  id: EntityId;
  tripId: EntityId;
  memberId: EntityId;
  activityId: EntityId | null;
  dayId: EntityId | null;
  body: string;
  createdAt: UtcInstant;
  updatedAt: UtcInstant;
  archivedAt: UtcInstant | null;
}

export interface TripDetail extends Trip {
  members: TripMember[];
  itinerary: ItineraryVersion | null;
  suggestions: Suggestion[];
}

export interface CreateTripRequest {
  title?: string;
  destinationName: string;
  startsOn: string;
  endsOn: string;
  timezone: IanaTimezone;
  currency: CurrencyCode;
  budgetTier: BudgetTier;
  vibe: TripVibe;
  specialRequests?: string;
}
