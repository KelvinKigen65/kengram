import { createServerRuntime } from "./bootstrap";
import { createHttpServer } from "./http";

async function main() {
  const runtime = createServerRuntime(process.env);
  const server = createHttpServer(runtime.config, runtime.app);

  try {
    await server.listen({ host: runtime.config.host, port: runtime.config.port });
  } catch (error) {
    server.log.error(error);
    process.exitCode = 1;
    await server.close();
  }
}

void main();
