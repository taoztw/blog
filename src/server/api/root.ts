import { postRouter } from "@/server/api/routers/post";
import { userRouter } from "@/server/api/routers/user";
import { createCallerFactory, createTRPCRouter } from "@/server/api/trpc";
import { categoryRouter } from "./routers/categories";
import { commentsRouter } from "./routers/comments";
import { commentReactionRouter } from "./routers/comment-reaction";
import { tagRouter } from "./routers/tags";
import { projectRouter } from "./routers/project";
import { questionRouter } from "./routers/questions";
import { answerRouter } from "./routers/answers";
import { journalRouter } from "./routers/journals";

/**
 * This is the primary router for your server.
 *
 * All routers added in /api/routers should be manually added here.
 */
export const appRouter = createTRPCRouter({
  post: postRouter,
  user: userRouter,
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
