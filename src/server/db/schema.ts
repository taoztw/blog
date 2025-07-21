import { relations, sql } from "drizzle-orm";
import { index, mysqlTableCreator, primaryKey } from "drizzle-orm/mysql-core";
import type { AdapterAccount } from "next-auth/adapters";

/**
 * This is an example of how to use the multi-project schema feature of Drizzle ORM. Use the same
 * database instance for multiple projects.
 *
 * @see https://orm.drizzle.team/docs/goodies#multi-project-schema
 */
export const createTable = mysqlTableCreator(name => `blog_${name}`);

export const posts = createTable(
	"post",
	d => ({
		id: d.bigint({ mode: "number" }).primaryKey().autoincrement(),
		name: d.varchar({ length: 256 }),
		createdById: d
			.varchar({ length: 255 })
			.notNull()
			.references(() => users.id),
		createdAt: d
			.timestamp()
			.default(sql`CURRENT_TIMESTAMP`)
			.notNull(),
		updatedAt: d.timestamp().onUpdateNow()
	}),
	t => [index("created_by_idx").on(t.createdById), index("name_idx").on(t.name)]
);

export const users = createTable("user", d => ({
	id: d
		.varchar({ length: 255 })
		.notNull()
		.primaryKey()
		.$defaultFn(() => crypto.randomUUID()),
	name: d.varchar({ length: 255 }),
	email: d.varchar({ length: 255 }).notNull(),
	image: d.varchar({ length: 255 }),
	location: d.varchar({ length: 255 })
}));

export const usersRelations = relations(users, ({ many }) => ({
	accounts: many(accounts)
}));

export const accounts = createTable(
	"account",
	d => ({
		userId: d
			.varchar({ length: 255 })
			.notNull()
			.references(() => users.id),
		type: d.varchar({ length: 255 }).$type<AdapterAccount["type"]>().notNull(),
		provider: d.varchar({ length: 255 }).notNull(),
		providerAccountId: d.varchar({ length: 255 }).notNull(),
		name: d.varchar({ length: 255 }).notNull(),
		image: d.varchar({ length: 255 }),
		password: d.varchar({ length: 300 })
		// refresh_token: d.text(),
		// access_token: d.text(),
		// expires_at: d.int(),
		// token_type: d.varchar({ length: 255 }),
		// scope: d.varchar({ length: 255 }),
		// id_token: d.text(),
		// session_state: d.varchar({ length: 255 })
	}),
	t => [
		primaryKey({
			columns: [t.provider, t.providerAccountId]
		}),
		index("account_user_id_idx").on(t.userId)
	]
);

export const accountsRelations = relations(accounts, ({ one }) => ({
	user: one(users, { fields: [accounts.userId], references: [users.id] })
}));
