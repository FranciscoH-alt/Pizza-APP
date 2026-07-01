import { createHash } from 'crypto';
import { NextRequest } from 'next/server';

export const ADMIN_COOKIE_NAME = 'admin_session';

function expectedCookieValue(): string | null {
  const password = process.env.ADMIN_PASSWORD;
  if (!password) return null;
  return createHash('sha256').update(password).digest('hex');
}

/** Fails closed: if ADMIN_PASSWORD is unset, always returns false. */
export function isAuthedRequest(req: NextRequest): boolean {
  const expected = expectedCookieValue();
  if (!expected) return false;
  const cookie = req.cookies.get(ADMIN_COOKIE_NAME)?.value;
  return !!cookie && cookie === expected;
}

/** Returns the cookie value to set on successful login, or null if ADMIN_PASSWORD is unset. */
export function computeSessionCookieValue(submittedPassword: string): string | null {
  const expected = expectedCookieValue();
  if (!expected) return null;
  if (submittedPassword !== process.env.ADMIN_PASSWORD) return null;
  return expected;
}
