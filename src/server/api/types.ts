import { type inferRouterOutputs } from "@trpc/server";
import { type AppRouter } from "./root";

export type CommentGetManyOutput = inferRouterOutputs<AppRouter>["comment"]["getMany"];

export type PostGetByPageOutput = inferRouterOutputs<AppRouter>["post"]["getByPage"];
export type PostListItem = PostGetByPageOutput["items"][number];
