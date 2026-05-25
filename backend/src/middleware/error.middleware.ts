import type { ErrorRequestHandler } from "express";
import multer from "multer";
import { Prisma } from "@prisma/client";
import { ZodError } from "zod";
import { isProduction } from "../config/env";
import { AppError } from "../utils/AppError";

export const notFoundHandler: ErrorRequestHandler = (err, _req, res, _next) => {
  const error = err instanceof AppError ? err : new AppError("Route not found.", 404, "ROUTE_NOT_FOUND");

  res.status(error.statusCode).json({
    success: false,
    message: error.message,
    ...error.details,
    error: {
      code: error.code,
      message: error.message,
      ...error.details,
    },
  });
};

export const errorHandler: ErrorRequestHandler = (err, _req, res, _next) => {
  if (err instanceof ZodError) {
    res.status(400).json({
      success: false,
      error: {
        code: "VALIDATION_ERROR",
        message: "Request validation failed.",
        issues: err.issues,
      },
    });
    return;
  }

  if (err instanceof multer.MulterError) {
    res.status(400).json({
      success: false,
      error: {
        code: err.code === "LIMIT_FILE_SIZE" ? "IMAGE_TOO_LARGE" : "UPLOAD_ERROR",
        message: err.code === "LIMIT_FILE_SIZE" ? "Avatar image must be 5MB or smaller." : err.message,
      },
    });
    return;
  }

  if (err instanceof Prisma.PrismaClientKnownRequestError) {
    if (err.code === "P2002") {
      res.status(409).json({
        success: false,
        error: {
          code: "UNIQUE_CONSTRAINT_VIOLATION",
          message: "A record with this value already exists.",
          target: err.meta?.target,
        },
      });
      return;
    }

    if (err.code === "P2025") {
      res.status(404).json({
        success: false,
        error: {
          code: "RECORD_NOT_FOUND",
          message: "The requested record was not found.",
        },
      });
      return;
    }
  }

  const error =
    err instanceof AppError
      ? err
      : new AppError("An unexpected error occurred.", 500, "INTERNAL_SERVER_ERROR");

  if (!isProduction) {
    console.error(err);
  }

  res.status(error.statusCode).json({
    success: false,
    message: error.message,
    ...error.details,
    error: {
      code: error.code,
      message: error.message,
      ...error.details,
      ...(!isProduction && err instanceof Error ? { stack: err.stack } : {}),
    },
  });
};
