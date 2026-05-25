import type { AuthTokenPayload } from "../shared/types/auth.types";

declare global {
  namespace Express {
    interface Request {
      user?: AuthTokenPayload;
    }
  }
}

export {};
