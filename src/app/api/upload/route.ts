import { getCurrentDatePath } from "@/lib/utils";
import type { NextRequest } from "next/server";
import { nanoid } from "nanoid";
import { getCloudflareContext } from "@opennextjs/cloudflare";

export async function POST(req: NextRequest, { context }: any) {
  const env = getCloudflareContext().env;

  // 这里必须解析 form-data
  const formData = await req.formData();
  const file = formData.get("file") as File;
  const filename = file.name;
  const fileType = filename.substring(filename.lastIndexOf("."));

  if (!file) {
    return new Response(JSON.stringify({ error: "No file" }), { status: 400 });
  }

  // 将 File 转成 arrayBuffer 再上传到 R2
  const fileId = nanoid();
  const key = `uploads/${getCurrentDatePath()}/${fileId}${fileType}`;
  const result = await env.NEXT_INC_CACHE_R2_BUCKET.put(key, await file.arrayBuffer(), {
    httpMetadata: { contentType: file.type },
  });

  return Response.json({ success: true, key, filename });
}
