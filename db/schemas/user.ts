import { boolean, mysqlTable, timestamp, varchar } from "drizzle-orm/mysql-core";
import { v4 as uuidv4 } from "uuid";

export const users = mysqlTable("users", {
  id: varchar("id", { length: 36 })
    .$defaultFn(() => uuidv4())
    .primaryKey(),
  email: varchar("email", { length: 255 }).notNull().unique(),

  password: varchar("password", { length: 255 }).notNull(),

  displayName: varchar("display_name", { length: 50 }).notNull(),

  isActive: boolean("is_active").default(true),

  createdAt: timestamp("created_at", { mode: "date" }).defaultNow(),
  updatedAt: timestamp("updated_at", { mode: "date" }).defaultNow().onUpdateNow(),
});
