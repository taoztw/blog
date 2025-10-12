import { betterAuth } from "better-auth";
import Database from "better-sqlite3";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { getDB } from "@/server/db/db";
export const auth = betterAuth({
  database: drizzleAdapter(getDB(), {
    provider: "sqlite",
  }),
});
