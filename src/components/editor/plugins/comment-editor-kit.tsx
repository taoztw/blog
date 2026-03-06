'use client';

import {
  BoldPlugin,
  CodePlugin,
  HighlightPlugin,
  UnderlinePlugin,
} from '@platejs/basic-nodes/react';
import {
  CodeBlockPlugin,
  CodeLinePlugin,
  CodeSyntaxPlugin,
} from '@platejs/code-block/react';
import { IndentPlugin } from '@platejs/indent/react';
import { ListPlugin } from '@platejs/list/react';
import {
  FilePlugin,
  ImagePlugin,
  PlaceholderPlugin,
} from '@platejs/media/react';
import { KEYS } from 'platejs';
import { all, createLowlight } from 'lowlight';

import { CodeLeaf } from '@/components/ui/code-node';
import {
  CodeBlockElement,
  CodeLineElement,
  CodeSyntaxLeaf,
} from '@/components/ui/code-block-node';
import { HighlightLeaf } from '@/components/ui/highlight-node';
import { ImageElement } from '@/components/ui/media-image-node';
import { FileElement } from '@/components/ui/media-file-node';
import { CommentPlaceholderElement } from '@/components/ui/comment-placeholder-node';
import { BlockList } from '@/components/ui/block-list';

const lowlight = createLowlight(all);

export const CommentEditorKit = [
  // Marks
  BoldPlugin,
  UnderlinePlugin,
  CodePlugin.configure({
    node: { component: CodeLeaf },
    shortcuts: { toggle: { keys: 'mod+e' } },
  }),
  HighlightPlugin.configure({
    node: { component: HighlightLeaf },
    shortcuts: { toggle: { keys: 'mod+shift+h' } },
  }),

  // Code blocks
  CodeBlockPlugin.configure({
    node: { component: CodeBlockElement },
    options: { lowlight },
    shortcuts: { toggle: { keys: 'mod+alt+8' } },
  }),
  CodeLinePlugin.withComponent(CodeLineElement),
  CodeSyntaxPlugin.withComponent(CodeSyntaxLeaf),

  // Lists
  IndentPlugin.configure({
    inject: { targetPlugins: [KEYS.p] },
    options: { offset: 24 },
  }),
  ListPlugin.configure({
    inject: { targetPlugins: [KEYS.p] },
    render: { belowNodes: BlockList },
  }),

  // Media (image + file only, using R2 upload)
  ImagePlugin.configure({
    options: { disableUploadInsert: true },
    render: { node: ImageElement },
  }),
  FilePlugin.withComponent(FileElement),
  PlaceholderPlugin.configure({
    options: { disableEmptyPlaceholder: true },
    render: { node: CommentPlaceholderElement },
  }),
];
