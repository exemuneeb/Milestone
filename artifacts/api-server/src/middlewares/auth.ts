import type { NextFunction, Request, RequestHandler, Response } from "express";
import { getAuth } from "@clerk/express";

export function getUserId(req: Request) {
  return getAuth(req).userId ?? null;
}

export const requireAuth: RequestHandler = (req: Request, res: Response, next: NextFunction) => {
  if (!getUserId(req)) {
    return res.status(401).json({ error: "Sign in to continue." });
  }
  return next();
};