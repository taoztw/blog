"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ImageService } from "./image-service";

export function ImageViewer() {
  const [imageKey, setImageKey] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleViewImage = async () => {
    if (!imageKey.trim()) {
      setError("请输入图片key");
      return;
    }

    setLoading(true);
    setError("");

    try {
      if (!ImageService.isValidKey(imageKey)) {
        throw new Error("无效的图片key");
      }

      //  使用新的ImageService获取图片URL
      const url = ImageService.getImageUrl(imageKey);
      setImageUrl(url);
    } catch (err) {
      setError(err instanceof Error ? err.message : "获取图片失败");
      setImageUrl("");
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = () => {
    if (imageUrl) {
      const link = document.createElement("a");
      link.href = imageUrl;
      link.download = ImageService.getFilenameFromKey(imageKey);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <CardTitle>查看图片</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Input
            type="text"
            placeholder="输入图片key (例如: uploads/2025-08-16/xxx.jpg)"
            value={imageKey}
            onChange={(e) => setImageKey(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleViewImage()}
          />
          <Button onClick={handleViewImage} disabled={loading} className="w-full">
            {loading ? "加载中..." : "查看图片"}
          </Button>
        </div>

        {error && <div className="text-red-500 text-sm">{error}</div>}

        {imageUrl && (
          <div className="space-y-3">
            <div className="border rounded-lg overflow-hidden">
              <img
                src={imageUrl || "/placeholder.svg"}
                alt="上传的图片"
                className="w-full h-auto max-h-64 object-contain"
                onError={() => setError("图片加载失败")}
              />
            </div>
            <div className="flex gap-2">
              <Button onClick={handleDownload} variant="outline" size="sm" className="flex-1">
                下载
              </Button>
              <Button onClick={() => window.open(imageUrl, "_blank")} variant="outline" size="sm" className="flex-1">
                新窗口打开
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
