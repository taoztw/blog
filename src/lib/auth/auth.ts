import { getDB } from "@/server/db/db";
import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { nextCookies } from "better-auth/next-js";
import { admin } from "better-auth/plugins";

export const getAuth = () =>
  betterAuth({
    // database: drizzleAdapter(new Database("./test.db"), {
    //   provider: "sqlite",
    // }),
    database: drizzleAdapter(getDB(), {
      provider: "sqlite",
    }),
    // database: new Database("./test.db"),
    emailAndPassword: {
      enabled: true,
      autoSignIn: true, //用户注册自动登录
      minPasswordLength: 6,
    },
    session: {
      cookieCache: {
        enabled: true,
        maxAge: 60 * 60 * 24, // 1 day
      },
    },
    plugins: [nextCookies(), admin()],
  });
