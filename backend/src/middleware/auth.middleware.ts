import type { NextFunction, Request, Response } from "express";
import jwt from "jsonwebtoken";
import { env } from "../config/env";
import { AppError } from "../utils/AppError";
import type { AuthTokenPayload, UserRole } from "../shared/types/auth.types";
import { AUTH_COOKIE_NAME, readCookie } from "../modules/auth/auth.cookies";

export function requireAuth(req: Request, _res: Response, next: NextFunction) {
  const header = req.header("authorization");
  const bearerToken = header?.startsWith("Bearer ") ? header.slice(7) : undefined;
  const cookieToken = readCookie(req.header("cookie"), AUTH_COOKIE_NAME);
  const token = bearerToken ?? cookieToken;

  if (!token) {
    return next(new AppError("Authentication token is required.", 401, "AUTH_TOKEN_REQUIRED"));
  }

  try {
    req.user = jwt.verify(token, env.jwtSecret) as AuthTokenPayload;
    return next();
  } catch {
    return next(new AppError("Authentication token is invalid or expired.", 401, "AUTH_TOKEN_INVALID"));
  }
}

export function requireRole(...roles: UserRole[]) {
  return (req: Request, _res: Response, next: NextFunction) => {
    if (!req.user) {
      return next(new AppError("Authenticated user is required.", 401, "AUTH_REQUIRED"));
    }

    if (!roles.includes(req.user.role)) {
      return next(new AppError("You do not have access to this resource.", 403, "FORBIDDEN"));
    }

    return next();
  };
}
