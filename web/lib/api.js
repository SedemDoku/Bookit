const DEFAULT_ALLOWED_ORIGINS = [
  "http://169.239.251.102:341",
  "http://localhost",
  "http://127.0.0.1",
];

export function getAllowedOrigins() {
  const raw = process.env.ALLOWED_ORIGINS;
  if (!raw) {
    return DEFAULT_ALLOWED_ORIGINS;
  }
  return raw
    .split(",")
    .map((value) => value.trim())
    .filter(Boolean);
}

export function buildCorsHeaders(request) {
  const origin = request.headers.get("origin") || "";
  const allowed = getAllowedOrigins();
  const headers = {
    "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type, X-User-ID, X-User-Email, X-CSRF-Token",
    "Access-Control-Max-Age": "86400",
  };

  if (allowed.includes(origin) || origin.startsWith("chrome-extension://") || origin.startsWith("moz-extension://")) {
    headers["Access-Control-Allow-Origin"] = origin;
    headers["Access-Control-Allow-Credentials"] = "true";
  }

  return headers;
}

export function jsonResponse(request, payload, status = 200) {
  const headers = {
    "Content-Type": "application/json",
    ...buildCorsHeaders(request),
  };

  return new Response(JSON.stringify(payload), { status, headers });
}

export function jsonSuccess(request, data = null, message = null) {
  const payload = { success: true };
  if (message) payload.message = message;
  if (data !== null) payload.data = data;
  return jsonResponse(request, payload, 200);
}

export function jsonError(request, message, status = 400) {
  return jsonResponse(request, { error: message }, status);
}

export async function parseJson(request) {
  try {
    return await request.json();
  } catch (error) {
    return null;
  }
}
