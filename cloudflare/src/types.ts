export interface Env {
  ALLOWED_ORIGINS: string;
  CLOUDINARY_WEBHOOK_SECRET: string;
  EDGE_FUNCTION_NAMESPACE: string;
  EDGE_ORIGIN_SECRET: string;
  FIREBASE_PROJECT_ID: string;
  SUPABASE_FUNCTIONS_BASE_URL: string;
  UPSTASH_REDIS_REST_TOKEN: string;
  UPSTASH_REDIS_REST_URL: string;
}

export interface JsonRecord {
  [key: string]: unknown;
}
