import dotenv from "dotenv";

dotenv.config();

type NodeEnv = "development" | "test" | "production";

const DEFAULT_PORT = 5000;

function required(name: string, fallback?: string): string {
  const value = process.env[name] ?? fallback;

  if (!value) {
    throw new Error(`Missing required environment variable: ${name}`);
  }

  return value;
}

function parsePort(value: string | undefined): number {
  if (!value) {
    return DEFAULT_PORT;
  }

  const port = Number(value);

  if (!Number.isInteger(port) || port < 1 || port > 65535) {
    throw new Error(`Invalid PORT value "${value}". PORT must be a number between 1 and 65535.`);
  }

  return port;
}

export const env = {
  nodeEnv: (process.env.NODE_ENV ?? "development") as NodeEnv,
  port: parsePort(process.env.PORT),
  apiPrefix: process.env.API_PREFIX ?? "/api",
  corsOrigin: process.env.CORS_ORIGIN ?? "http://localhost:8080",
  databaseUrl: required(
    "DATABASE_URL",
    process.env.NODE_ENV === "production" ? undefined : "postgres://postgres:postgres@localhost:5432/algebra_quest",
  ),
  jwtSecret: required("JWT_SECRET", process.env.NODE_ENV === "production" ? undefined : "development-only-secret"),
  jwtExpiresIn: process.env.JWT_EXPIRES_IN ?? "7d",
};

export const isProduction = env.nodeEnv === "production";
