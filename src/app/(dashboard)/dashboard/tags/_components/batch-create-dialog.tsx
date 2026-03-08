"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Plus, X } from "lucide-react";
import type { CreateTagData } from "@/global";

interface BatchCreateTagDialogProps {
  onBatchCreateTags: (tags: CreateTagData[]) => Promise<void>;
  trigger?: React.ReactNode;
}

export function BatchCreateTagDialog({ onBatchCreateTags, trigger }: BatchCreateTagDialogProps) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [tagText, setTagText] = useState("");
  const [parsedTags, setParsedTags] = useState<CreateTagData[]>([]);

  const parseTagsFromText = (text: string) => {
    // 支持多种分隔符：逗号、换行、分号
    const lines = text
      .split(/[,\n;]/)
      .map((line) => line.trim())
      .filter(Boolean);

    const tags: CreateTagData[] = lines
      .map((line) => {
        // 支持格式：标签名 或 标签名|描述 或 标签名|描述|颜色
        const parts = line.split("|").map((part) => part.trim());

        return {
          name: parts[0] || "",
          description: parts[1] || "",
          color: parts[2] || "",
        };
      })
      .filter((tag) => tag.name); // 过滤掉空名称的标签

    setParsedTags(tags);
  };

  const handleTextChange = (text: string) => {
    setTagText(text);
    parseTagsFromText(text);
  };

  const removeTag = (index: number) => {
    const newTags = parsedTags.filter((_, i) => i !== index);
    setParsedTags(newTags);

    // 更新文本
    const newText = newTags
      .map((tag) => {
        const parts = [tag.name];
        if (tag.description) parts.push(tag.description);
        if (tag.color) parts.push(tag.color);
        return parts.join("|");
      })
      .join("\n");

    setTagText(newText);
  };

  const handleSubmit = async () => {
    if (parsedTags.length === 0) return;

    setLoading(true);
    try {
      await onBatchCreateTags(parsedTags);
      setTagText("");
      setParsedTags([]);
      setOpen(false);
    } catch (error) {
      console.error("批量创建标签失败:", error);
    } finally {
      setLoading(false);
    }
  };

  const getRandomColor = () => {
    const colors = [
      "#3b82f6",
      "#ef4444",
      "#10b981",
      "#f59e0b",
      "#8b5cf6",
      "#06b6d4",
      "#84cc16",
      "#f97316",
      "#ec4899",
      "#6366f1",
      "#14b8a6",
      "#eab308",
    ];
    return colors[Math.floor(Math.random() * colors.length)];
  };

  const assignRandomColors = () => {
    const updatedTags = parsedTags.map((tag) => ({
      ...tag,
      color: tag.color || getRandomColor(),
    }));
    setParsedTags(updatedTags);

    // 更新文本
    const newText = updatedTags
      .map((tag) => {
        const parts = [tag.name];
        if (tag.description) parts.push(tag.description);
        if (tag.color) parts.push(tag.color);
        return parts.join("|");
      })
      .join("\n");

    setTagText(newText);
  };

  return (
    <Dialog
      open={open}
      onOpenChange={setOpen}
    >
      <DialogTrigger asChild>
        {trigger ?? (
          <Button variant="outline">
            <Plus className="h-4 w-4 mr-2" />
            批量创建标签
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[600px] max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>批量创建标签</DialogTitle>
          <DialogDescription>
            输入标签信息，每行一个标签。支持格式：
            <br />• <code>标签名</code>
            <br />• <code>标签名|描述</code>
            <br />• <code>标签名|描述|颜色</code>
            <br />
            可使用逗号、换行或分号分隔。
            <br />
            <span className="text-blue-600">💡 每个标签将依次创建，重复或错误的标签会自动跳过。</span>
            <br />
            <span className="text-amber-600">⚠️ 单次最多50个标签。</span>
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-4 py-4">
          <div>
            <Label htmlFor="tagText">标签列表</Label>
            <Textarea
              id="tagText"
              value={tagText}
              onChange={(e) => handleTextChange(e.target.value)}
              placeholder={`前端开发|前端相关技术|#3b82f6
React|React框架相关|#61dafb
Vue|Vue.js框架
Node.js|后端Node.js技术
数据库
算法与数据结构|编程基础`}
              className="mt-2 min-h-[120px] font-mono text-sm"
            />
            <div className="flex gap-2 mt-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={assignRandomColors}
                disabled={parsedTags.length === 0}
              >
                随机分配颜色
              </Button>
              <span
                className={`text-sm self-center ${
                  parsedTags.length > 50 ? "text-amber-600 font-medium" : "text-muted-foreground"
                }`}
              >
                已解析 {parsedTags.length} 个标签
                {parsedTags.length > 50 && " (建议分批创建)"}
              </span>
            </div>
          </div>

          {parsedTags.length > 0 && (
            <div>
              <Label>预览标签</Label>
              <div className="flex flex-wrap gap-2 mt-2 p-3 border rounded-md bg-muted/30 max-h-40 overflow-y-auto">
                {parsedTags.map((tag, index) => (
                  <Badge
                    key={index}
                    variant="secondary"
                    className="flex items-center gap-1 pr-1"
                    style={{
                      backgroundColor: tag.color ? `${tag.color}20` : undefined,
                      borderColor: tag.color || undefined,
                      color: tag.color || undefined,
                    }}
                  >
                    <span>{tag.name}</span>
                    {tag.description && <span className="text-xs opacity-70">({tag.description})</span>}
                    <button
                      onClick={() => removeTag(index)}
                      className="ml-1 hover:bg-destructive/20 rounded-sm"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </Badge>
                ))}
              </div>
            </div>
          )}
        </div>

        <DialogFooter>
          <Button
            type="button"
            variant="outline"
            onClick={() => setOpen(false)}
          >
            取消
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={loading || parsedTags.length === 0}
          >
            {loading ? "创建中..." : `创建 ${parsedTags.length} 个标签`}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
