import { z } from "zod";
import {
  categoryInsertSchema,
  categorySelectSchema,
  postSelectSchema,
  projectInsertSchema,
  projectSelectSchema,
  tagInsertSchema,
  tagSelectSchema,
  userSelectSchema,
} from "./server/db/schema";

// 基础类型
type CreatePostData = z.infer<typeof postInsertSchema>;

type Category = z.infer<typeof categorySelectSchema>;
type CreateCategoryData = z.infer<typeof categoryInsertSchema>;

type Tag = z.infer<typeof tagSelectSchema>;
type CreateTagData = z.infer<typeof tagInsertSchema>;

type Project = z.infer<typeof projectSelectSchema>;
type CreateProjectData = z.infer<typeof projectInsertSchema>;

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

type ProjectWithRelations = z.infer<typeof projectSelectSchema> & {
  author: {
    id: string;
    name: string | null;
    email: string;
    image: string | null;
  } | null;
  category: {
    id: string;
    name: string;
    description: string | null;
  } | null;
  tags: Array<{
    tag: {
      id: string;
      name: string;
      description: string | null;
      color: string | null;
    };
  }>;
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

type ActionResponse<T = null> = {
  success: boolean;
  data?: T;
  error?: {
    message: string;
    details?: Record<string, string[]>;
  };
  status?: number;
};
type SuccessResponse<T = null> = ActionResponse<T> & { success: true };
type ErrorResponse = ActionResponse<undefined> & { success: false };

type APIErrorResponse = NextResponse<ErrorResponse>;
type APIResponse<T = null> = NextResponse<SuccessResponse<T> | ErrorResponse>;
