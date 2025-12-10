import type { CodeBlockLanguage } from "../types";

/**
 * 代码块支持的语言列表
 */
export const CODE_BLOCK_LANGUAGES: CodeBlockLanguage[] = [
  { value: "javascript", label: "JavaScript" },
  { value: "typescript", label: "TypeScript" },
  { value: "jsx", label: "JSX" },
  { value: "tsx", label: "TSX" },
  { value: "python", label: "Python" },
  { value: "java", label: "Java" },
  { value: "c", label: "C" },
  { value: "cpp", label: "C++" },
  { value: "csharp", label: "C#" },
  { value: "go", label: "Go" },
  { value: "rust", label: "Rust" },
  { value: "php", label: "PHP" },
  { value: "ruby", label: "Ruby" },
  { value: "swift", label: "Swift" },
  { value: "kotlin", label: "Kotlin" },
  { value: "sql", label: "SQL" },
  { value: "html", label: "HTML" },
  { value: "css", label: "CSS" },
  { value: "scss", label: "SCSS" },
  { value: "json", label: "JSON" },
  { value: "yaml", label: "YAML" },
  { value: "markdown", label: "Markdown" },
  { value: "bash", label: "Bash" },
  { value: "shell", label: "Shell" },
  { value: "powershell", label: "PowerShell" },
  { value: "docker", label: "Dockerfile" },
  { value: "git", label: "Git" },
  { value: "plaintext", label: "Plain Text" },
];

/**
 * 默认代码块语言
 */
export const DEFAULT_CODE_LANGUAGE = "javascript";

/**
 * 键盘快捷键映射
 */
export const KEYBOARD_SHORTCUTS = {
  bold: "Mod-b",
  italic: "Mod-i",
  strike: "Mod-Shift-s",
  code: "Mod-e",
  undo: "Mod-z",
  redo: "Mod-Shift-z",
  bulletList: "Mod-Shift-8",
  orderedList: "Mod-Shift-7",
  blockquote: "Mod-Shift-b",
  codeBlock: "Mod-Alt-c",
  horizontalRule: "Mod-Shift-minus",
} as const;
