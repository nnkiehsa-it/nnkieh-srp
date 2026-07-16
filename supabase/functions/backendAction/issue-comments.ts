import { asRecord, asString } from "../_shared/http.ts";
import { ISSUE_CATEGORIES } from "../_shared/issue-categories.ts";
import type { AuthContext, BackendSupabase, JsonRecord } from "./types.ts";
import { validateMarkdownUploadsBeforeCreate } from "./uploads.ts";
import { asNumber, asUuid, readCursor, readCursorDate } from "./utils.ts";
import { INPUT_LIMITS, requiredMediaContent } from "./validation.ts";
import { canManageIssueCategory } from "./auth.ts";
import { selectIssue } from "./issue-shared.ts";

const PRIVATE_TO_OWNER_CATEGORIES = ISSUE_CATEGORIES
  .filter((category) => category.readAccess === "owner-admin")
  .map((category) => category.id);
const REVIEW_REQUIRED_CATEGORIES = ISSUE_CATEGORIES
  .filter((category) => category.readAccess === "reviewed-school")
  .map((category) => category.id);
const PUBLIC_COMMENT_CATEGORIES = ISSUE_CATEGORIES
  .filter((category) => category.comments.enabledWhen === "public")
  .map((category) => category.id);

function issueCommentPolicyParams(auth: AuthContext, actorCanManage: boolean) {
  return {
    actor_uid: auth.uid,
    actor_is_admin: actorCanManage,
    private_to_owner_categories: PRIVATE_TO_OWNER_CATEGORIES,
    review_required_categories: REVIEW_REQUIRED_CATEGORIES,
    public_comment_categories: PUBLIC_COMMENT_CATEGORIES,
  };
}

async function listComments(payload: JsonRecord, auth: AuthContext, supabase: BackendSupabase) {
  const issueId = asUuid(payload.issueId);
  if (!issueId) throw new Error("not-found");
  const issue = await selectIssue(supabase, issueId);
  const cursor = readCursor(payload);
  const { data, error } = await supabase.schema("app_api").rpc("backend_list_issue_comments", {
    issue_id: issueId,
    cursor_id: asUuid(cursor.id) || null,
    cursor_created_at: readCursorDate(cursor, "createdAtMs", "created_at") || null,
    page_size: Math.min(Math.max(Math.round(asNumber(payload.pageSize, 30)), 1), 30),
    ...issueCommentPolicyParams(auth, canManageIssueCategory(auth, asString(issue.category))),
  });
  if (error) throw error;
  return data;
}

async function createComment(payload: JsonRecord, auth: AuthContext, supabase: BackendSupabase) {
  const issueId = asUuid(payload.issueId);
  if (!issueId) throw new Error("not-found");
  const issue = await selectIssue(supabase, issueId);
  const content = requiredMediaContent(
    payload.content,
    "comment",
    INPUT_LIMITS.comment,
    INPUT_LIMITS.commentStorage,
  );
  const parentCommentId = asUuid(payload.parentCommentId) || null;
  await validateMarkdownUploadsBeforeCreate(supabase, auth.uid, content, "comment");
  const { data, error } = await supabase.schema("app_api").rpc("backend_create_issue_comment", {
    issue_id: issueId,
    parent_comment_id: parentCommentId,
    actor_name: auth.name,
    actor_photo_url: auth.photoUrl,
    comment_content: content,
    ...issueCommentPolicyParams(auth, canManageIssueCategory(auth, asString(issue.category))),
  });
  if (error) throw error;
  return { comment: asRecord(data) };
}

async function deleteComment(payload: JsonRecord, auth: AuthContext, supabase: BackendSupabase) {
  const commentId = asUuid(payload.commentId);
  if (!commentId) return { success: true };
  const { data: comment, error: commentError } = await supabase.schema("app_private")
    .from("comments").select("issue_id").eq("id", commentId).maybeSingle();
  if (commentError) throw commentError;
  if (!comment) return { success: true };
  const issue = await selectIssue(supabase, comment.issue_id);
  const { error } = await supabase.schema("app_api").rpc("backend_delete_issue_comment", {
    comment_id: commentId,
    actor_uid: auth.uid,
    actor_is_admin: canManageIssueCategory(auth, asString(issue.category)),
  });
  if (error) throw error;
  return { success: true };
}

export function isIssueCommentAction(action: string) {
  return action === "listComments" || action === "createComment" || action === "deleteComment";
}

export async function handleIssueCommentAction(
  action: string,
  payload: JsonRecord,
  auth: AuthContext,
  supabase: BackendSupabase,
) {
  if (action === "listComments") return listComments(payload, auth, supabase);
  if (action === "createComment") return createComment(payload, auth, supabase);
  if (action === "deleteComment") return deleteComment(payload, auth, supabase);
  throw new Error("unsupported-action");
}
