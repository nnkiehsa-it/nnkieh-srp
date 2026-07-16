import type { AppDatabaseClient } from "../_shared/database-client.ts";

export type BackendSupabase = AppDatabaseClient;
export type JsonRecord = Record<string, unknown>;
export type PermissionCode =
  | "announcement.manage"
  | "dashboard.view"
  | "facility.manage"
  | "proposal.manage"
  | "role.manage";

export interface AuthContext {
  email: string;
  isAdmin: boolean;
  managedIssueCategoryIds: string[];
  permissions: PermissionCode[];
  roles: string[];
  name: string;
  photoUrl: string | null;
  uid: string;
}
