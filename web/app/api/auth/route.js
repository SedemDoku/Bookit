import bcrypt from "bcryptjs";
import crypto from "crypto";
import { getSupabaseAdmin } from "@/lib/supabaseAdmin";
import { authenticateUserFromHeaders } from "@/lib/auth";
import { buildCorsHeaders, jsonError, jsonSuccess, parseJson } from "@/lib/api";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function OPTIONS(request) {
  return new Response(null, { status: 200, headers: buildCorsHeaders(request) });
}

export async function GET(request) {
  const action = new URL(request.url).searchParams.get("action") || "";

  if (action === "check") {
    return handleCheckAuth(request);
  }

  if (action === "user") {
    return handleGetUser(request);
  }

  return jsonError(request, "Invalid action", 400);
}

export async function POST(request) {
  const action = new URL(request.url).searchParams.get("action") || "";

  if (action === "signup") {
    return handleSignup(request);
  }

  if (action === "login") {
    return handleLogin(request);
  }

  if (action === "logout") {
    return jsonSuccess(request, null, "Logged out successfully");
  }

  return jsonError(request, "Invalid action", 400);
}

async function handleSignup(request) {
  const data = await parseJson(request);
  if (!data) {
    return jsonError(request, "Invalid JSON body", 400);
  }

  const username = (data.username || "").trim();
  const email = (data.email || "").trim();
  const password = data.password || "";
  const confirmPassword = data.confirmPassword || "";

  if (!username || !email || !password) {
    return jsonError(request, "All fields are required");
  }

  if (username.length < 3 || username.length > 50) {
    return jsonError(request, "Username must be between 3 and 50 characters");
  }

  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return jsonError(request, "Invalid email format");
  }

  if (password.length < 8) {
    return jsonError(request, "Password must be at least 8 characters long");
  }

  if (!/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
    return jsonError(request, "Password must contain at least one special character");
  }

  if (password !== confirmPassword) {
    return jsonError(request, "Passwords do not match");
  }

  const supabase = getSupabaseAdmin();
  const { data: existingUsers, error: existingError } = await supabase
    .from("users")
    .select("id")
    .or(`username.eq.${username},email.eq.${email}`)
    .limit(1);

  if (existingError) {
    return jsonError(request, "Failed to check existing users", 500);
  }

  if (existingUsers && existingUsers.length > 0) {
    return jsonError(request, "Username or email already exists");
  }

  const passwordHash = await bcrypt.hash(password, 10);
  const { data: newUser, error: insertError } = await supabase
    .from("users")
    .insert({ username, email, password_hash: passwordHash })
    .select("id, username, email")
    .single();

  if (insertError || !newUser) {
    return jsonError(request, "Failed to create user", 500);
  }

  await supabase.from("collections").insert({ user_id: newUser.id, name: "Unsorted" });

  return jsonSuccess(
    request,
    { user_id: newUser.id, username: newUser.username, email: newUser.email },
    "Account created successfully"
  );
}

async function handleLogin(request) {
  const data = await parseJson(request);
  if (!data) {
    return jsonError(request, "Invalid JSON body", 400);
  }

  const email = (data.email || "").trim();
  const password = data.password || "";

  if (!email || !password) {
    return jsonError(request, "Email and password are required");
  }

  const supabase = getSupabaseAdmin();
  const { data: user, error } = await supabase
    .from("users")
    .select("id, username, email, password_hash")
    .eq("email", email)
    .maybeSingle();

  if (error || !user) {
    return jsonError(request, "Invalid email or password", 401);
  }

  const matches = await bcrypt.compare(password, user.password_hash);
  if (!matches) {
    return jsonError(request, "Invalid email or password", 401);
  }

  const token = crypto
    .createHash("sha256")
    .update(`${user.id}${user.email}${Date.now()}bookmark_secret`)
    .digest("hex");

  return jsonSuccess(
    request,
    { user_id: user.id, username: user.username, email: user.email, token },
    "Login successful"
  );
}

async function handleCheckAuth(request) {
  const userId = await authenticateUserFromHeaders(request);
  if (!userId) {
    return jsonError(request, "Not authenticated", 401);
  }

  return jsonSuccess(request, {
    authenticated: true,
    user_id: userId,
    message: "Header authentication valid",
  });
}

async function handleGetUser(request) {
  const userIdRaw = request.headers.get("x-user-id");
  if (!userIdRaw) {
    return jsonError(request, "User information not available", 400);
  }

  const userId = Number.parseInt(userIdRaw, 10);
  if (!Number.isInteger(userId) || userId <= 0) {
    return jsonError(request, "Invalid user id", 400);
  }

  const supabase = getSupabaseAdmin();
  const { data: user, error } = await supabase
    .from("users")
    .select("id, username, email")
    .eq("id", userId)
    .maybeSingle();

  if (error) {
    return jsonError(request, "Failed to fetch user information", 500);
  }

  if (!user) {
    return jsonError(request, "User not found", 404);
  }

  return jsonSuccess(request, user);
}
