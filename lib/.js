// Lightweight in-memory rate limiter (per serverless instance).
// Good enough to blunt basic spam/abuse. For true multi-instance protection
// at high traffic, swap this for Upstash Redis (@upstash/ratelimit) later —
// same function signature, so nothing else needs to change.

const requestLog = new Map();

// Periodically clear old entries so memory doesn't grow forever
setInterval(() => {
  const now = Date.now();
  for (const [key, entry] of requestLog.entries()) {
    if (now - entry.windowStart > 5 * 60 * 1000) {
      requestLog.delete(key);
    }
  }
}, 5 * 60 * 1000);

/**
 * Returns { allowed: boolean, remaining: number } for the given key
 * (usually an IP address or IP+route combo).
 */
export function rateLimit(key, { limit = 20, windowMs = 60 * 1000 } = {}) {
  const now = Date.now();
  const entry = requestLog.get(key);

  if (!entry || now - entry.windowStart > windowMs) {
    requestLog.set(key, { count: 1, windowStart: now });
    return { allowed: true, remaining: limit - 1 };
  }

  if (entry.count >= limit) {
    return { allowed: false, remaining: 0 };
  }

  entry.count += 1;
  return { allowed: true, remaining: limit - entry.count };
}

/**
 * Extracts a best-effort client IP from a Next.js Request object.
 */
export function getClientIp(request) {
  const forwardedFor = request.headers.get('x-forwarded-for');
  if (forwardedFor) return forwardedFor.split(',')[0].trim();
  return request.headers.get('x-real-ip') || 'unknown';
}