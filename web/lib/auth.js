import { getSupabaseAdmin } from "./supabaseAdmin";

export async function authenticateUserFromHeaders(request) {
  const userIdRaw = request.headers.get("x-user-id");
  const email = request.headers.get("x-user-email");

  if (!userIdRaw || !email) {
    return null;
  }

  const userId = Number.parseInt(userIdRaw, 10);
  if (!Number.isInteger(userId) || userId <= 0) {
    return null;
  }

  const supabase = getSupabaseAdmin();
  const { data, error } = await supabase
    .from("users")
    .select("id")
    .eq("id", userId)
    .eq("email", email)
    .maybeSingle();

  if (error || !data) {
    return null;
  }

  return userId;
}
