import * as React from "react";

import { toast } from "sonner";

interface UploadedCommentFile {
  key: string;
  url: string;
  name: string;
  size: number;
  type: string;
}

export function useCommentUpload() {
  const [uploadedFile, setUploadedFile] = React.useState<UploadedCommentFile>();
  const [uploadingFile, setUploadingFile] = React.useState<File>();
  const [progress, setProgress] = React.useState<number>(0);
  const [isUploading, setIsUploading] = React.useState(false);

  async function uploadFile(file: File) {
    setIsUploading(true);
    setUploadingFile(file);
    setProgress(0);

    try {
      const formData = new FormData();
      formData.append("file", file);

      const result = await new Promise<UploadedCommentFile>(
        (resolve, reject) => {
          const xhr = new XMLHttpRequest();

          xhr.upload.addEventListener("progress", (e) => {
            if (e.lengthComputable) {
              setProgress(Math.round((e.loaded / e.total) * 100));
            }
          });

          xhr.addEventListener("load", () => {
            if (xhr.status >= 200 && xhr.status < 300) {
              const data = JSON.parse(xhr.responseText);
              if (data.success) {
                resolve(data as UploadedCommentFile);
              } else {
                reject(new Error(data.error || "上传失败"));
              }
            } else {
              reject(new Error(`上传失败 (${xhr.status})`));
            }
          });

          xhr.addEventListener("error", () => reject(new Error("网络错误")));
          xhr.open("POST", "/api/comment-upload");
          xhr.send(formData);
        },
      );

      setUploadedFile(result);

      return result;
    } catch (error) {
      const message = error instanceof Error ? error.message : "上传失败";
      toast.error(message);
    } finally {
      setProgress(0);
      setIsUploading(false);
      setUploadingFile(undefined);
    }
  }

  return {
    isUploading,
    progress,
    uploadedFile,
    uploadFile,
    uploadingFile,
  };
}
