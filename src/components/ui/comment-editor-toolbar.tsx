'use client';

import {
  BoldIcon,
  Code2Icon,
  HighlighterIcon,
  UnderlineIcon,
} from 'lucide-react';
import { KEYS } from 'platejs';

import { MarkToolbarButton } from './mark-toolbar-button';
import { ToolbarGroup } from './toolbar';

export function CommentEditorToolbarButtons() {
  return (
    <ToolbarGroup>
      <MarkToolbarButton nodeType={KEYS.bold} tooltip="加粗 (⌘+B)">
        <BoldIcon />
      </MarkToolbarButton>
      <MarkToolbarButton nodeType={KEYS.underline} tooltip="下划线 (⌘+U)">
        <UnderlineIcon />
      </MarkToolbarButton>
      <MarkToolbarButton
        nodeType={KEYS.highlight}
        tooltip="高亮 (⌘+⇧+H)"
      >
        <HighlighterIcon />
      </MarkToolbarButton>
      <MarkToolbarButton nodeType={KEYS.code} tooltip="代码 (⌘+E)">
        <Code2Icon />
      </MarkToolbarButton>
    </ToolbarGroup>
  );
}
