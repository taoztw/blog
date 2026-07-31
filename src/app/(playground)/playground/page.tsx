import { STAGES, ALL_LESSONS } from "./lessons";
import Link from "next/link";
import { ArrowRight } from "lucide-react";

export default function PlaygroundHome() {
  return (
    <div className="max-w-3xl space-y-8">
      <div className="space-y-3">
        <h1 className="text-3xl font-bold text-ink-900">Slate / Plate 交互式学习</h1>
        <p className="text-ink-600">
          左侧文档讲原理,右侧 demo 可实时交互。想改代码?每个 demo 都标了源码路径 ——
          直接改对应 <code className="rounded bg-ink-100 px-1.5 py-0.5 text-sm">.tsx</code> 文件,保存即热更新。
        </p>
      </div>

      <div className="rounded-xl border border-ink-300 bg-ink-100 p-5 text-sm text-ink-700">
        <p className="mb-2 font-medium text-ink-800">怎么用这个 playground</p>
        <ol className="list-decimal space-y-1 pl-5">
          <li>先读左侧课程文档,建立概念</li>
          <li>在右侧 demo 里动手操作,观察实时 JSON 变化</li>
          <li>打开徽章标注的源码文件,改代码验证你的理解,保存后页面秒级刷新</li>
        </ol>
      </div>

      <div className="space-y-5">
        {STAGES.map((stage) => (
          <div key={stage.id} className="space-y-2">
            <h2 className="text-sm font-semibold uppercase tracking-wide text-ink-500">
              {stage.title}
            </h2>
            {stage.lessons.length === 0 ? (
              <p className="text-sm text-ink-400">课程编写中…</p>
            ) : (
              <ul className="space-y-2">
                {stage.lessons.map((lesson) => (
                  <li key={lesson.slug}>
                    <Link
                      href={`/playground/${lesson.slug}`}
                      className="group flex items-center justify-between rounded-lg border border-ink-300 bg-ink-50 px-4 py-3 transition-colors hover:border-brand/50 hover:bg-brand/5"
                    >
                      <span>
                        <span className="block font-medium text-ink-800">{lesson.title}</span>
                        <span className="block text-sm text-ink-500">{lesson.summary}</span>
                      </span>
                      <ArrowRight className="size-4 shrink-0 text-ink-400 transition-transform group-hover:translate-x-0.5 group-hover:text-brand" />
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </div>
        ))}
      </div>

      <p className="text-xs text-ink-400">共 {ALL_LESSONS.length} 课已就绪,更多陆续添加。</p>
    </div>
  );
}
