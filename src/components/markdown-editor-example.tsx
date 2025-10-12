"use client";

import { useState } from "react";
import { MarkdownEditor } from "@/components/markdown-editor";
import { Button } from "@/components/ui/button";

/**
 * Example usage of MarkdownEditor component
 *
 * This demonstrates how to use the MarkdownEditor in your journals and qas pages
 */
export function MarkdownEditorExample() {
  const [content, setContent] = useState("");

  const handleSubmit = () => {
    console.log("Submitted content:", content);
    // Here you would typically send the content to your API
  };

  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-bold">Markdown Editor Example</h2>

      <MarkdownEditor
        value={content}
        onChange={setContent}
        placeholder="Write your journal entry or question in Markdown..."
        minHeight="400px"
      />

      <div className="flex justify-end gap-2">
        <Button variant="outline" onClick={() => setContent("")}>
          Clear
        </Button>
        <Button onClick={handleSubmit}>
          Submit
        </Button>
      </div>
    </div>
  );
}
