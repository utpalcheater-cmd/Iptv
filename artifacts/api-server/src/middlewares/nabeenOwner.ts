import type { NextFunction, Request, Response } from "express";
import { getAuth } from "@clerk/express";

type ClerkUserResponse = {
  primary_email_address_id?: string | null;
  email_addresses?: Array<{
    id?: string;
    email_address?: string;
    verification?: { status?: string };
  }>;
};

const OWNER_CACHE_TTL_MS = 60_000;
const ownerCache = new Map<string, { allowed: boolean; expiresAt: number }>();

async function isConfiguredOwner(userId: string): Promise<boolean> {
  const ownerEmail = process.env.NABEEN_OWNER_EMAIL?.trim().toLowerCase();
  const clerkSecret = process.env.CLERK_SECRET_KEY;
  if (!ownerEmail || !clerkSecret) {
    throw new Error("Owner authorization is not configured");
  }

  const cached = ownerCache.get(userId);
  if (cached && cached.expiresAt > Date.now()) return cached.allowed;

  const response = await fetch(
    `https://api.clerk.com/v1/users/${encodeURIComponent(userId)}`,
    {
      headers: { Authorization: `Bearer ${clerkSecret}` },
      signal: AbortSignal.timeout(5_000),
    },
  );
  if (!response.ok) {
    throw new Error(`Clerk user verification failed with status ${response.status}`);
  }

  const user = (await response.json()) as ClerkUserResponse;
  const primaryEmail = user.email_addresses?.find(
    (entry) =>
      entry.id === user.primary_email_address_id &&
      entry.verification?.status === "verified",
  )?.email_address;
  const allowed = primaryEmail?.trim().toLowerCase() === ownerEmail;
  ownerCache.set(userId, { allowed, expiresAt: Date.now() + OWNER_CACHE_TTL_MS });
  return allowed;
}

export async function requireNabeenOwner(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  const userId = getAuth(req).userId;
  if (!userId) {
    res.status(401).json({ error: "Sign in to access this workspace." });
    return;
  }

  try {
    if (!(await isConfiguredOwner(userId))) {
      res.status(403).json({ error: "This workspace is restricted to its owner." });
      return;
    }
    res.locals.ownerId = userId;
    next();
  } catch {
    req.log.warn("Owner authorization could not be verified");
    res.status(503).json({ error: "Owner authorization is temporarily unavailable." });
  }
}