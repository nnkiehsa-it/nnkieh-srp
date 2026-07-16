#!/usr/bin/env bash
set -euo pipefail

ENV_FILE=""
KEEP_RUNNING="false"
while [[ $# -gt 0 ]]; do
  case "$1" in
    --env-file)
      ENV_FILE="${2:-}"
      shift 2
      ;;
    --keep-running)
      KEEP_RUNNING="true"
      shift
      ;;
    *)
      echo "Unknown option: $1" >&2
      exit 2
      ;;
  esac
done

if [[ -n "$ENV_FILE" && ! -f "$ENV_FILE" ]]; then
  echo "The supplied --env-file is not readable." >&2
  exit 2
fi

for command_name in docker supabase deno curl; do
  if ! command -v "$command_name" >/dev/null 2>&1; then
    echo "Missing local integration dependency: $command_name" >&2
    exit 2
  fi
done
if ! docker info >/dev/null 2>&1; then
  echo "Docker is not running or the current WSL user cannot access it." >&2
  exit 2
fi

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$ROOT"
TEMP_ENV="$(mktemp)"
FUNCTION_ENV="$(mktemp)"
FUNCTION_LOG="$(mktemp)"
FUNCTION_PID=""

cleanup() {
  if [[ -n "$FUNCTION_PID" ]] && kill -0 "$FUNCTION_PID" >/dev/null 2>&1; then
    kill "$FUNCTION_PID" >/dev/null 2>&1 || true
    wait "$FUNCTION_PID" >/dev/null 2>&1 || true
  fi
  rm -f "$TEMP_ENV" "$FUNCTION_ENV" "$FUNCTION_LOG"
  if [[ "$KEEP_RUNNING" != "true" ]]; then
    supabase stop >/dev/null 2>&1 || true
  fi
}
trap cleanup EXIT

echo "[integration] Starting local Supabase"
supabase start --exclude imgproxy,logflare,mailpit,postgres-meta,realtime,storage-api,studio,supavisor,vector
echo "[integration] Resetting the local database"
supabase db reset --local

STATUS_ENV="$(supabase status -o env)"
eval "$(printf '%s\n' "$STATUS_ENV" | grep -E '^(ANON_KEY|API_URL|JWT_SECRET|PUBLISHABLE_KEY|SECRET_KEY|SERVICE_ROLE_KEY)=')"
ANON_KEY="${ANON_KEY:-${PUBLISHABLE_KEY:-}}"
SERVICE_ROLE_KEY="${SERVICE_ROLE_KEY:-${SECRET_KEY:-}}"
: "${API_URL:?Local Supabase did not report API_URL}"
: "${ANON_KEY:?Local Supabase did not report an anonymous or publishable key}"
: "${SERVICE_ROLE_KEY:?Local Supabase did not report a service-role or secret key}"
: "${JWT_SECRET:?Local Supabase did not report JWT_SECRET}"

echo "[integration] Waiting for the REST schema cache"
rest_status=""
for _ in $(seq 1 60); do
  rest_status="$(curl -sS -o /dev/null -w '%{http_code}' \
    "$API_URL/rest/v1/user_profiles?select=uid&limit=1" \
    -H "apikey: $SERVICE_ROLE_KEY" \
    -H "authorization: Bearer $SERVICE_ROLE_KEY" \
    -H 'accept-profile: app_private' || true)"
  if [[ "$rest_status" == "200" ]]; then
    break
  fi
  sleep 1
done
if [[ "$rest_status" != "200" ]]; then
  echo "Local REST API schema cache did not become ready (HTTP $rest_status)." >&2
  exit 1
fi

echo "[integration] Linting the rebuilt database"
supabase db lint --local --level error --fail-on error

{
  printf 'ALLOWED_DOMAIN=integration.invalid\n'
  printf 'CLOUDFLARE_WORKER_URL=http://127.0.0.1:1\n'
  printf 'CLOUDINARY_API_KEY=integration-api-key\n'
  printf 'CLOUDINARY_API_SECRET=integration-api-secret\n'
  printf 'CLOUDINARY_CLOUD_NAME=integration-cloud\n'
  printf 'CLOUDINARY_WEBHOOK_SECRET=integration-cloudinary-webhook\n'
  printf 'EDGE_ORIGIN_SECRET=integration-origin-secret\n'
  printf 'FIREBASE_PROJECT_ID=integration-project\n'
  printf 'FIREBASE_WEB_API_KEY=integration-web-api-key\n'
  printf 'WEBHOOK_SECRET=integration-worker-secret\n'
  if [[ -n "$ENV_FILE" ]]; then
    grep -E '^(ALLOWED_DOMAIN|CLOUDFLARE_WORKER_URL|CLOUDINARY_API_KEY|CLOUDINARY_API_SECRET|CLOUDINARY_CLOUD_NAME|CLOUDINARY_WEBHOOK_SECRET|EDGE_ORIGIN_SECRET|FIREBASE_PROJECT_ID|FIREBASE_WEB_API_KEY|WEBHOOK_SECRET)=' "$ENV_FILE" || true
  fi
  printf '\nAPP_SUPABASE_SERVICE_ROLE_KEY=%s\n' "$SERVICE_ROLE_KEY"
  printf 'SUPABASE_URL=%s\n' "$API_URL"
  printf 'SUPABASE_ANON_KEY=%s\n' "$ANON_KEY"
  printf 'SUPABASE_JWT_SECRET=%s\n' "$JWT_SECRET"
  printf 'SUPABASE_FUNCTIONS_URL=%s/functions/v1\n' "$API_URL"
  printf 'GOOGLE_SERVICE_ACCOUNT_JSON=not-json\n'
} >"$TEMP_ENV"
chmod 600 "$TEMP_ENV"
grep -v '^SUPABASE_' "$TEMP_ENV" >"$FUNCTION_ENV"
chmod 600 "$FUNCTION_ENV"

echo "[integration] Serving Edge Functions with local database credentials"
supabase functions serve --env-file "$FUNCTION_ENV" --no-verify-jwt >"$FUNCTION_LOG" 2>&1 &
FUNCTION_PID="$!"
for _ in $(seq 1 60); do
  status="$(curl -sS -o /dev/null -w '%{http_code}' \
    -X POST "$API_URL/functions/v1/backendAction" \
    -H 'content-type: application/json' \
    --data '{"action":"getContentRevisions","payload":{}}' || true)"
  if [[ "$status" == "401" ]]; then
    break
  fi
  if ! kill -0 "$FUNCTION_PID" >/dev/null 2>&1; then
    cat "$FUNCTION_LOG" >&2
    exit 1
  fi
  sleep 1
done
if [[ "${status:-}" != "401" ]]; then
  cat "$FUNCTION_LOG" >&2
  echo "Edge Functions did not become ready." >&2
  exit 1
fi

echo "[integration] Running every backend action, permission matrix, RLS, and worker lifecycle"
if ! deno test \
  --node-modules-dir=none \
  --no-lock \
  --env-file="$TEMP_ENV" \
  --allow-env \
  --allow-net \
  --allow-read \
  --fail-fast \
  tests/integration; then
  echo "[integration] Edge Function log follows" >&2
  cat "$FUNCTION_LOG" >&2
  exit 1
fi

echo "[integration] All local integration checks passed"
