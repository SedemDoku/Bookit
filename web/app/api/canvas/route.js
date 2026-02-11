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
  if (!collectionId) {
    return jsonError(request, "Collection ID required", 400);
  }

  const supabase = getSupabaseAdmin();
  const bookmarkIds = await fetchUserBookmarkIds(supabase, userId);

  if (bookmarkIds.length === 0) {
    return jsonSuccess(request, { positions: [], connections: [] });
  }

  const { data: positions, error: positionsError } = await supabase
    .from("bookmark_canvas_positions")
    .select("bookmark_id, x_position, y_position")
    .eq("collection_id", collectionId)
    .in("bookmark_id", bookmarkIds);

  if (positionsError) {
    return jsonError(request, "Server error", 500);
  }

  const { data: connections, error: connectionsError } = await supabase
    .from("bookmark_canvas_connections")
    .select("from_bookmark_id, to_bookmark_id, label")
    .eq("collection_id", collectionId)
    .in("from_bookmark_id", bookmarkIds)
    .in("to_bookmark_id", bookmarkIds);

  if (connectionsError) {
    return jsonError(request, "Server error", 500);
  }

  return jsonSuccess(request, {
    positions: positions || [],
    connections: connections || [],
  });
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

  const collectionId = data.collection_id;
  const positions = Array.isArray(data.positions) ? data.positions : [];
  const connections = Array.isArray(data.connections) ? data.connections : [];

  if (!collectionId) {
    return jsonError(request, "Collection ID required", 400);
  }

  const supabase = getSupabaseAdmin();
  const bookmarkIds = await fetchUserBookmarkIds(supabase, userId);

  await supabase
    .from("bookmark_canvas_positions")
    .delete()
    .eq("collection_id", collectionId)
    .in("bookmark_id", bookmarkIds);

  await supabase
    .from("bookmark_canvas_connections")
    .delete()
    .eq("collection_id", collectionId)
    .in("from_bookmark_id", bookmarkIds);

  if (positions.length > 0) {
    const safePositions = positions
      .filter((pos) => bookmarkIds.includes(pos.bookmark_id))
      .map((pos) => ({
        bookmark_id: pos.bookmark_id,
        collection_id: collectionId,
        x_position: pos.x_position,
        y_position: pos.y_position,
      }));

    if (safePositions.length > 0) {
      await supabase
        .from("bookmark_canvas_positions")
        .upsert(safePositions, { onConflict: "bookmark_id,collection_id" });
    }
  }

  if (connections.length > 0) {
    const safeConnections = connections
      .filter(
        (conn) =>
          bookmarkIds.includes(conn.from_bookmark_id) &&
          bookmarkIds.includes(conn.to_bookmark_id)
      )
      .map((conn) => ({
        from_bookmark_id: conn.from_bookmark_id,
        to_bookmark_id: conn.to_bookmark_id,
        collection_id: collectionId,
        label: conn.label || "",
      }));

    if (safeConnections.length > 0) {
      await supabase.from("bookmark_canvas_connections").insert(safeConnections);
    }
  }

  return jsonSuccess(request, null, "Canvas data saved successfully");
}

async function fetchUserBookmarkIds(supabase, userId) {
  const { data } = await supabase
    .from("bookmarks")
    .select("id")
    .eq("user_id", userId);

  return (data || []).map((row) => row.id);
}
