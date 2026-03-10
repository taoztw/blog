import React from "react";

interface CommentContentProps {
  content: string;
}

export function CommentContent({ content }: CommentContentProps) {
  // Try to parse JSON (legacy rich text content) and extract plain text
  let displayText = content;

  try {
    const parsed = JSON.parse(content);
    if (Array.isArray(parsed)) {
      displayText = parsed
        .map((node: { children?: { text?: string }[] }) =>
          node.children?.map((child) => child.text || "").join("") || ""
        )
        .join("\n")
        .trim();
    }
  } catch {
    // Not JSON, use as-is
  }

  return (
    <p className="text-sm whitespace-pre-wrap">{displayText}</p>
  );
}
