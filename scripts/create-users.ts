#!/usr/bin/env tsx

import fs from "node:fs";
import path from "node:path";
import { drizzle } from "drizzle-orm/better-sqlite3";
import Database from "better-sqlite3";
import { users, accounts, ROLES_ENUM } from "../src/server/db/schema";
import bcrypt from "bcryptjs";
import { eq, and } from "drizzle-orm";

function getLocalD1DB() {
  console.log("Using local D1 database for development");
  try {
    const basePath = path.resolve(".wrangler/state/v3/d1");
    const dbFile = fs.readdirSync(basePath, { encoding: "utf-8", recursive: true }).find((f) => f.endsWith(".sqlite"));

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

// Database setup
const dbPath = getLocalD1DB();
if (!dbPath) {
  console.error("❌ 无法找到数据库文件");
  process.exit(1);
}

const sqlite = new Database(dbPath);
const db = drizzle(sqlite);

// Sample users data - modify this array to create the users you want
const usersToCreate = [
  // Already created users - commented out
  // {
  //   name: "张三",
  //   email: "zhangsan@example.com",
  //   password: "password123",
  //   role: ROLES_ENUM.USER,
  //   location: "北京",
  // },
  // {
  //   name: "李四",
  //   email: "lisi@example.com",
  //   password: "password123",
  //   role: ROLES_ENUM.USER,
  //   location: "上海",
  // },
  // {
  //   name: "王五",
  //   email: "wangwu@example.com",
  //   password: "password123",
  //   role: ROLES_ENUM.ADMIN,
  //   location: "广州",
  // },
  // {
  //   name: "赵六",
  //   email: "zhaoliu@example.com",
  //   password: "password123",
  //   role: ROLES_ENUM.USER,
  //   location: "深圳",
  // },
  // {
  //   name: "Admin User",
  //   email: "admin@example.com",
  //   password: "admin123",
  //   role: ROLES_ENUM.ADMIN,
  //   location: "杭州",
  // },

  // New test users
  {
    name: "测试用户1",
    email: "test1@example.com",
    password: "test123",
    role: ROLES_ENUM.USER,
    location: "成都",
  },
  {
    name: "测试用户2",
    email: "test2@example.com",
    password: "test123",
    role: ROLES_ENUM.USER,
    location: "武汉",
  },
  {
    name: "测试用户3",
    email: "test3@example.com",
    password: "test123",
    role: ROLES_ENUM.ADMIN,
    location: "西安",
  },
  {
    name: "测试用户4",
    email: "test4@example.com",
    password: "test123",
    role: ROLES_ENUM.USER,
    location: "重庆",
  },
  {
    name: "测试用户5",
    email: "test5@example.com",
    password: "test123",
    role: ROLES_ENUM.USER,
    location: "南京",
  },
  {
    name: "测试用户6",
    email: "test6@example.com",
    password: "test123",
    role: ROLES_ENUM.USER,
    location: "苏州",
  },
  {
    name: "测试用户7",
    email: "test7@example.com",
    password: "test123",
    role: ROLES_ENUM.ADMIN,
    location: "青岛",
  },
  {
    name: "测试用户8",
    email: "test8@example.com",
    password: "test123",
    role: ROLES_ENUM.USER,
    location: "大连",
  },
  {
    name: "测试用户9",
    email: "test9@example.com",
    password: "test123",
    role: ROLES_ENUM.USER,
    location: "厦门",
  },
  {
    name: "测试用户10",
    email: "test10@example.com",
    password: "test123",
    role: ROLES_ENUM.USER,
    location: "长沙",
  },
];

async function createUsers() {
  console.log("🚀 开始批量创建用户...\n");

  let successCount = 0;
  let failCount = 0;
  const failedUsers: string[] = [];

  for (const userData of usersToCreate) {
    try {
      const { name, email, password, role, location } = userData;

      // 检查用户是否已存在
      const existingAccount = await db
        .select()
        .from(accounts)
        .where(and(eq(accounts.providerAccountId, email), eq(accounts.provider, "credentials")))
        .limit(1);

      if (existingAccount.length > 0) {
        console.log(`❌ 用户 ${email} 已存在，跳过创建`);
        failCount++;
        failedUsers.push(email);
        continue;
      }

      // 加密密码
      const hashedPassword = await bcrypt.hash(password, 12);

      // 创建用户
      const [newUser] = await db
        .insert(users)
        .values({
          name,
          email,
          role,
          image: "",
          location: location || "",
        })
        .returning();

      if (!newUser) {
        throw new Error("创建用户失败");
      }

      // 创建账户
      await db.insert(accounts).values({
        userId: newUser.id,
        type: "email",
        provider: "credentials",
        providerAccountId: email,
        name,
        image: "",
        password: hashedPassword,
      });

      console.log(`✅ 成功创建用户: ${name} (${email}) - 角色: ${role}`);
      successCount++;
    } catch (error) {
      console.log(`❌ 创建用户失败: ${userData.email} - 错误: ${error instanceof Error ? error.message : "未知错误"}`);
      failCount++;
      failedUsers.push(userData.email);
    }
  }

  console.log("\n📊 批量创建结果:");
  console.log(`✅ 成功创建: ${successCount} 个用户`);
  console.log(`❌ 创建失败: ${failCount} 个用户`);

  if (failedUsers.length > 0) {
    console.log(`失败的用户: ${failedUsers.join(", ")}`);
  }

  console.log("\n🎉 批量创建完成!");

  // 关闭数据库连接
  sqlite.close();
}

// 运行脚本
createUsers().catch((error) => {
  console.error("❌ 脚本执行失败:", error);
  process.exit(1);
});
