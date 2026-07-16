import { RATE_LIMITS } from "../_shared/rate-limits.ts";
import { claimFixedWindowRateLimits, utcMinuteWindow, utcSecondWindow } from "../_shared/upstash-rate-limit.ts";

export async function claimBackendHealthcheckRateLimit() {
  await claimFixedWindowRateLimits([
    { identifier: "global", actionName: "backend.healthcheck.second", window: utcSecondWindow(), config: RATE_LIMITS.backendHealthcheckSecond },
    { identifier: "global", actionName: "backend.healthcheck", window: utcMinuteWindow(), config: RATE_LIMITS.backendHealthcheckMinute },
  ]);
}
