import { createServer } from "node:http";
import type { Server } from "node:http";
import { createApp } from "./app";
import { env } from "./config/env";
import { closeDatabase, connectDatabase } from "./config/prisma";

function listen(server: Server, port: number): Promise<void> {
  return new Promise((resolve, reject) => {
    const onError = (error: NodeJS.ErrnoException) => {
      server.off("listening", onListening);
      reject(error);
    };

    const onListening = () => {
      server.off("error", onError);
      resolve();
    };

    server.once("error", onError);
    server.once("listening", onListening);
    server.listen(port);
  });
}

function handleStartupError(error: unknown, port: number): never {
  if (isNodeError(error) && error.code === "EADDRINUSE") {
    console.error(`Port ${port} is already in use.`);
    console.error("Stop the existing backend process that is using this port, or change PORT in your .env file.");
    console.error(`Example: PORT=5001`);
    process.exit(1);
  }

  console.error("Failed to start Algebra Quest API", error);
  process.exit(1);
}

function isNodeError(error: unknown): error is NodeJS.ErrnoException {
  return error instanceof Error && "code" in error;
}

async function bootstrap() {
  await connectDatabase();

  const app = createApp();
  const server = createServer(app);

  try {
    await listen(server, env.port);
  } catch (error) {
    await closeDatabase();
    handleStartupError(error, env.port);
  }

  console.info(`Algebra Quest API listening on port ${env.port}`);
  console.info(`API base path: ${env.apiPrefix}`);

  const shutdown = async (signal: NodeJS.Signals) => {
    console.info(`${signal} received. Shutting down API...`);
    server.close(async () => {
      await closeDatabase();
      process.exit(0);
    });
  };

  process.on("SIGINT", shutdown);
  process.on("SIGTERM", shutdown);
}

bootstrap().catch((error) => {
  handleStartupError(error, env.port);
});
