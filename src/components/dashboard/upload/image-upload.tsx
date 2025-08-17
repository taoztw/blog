"use client";

import type React from "react";

import { useState, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { toast } from "sonner";
import { Upload, X, ImageIcon } from "lucide-react";
import type { file } from "zod";
import { ImageService } from "./image-service";

interface UploadedImage {
  key: string;
  filename: string;
  size: number;
}

export function ImageUpload() {
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadedImages, setUploadedImages] = useState<UploadedImage[]>([]);
  const [dragActive, setDragActive] = useState(false);

  const handleFiles = useCallback(
    async (files: FileList) => {
      const validFiles = Array.from(files).filter((file) => {
        if (!file.type.startsWith("image/")) {
          toast("文件类型错误", {
            description: `${file.name} 不是有效的图片文件`,
          });
          return false;
        }
        if (file.size > 10 * 1024 * 1024) {
          // 10MB limit
          toast("文件过大", {
            description: `${file.name} 超过 10MB 限制`,
          });
          return false;
        }
        return true;
      });

      if (validFiles.length === 0) return;

      setUploading(true);
      setUploadProgress(0);

      try {
        for (let i = 0; i < validFiles.length; i++) {
          const file = validFiles[i];
          const formData = new FormData();
          formData.append("file", file!);

          const response = await fetch("/api/upload", {
            method: "POST",
            body: formData,
          });

          if (!response.ok) {
            const error = await response.text();
            throw new Error(error);
          }

          const result = await response.json();

          console.log("Upload result:", result);
          setUploadedImages((prev) => [
            ...prev,
            {
              key: result.key,
              filename: file!.name,
              size: file!.size,
            },
          ]);

          setUploadProgress(((i + 1) / validFiles.length) * 100);
        }

        toast("上传成功", {
          description: `成功上传 ${validFiles.length} 个文件`,
        });
      } catch (error) {
        console.error("Upload error:", error);
        toast("上传失败", {
          description: error instanceof Error ? error.message : "未知错误",
        });
      } finally {
        setUploading(false);
        setUploadProgress(0);
      }
    },
    [toast]
  );

  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  }, []);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      setDragActive(false);

      if (e.dataTransfer.files && e.dataTransfer.files[0]) {
        handleFiles(e.dataTransfer.files);
      }
    },
    [handleFiles]
  );

  const handleFileInput = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      if (e.target.files && e.target.files[0]) {
        handleFiles(e.target.files);
      }
    },
    [handleFiles]
  );

  const removeImage = useCallback((id: string) => {
    setUploadedImages((prev) => prev.filter((img) => img.key !== id));
  }, []);

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Number.parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Upload className="h-5 w-5" />
            上传图片
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div
            className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
              dragActive ? "border-primary bg-primary/5" : "border-muted-foreground/25 hover:border-primary/50"
            }`}
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
            onDragOver={handleDrag}
            onDrop={handleDrop}
          >
            <ImageIcon className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
            <div className="space-y-2">
              <p className="text-lg font-medium">拖拽图片到这里或点击选择文件</p>
              <p className="text-sm text-muted-foreground">支持 JPG, PNG, GIF, WebP 格式，最大 10MB</p>
            </div>
            <input
              type="file"
              multiple
              accept="image/*"
              onChange={handleFileInput}
              className="hidden"
              id="file-upload"
              disabled={uploading}
            />
            <Button asChild className="mt-4" disabled={uploading}>
              <label htmlFor="file-upload" className="cursor-pointer">
                选择文件
              </label>
            </Button>
          </div>

          {uploading && (
            <div className="mt-4 space-y-2">
              <div className="flex justify-between text-sm">
                <span>上传进度</span>
                <span>{Math.round(uploadProgress)}%</span>
              </div>
              <Progress value={uploadProgress} />
            </div>
          )}
        </CardContent>
      </Card>

      {uploadedImages.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>已上传的图片</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {uploadedImages.map((image) => (
                <div key={image.key} className="relative group">
                  <div className="aspect-square rounded-lg overflow-hidden bg-muted">
                    <img
                      src={ImageService.getImageUrl(image.key)}
                      alt={image.filename}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <Button
                    variant="destructive"
                    size="sm"
                    className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity"
                    onClick={() => removeImage(image.key)}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                  <div className="mt-2 space-y-1">
                    <p className="text-sm font-medium truncate">{image.filename}</p>
                    <p className="text-xs text-muted-foreground">{formatFileSize(image.size)}</p>
                    <Button
                      variant="outline"
                      size="sm"
                      className="w-full bg-transparent"
                      onClick={() => navigator.clipboard.writeText(ImageService.getImageUrl(image.key))}
                    >
                      复制链接
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
