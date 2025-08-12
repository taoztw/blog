import type { PostWithRelations } from "@/global";

export const blogPosts: PostWithRelations[] = [
  {
    id: "clx1a2b3c4d5e6f7g8h9i0j1",
    title: "AI-Powered Marketing: The Future of Customer Engagement",
    slug: "ai-powered-marketing-future",
    excerpt:
      "Explore how artificial intelligence is revolutionizing marketing strategies and creating personalized customer experiences at scale.",
    content: "Full content about AI-powered marketing...",
    imageUrl: "/tmp/p1.jpg",
    status: "PUBLISHED",
    viewCount: 1247,
    likeCount: 89,
    createdById: "usr_123456789",
    categoryId: "1",
    author: {
      id: "usr_123456789",
      name: "Sarah Chen",
      email: "sarah.chen@example.com",
      image: "/avatars/sarah-chen.jpg",
    },
    category: {
      id: 1,
      name: "Artificial Intelligence",
    },
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: "clx2b3c4d5e6f7g8h9i0j1k2",
    title: "Building Brand Loyalty Through Social Media Storytelling",
    slug: "brand-loyalty-social-media",
    excerpt:
      "Discover the art of crafting compelling brand narratives that resonate with your audience and drive long-term loyalty.",
    content: "Full content about social media storytelling...",
    imageUrl: "/tmp/p2.jpg",
    status: "PUBLISHED",
    viewCount: 892,
    likeCount: 156,
    createdById: "usr_987654321",
    categoryId: "2",
    author: {
      id: "usr_987654321",
      name: "Marcus Rodriguez",
      email: "marcus.r@example.com",
      image: "/avatars/marcus-rodriguez.jpg",
    },
    category: {
      id: 2,
      name: "Social Media",
    },
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: "clx3c4d5e6f7g8h9i0j1k2l3",
    title: "The Rise of Voice Commerce: Optimizing for Audio Shopping",
    slug: "voice-commerce-optimization",
    excerpt:
      "Learn how voice assistants are changing the e-commerce landscape and how to optimize your business for voice commerce.",
    content: "Full content about voice commerce...",
    imageUrl: "/tmp/p3.jpg",
    status: "PUBLISHED",
    viewCount: 634,
    likeCount: 78,
    createdById: "usr_456789123",
    categoryId: "3",
    author: {
      id: "usr_456789123",
      name: "Emily Watson",
      email: "emily.watson@example.com",
      image: "/avatars/emily-watson.jpg",
    },
    category: {
      id: 3,
      name: "E-commerce",
    },
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: "clx4d5e6f7g8h9i0j1k2l3m4",
    title: "Sustainable Marketing: Connecting with Eco-Conscious Consumers",
    slug: "sustainable-marketing-eco-conscious",
    excerpt:
      "Understand how sustainability messaging can differentiate your brand and attract environmentally conscious customers.",
    content: "Full content about sustainable marketing...",
    imageUrl: "/tmp/p4.jpg",
    status: "PUBLISHED",
    viewCount: 1089,
    likeCount: 203,
    createdById: "usr_789123456",
    categoryId: "4",
    author: {
      id: "usr_789123456",
      name: "David Kim",
      email: "david.kim@example.com",
      image: "/avatars/david-kim.jpg",
    },
    category: {
      id: 4,
      name: "Sustainability",
    },
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: "clx5e6f7g8h9i0j1k2l3m4n5",
    title: "Micro-Influencer Marketing: Quality Over Quantity",
    slug: "micro-influencer-marketing",
    excerpt:
      "Why partnering with micro-influencers often delivers better ROI than celebrity endorsements and how to find the right partners.",
    content: "Full content about micro-influencer marketing...",
    imageUrl: "/tmp/p2.jpg",
    status: "PUBLISHED",
    viewCount: 756,
    likeCount: 124,
    createdById: "usr_321654987",
    categoryId: "2",
    author: {
      id: "usr_321654987",
      name: "Jessica Liu",
      email: "jessica.liu@example.com",
      image: "/avatars/jessica-liu.jpg",
    },
    category: {
      id: 2,
      name: "Social Media",
    },
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: "clx6f7g8h9i0j1k2l3m4n5o6",
    title: "The Psychology of Color in Digital Marketing",
    slug: "color-psychology-digital-marketing",
    excerpt:
      "Explore how color choices impact consumer behavior and learn to use color psychology to improve your marketing effectiveness.",
    content: "Full content about color psychology...",
    imageUrl: "/tmp/p4.jpg",
    status: "DRAFT",
    viewCount: 0,
    likeCount: 0,
    createdById: "usr_654987321",
    categoryId: "5",
    author: {
      id: "usr_654987321",
      name: "Alex Thompson",
      email: "alex.thompson@example.com",
      image: "/avatars/alex-thompson.jpg",
    },
    category: {
      id: 5,
      name: "Design",
    },
    createdAt: new Date(),
    updatedAt: new Date(),
  },
];

