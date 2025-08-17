import { type NextRequest, NextResponse } from "next/server";
import { getCloudflareContext } from "@opennextjs/cloudflare";

export async function GET(request: NextRequest, { params }: { params: { key: string } }) {
  try {
    const { key } = await params;
    console.log(key);
    if (!key) {
      return NextResponse.json({ error: "Image key is required" }, { status: 400 });
    }

    const env = getCloudflareContext().env;

    try {
      // 从 R2 获取对象
      const object = await env.NEXT_INC_CACHE_R2_BUCKET.get(key);

      if (!object) {
        return NextResponse.json({ error: "Image not found" }, { status: 404 });
      }

      // 获取对象的元数据
      const headers = new Headers();
      headers.set("Content-Type", object.httpMetadata?.contentType || "application/octet-stream");
      headers.set("Cache-Control", "public, max-age=31536000");

      // 返回图片数据流
      return new Response(object.body, {
        headers,
      });
    } catch (error) {
      console.error("Error fetching from R2:", error);
      return NextResponse.json({ error: "Failed to fetch image" }, { status: 500 });
    }
  } catch (error) {
    console.error("Error getting image:", error);
    return NextResponse.json({ error: "Failed to get image" }, { status: 500 });
  }
}
