import { getAuth } from "@/lib/auth/auth";
import { getCurrentDatePath } from "@/lib/utils";
import { getCloudflareContext } from "@opennextjs/cloudflare";
import { nanoid } from "nanoid";
import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

export async function POST(req: NextRequest, { context }: any) {
  const session = await getAuth().api.getSession({ headers: req.headers });

  if (session?.user.role !== "admin") {
    return Response.json({ success: false, message: "你没有权限上传图片。" });
  }
  const env = getCloudflareContext().env;

  // 这里必须解析 form-data
  const formData = await req.formData();
  const file = formData.get("file") as File;
  const filename = file.name;
  const fileType = filename.substring(filename.lastIndexOf("."));

  if (!file) {
    return new NextResponse(JSON.stringify({ error: "No file" }), { status: 400 });
  }

  // 将 File 转成 arrayBuffer 再上传到 R2
  const fileId = nanoid();
  const key = `uploads/${getCurrentDatePath()}/${fileId}${fileType}`;
  const result = await env.NEXT_INC_CACHE_R2_BUCKET.put(key, await file.arrayBuffer(), {
    httpMetadata: { contentType: file.type },
  });

  return NextResponse.json({ success: true, key, filename });
}