export const markdownString = `

# A demo of \`react-markdown\`

\`react-markdown\` is a markdown component for React.
\`\`\`python
import os
print(1)
\`\`\`

👉 Changes are re-rendered as you type.

👈 Try writing some markdown on the left.

## Overview

* Follows [CommonMark](https://commonmark.org)
* Optionally follows [GitHub Flavored Markdown](https://github.github.com/gfm/)
* Renders actual React elements instead of using \`dangerouslySetInnerHTML\`
* Lets you define your own components (to render \`MyHeading\` instead of \`'h1'\`)
* Has a lot of plugins

## Contents

Here is an example of a plugin in action ([\`remark-toc\`](https://github.com/remarkjs/remark-toc)).
**This section is replaced by an actual table of contents**.

## Syntax highlighting

Here is an example of a plugin to highlight code:
[\`rehype-starry-night\`](https://github.com/rehypejs/rehype-starry-night).

\`\`\`js
import React from 'react'
import ReactDom from 'react-dom'
import {MarkdownHooks} from 'react-markdown'
import rehypeStarryNight from 'rehype-starry-night'

const markdown = \`
# Your markdown here
\`

ReactDom.render(
  <MarkdownHooks rehypePlugins={[rehypeStarryNight]}>{markdown}</MarkdownHooks>,
  document.querySelector('#content')
)
\`\`\`

Pretty neat, eh?

## GitHub flavored markdown (GFM)

For GFM, you can *also* use a plugin:
[\`remark-gfm\`](https://github.com/remarkjs/react-markdown#use).
It adds support for GitHub-specific extensions to the language:
tables, strikethrough, tasklists, and literal URLs.

These features **do not work by default**.
👆 Use the toggle above to add the plugin.

| Feature    | Support              |
| ---------: | :------------------- |
| CommonMark | 100%                 |
| GFM        | 100% w/ \`remark-gfm\` |

~~strikethrough~~

* [ ] task list
* [x] checked item

https://example.com

## HTML in markdown

⚠️ HTML in markdown is quite unsafe, but if you want to support it, you can
use [\`rehype-raw\`](https://github.com/rehypejs/rehype-raw).
You should probably combine it with
[\`rehype-sanitize\`](https://github.com/rehypejs/rehype-sanitize).

<blockquote>
  👆 Use the toggle above to add the plugin.
</blockquote>

## Components

You can pass components to change things:

\`\`\`js
import React from 'react'
import ReactDom from 'react-dom'
import Markdown from 'react-markdown'
import MyFancyRule from './components/my-fancy-rule.js'
import { raw } from "mysql2";
import python from "react-syntax-highlighter/dist/esm/languages/hljs/python";

const markdown = \`
# Your markdown here
\`

ReactDom.render(
  <Markdown
    components={{
      // Use h2s instead of h1s
      h1: 'h2',
      // Use a component instead of hrs
      hr(props) {
        const {node, ...rest} = props
        return <MyFancyRule {...rest} />
      }
    }}
  >
    {markdown}
  </Markdown>,
  document.querySelector('#content')
)
\`\`\`

## More info?

Much more info is available in the
[readme on GitHub](https://github.com/remarkjs/react-markdown)!

***

A component by [Espen Hovlandsdal](https://espen.codes/)
  
`;
