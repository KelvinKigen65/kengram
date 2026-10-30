import { createApplication, type Application } from "./app";
import { loadConfig, type Environment, type ServerConfig } from "./config";

export interface ListeningAdapter {
  listen(options: {
    host: string;
    port: number;
    handler: Application["handle"];
  }): Promise<void>;
}

export interface ServerRuntime {
  config: ServerConfig;
  app: Application;
}

/** Creates a fully validated runtime before any socket is opened. */
export function createServerRuntime(environment: Environment): ServerRuntime {
  const config = loadConfig(environment);
  return { config, app: createApplication(config) };
}

/**
 * Socket ownership stays behind an adapter. Fastify will provide this adapter
 * when server dependencies are installed by the workspace integration step.
 */
export async function bootstrap(environment: Environment, adapter: ListeningAdapter): Promise<ServerRuntime> {
  const runtime = createServerRuntime(environment);
  await adapter.listen({
    host: runtime.config.host,
    port: runtime.config.port,
    handler: runtime.app.handle,
  });
  return runtime;
}
