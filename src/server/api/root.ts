import { postRouter } from "@/server/api/routers/post";
import { createCallerFactory, createTRPCRouter } from "@/server/api/trpc";
import { answerRouter } from "./routers/answers";
import { categoryRouter } from "./routers/categories";
import { commentReactionRouter } from "./routers/comment-reaction";
import { commentsRouter } from "./routers/comments";
import { journalRouter } from "./routers/journals";
import { projectRouter } from "./routers/project";
import { questionRouter } from "./routers/questions";
import { tagRouter } from "./routers/tags";

/**
 * This is the primary router for your server.
 *
 * All routers added in /api/routers should be manually added here.
 */
export const appRouter = createTRPCRouter({
  post: postRouter,
  category: categoryRouter,
  tag: tagRouter,
  comment: commentsRouter,
  commentReactions: commentReactionRouter,
  project: projectRouter,
  question: questionRouter,
  answer: answerRouter,
  journal: journalRouter,
});

// export type definition of API
export type AppRouter = typeof appRouter;

/**
 * Create a server-side caller for the tRPC API.
 * @example
 * const trpc = createCaller(createContext);
 * const res = await trpc.post.all();
 *       ^? Post[]
 */
export const createCaller = createCallerFactory(appRouter);
