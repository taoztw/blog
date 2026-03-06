import { getAuth } from "@/lib/auth/auth";
import { ImageService } from "@/lib/image-service";
import { getCurrentDatePath } from "@/lib/utils";
import { getCloudflareContext } from "@opennextjs/cloudflare";
import { nanoid } from "nanoid";
import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

const ALLOWED_TYPES = [
  "image/jpeg",
  "image/jpg",
  "image/png",
  "image/gif",
  "image/webp",
  "application/pdf",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  "text/plain",
  "text/markdown",
  "application/zip",
  "application/x-zip-compressed",
];

const MAX_FILE_SIZE = 5 * 1024 * 1024;

export async function POST(req: NextRequest) {
  const auth = await getAuth();
  const session = await auth.api.getSession({ headers: req.headers });

  if (!session?.user) {
    return Response.json(
      { success: false, message: "请先登录。" },
      { status: 401 },
    );
  }

  const env = getCloudflareContext().env;
  const formData = await req.formData();
  const file = formData.get("file") as File;

  if (!file) {
    return NextResponse.json(
      { success: false, error: "No file provided" },
      { status: 400 },
    );
  }

  if (!ALLOWED_TYPES.includes(file.type)) {
    return NextResponse.json(
      { success: false, error: `不支持的文件类型: ${file.type}` },
      { status: 400 },
    );
  }

  if (file.size > MAX_FILE_SIZE) {
    return NextResponse.json(
      { success: false, error: "文件大小不能超过 5MB" },
      { status: 400 },
    );
  }

  const fileId = nanoid();
  const fileType = file.name.substring(file.name.lastIndexOf("."));
  const key = `comment-uploads/${getCurrentDatePath()}/${fileId}${fileType}`;

  await env.NEXT_INC_CACHE_R2_BUCKET.put(key, await file.arrayBuffer(), {
    httpMetadata: { contentType: file.type },
  });

  const url = ImageService.getImageUrl(key);

  return NextResponse.json({
    success: true,
    key,
    url,
    name: file.name,
    size: file.size,
    type: file.type,
  });
}
