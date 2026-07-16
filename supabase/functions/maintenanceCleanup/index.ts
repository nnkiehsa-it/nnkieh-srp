import { createClient } from "npm:@supabase/supabase-js@2";
import type { Database } from "../_shared/database.ts";
import { requireEnv } from "../_shared/env.ts";
import { errorMessage, errorStatus, jsonResponse, publicError, requireMethod } from "../_shared/http.ts";
import { ISSUE_CATEGORY_IDS } from "../_shared/issue-categories.ts";
import { RATE_LIMITS } from "../_shared/rate-limits.ts";
import { DATA_RETENTION } from "../_shared/data-retention.ts";
import { claimFixedWindowRateLimits, utcMinuteWindow, utcSecondWindow } from "../_shared/upstash-rate-limit.ts";
import { requireBearerSecret } from "../_shared/webhook.ts";
import { edgeFunctionUrl, requireOriginSecret } from "../_shared/origin.ts";

Deno.serve(async (request) => {
  const originFailure = requireOriginSecret(request);
  if (originFailure) return originFailure;
  const methodFailure = requireMethod(request, "POST");
  if (methodFailure) return methodFailure;

  const authFailure = requireBearerSecret(request);
  if (authFailure) return authFailure;

  try {
    await claimFixedWindowRateLimits([
      { identifier: "global", actionName: "worker.maintenance.second", window: utcSecondWindow(), config: RATE_LIMITS.workerRunSecond },
      { identifier: "global", actionName: "worker.maintenance", window: utcMinuteWindow(), config: RATE_LIMITS.workerRunMinute },
    ]);
    const supabase = createClient<Database>(
      requireEnv("SUPABASE_URL"),
      requireEnv("APP_SUPABASE_SERVICE_ROLE_KEY"),
      { auth: { persistSession: false } },
    );
    const { data, error } = await supabase
      .schema("app_api")
      .rpc("run_maintenance_cleanup", {
        retention_config: DATA_RETENTION,
        valid_issue_categories: [...ISSUE_CATEGORY_IDS],
      });
    if (error) throw error;

    const authorization = `Bearer ${requireEnv("WEBHOOK_SECRET")}`;
    const originSecret = requireEnv("EDGE_ORIGIN_SECRET");
    const workers = [
      { name: "processDeletionJobs", url: edgeFunctionUrl("delete") },
      { name: "outboxWorker", url: edgeFunctionUrl("outbox") },
    ];
    const workerResults = await Promise.all(workers.map(async ({ name, url }) => {
      const response = await fetch(url, {
        method: "POST",
        headers: { authorization, "content-type": "application/json", "x-novae-origin-secret": originSecret },
        body: JSON.stringify({ signal: "daily_maintenance" }),
        signal: AbortSignal.timeout(30_000),
      });
      if (!response.ok) throw new Error(`${name}-failed`);
      return await response.json();
    }));

    return jsonResponse({ ok: true, result: data, workers: workerResults });
  } catch (error) {
    console.error(errorMessage(error));
    return jsonResponse({ ok: false, error: publicError(error) }, { status: errorStatus(error) });
  }
});
