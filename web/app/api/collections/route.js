import { getSupabaseAdmin } from "@/lib/supabaseAdmin";
import { authenticateUserFromHeaders } from "@/lib/auth";
import { buildCorsHeaders, jsonError, jsonSuccess, parseJson } from "@/lib/api";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function OPTIONS(request) {
  return new Response(null, { status: 200, headers: buildCorsHeaders(request) });
}

export async function GET(request) {
  const userId = await authenticateUserFromHeaders(request);
  if (!userId) {
    return jsonError(request, "Authentication required. Please log in.", 401);
  }

  const supabase = getSupabaseAdmin();
  const { data: collections, error } = await supabase
    .from("collections")
    .select("id, user_id, name, parent_id, created_at, updated_at")
    .eq("user_id", userId)
    .order("name", { ascending: true });

  if (error) {
    return jsonError(request, "Server error", 500);
  }

  const { data: bookmarks } = await supabase
    .from("bookmarks")
    .select("id, collection_id")
    .eq("user_id", userId);

  const countMap = new Map();
  (bookmarks || []).forEach((bookmark) => {
    const key = bookmark.collection_id || "__none__";
    countMap.set(key, (countMap.get(key) || 0) + 1);
  });

  const indexed = {};
  (collections || []).forEach((collection) => {
    indexed[collection.id] = {
      ...collection,
      bookmark_count: countMap.get(collection.id) || 0,
      children: [],
    };
  });

  const tree = [];
  Object.values(indexed).forEach((collection) => {
    if (collection.parent_id && indexed[collection.parent_id]) {
      indexed[collection.parent_id].children.push(collection);
    } else {
      tree.push(collection);
    }
  });

  return jsonSuccess(request, tree);
}

export async function POST(request) {
  const userId = await authenticateUserFromHeaders(request);
  if (!userId) {
    return jsonError(request, "Authentication required. Please log in.", 401);
  }

  const data = await parseJson(request);
  if (!data) {
    return jsonError(request, "Invalid JSON body", 400);
  }

  const name = (data.name || "").trim();
  const parentId = data.parent_id || null;

  if (!name) {
    return jsonError(request, "Collection name is required");
  }

  const supabase = getSupabaseAdmin();

  if (parentId) {
    const { data: parent, error } = await supabase
      .from("collections")
      .select("id")
      .eq("id", parentId)
      .eq("user_id", userId)
      .maybeSingle();

    if (error || !parent) {
      return jsonError(request, "Invalid parent collection");
    }
  }

  const { data: collection, error } = await supabase
    .from("collections")
    .insert({ user_id: userId, name, parent_id: parentId })
    .select("id, user_id, name, parent_id, created_at, updated_at")
    .single();

  if (error || !collection) {
    return jsonError(request, "Failed to create collection", 500);
  }

  return jsonSuccess(
    request,
    { ...collection, bookmark_count: 0 },
    "Collection created successfully"
  );
}

export async function PUT(request) {
  const userId = await authenticateUserFromHeaders(request);
  if (!userId) {
    return jsonError(request, "Authentication required. Please log in.", 401);
  }

  const params = new URL(request.url).searchParams;
  const collectionId = params.get("id");
  if (!collectionId) {
    return jsonError(request, "Collection ID required");
  }

  const data = await parseJson(request);
  if (!data) {
    return jsonError(request, "Invalid JSON body", 400);
  }

  const updates = {};
  if (data.name !== undefined) updates.name = (data.name || "").trim();
  if (data.parent_id !== undefined) updates.parent_id = data.parent_id || null;

  if (Object.keys(updates).length === 0) {
    return jsonError(request, "No fields to update");
  }

  const supabase = getSupabaseAdmin();
  const { data: existing, error: existingError } = await supabase
    .from("collections")
    .select("id")
    .eq("id", collectionId)
    .eq("user_id", userId)
    .maybeSingle();

  if (existingError || !existing) {
    return jsonError(request, "Collection not found", 404);
  }

  const { error } = await supabase
    .from("collections")
    .update(updates)
    .eq("id", collectionId)
    .eq("user_id", userId);

  if (error) {
    return jsonError(request, "Failed to update collection", 500);
  }

  return jsonSuccess(request, null, "Collection updated successfully");
}

export async function DELETE(request) {
  const userId = await authenticateUserFromHeaders(request);
  if (!userId) {
    return jsonError(request, "Authentication required. Please log in.", 401);
  }

  const params = new URL(request.url).searchParams;
  const collectionId = params.get("id");
  if (!collectionId) {
    return jsonError(request, "Collection ID required");
  }

  const supabase = getSupabaseAdmin();
  const { error, count } = await supabase
    .from("collections")
    .delete({ count: "exact" })
    .eq("id", collectionId)
    .eq("user_id", userId);

  if (error) {
    return jsonError(request, "Failed to delete collection", 500);
  }

  if (!count) {
    return jsonError(request, "Collection not found", 404);
  }

  return jsonSuccess(request, null, "Collection deleted successfully");
}
