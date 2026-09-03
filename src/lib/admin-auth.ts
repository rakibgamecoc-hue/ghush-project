import "server-only";
import { createHmac, timingSafeEqual } from "crypto";
import { ADMIN_COOKIE_NAME } from "@/app/api/admin/auth/route";
import type { ReadonlyRequestCookies } from "next/dist/server/web/spec-extension/adapters/request-cookies";

function getSecret(): string | null {
  const secret = process.env.ADMIN_SESSION_SECRET;
  if (secret && secret.length > 0) return secret;
  const password = process.env.ADMIN_PASSWORD;
  if (!password) return null;
  return createHmac("sha256", "rasuah-fallback").update(password).digest("hex");
}

function verifyToken(token: string | undefined | null): boolean {
  if (!token) return false;
  const secret = getSecret();
  if (!secret) return false;
  const dotIndex = token.lastIndexOf(".");
  if (dotIndex < 0) return false;
  const payload = token.slice(0, dotIndex);
  const provided = token.slice(dotIndex + 1);
  const expected = createHmac("sha256", secret).update(payload).digest("hex");
  if (expected.length !== provided.length) return false;
  try {
    return timingSafeEqual(Buffer.from(expected, "hex"), Buffer.from(provided, "hex"));
  } catch {
    return false;
  }
}

export function isAdminAuthed(cookieStore: ReadonlyRequestCookies): boolean {
  const token = cookieStore.get(ADMIN_COOKIE_NAME)?.value;
  return verifyToken(token);
}

export function verifyAdminToken(cookieStore: ReadonlyRequestCookies): boolean {
  return isAdminAuthed(cookieStore);
}
