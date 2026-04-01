import { createClient } from "@/lib/supabase/server";

type ServerSupabaseClient = Awaited<ReturnType<typeof createClient>>;

export interface RateLimitConfig {
  maxRequests: number;
  windowMs: number;
}

export interface RateLimitResult {
  limited: boolean;
  remaining: number;
  retryAfterSeconds: number;
}

const MISSING_TABLE_HINT = 'relation "api_rate_limits" does not exist';

export async function enforceRateLimit(
  supabase: ServerSupabaseClient,
  userId: string,
  routeKey: string,
  config: RateLimitConfig
): Promise<RateLimitResult> {
  const nowMs = Date.now();
  const nowIso = new Date(nowMs).toISOString();

  const { data: row, error: readError } = await supabase
    .from("api_rate_limits")
    .select("window_start, request_count")
    .eq("user_id", userId)
    .eq("route_key", routeKey)
    .maybeSingle();

  if (readError) {
    if (readError.message.includes(MISSING_TABLE_HINT)) {
      // Migration may not be applied yet. Keep API available until DB is updated.
      return {
        limited: false,
        remaining: config.maxRequests,
        retryAfterSeconds: 0,
      };
    }
    throw readError;
  }

  const windowStartMs = row ? new Date(row.window_start).getTime() : 0;
  const elapsedMs = row ? nowMs - windowStartMs : config.windowMs + 1;
  const windowExpired = !row || elapsedMs >= config.windowMs;

  if (windowExpired) {
    const { error: resetError } = await supabase.from("api_rate_limits").upsert({
      user_id: userId,
      route_key: routeKey,
      window_start: nowIso,
      request_count: 1,
    });

    if (resetError) {
      throw resetError;
    }

    return {
      limited: false,
      remaining: Math.max(config.maxRequests - 1, 0),
      retryAfterSeconds: 0,
    };
  }

  const currentCount = row.request_count ?? 0;
  if (currentCount >= config.maxRequests) {
    const retryAfterSeconds = Math.max(
      Math.ceil((config.windowMs - elapsedMs) / 1000),
      1
    );

    return {
      limited: true,
      remaining: 0,
      retryAfterSeconds,
    };
  }

  const { error: incrementError } = await supabase
    .from("api_rate_limits")
    .update({ request_count: currentCount + 1 })
    .eq("user_id", userId)
    .eq("route_key", routeKey);

  if (incrementError) {
    throw incrementError;
  }

  return {
    limited: false,
    remaining: Math.max(config.maxRequests - (currentCount + 1), 0),
    retryAfterSeconds: 0,
  };
}
