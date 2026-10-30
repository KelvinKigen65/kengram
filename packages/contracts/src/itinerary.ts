import type { EntityId, MoneyEstimate, UtcInstant } from "./common";
import type { PlaceSnapshot } from "./place";

export type ItineraryVersionStatus = "draft" | "active" | "superseded" | "archived";
export type ActivityKind = "core" | "buffer" | "travel" | "free_time";
export type ActivityStatus = "scheduled" | "warning" | "removed";
export type ValidationWarningCode =
  | "place_details_stale"
  | "hours_unverified"
  | "reservation_recommended"
  | "route_time_unavailable"
  | "partial_schedule"
  | "constraint_conflict";

export interface ScheduleWarning {
  code: ValidationWarningCode;
  message: string;
  activityId: EntityId | null;
}

export interface Activity {
  id: EntityId;
  dayId: EntityId;
  position: number;
  kind: ActivityKind;
  status: ActivityStatus;
  title: string;
  startsAt: UtcInstant | null;
  endsAt: UtcInstant | null;
  place: PlaceSnapshot | null;
  costEstimate: MoneyEstimate | null;
  reservationNote: string | null;
  travelMinutesFromPrevious: number | null;
  bufferMinutesAfter: number;
  warnings: ScheduleWarning[];
}

export interface ItineraryDay {
  id: EntityId;
  versionId: EntityId;
  dayNumber: number;
  localDate: string;
  title: string | null;
  activities: Activity[];
  warnings: ScheduleWarning[];
}

export interface ItineraryVersion {
  id: EntityId;
  tripId: EntityId;
  versionNumber: number;
  status: ItineraryVersionStatus;
  createdAt: UtcInstant;
  /** Null when the original creator has deleted their account. */
  createdByUserId: EntityId | null;
  /** A partial version is usable but contains explicit unresolved warnings. */
  isPartial: boolean;
  days: ItineraryDay[];
}

export type ItineraryCommand =
  | {
      type: "add";
      dayId: EntityId;
      afterActivityId?: EntityId;
      activity: Omit<Activity, "id" | "dayId" | "position" | "warnings">;
    }
  | { type: "move"; activityId: EntityId; destinationDayId: EntityId; position: number }
  | { type: "remove"; activityId: EntityId }
  | { type: "swap"; activityId: EntityId; replacementPlaceId: EntityId }
  | { type: "reschedule"; activityId: EntityId; startsAt: UtcInstant; endsAt: UtcInstant };

export interface EditItineraryRequest {
  expectedVersionNumber: number;
  idempotencyKey: string;
  command: ItineraryCommand;
}
