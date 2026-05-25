import type { Request, Response } from "express";
import { asyncHandler } from "../../utils/asyncHandler";
import * as authService from "./auth.service";
import { clearAuthCookie, setAuthCookie } from "./auth.cookies";
import { loginSchema, registerSchema } from "./auth.validation";

export const register = asyncHandler(async (req: Request, res: Response) => {
  const { body } = registerSchema.parse({ body: req.body });
  const data = await authService.register(body);

  setAuthCookie(res, data.accessToken);
  res.status(201).json({ success: true, data });
});

export const login = asyncHandler(async (req: Request, res: Response) => {
  const { body } = loginSchema.parse({ body: req.body });
  const data = await authService.login(body);

  setAuthCookie(res, data.accessToken);
  res.status(200).json({ success: true, data });
});

export const logout = asyncHandler(async (_req: Request, res: Response) => {
  clearAuthCookie(res);
  res.status(200).json({ success: true, data: { loggedOut: true } });
});

export const me = asyncHandler(async (req: Request, res: Response) => {
  const user = await authService.me(req.user!.sub);

  res.status(200).json({ success: true, data: { user } });
});
