'use client';

import { createPlatePlugin } from 'platejs/react';

import { FloatingToolbar } from '@/components/ui/floating-toolbar';
import { CommentEditorToolbarButtons } from '@/components/ui/comment-editor-toolbar';

export const CommentToolbarKit = [
  createPlatePlugin({
    key: 'comment-floating-toolbar',
    render: {
      afterEditable: () => (
        <FloatingToolbar>
          <CommentEditorToolbarButtons />
        </FloatingToolbar>
      ),
    },
  }),
];
