export const ROLES_ENUM = {
  ADMIN: "admin",
  USER: "user",
} as const;

export const POST_STATUS_ENUM = {
  DRAFT: "draft",
  PUBLISHED: "published",
};

export const REACTION_ENUM = {
  LIKE: "like",
  DISLIKE: "dislike",
};

export const PROJECT_STATUS_ENUM = {
  DRAFT: "draft",
  PUBLISHED: "published",
};

export const PROJECT_TYPE_ENUM = {
  FRONTEND: "frontend",
  BACKEND: "backend",
  MOBILE: "mobile",
  TOOL: "tool",
  AI: "ai",
  OTHER: "other",
};

export const QUESTION_STATUS_ENUM = {
  PENDING: "pending",
  APPROVED: "approved",
  REJECTED: "rejected",
};

export const VOTE_TYPE_ENUM = {
  UPVOTE: "upvote",
  DOWNVOTE: "downvote",
};

export const roleTuple = Object.values(ROLES_ENUM) as [string, ...string[]];
export const POST_STATUS_TUPLE = Object.values(POST_STATUS_ENUM) as [string, ...string[]];
export const PROJECT_STATUS_TUPLE = Object.values(PROJECT_STATUS_ENUM) as [string, ...string[]];
export const PROJECT_TYPE_TUPLE = Object.values(PROJECT_TYPE_ENUM) as [string, ...string[]];
export const reactionTuple = Object.values(REACTION_ENUM) as [string, ...string[]];
export const QUESTION_STATUS_TUPLE = Object.values(QUESTION_STATUS_ENUM) as [string, ...string[]];
export const VOTE_TYPE_TUPLE = Object.values(VOTE_TYPE_ENUM) as [string, ...string[]];
