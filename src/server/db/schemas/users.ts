import { relations } from "drizzle-orm";
import { index, text, sqliteTable, primaryKey } from "drizzle-orm/sqlite-core";
import type { AdapterAccount } from "next-auth/adapters";
import { createSelectSchema } from "drizzle-zod";
import { roleTuple, ROLES_ENUM } from "./enums";
import { commonColumns } from "./common";

export const users = sqliteTable(
  "user",
  {
    id: text("id", { length: 255 })
      .notNull()
      .primaryKey()
      .$defaultFn(() => crypto.randomUUID()),
    name: text("name", { length: 255 }),
    email: text("email", { length: 255 }).notNull(),
    role: text("role", { enum: roleTuple }).default(ROLES_ENUM.USER).notNull(),
    image: text("image", { length: 255 }),
    location: text("location", { length: 255 }),
    ...commonColumns,
  },
  (table) => [index("email_idx").on(table.email)]
);

export const userSelectSchema = createSelectSchema(users).omit({
  updateCounter: true,
});

export const accounts = sqliteTable(
  "account",
  {
    userId: text("user_id", { length: 255 })
      .notNull()
      .references(() => users.id),
    type: text("type", { length: 255 }).$type<AdapterAccount["type"]>().notNull(),
    provider: text("provider", { length: 255 }).notNull(),
    providerAccountId: text("provider_account_id", { length: 255 }).notNull(),
    name: text("name", { length: 255 }).notNull(),
    image: text("image", { length: 255 }),
    password: text("password", { length: 300 }),
    ...commonColumns,
  },
  (t) => [
    primaryKey({
      columns: [t.provider, t.providerAccountId],
    }),
    index("account_user_id_idx").on(t.userId),
  ]
);

export const usersRelations = relations(users, ({ many }) => ({
  accounts: many(accounts),
}));

export const accountsRelations = relations(accounts, ({ one }) => ({
  user: one(users, { fields: [accounts.userId], references: [users.id] }),
}));