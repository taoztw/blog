// src/types/next-auth.d.ts
import NextAuth, { DefaultSession, DefaultUser } from "next-auth";

declare module "next-auth" {
  interface Session {
    user: {
      /** 来自数据库 users 表的用户 ID */
      id: string;
      /** 角色 */
      role: string;
    } & DefaultSession["user"];
  }
}
