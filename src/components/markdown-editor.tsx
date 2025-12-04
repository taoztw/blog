"use client";

import { MarkdownPreview } from "@/components/mardown-preview";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import {
  Bold,
  Code,
  Heading,
  Image as ImageIcon,
  Italic,
  Link,
  List,
  ListOrdered,
  ListTodo,
  Loader2,
} from "lucide-react";
import { useRef, useState, type ChangeEvent } from "react";
import { toast } from "sonner";

interface MarkdownEditorProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
  minHeight?: string;
}

export function MarkdownEditor({
  value,
  onChange,
  placeholder = "Write your content in Markdown...",
  className = "",
  minHeight = "300px",
}: MarkdownEditorProps) {
  const [activeTab, setActiveTab] = useState<"write" | "preview">("write");
  const [uploading, setUploading] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Insert text at cursor position
  const insertText = (before: string, after: string = "", placeholder: string = "") => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selectedText = value.substring(start, end);
    const textToInsert = selectedText || placeholder;

    const newText = value.substring(0, start) + before + textToInsert + after + value.substring(end);

    onChange(newText);

    // Set cursor position
    setTimeout(() => {
      if (selectedText) {
        textarea.setSelectionRange(start + before.length, start + before.length + selectedText.length);
      } else {
        textarea.setSelectionRange(start + before.length, start + before.length + placeholder.length);
      }
      textarea.focus();
    }, 0);
  };

  // Handle image upload
  const handleImageUpload = async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith("image/")) {
      toast.error("Please select an image file");
      return;
    }

    // Validate file size (max 10MB)
    if (file.size > 10 * 1024 * 1024) {
      toast.error("Image size should be less than 10MB");
      return;
    }

    setUploading(true);
    try {
      const formData = new FormData();
      formData.append("file", file);

      const res = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      if (!res.ok) throw new Error("Upload failed");

      const data = await res.json();

      // Get image dimensions
      const img = new Image();
      img.onload = () => {
        const width = img.width;
        const height = img.height;
        const imageUrl = `/api/file?key=${encodeURIComponent(data.key)}`;

        // Insert HTML img tag with width and height
        const imgTag = `<img width="${width}" height="${height}" alt="Image" src="${imageUrl}" />`;

        const textarea = textareaRef.current;
        if (textarea) {
          const start = textarea.selectionStart;
          const newText = value.substring(0, start) + "\n" + imgTag + "\n" + value.substring(start);
          onChange(newText);

          setTimeout(() => {
            textarea.setSelectionRange(start + imgTag.length + 2, start + imgTag.length + 2);
            textarea.focus();
          }, 0);
        }

        toast.success("Image uploaded successfully");
      };

      img.onerror = () => {
        toast.error("Failed to load image dimensions");
      };

      img.src = URL.createObjectURL(file);
    } catch (error) {
      console.error("Upload error:", error);
      toast.error("Failed to upload image");
    } finally {
      setUploading(false);
      // Reset file input
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  const toolbarButtons = [
    {
      icon: Heading,
      label: "Heading",
      action: () => insertText("## ", "", "Heading"),
    },
    {
      icon: Bold,
      label: "Bold",
      action: () => insertText("**", "**", "bold text"),
    },
    {
      icon: Italic,
      label: "Italic",
      action: () => insertText("*", "*", "italic text"),
    },
    {
      icon: Code,
      label: "Code",
      action: () => insertText("`", "`", "code"),
    },
    {
      icon: Link,
      label: "Link",
      action: () => insertText("[", "](url)", "link text"),
    },
    {
      icon: List,
      label: "Bullet List",
      action: () => insertText("- ", "", "list item"),
    },
    {
      icon: ListOrdered,
      label: "Numbered List",
      action: () => insertText("1. ", "", "list item"),
    },
    {
      icon: ListTodo,
      label: "Task List",
      action: () => insertText("- [ ] ", "", "task"),
    },
  ];

  return (
    <div className={`border rounded-lg overflow-hidden ${className}`}>
      <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as "write" | "preview")}>
        <div className="flex items-center justify-between border-b bg-muted/30">
          <TabsList className="h-auto p-0 bg-transparent">
            <TabsTrigger
              value="write"
              className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent"
            >
              Write
            </TabsTrigger>
            <TabsTrigger
              value="preview"
              className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent"
            >
              Preview
            </TabsTrigger>
          </TabsList>

          {activeTab === "write" && (
            <div className="flex items-center gap-1 p-2">
              {toolbarButtons.map((btn, index) => (
                <Button
                  key={index}
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="h-8 w-8 p-0"
                  onClick={btn.action}
                  title={btn.label}
                >
                  <btn.icon className="h-4 w-4" />
                </Button>
              ))}

              <div className="h-4 w-px bg-border mx-1" />

              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="h-8 w-8 p-0"
                onClick={() => fileInputRef.current?.click()}
                disabled={uploading}
                title="Upload Image"
              >
                {uploading ? <Loader2 className="h-4 w-4 animate-spin" /> : <ImageIcon className="h-4 w-4" />}
              </Button>

              <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handleImageUpload} />
            </div>
          )}
        </div>

        <TabsContent value="write" className="m-0 p-0">
          <Textarea
            ref={textareaRef}
            value={value}
            onChange={(e) => onChange(e.target.value)}
            placeholder={placeholder}
            className="border-0 rounded-none focus-visible:ring-0 resize-none font-mono"
            style={{ minHeight }}
          />
        </TabsContent>

        <TabsContent value="preview" className="m-0 p-4">
          {value ? (
            <MarkdownPreview content={value} />
          ) : (
            <div className="text-muted-foreground text-sm" style={{ minHeight }}>
              Nothing to preview
            </div>
          )}
        </TabsContent>
      </Tabs>

      <div className="border-t bg-muted/30 px-4 py-2 text-xs text-muted-foreground">
        Paste, drop, or click{" "}
        <button type="button" className="text-primary hover:underline" onClick={() => fileInputRef.current?.click()}>
          here
        </button>{" "}
        to add files
      </div>
    </div>
  );
}
