import type { NextFunction, Request, Response } from "express";
import { AppError } from "../utils/AppError";

const WINDOW_MS = 15 * 60 * 1000;
const MAX_REQUESTS = 300;
const AUTH_MAX_REQUESTS = 40;
const buckets = new Map<string, { count: number; resetAt: number }>();

export function securityHeaders(_req: Request, res: Response, next: NextFunction) {
  res.setHeader("X-Content-Type-Options", "nosniff");
  res.setHeader("X-Frame-Options", "DENY");
  res.setHeader("Referrer-Policy", "no-referrer");
  res.setHeader("Permissions-Policy", "camera=(), microphone=(), geolocation=()");
  next();
}

export function rateLimit(req: Request, _res: Response, next: NextFunction) {
  const now = Date.now();
  const isAuthRoute = req.path.includes("/auth/");
  const limit = isAuthRoute ? AUTH_MAX_REQUESTS : MAX_REQUESTS;
  const key = `${req.ip}:${isAuthRoute ? "auth" : "api"}`;
  const bucket = buckets.get(key);

  if (!bucket || bucket.resetAt <= now) {
    buckets.set(key, { count: 1, resetAt: now + WINDOW_MS });
    return next();
  }

  bucket.count += 1;
  if (bucket.count > limit) {
    return next(new AppError("Too many requests. Please try again later.", 429, "RATE_LIMITED"));
  }

  return next();
}
