import { createDatabaseClient } from "../_shared/database-client.ts";
import {
  asRecord,
  asString,
  errorMessage,
  errorStatus,
  handleCorsPreflight,
  readJsonRecord,
} from "../_shared/http.ts";
import { handleHealthcheck, requireAuth } from "./auth.ts";
import { getBackendActionDefinition } from "./action-registry.ts";
import { claimBackendHealthcheckRateLimit } from "./rate-limit.ts";
import { errorResponse, successResponse } from "./response.ts";
import { requireOriginSecret } from "../_shared/origin.ts";
import { executeBackendAction } from "./execution.ts";

Deno.serve(async (request) => {
  const originFailure = requireOriginSecret(request);
  if (originFailure) return originFailure;
  const preflight = handleCorsPreflight(request);
  if (preflight) return preflight;

  const requestId = crypto.randomUUID();
  let action = "";

  try {
    if (request.method !== "POST") {
      return errorResponse(new Error("method-not-allowed"), requestId, {
        headers: { Allow: "POST" },
      });
    }

    const body = await readJsonRecord(request);
    action = asString(body.action);
    const payload = asRecord(body.payload);
    if (!action) throw new Error("invalid-action");

    const supabase = createDatabaseClient();
    if (action === "healthcheck") {
      await claimBackendHealthcheckRateLimit();
      return successResponse(await handleHealthcheck(request, supabase), requestId);
    }

    const definition = getBackendActionDefinition(action);
    if (!definition) throw new Error("invalid-action");
    const auth = await requireAuth(supabase, request);
    const data = await executeBackendAction(definition, payload, auth, supabase);
    return successResponse(data, requestId);
  } catch (error) {
    const status = errorStatus(error);
    console.error(JSON.stringify({
      action: action || "unknown",
      error: errorMessage(error),
      requestId,
      stack: error instanceof Error ? error.stack : undefined,
      status,
    }));
    return errorResponse(error, requestId);
  }
});
