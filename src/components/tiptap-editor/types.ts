import type { Editor } from "@tiptap/react";
import type { JSONContent } from "@tiptap/core";

/**
 * 文件上传结果
 */
export interface UploadResult {
  success: boolean;
  key?: string;
  filename?: string;
  size?: number;
  mimeType?: string;
  error?: string;
}

/**
 * 文件验证选项
 */
export interface FileValidationOptions {
  maxSize: number; // 字节
  allowedTypes: string[]; // MIME types
}

/**
 * 上传进度回调
 */
export interface UploadProgress {
  loaded: number;
  total: number;
  percentage: number;
}

/**
 * 编辑器配置选项
 */
export interface TiptapEditorProps {
  /** 初始内容 (JSON 或 HTML) */
  content?: JSONContent | string;
  /** 内容变化回调 */
  onChange?: (content: JSONContent) => void;
  /** 占位符文本 */
  placeholder?: string;
  /** 是否可编辑 */
  editable?: boolean;
  /** 是否自动聚焦 */
  autofocus?: boolean;
  /** 是否显示工具栏 */
  showToolbar?: boolean;
  /** 自定义类名 */
  className?: string;
  /** 最小高度 */
  minHeight?: string;
  /** 最大高度 */
  maxHeight?: string;
  /** 是否启用文件上传 */
  enableFileUpload?: boolean;
  /** 是否启用 @提及功能 */
  enableMentions?: boolean;
  /** 获取用户列表（用于 @提及） */
  onSearchUsers?: (query: string) => Promise<MentionUser[]>;
}

/**
 * @提及用户数据
 */
export interface MentionUser {
  id: string;
  name: string;
  username: string;
  avatar?: string;
}

/**
 * 图片节点属性
 */
export interface ImageNodeAttrs {
  src: string;
  alt?: string;
  title?: string;
  width?: number;
  height?: number;
}

/**
 * 文件节点属性
 */
export interface FileNodeAttrs {
  src: string;
  filename: string;
  size: number;
  mimeType: string;
}

/**
 * 工具栏按钮类型
 */
export type ToolbarButtonType =
  | "heading"
  | "bold"
  | "italic"
  | "strike"
  | "code"
  | "link"
  | "bulletList"
  | "orderedList"
  | "taskList"
  | "blockquote"
  | "codeBlock"
  | "table"
  | "image"
  | "file"
  | "horizontalRule"
  | "undo"
  | "redo"
  | "clearFormat";

/**
 * 工具栏按钮配置
 */
export interface ToolbarButton {
  type: ToolbarButtonType;
  label: string;
  icon: React.ReactNode;
  action: (editor: Editor) => void;
  isActive?: (editor: Editor) => boolean;
  isDisabled?: (editor: Editor) => boolean;
}

/**
 * 代码块语言
 */
export interface CodeBlockLanguage {
  value: string;
  label: string;
}

/**
 * 文件类型配置
 */
export interface FileTypeConfig {
  extension: string;
  mimeType: string;
  icon: string;
  label: string;
}

/**
 * 编辑器模式
 */
export type EditorMode = "write" | "markdown";
