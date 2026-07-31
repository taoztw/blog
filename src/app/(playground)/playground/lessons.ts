/**
 * Playground 课程注册表。
 * 每新增一课:在此登记 + 在对应 slug 目录建 page.tsx。
 * 侧边导航、上一课/下一课都从这里读。
 */

export interface Lesson {
  slug: string;
  title: string;
  /** 阶段编号,用于侧边栏分组 */
  stage: number;
  /** 一句话描述,显示在导航副标题 */
  summary: string;
}

export interface Stage {
  id: number;
  title: string;
  lessons: Lesson[];
}

const lessons: Lesson[] = [
  {
    slug: "slate-basics",
    title: "裸 Slate 最小编辑器",
    stage: 1,
    summary: "Node / Path / Transforms —— 徒手搭一个加粗斜体编辑器",
  },
];

export const STAGES: Stage[] = [
  { id: 0, title: "阶段 0 · 心智模型", lessons: [] },
  { id: 1, title: "阶段 1 · Slate 数据模型", lessons: [] },
  { id: 2, title: "阶段 2 · Slate-React 渲染层", lessons: [] },
  { id: 3, title: "阶段 3 · Plate 插件系统", lessons: [] },
  { id: 4, title: "阶段 4 · 落到 AI", lessons: [] },
].map((s) => ({ ...s, lessons: lessons.filter((l) => l.stage === s.id) }));

export const ALL_LESSONS = lessons;

export function getLesson(slug: string): Lesson | undefined {
  return lessons.find((l) => l.slug === slug);
}

export function getAdjacent(slug: string): { prev?: Lesson; next?: Lesson } {
  const i = lessons.findIndex((l) => l.slug === slug);
  if (i === -1) return {};
  return {
    prev: i > 0 ? lessons[i - 1] : undefined,
    next: i < lessons.length - 1 ? lessons[i + 1] : undefined,
  };
}
