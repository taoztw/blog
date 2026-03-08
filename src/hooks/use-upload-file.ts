import * as React from 'react';

import { toast } from 'sonner';

import { ImageService } from '@/lib/image-service';

export interface UploadedFile {
  key: string;
  url: string;
  name: string;
  size: number;
  type: string;
}

interface UseUploadFileProps {
  onUploadComplete?: (file: UploadedFile) => void;
  onUploadError?: (error: unknown) => void;
  onUploadProgress?: (progress: number) => void;
}

export function useUploadFile({
  onUploadComplete,
  onUploadError,
  onUploadProgress,
}: UseUploadFileProps = {}) {
  const [uploadedFile, setUploadedFile] = React.useState<UploadedFile>();
  const [uploadingFile, setUploadingFile] = React.useState<File>();
  const [progress, setProgress] = React.useState<number>(0);
  const [isUploading, setIsUploading] = React.useState(false);

  async function uploadFile(file: File) {
    setIsUploading(true);
    setUploadingFile(file);
    setProgress(0);

    try {
      const formData = new FormData();
      formData.append('file', file);

      const result = await new Promise<UploadedFile>((resolve, reject) => {
        const xhr = new XMLHttpRequest();

        xhr.upload.addEventListener('progress', (e) => {
          if (e.lengthComputable) {
            const p = Math.round((e.loaded / e.total) * 100);
            setProgress(p);
            onUploadProgress?.(p);
          }
        });

        xhr.addEventListener('load', () => {
          if (xhr.status >= 200 && xhr.status < 300) {
            const data = JSON.parse(xhr.responseText) as {
              success: boolean;
              key: string;
              filename: string;
              size: number;
              mimeType: string;
              error?: string;
            };
            if (data.success) {
              resolve({
                key: data.key,
                url: ImageService.getImageUrl(data.key),
                name: data.filename,
                size: data.size,
                type: data.mimeType,
              });
            } else {
              reject(new Error(data.error ?? '上传失败'));
            }
          } else {
            reject(new Error(`上传失败 (${xhr.status})`));
          }
        });

        xhr.addEventListener('error', () => reject(new Error('网络错误')));
        xhr.open('POST', '/api/upload');
        xhr.send(formData);
      });

      setUploadedFile(result);
      onUploadComplete?.(result);

      return result;
    } catch (error) {
      const message = error instanceof Error ? error.message : '上传失败';
      toast.error(message);
      onUploadError?.(error);
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
