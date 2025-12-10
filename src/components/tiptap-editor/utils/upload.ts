import type { UploadResult, UploadProgress } from "../types";

/**
 * 上传文件到服务器
 */
export async function uploadFile(
  file: File,
  onProgress?: (progress: UploadProgress) => void,
): Promise<UploadResult> {
  const formData = new FormData();
  formData.append("file", file);

  try {
    const xhr = new XMLHttpRequest();

    // 监听上传进度
    if (onProgress) {
      xhr.upload.addEventListener("progress", (e) => {
        if (e.lengthComputable) {
          const percentage = (e.loaded / e.total) * 100;
          onProgress({
            loaded: e.loaded,
            total: e.total,
            percentage: Math.round(percentage),
          });
        }
      });
    }

    // 创建 Promise 包装 XHR
    const result = await new Promise<UploadResult>((resolve, reject) => {
      xhr.addEventListener("load", () => {
        if (xhr.status >= 200 && xhr.status < 300) {
          try {
            const response = JSON.parse(xhr.responseText) as UploadResult;
            resolve(response);
          } catch (error) {
            reject(new Error("Invalid response format"));
          }
        } else {
          reject(new Error(`Upload failed with status ${xhr.status}`));
        }
      });

      xhr.addEventListener("error", () => {
        reject(new Error("Network error during upload"));
      });

      xhr.addEventListener("abort", () => {
        reject(new Error("Upload aborted"));
      });

      xhr.open("POST", "/api/upload");
      xhr.send(formData);
    });

    return result;
  } catch (error) {
    console.error("Upload error:", error);
    return {
      success: false,
      error:
        error instanceof Error ? error.message : "Unknown upload error",
    };
  }
}

/**
 * 批量上传文件（最多同时3个）
 */
export async function uploadMultipleFiles(
  files: File[],
  onProgress?: (fileIndex: number, progress: UploadProgress) => void,
): Promise<UploadResult[]> {
  const MAX_CONCURRENT = 3;
  const results: UploadResult[] = [];
  const queue = [...files];

  const uploadWithProgress = async (file: File, index: number) => {
    return uploadFile(file, (progress) => {
      onProgress?.(index, progress);
    });
  };

  while (queue.length > 0) {
    const batch = queue.splice(0, MAX_CONCURRENT);
    const batchResults = await Promise.all(
      batch.map((file, i) => {
        const fileIndex = files.length - queue.length - batch.length + i;
        return uploadWithProgress(file, fileIndex);
      }),
    );
    results.push(...batchResults);
  }

  return results;
}

/**
 * 从文件生成预览 URL
 */
export function getFilePreviewUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

/**
 * 从图片文件获取尺寸
 */
export function getImageDimensions(
  file: File,
): Promise<{ width: number; height: number }> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    const url = URL.createObjectURL(file);

    img.onload = () => {
      URL.revokeObjectURL(url);
      resolve({
        width: img.naturalWidth,
        height: img.naturalHeight,
      });
    };

    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error("Failed to load image"));
    };

    img.src = url;
  });
}

/**
 * 构建文件 URL
 */
export function buildFileUrl(key: string): string {
  return `/api/file?key=${encodeURIComponent(key)}`;
}
