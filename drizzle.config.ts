import fs from "node:fs";
import path from "node:path";
import type { Config } from "drizzle-kit";

import { env } from "@/env";

function getLocalD1DB() {
	console.log("Using local D1 database for development");
	try {
		const basePath = path.resolve(".wrangler/state/v3/d1");
		const dbFile = fs.readdirSync(basePath, { encoding: "utf-8", recursive: true }).find(f => f.endsWith(".sqlite"));

		if (!dbFile) {
			throw new Error(`.sqlite file not found in ${basePath}`);
		}

		const url = path.resolve(basePath, dbFile);
		return url;
	} catch (err) {
		console.error(err);

		return null;
	}
}

export default {
	schema: "./src/server/db/schema.ts",
	out: "./migrations",
	dialect: "sqlite",
	...(env.NODE_ENV === "production"
		? {
				driver: "d1-http",
				dbCredentials: {
					accountId: env.CLOUDFLARE_ACCOUNT_ID,
					databaseId: env.CLOUDFLARE_D1_DATABASE_ID,
					token: env.CLOUDFLARE_TOKEN
				}
		  }
		: {
				dbCredentials: {
					url: getLocalD1DB()
				}
		  }),

	tablesFilter: ["blog_*"]
} satisfies Config;
