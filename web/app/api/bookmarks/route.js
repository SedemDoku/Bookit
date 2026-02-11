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

  const params = new URL(request.url).searchParams;
  const collectionId = params.get("collection_id");
  const search = (params.get("search") || "").trim();
  const tag = (params.get("tag") || "").trim();
  const favorite = params.get("favorite");

  const supabase = getSupabaseAdmin();
  let query = supabase
    .from("bookmarks")
    .select(
      "id, user_id, collection_id, title, url, type, content, description, favorite, created_at, updated_at, collections(name), bookmark_tags(tag_id, tags(name))"
    )
    .eq("user_id", userId)
    .order("created_at", { ascending: false });

  if (collectionId) {
    query = query.eq("collection_id", collectionId);
  }

  if (favorite === "true") {
    query = query.eq("favorite", true);
  }

  if (search) {
    query = query.or(
      `title.ilike.%${search}%,description.ilike.%${search}%,content.ilike.%${search}%`
    );
  }

  const { data, error } = await query;
  if (error) {
    return jsonError(request, "Server error: " + error.message, 500);
  }

  const bookmarks = (data || []).map((bookmark) => {
    const tags = (bookmark.bookmark_tags || [])
      .map((tag) => tag.tags?.name)
      .filter(Boolean);
    const collectionName = bookmark.collections?.name || null;

    return {
      ...bookmark,
      tags,
      collection_name: collectionName,
      favorite: Boolean(bookmark.favorite),
      bookmark_tags: undefined,
      collections: undefined,
    };
  });

  const filtered = tag
    ? bookmarks.filter((bookmark) => bookmark.tags.includes(tag))
    : bookmarks;

  return jsonSuccess(request, filtered);
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

  const title = (data.title || "").trim();
  const url = (data.url || "").trim();
  const type = data.type || "link";
  const content = data.content || "";
  const description = (data.description || "").trim();
  const collectionId = data.collection_id || null;
  const tags = Array.isArray(data.tags) ? data.tags : [];
  const favorite = Boolean(data.favorite);

  if (!title) {
    return jsonError(request, "Title is required");
  }

  if (!Array.isArray(tags)) {
    return jsonError(request, "Invalid tags format");
  }

  if (!['link', 'text', 'image', 'video'].includes(type)) {
    return jsonError(request, "Invalid bookmark type. Only link, text, image, and video bookmarks are allowed.");
  }

  const supabase = getSupabaseAdmin();

  if (collectionId) {
    const { data: collection, error } = await supabase
      .from("collections")
      .select("id")
      .eq("id", collectionId)
      .eq("user_id", userId)
      .maybeSingle();

    if (error || !collection) {
      return jsonError(request, "Invalid collection");
    }
  }

  const { data: bookmark, error: insertError } = await supabase
    .from("bookmarks")
    .insert({
      user_id: userId,
      collection_id: collectionId,
      title,
      url,
      type,
      content,
      description,
      favorite,
    })
    .select("id")
    .single();

  if (insertError || !bookmark) {
    return jsonError(request, "Failed to create bookmark", 500);
  }

  await upsertBookmarkTags(userId, bookmark.id, tags);

  const fullBookmark = await fetchBookmark(supabase, bookmark.id, userId);
  if (!fullBookmark) {
    return jsonError(request, "Failed to load bookmark", 500);
  }

  return jsonSuccess(request, fullBookmark, "Bookmark created successfully");
}

