"use client";

import type { Value } from "platejs";
import { normalizeNodeId } from "platejs";
import { Plate, usePlateEditor } from "platejs/react";

import { EditorKit } from "@/components/editor/editor-kit";
import { SettingsDialog } from "@/components/editor/settings-dialog";
import { Editor, EditorContainer } from "@/components/ui/editor";

interface PlateEditorProps {
  initialValue?: Value;
  onChange?: (value: Value) => void;
  onSave?: (value: Value) => void;
}

export function PlateEditor({ initialValue, onChange, onSave }: PlateEditorProps) {
  const editor = usePlateEditor({
    plugins: EditorKit,
    value: initialValue ?? defaultValue,
  });

  return (
    <Plate
      editor={editor}
      onChange={onChange ? ({ value }) => onChange(value) : undefined}
      onValueChange={onSave ? ({ value }) => onSave(value) : undefined}
    >
      <EditorContainer>
        <Editor variant="default" />
      </EditorContainer>

      <SettingsDialog />
    </Plate>
  );
}

export { type PlateEditorProps };

const defaultValue = normalizeNodeId([
  {
    children: [{ text: "" }],
    type: "h1",
  },
  {
    children: [{ text: "" }],
    type: "p",
  },
]);
