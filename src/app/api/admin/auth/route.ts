import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { createHmac, timingSafeEqual, randomBytes } from "crypto";

export const ADMIN_COOKIE_NAME = "rasuah_admin_session";
const SESSION_TTL_SECONDS = 60 * 60 * 24; // 24 hours
const SESSION_VERSION = "v1";

function getSecret(): string | null {
  const secret = process.env.ADMIN_SESSION_SECRET;
  if (secret && secret.length > 0) return secret;
  const password = process.env.ADMIN_PASSWORD;
  if (!password) return null;
  return createHmac("sha256", "rasuah-fallback").update(password).digest("hex");
}

function signToken(payload: string): string {
  const secret = getSecret();
  if (!secret) throw new Error("Admin session secret unavailable");
  const sig = createHmac("sha256", secret).update(payload).digest("hex");
  return `${payload}.${sig}`;
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

function safeEqual(a: string, b: string): boolean {
  const aBuf = Buffer.from(a, "utf8");
  const bBuf = Buffer.from(b, "utf8");
  if (aBuf.length !== bBuf.length) {
    timingSafeEqual(aBuf, Buffer.alloc(aBuf.length));
    return false;
  }
  return timingSafeEqual(aBuf, bBuf);
}

export async function POST(req: Request) {
  const adminPassword = process.env.ADMIN_PASSWORD;
  if (!adminPassword) {
    return NextResponse.json({ error: "Admin is not configured on this server" }, { status: 503 });
  }

  let body: { password?: string } = {};
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const supplied = typeof body.password === "string" ? body.password : "";
  if (!supplied || !safeEqual(supplied, adminPassword)) {
    await new Promise((r) => setTimeout(r, 250));
    return NextResponse.json({ error: "Invalid password" }, { status: 401 });
  }

  const nonce = randomBytes(16).toString("hex");
  const issuedAt = Math.floor(Date.now() / 1000);
  const payload = `${SESSION_VERSION}.${issuedAt}.${nonce}`;
  const token = signToken(payload);

  const response = NextResponse.json({ success: true });
  response.cookies.set({
    name: ADMIN_COOKIE_NAME,
    value: token,
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: SESSION_TTL_SECONDS,
  });
  return response;
}

export async function DELETE() {
  const response = NextResponse.json({ success: true });
  response.cookies.set({
    name: ADMIN_COOKIE_NAME,
    value: "",
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 0,
  });
  return response;
}

export async function GET() {
  const cookieStore = await cookies();
  const token = cookieStore.get(ADMIN_COOKIE_NAME)?.value;
  if (!verifyToken(token)) {
    return NextResponse.json({ authenticated: false }, { status: 200 });
  }
  return NextResponse.json({ authenticated: true });
}
