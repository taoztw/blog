import { z } from "zod";
import { postSelectSchema } from "./server/db/schema";

// 基础类型
type Post = z.infer<typeof postSelectSchema>;

// 带完整关联数据的类型
type PostWithRelations = Post & {
  author: {
    id: string;
    name: string | null;
    email: string;
    image: string | null;
  };
  category: {
    id: number;
    name: string;
  };
};
