import { RATE_LIMITS } from "../_shared/rate-limits.ts";
import {
  claimFixedWindowRateLimit,
  utcHourWindow,
  utcMinuteWindow,
  utcSecondWindow,
} from "../_shared/upstash-rate-limit.ts";
import type { BackendActionDefinition } from "./action-registry.ts";

export async function claimBackendActionRateLimit(uid: string, definition: BackendActionDefinition) {
  const action = definition.name;

  if (definition.rateLimitGroup === "read") {
    await claimFixedWindowRateLimit(
      uid,
      `backend.read.${action}.second`,
      utcSecondWindow(),
      RATE_LIMITS.backendActionReadSecond,
    );
    await claimFixedWindowRateLimit(
      uid,
      `backend.read.${action}`,
      utcHourWindow(),
      RATE_LIMITS.backendActionReadHourly,
    );
    return;
  }

  if (definition.rateLimitGroup === "general-write") {
    await claimFixedWindowRateLimit(
      uid,
      `backend.write.${action}.second`,
      utcSecondWindow(),
      RATE_LIMITS.backendActionWriteSecond,
    );
    await claimFixedWindowRateLimit(
      uid,
      `backend.write.${action}`,
      utcHourWindow(),
      RATE_LIMITS.backendActionWriteHourly,
    );
    return;
  }

  if (definition.rateLimitGroup === "upload-resolve") {
    await claimFixedWindowRateLimit(
      uid,
      `backend.upload-resolve.${action}.second`,
      utcSecondWindow(),
      RATE_LIMITS.backendActionUploadResolveSecond,
    );
    await claimFixedWindowRateLimit(
      uid,
      `backend.upload-resolve.${action}`,
      utcHourWindow(),
      RATE_LIMITS.backendActionUploadResolveHourly,
    );
    return;
  }

  if (definition.rateLimitGroup === "admin-write") {
    await claimFixedWindowRateLimit(
      uid,
      `backend.admin-write.${action}.second`,
      utcSecondWindow(),
      RATE_LIMITS.backendActionAdminWriteSecond,
    );
    await claimFixedWindowRateLimit(
      uid,
      `backend.admin-write.${action}`,
      utcHourWindow(),
      RATE_LIMITS.backendActionAdminWriteHourly,
    );
    return;
  }

  if (definition.rateLimitGroup === "sensitive-write") {
    await claimFixedWindowRateLimit(
      uid,
      `backend.sensitive-write.${action}.second`,
      utcSecondWindow(),
      RATE_LIMITS.backendActionSensitiveWriteSecond,
    );
    await claimFixedWindowRateLimit(
      uid,
      `backend.sensitive-write.${action}`,
      utcHourWindow(),
      RATE_LIMITS.backendActionSensitiveWriteHourly,
    );
    return;
  }
}

export async function claimBackendHealthcheckRateLimit() {
  await claimFixedWindowRateLimit(
    "global",
    "backend.healthcheck.second",
    utcSecondWindow(),
    RATE_LIMITS.backendHealthcheckSecond,
  );
  await claimFixedWindowRateLimit(
    "global",
    "backend.healthcheck",
    utcMinuteWindow(),
    RATE_LIMITS.backendHealthcheckMinute,
  );
}
