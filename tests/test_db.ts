import "dotenv/config";
import { drizzle } from "drizzle-orm/mysql2";
import { users } from "@/db/schemas/user";
import { exit } from "process";

const db = drizzle(process.env.DATABASE_URL!);

async function main() {
  const user: typeof users.$inferInsert = {
    displayName: "taozhu",
    email: "john@example.com",
    password: "password123",
    isActive: true,
  };
  await db.insert(users).values(user);
  console.log("New user created!");
  //   const allUsers = await db.select().from(users);
  //   console.log("Getting all users from the database: ", allUsers);

  //   console.log("User info updated!");
  //   await db.delete(users).where(eq(users.email, user.email));
  //   console.log("User deleted!");
  exit(0);
}
main();
