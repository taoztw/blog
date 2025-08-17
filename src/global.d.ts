import { z } from "zod";
import { categoryInsertSchema, categorySelectSchema, postSelectSchema } from "./server/db/schema";

// 基础类型
type Post = z.infer<typeof postSelectSchema>;
type CreatePostData = z.infer<typeof postInsertSchema>;

type Category = z.infer<typeof categorySelectSchema>;
type CreateCategoryData = z.infer<typeof categoryInsertSchema>;

// 带完整关联数据的类型
type PostWithRelations = Post & {
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
