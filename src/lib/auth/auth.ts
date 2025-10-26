import { env } from "@/env";
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
    socialProviders: {
      github: {
        clientId: env.AUTH_GITHUB_ID,
        clientSecret: env.AUTH_GITHUB_SECRET,
      },
      google: {
        clientId: env.AUTH_GOOGLE_ID,
        clientSecret: env.AUTH_GOOGLE_SECRET,
      },
    },
    session: {
      cookieCache: {
        enabled: true,
        maxAge: 60 * 60 * 24, // 1 day
      },
    },
    plugins: [nextCookies(), admin()],
  });
