import { z } from "zod";
import { categoryInsertSchema, categorySelectSchema, postSelectSchema, userSelectSchema } from "./server/db/schema";
import { posts, categorys, users } from "./server/db/schema";

// 基础类型
type CreatePostData = z.infer<typeof postInsertSchema>;

type Category = z.infer<typeof categorySelectSchema>;
type CreateCategoryData = z.infer<typeof categoryInsertSchema>;

// 带完整关联数据的类型
type PostWithRelations = z.infer<typeof postSelectSchema> & {
  author: {
    id: string;
    name: string | null;
    email: string;
    image: string | null;
  };
  category: {
    id: string;
    name: string;
  } | null;
};

// 带关联 & 统计字段的完整 Post 类型
export type Post = z.infer<typeof postSelectSchema> & {
  user: z.infer<typeof userSelectSchema>;
  category: z.infer<typeof categorySelectSchema>;
  viewCount: number;
  likeCount: number;
  commentCount: number;
  userReaction?: string | null;
};
