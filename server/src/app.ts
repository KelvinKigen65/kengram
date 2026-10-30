import type { ServerConfig } from "./config";

export interface HttpRequest {
  method: string;
  path: string;
}

export interface HttpResponse {
  statusCode: number;
  headers: Record<string, string>;
  body: string;
}

export interface Application {
  handle(request: HttpRequest): Promise<HttpResponse>;
}

function json(statusCode: number, body: unknown, headers: Record<string, string> = {}): HttpResponse {
  return {
    statusCode,
    headers: { "content-type": "application/json; charset=utf-8", ...headers },
    body: JSON.stringify(body),
  };
}

/**
 * Framework-neutral until server dependencies are installed. Keeping health
 * handling here makes boot checks testable without a database or network.
 */
export function createApplication(config: Pick<ServerConfig, "nodeEnv">): Application {
  return {
    async handle(request) {
      if (request.path === "/health") {
        if (request.method !== "GET") {
          return json(405, { code: "not_found", message: "Method not allowed." }, { allow: "GET" });
        }

        return json(200, {
          status: "ok",
          service: "roamly-api",
          environment: config.nodeEnv,
          timestamp: new Date().toISOString(),
        });
      }

      return json(404, { code: "not_found", message: "Route not found." });
    },
  };
}
