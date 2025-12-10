import { getAuth } from "@/lib/auth/auth";
import { getCurrentDatePath } from "@/lib/utils";
import { getCloudflareContext } from "@opennextjs/cloudflare";
import { nanoid } from "nanoid";
import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

// 允许的文件类型
const ALLOWED_TYPES = [
  // 图片
  "image/jpeg",
  "image/jpg",
  "image/png",
  "image/gif",
  "image/webp",
  "image/svg+xml",
  // 文档
  "application/pdf",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  "application/vnd.ms-excel",
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  "text/plain",
  "text/markdown",
  "application/zip",
  "application/x-zip-compressed",
];

// 文件大小限制：20MB
const MAX_FILE_SIZE = 20 * 1024 * 1024;

export async function POST(req: NextRequest, { context }: any) {
  const auth = await getAuth();
  const session = await auth.api.getSession({ headers: req.headers });

  if (session?.user.role !== "admin") {
    return Response.json(
      { success: false, message: "你没有权限上传文件。" },
      { status: 403 },
    );
  }
  const env = getCloudflareContext().env;

  // 这里必须解析 form-data
  const formData = await req.formData();
  const file = formData.get("file") as File;

  if (!file) {
    return new NextResponse(
      JSON.stringify({ success: false, error: "No file provided" }),
      { status: 400 },
    );
  }

  // 验证文件类型
  if (!ALLOWED_TYPES.includes(file.type)) {
    return new NextResponse(
      JSON.stringify({
        success: false,
        error: `不支持的文件类型: ${file.type}`,
      }),
      { status: 400 },
    );
  }

  // 验证文件大小
  if (file.size > MAX_FILE_SIZE) {
    return new NextResponse(
      JSON.stringify({
        success: false,
        error: `文件大小不能超过 ${MAX_FILE_SIZE / (1024 * 1024)}MB`,
      }),
      { status: 400 },
    );
  }

  const filename = file.name;
  const fileType = filename.substring(filename.lastIndexOf("."));

  // 将 File 转成 arrayBuffer 再上传到 R2
  const fileId = nanoid();
  const key = `uploads/${getCurrentDatePath()}/${fileId}${fileType}`;
  const result = await env.NEXT_INC_CACHE_R2_BUCKET.put(
    key,
    await file.arrayBuffer(),
    {
      httpMetadata: { contentType: file.type },
    },
  );

  return NextResponse.json({
    success: true,
    key,
    filename,
    size: file.size,
    mimeType: file.type,
  });
}
