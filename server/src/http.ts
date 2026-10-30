import Fastify, { type FastifyInstance } from "fastify";

import type { Application } from "./app";
import type { ServerConfig } from "./config";

export function createHttpServer(config: Pick<ServerConfig, "host" | "port">, application: Application): FastifyInstance {
  const server = Fastify({ logger: true });

  server.all("/*", async (request, reply) => {
    const path = new URL(request.raw.url ?? request.url, "http://roamly.local").pathname;
    const response = await application.handle({ method: request.method, path });

    await reply.code(response.statusCode).headers(response.headers).send(response.body);
  });

  server.addHook("onClose", async () => {
    // Reserved for Prisma/provider cleanup as those integrations are added.
  });

  void config;
  return server;
}
