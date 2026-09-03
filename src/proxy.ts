import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";

const redisUrl = process.env.UPSTASH_REDIS_REST_URL;
const redisToken = process.env.UPSTASH_REDIS_REST_TOKEN;
const redis = redisUrl && redisToken ? new Redis({ url: redisUrl, token: redisToken }) : null;

const ratelimit = redis
  ? new Ratelimit({
      redis: redis,
      limiter: Ratelimit.slidingWindow(5, "1 m"),
      analytics: false,
    })
  : null;

export async function proxy(request: NextRequest) {
  // Only apply to API routes
  if (request.nextUrl.pathname.startsWith('/api/')) {

    if (ratelimit) {
      const ip = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown";
      const { success } = await ratelimit.limit(`ratelimit_${ip}`);
      if (!success) {
        return NextResponse.json({ error: "Too many requests. Please try again later." }, { status: 429 });
      }
    }

    // Clone headers and strip all user-identifiable info before passing to backend handlers
    const requestHeaders = new Headers(request.headers);
    requestHeaders.delete('x-forwarded-for');
    requestHeaders.delete('x-real-ip');
    requestHeaders.delete('remote-addr');
    requestHeaders.delete('user-agent');
    requestHeaders.delete('cf-connecting-ip');

    const response = NextResponse.next({
      request: {
        headers: requestHeaders,
      },
    });

    // Security response headers
    response.headers.set('X-Content-Type-Options', 'nosniff');
    response.headers.set('X-Frame-Options', 'DENY');
    response.headers.set('Referrer-Policy', 'no-referrer');
    response.headers.set('Permissions-Policy', 'geolocation=()');
    response.headers.set('Content-Security-Policy', "default-src 'self'; frame-ancestors 'none'; base-uri 'self';");

    return response;
  }

  return NextResponse.next();
}

export const config = {
  matcher: '/api/:path*',
}
