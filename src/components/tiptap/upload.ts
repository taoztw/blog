import { type Editor, Extension } from "@tiptap/core";
import { Plugin, PluginKey } from "@tiptap/pm/state";
import { toast } from "sonner";

import { ImageService } from "@/lib/image-service";

interface UploadResponse {
  success: boolean;
  key?: string;
  error?: string;
  message?: string;
}

/** 上传一张图片到 /api/upload，返回可访问的地址 */
export async function uploadImage(file: File): Promise<string> {
  const formData = new FormData();
  formData.append("file", file);

  const res = await fetch("/api/upload", { method: "POST", body: formData });
  const data = (await res.json().catch(() => null)) as UploadResponse | null;

  if (!res.ok || !data?.success || !data.key) {
    throw new Error(data?.error ?? data?.message ?? `上传失败 (${res.status})`);
  }
  return ImageService.getImageUrl(data.key);
}

export function getImageFiles(list: FileList | null | undefined): File[] {
  return Array.from(list ?? []).filter((file) => file.type.startsWith("image/"));
}

/**
 * 上传图片并插入到文档。
 * `pos` 省略时插入到上传完成那一刻的光标处。
 */
export async function uploadAndInsertImages(editor: Editor, files: File[], pos?: number) {
  for (const file of files) {
    const toastId = toast.loading(`正在上传 ${file.name}…`);
    try {
      const src = await uploadImage(file);
      if (editor.isDestroyed) return;

      const image = { type: "image", attrs: { src, alt: file.name } };
      // 上传期间文档可能已被编辑，位置越界时退回到当前光标
      const at = pos !== undefined && pos <= editor.state.doc.content.size ? pos : undefined;
      if (at === undefined) {
        editor.chain().focus().insertContent(image).run();
      } else {
        editor.chain().focus().insertContentAt(at, image).run();
      }
      toast.success("图片已上传", { id: toastId });
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "上传失败", { id: toastId });
    }
  }
}

/** 打开系统文件选择框，选中的图片上传后插入到光标处 */
export function pickAndUploadImages(editor: Editor) {
  const input = document.createElement("input");
  input.type = "file";
  input.accept = "image/*";
  input.multiple = true;
  input.onchange = () => {
    const files = getImageFiles(input.files);
    if (files.length > 0) void uploadAndInsertImages(editor, files);
  };
  input.click();
}

/** 粘贴或拖入图片文件时自动上传 */
export const ImagePasteDrop = Extension.create({
  name: "imagePasteDrop",

  addProseMirrorPlugins() {
    const editor = this.editor;

    return [
      new Plugin({
        key: new PluginKey("imagePasteDrop"),
        props: {
          handlePaste: (_view, event) => {
            const files = getImageFiles(event.clipboardData?.files);
            if (files.length === 0) return false;
            event.preventDefault();
            void uploadAndInsertImages(editor, files);
            return true;
          },
          handleDrop: (view, event, _slice, moved) => {
            const files = getImageFiles(event.dataTransfer?.files);
            // moved 为 true 表示是编辑器内部拖动已有节点，交给默认处理
            if (moved || files.length === 0) return false;
            event.preventDefault();
            const pos = view.posAtCoords({ left: event.clientX, top: event.clientY })?.pos;
            void uploadAndInsertImages(editor, files, pos);
            return true;
          },
        },
      }),
    ];
  },
});
