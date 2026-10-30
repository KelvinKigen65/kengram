import type { EntityId } from "./common";

export type ErrorCode =
  | "authentication_required"
  | "forbidden"
  | "not_found"
  | "validation_failed"
  | "version_conflict"
  | "trip_locked"
  | "share_link_invalid"
  | "rate_limited"
  | "provider_unavailable"
  | "job_failed"
  | "internal_error";

export interface ApiError {
  code: ErrorCode;
  message: string;
  requestId?: string;
  details?: Record<string, string | number | boolean | null>;
}

export interface VersionConflictError extends ApiError {
  code: "version_conflict";
  details: {
    currentVersionNumber: number;
    tripId: EntityId;
  };
}