export async function PUT(request) {
  const userId = await authenticateUserFromHeaders(request);
  if (!userId) {
    return jsonError(request, "Authentication required. Please log in.", 401);
  }

  const params = new URL(request.url).searchParams;
  const bookmarkId = params.get("id");
  if (!bookmarkId) {
    return jsonError(request, "Bookmark ID required");
  }

  const supabase = getSupabaseAdmin();
  const { data: existing, error: existingError } = await supabase
    .from("bookmarks")
    .select("id")
    .eq("id", bookmarkId)
    .eq("user_id", userId)
    .maybeSingle();

  if (existingError || !existing) {
    return jsonError(request, "Bookmark not found", 404);
  }

  const data = await parseJson(request);
  if (!data) {
    return jsonError(request, "Invalid JSON body", 400);
  }

  const updates = {};
  if (data.title !== undefined) updates.title = (data.title || "").trim();
  if (data.url !== undefined) updates.url = (data.url || "").trim();
  if (data.type !== undefined) updates.type = data.type;
  if (data.content !== undefined) updates.content = data.content || "";
  if (data.description !== undefined) updates.description = (data.description || "").trim();
  if (data.collection_id !== undefined) updates.collection_id = data.collection_id || null;
  if (data.favorite !== undefined) updates.favorite = Boolean(data.favorite);

  if (Object.keys(updates).length === 0 && !Array.isArray(data.tags)) {
    return jsonError(request, "No fields to update");
  }

  if (updates.type && !['link', 'text', 'image', 'video'].includes(updates.type)) {
    return jsonError(request, "Invalid bookmark type. Only link, text, image, and video bookmarks are allowed.");
  }

  if (Object.keys(updates).length > 0) {
    const { error: updateError } = await supabase
      .from("bookmarks")
      .update(updates)
      .eq("id", bookmarkId)
      .eq("user_id", userId);

    if (updateError) {
      return jsonError(request, "Failed to update bookmark", 500);
    }
  }

  if (Array.isArray(data.tags)) {
    await supabase.from("bookmark_tags").delete().eq("bookmark_id", bookmarkId);
    await upsertBookmarkTags(userId, bookmarkId, data.tags);
  }

  return jsonSuccess(request, null, "Bookmark updated successfully");
}

export async function DELETE(request) {
  const userId = await authenticateUserFromHeaders(request);
  if (!userId) {
    return jsonError(request, "Authentication required. Please log in.", 401);
  }

  const params = new URL(request.url).searchParams;
  const bookmarkId = params.get("id");
  if (!bookmarkId) {
    return jsonError(request, "Bookmark ID required");
  }

  const supabase = getSupabaseAdmin();
  const { error, count } = await supabase
    .from("bookmarks")
    .delete({ count: "exact" })
    .eq("id", bookmarkId)
    .eq("user_id", userId);

  if (error) {
    return jsonError(request, "Failed to delete bookmark", 500);
  }

  if (!count) {
    return jsonError(request, "Bookmark not found", 404);
  }

  return jsonSuccess(request, null, "Bookmark deleted successfully");
}

async function upsertBookmarkTags(userId, bookmarkId, tags) {
  const supabase = getSupabaseAdmin();

  for (const rawTag of tags) {
    const tagName = String(rawTag || "").trim();
    if (!tagName) continue;

    const { data: tagRow } = await supabase
      .from("tags")
      .upsert({ user_id: userId, name: tagName }, { onConflict: "user_id,name" })
      .select("id")
      .single();

    if (!tagRow) continue;

    await supabase
      .from("bookmark_tags")
      .upsert({ bookmark_id: bookmarkId, tag_id: tagRow.id }, { onConflict: "bookmark_id,tag_id" });
  }
}

async function fetchBookmark(supabase, bookmarkId, userId) {
  const { data, error } = await supabase
    .from("bookmarks")
    .select(
      "id, user_id, collection_id, title, url, type, content, description, favorite, created_at, updated_at, collections(name), bookmark_tags(tag_id, tags(name))"
    )
    .eq("id", bookmarkId)
    .eq("user_id", userId)
    .maybeSingle();

  if (error || !data) {
    return null;
  }

  return {
    ...data,
    tags: (data.bookmark_tags || [])
      .map((tag) => tag.tags?.name)
      .filter(Boolean),
    collection_name: data.collections?.name || null,
    favorite: Boolean(data.favorite),
    bookmark_tags: undefined,
    collections: undefined,
  };
}
