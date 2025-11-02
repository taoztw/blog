import { getCloudflareContext } from "@opennextjs/cloudflare";
import type { DrizzleD1Database } from "drizzle-orm/d1";
import { drizzle } from "drizzle-orm/d1";
import { cache } from "react";
import * as schema from "./schema";

/**
 * Cache the database connection in development. This avoids creating a new connection on every HMR
 * update.
 */

export let db: DrizzleD1Database<typeof schema> | null = null;

export const getDB = cache(async () => {
  if (db) {
    return db;
  }

  const { env: cf_env } = await getCloudflareContext({ async: true });

  if (!cf_env.DB) {
    throw new Error("D1 database not found");
  }

  db = drizzle(cf_env.DB, { schema });

  return db;
});
