"use client";

import * as React from "react";
import type { Value } from "platejs";
import { Plate, usePlateEditor } from "platejs/react";

import { CommentEditorKit } from "@/components/editor/plugins/comment-editor-kit";
import { Editor, EditorContainer } from "@/components/ui/editor";

interface CommentContentProps {
  content: string;
}

export function CommentContent({ content }: CommentContentProps) {
  let parsedValue: Value | null = null;

  try {
    const parsed = JSON.parse(content);
    if (Array.isArray(parsed)) {
      parsedValue = parsed as Value;
    }
  } catch {
    // Not JSON, render as plain text
  }

  if (!parsedValue) {
    return <p className="text-sm">{content}</p>;
  }

  return <CommentRichContent value={parsedValue} />;
}

function CommentRichContent({ value }: { value: Value }) {
  const editor = usePlateEditor({
    plugins: CommentEditorKit,
    value,
  });

  return (
    <Plate editor={editor} readOnly>
      <EditorContainer variant="comment">
        <Editor variant="comment" className="text-sm" readOnly />
      </EditorContainer>
    </Plate>
  );
}
