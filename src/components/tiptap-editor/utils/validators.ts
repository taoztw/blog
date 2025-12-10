import type { FileValidationOptions, FileTypeConfig } from "../types";

/**
 * 允许的图片类型
 */
export const ALLOWED_IMAGE_TYPES = [
  "image/jpeg",
  "image/jpg",
  "image/png",
  "image/gif",
  "image/webp",
  "image/svg+xml",
];

/**
 * 允许的文档类型
 */
export const ALLOWED_DOCUMENT_TYPES = [
  "application/pdf", // PDF
  "application/msword", // DOC
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document", // DOCX
  "application/vnd.ms-excel", // XLS
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet", // XLSX
  "text/plain", // TXT
  "text/markdown", // MD
  "application/zip", // ZIP
  "application/x-zip-compressed", // ZIP (alternative)
];

/**
 * 文件类型配置映射
 */
export const FILE_TYPE_CONFIGS: Record<string, FileTypeConfig> = {
  "application/pdf": {
    extension: "pdf",
    mimeType: "application/pdf",
    icon: "📄",
    label: "PDF Document",
  },
  "application/msword": {
    extension: "doc",
    mimeType: "application/msword",
    icon: "📝",
    label: "Word Document",
  },
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document": {
    extension: "docx",
    mimeType:
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    icon: "📝",
    label: "Word Document",
  },
  "application/vnd.ms-excel": {
    extension: "xls",
    mimeType: "application/vnd.ms-excel",
    icon: "📊",
    label: "Excel Spreadsheet",
  },
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet": {
    extension: "xlsx",
    mimeType:
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    icon: "📊",
    label: "Excel Spreadsheet",
  },
  "text/plain": {
    extension: "txt",
    mimeType: "text/plain",
    icon: "📃",
    label: "Text File",
  },
  "text/markdown": {
    extension: "md",
    mimeType: "text/markdown",
    icon: "📋",
    label: "Markdown File",
  },
  "application/zip": {
    extension: "zip",
    mimeType: "application/zip",
    icon: "🗜️",
    label: "ZIP Archive",
  },
};

/**
 * 默认文件验证选项
 */
export const DEFAULT_VALIDATION_OPTIONS: FileValidationOptions = {
  maxSize: 20 * 1024 * 1024, // 20MB
  allowedTypes: [...ALLOWED_IMAGE_TYPES, ...ALLOWED_DOCUMENT_TYPES],
};

/**
 * 图片验证选项
 */
export const IMAGE_VALIDATION_OPTIONS: FileValidationOptions = {
  maxSize: 10 * 1024 * 1024, // 10MB
  allowedTypes: ALLOWED_IMAGE_TYPES,
};

/**
 * 文档验证选项
 */
export const DOCUMENT_VALIDATION_OPTIONS: FileValidationOptions = {
  maxSize: 20 * 1024 * 1024, // 20MB
  allowedTypes: ALLOWED_DOCUMENT_TYPES,
};

/**
 * 验证文件
 */
export function validateFile(
  file: File,
  options: FileValidationOptions = DEFAULT_VALIDATION_OPTIONS,
): { valid: boolean; error?: string } {
  // 检查文件大小
  if (file.size > options.maxSize) {
    const maxSizeMB = (options.maxSize / (1024 * 1024)).toFixed(2);
    return {
      valid: false,
      error: `文件大小不能超过 ${maxSizeMB}MB`,
    };
  }

  // 检查文件类型
  if (!options.allowedTypes.includes(file.type)) {
    return {
      valid: false,
      error: `不支持的文件类型: ${file.type}`,
    };
  }

  return { valid: true };
}

/**
 * 检查是否为图片文件
 */
export function isImageFile(file: File): boolean {
  return ALLOWED_IMAGE_TYPES.includes(file.type);
}

/**
 * 检查是否为文档文件
 */
export function isDocumentFile(file: File): boolean {
  return ALLOWED_DOCUMENT_TYPES.includes(file.type);
}

/**
 * 获取文件类型配置
 */
export function getFileTypeConfig(mimeType: string): FileTypeConfig {
  return (
    FILE_TYPE_CONFIGS[mimeType] ?? {
      extension: "file",
      mimeType,
      icon: "📎",
      label: "File",
    }
  );
}

/**
 * 格式化文件大小
 */
export function formatFileSize(bytes: number): string {
  if (bytes === 0) return "0 B";

  const k = 1024;
  const sizes = ["B", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(2))} ${sizes[i]}`;
}

/**
 * 从 URL 获取文件扩展名
 */
export function getFileExtension(url: string): string {
  const pathname = new URL(url, window.location.origin).pathname;
  const parts = pathname.split(".");
  return parts.length > 1 ? parts[parts.length - 1]!.toLowerCase() : "";
}
