export type NodeEnvironment = "development" | "test" | "production";

export interface Environment {
  readonly [key: string]: string | undefined;
}

export interface ServerConfig {
  nodeEnv: NodeEnvironment;
  port: number;
  host: string;
  databaseUrl: string;
  supabaseUrl: string;
  supabaseJwtSecret: string;
  supabaseServiceRoleKey: string;
  aiProvider: "openai" | "anthropic";
  aiApiKey: string;
  mapboxAccessToken: string;
  publicAppUrl: string;
}

export class ConfigValidationError extends Error {
  readonly missing: readonly string[];
  readonly invalid: readonly string[];

  constructor(missing: readonly string[], invalid: readonly string[]) {
    const details = [
      missing.length > 0 ? `missing: ${missing.join(", ")}` : "",
      invalid.length > 0 ? `invalid: ${invalid.join(", ")}` : "",
    ]
      .filter(Boolean)
      .join("; ");
    super(`Server configuration is invalid${details ? ` (${details})` : ""}.`);
    this.name = "ConfigValidationError";
    this.missing = missing;
    this.invalid = invalid;
  }
}

function required(env: Environment, key: string, missing: string[]): string {
  const value = env[key]?.trim();
  if (!value) {
    missing.push(key);
    return "";
  }
  return value;
}

function isHttpUrl(value: string): boolean {
  try {
    const url = new URL(value);
    return url.protocol === "http:" || url.protocol === "https:";
  } catch {
    return false;
  }
}

function isAppUrl(value: string): boolean {
  try {
    return Boolean(new URL(value).protocol);
  } catch {
    return false;
  }
}

/**
 * Parses configuration from an explicit environment map so it can be tested
 * without touching process state. The HTTP-runtime integration supplies its
 * environment map at process startup.
 */
export function loadConfig(env: Environment): ServerConfig {
  const missing: string[] = [];
  const invalid: string[] = [];

  const nodeEnv = (env.NODE_ENV ?? "development").trim();
  if (nodeEnv !== "development" && nodeEnv !== "test" && nodeEnv !== "production") {
    invalid.push("NODE_ENV");
  }

  const portText = (env.PORT ?? "3001").trim();
  const port = Number(portText);
  if (!Number.isInteger(port) || port < 1 || port > 65_535) {
    invalid.push("PORT");
  }

  const aiProvider = (env.AI_PROVIDER ?? "openai").trim();
  if (aiProvider !== "openai" && aiProvider !== "anthropic") {
    invalid.push("AI_PROVIDER");
  }

  const databaseUrl = required(env, "DATABASE_URL", missing);
  const supabaseUrl = required(env, "SUPABASE_URL", missing);
  const supabaseJwtSecret = required(env, "SUPABASE_JWT_SECRET", missing);
  const supabaseServiceRoleKey = required(env, "SUPABASE_SERVICE_ROLE_KEY", missing);
  const aiApiKey = required(env, "AI_API_KEY", missing);
  const mapboxAccessToken = required(env, "MAPBOX_ACCESS_TOKEN", missing);
  const publicAppUrl = required(env, "PUBLIC_APP_URL", missing);

  if (databaseUrl && !databaseUrl.startsWith("postgresql://") && !databaseUrl.startsWith("postgres://")) {
    invalid.push("DATABASE_URL");
  }
  if (supabaseUrl && !isHttpUrl(supabaseUrl)) invalid.push("SUPABASE_URL");
  if (publicAppUrl && !isAppUrl(publicAppUrl)) invalid.push("PUBLIC_APP_URL");

  if (missing.length > 0 || invalid.length > 0) {
    throw new ConfigValidationError(missing, invalid);
  }

  return {
    nodeEnv: nodeEnv as NodeEnvironment,
    port,
    host: (env.HOST ?? "0.0.0.0").trim() || "0.0.0.0",
    databaseUrl,
    supabaseUrl,
    supabaseJwtSecret,
    supabaseServiceRoleKey,
    aiProvider: aiProvider as ServerConfig["aiProvider"],
    aiApiKey,
    mapboxAccessToken,
    publicAppUrl,
  };
}
