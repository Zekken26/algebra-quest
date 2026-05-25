import cors from "cors";
import express from "express";
import path from "node:path";
import { env } from "./config/env";
import { errorHandler } from "./middleware/error.middleware";
import { rateLimit, securityHeaders } from "./middleware/security.middleware";
import { apiRouter } from "./routes";
import { AppError } from "./utils/AppError";

export function createApp() {
  const app = express();

  app.disable("x-powered-by");
  app.use(securityHeaders);
  app.use(rateLimit);
  app.use(
    cors({
      origin: env.corsOrigin,
      credentials: true,
    }),
  );
  app.use(express.json({ limit: "1mb" }));
  app.use(express.urlencoded({ extended: true }));
  app.use("/uploads", express.static(path.resolve(process.cwd(), "uploads")));

  app.get("/", (_req, res) => {
    res.status(200).json({
      success: true,
      data: {
        service: "Algebra Quest API",
        version: "1.0.0",
      },
    });
  });

  app.use(env.apiPrefix, apiRouter);

  if (env.apiPrefix !== "/api") {
    app.use("/api", apiRouter);
  }

  app.use((req, _res, next) => {
    next(new AppError(`Cannot ${req.method} ${req.originalUrl}`, 404, "ROUTE_NOT_FOUND"));
  });

  app.use(errorHandler);

  return app;
}
