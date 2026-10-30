/** ISO 4217 currency values supported by the first Roamly release. */
export type CurrencyCode = "USD" | "EUR" | "GBP" | "JPY" | "AUD" | "CAD";

/** ISO 8601 instant strings are always UTC. */
export type UtcInstant = string;

/** An IANA timezone, for example `Europe/Paris`. */
export type IanaTimezone = string;

export type EntityId = string;

export interface MoneyEstimate {
  amount: number;
  currency: CurrencyCode;
  /** Estimates are intentionally not a live price quote. */
  isEstimate: true;
}

export interface PageInfo {
  nextCursor: string | null;
}
