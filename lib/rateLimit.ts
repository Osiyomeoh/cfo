// Simple in-memory rate limiter — resets on server restart
// For production use Upstash Redis or Vercel KV

const store = new Map<string, { count: number; reset: number }>()

export function rateLimit(
  key: string,
  limit = 20,      // requests
  windowMs = 60_000, // per minute
): { ok: boolean; remaining: number } {
  const now = Date.now()
  const entry = store.get(key)

  if (!entry || now > entry.reset) {
    store.set(key, { count: 1, reset: now + windowMs })
    return { ok: true, remaining: limit - 1 }
  }

  if (entry.count >= limit) {
    return { ok: false, remaining: 0 }
  }

  entry.count++
  return { ok: true, remaining: limit - entry.count }
}
