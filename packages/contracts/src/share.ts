import type { EntityId, UtcInstant } from "./common";
import type { ItineraryDay } from "./itinerary";

export interface ShareLink {
  id: EntityId;
  tripId: EntityId;
  hideExactDates: boolean;
  expiresAt: UtcInstant | null;
  revokedAt: UtcInstant | null;
  createdAt: UtcInstant;
}

/** Deliberately anonymous, read-only projection for opaque public links. */
export interface PublicShareView {
  tripTitle: string;
  destinationName: string;
  status: "collaborative" | "confirmed" | "reopened";
  /** Null when the owner has selected date masking. */
  startsOn: string | null;
  endsOn: string | null;
  timezone: string;
  days: ItineraryDay[];
  isDateMasked: boolean;
}

export type ArtifactKind = "daily_brief_pdf" | "trip_summary_image" | "calendar_ics" | "static_map_image";

export interface Artifact {
  id: EntityId;
  tripId: EntityId;
  itineraryVersionId: EntityId;
  kind: ArtifactKind;
  storagePath: string;
  contentType: string;
  createdAt: UtcInstant;
  expiresAt: UtcInstant | null;
}
