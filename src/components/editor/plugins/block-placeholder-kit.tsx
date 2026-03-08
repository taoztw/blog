'use client';

import { KEYS } from 'platejs';
import { BlockPlaceholderPlugin } from 'platejs/react';

export const BlockPlaceholderKit = [
  BlockPlaceholderPlugin.configure({
    options: {
      className:
        'before:absolute before:cursor-text before:text-muted-foreground/80 before:content-[attr(placeholder)]',
      placeholders: {
        [KEYS.h1]: '标题',
        [KEYS.p]: '输入正文，或使用 / 插入内容...',
      },
      query: ({ path }) => path.length === 1,
    },
  }),
];
