import type { NextRequest } from "next/server";
import { getCloudflareContext } from "@opennextjs/cloudflare";

export async function GET(req: NextRequest) {
  const env = getCloudflareContext().env;
  const { searchParams } = new URL(req.url);
  const key = searchParams.get("key");

  if (!key) {
    return new Response(JSON.stringify({ error: "No key provided" }), {
      status: 400,
    });
  }

  try {
    const object = await env.NEXT_INC_CACHE_R2_BUCKET.get(key);

    if (!object) {
      return new Response(JSON.stringify({ error: "File not found" }), {
        status: 404,
      });
    }

    const headers = new Headers();
    object.writeHttpMetadata(headers);
    headers.set("etag", object.httpEtag);
    headers.set("cache-control", "public, max-age=31536000, immutable");

    return new Response(object.body, {
      headers,
    });
  } catch (error) {
    console.error("Error fetching file:", error);
    return new Response(JSON.stringify({ error: "Failed to fetch file" }), {
      status: 500,
    });
  }
}
