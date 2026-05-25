"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { authClient } from "@/lib/auth/authClient";
import { api } from "@/trpc/react";
import { formatDistanceToNow } from "date-fns";
import { zhCN } from "date-fns/locale";
import { ArrowRight, Eye, FileText, MessageSquare, Users } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";

interface UserSummary {
  id: string;
  name: string;
  email: string;
  image: string | null;
  role: string | null | undefined;
  createdAt: Date;
}

export default function AdminDashboard() {
  const { data: stats, isLoading: statsLoading } = api.post.getStatistics.useQuery();
  const { data: recentPosts, isLoading: postsLoading } = api.post.getRecent.useQuery({ limit: 5 });
  const { data: recentComments, isLoading: commentsLoading } = api.comment.getRecent.useQuery({ limit: 5 });

  const [users, setUsers] = useState<UserSummary[]>([]);
  const [totalUsers, setTotalUsers] = useState<number | null>(null);
  const [usersLoading, setUsersLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const { data } = await authClient.admin.listUsers({
          query: { limit: 5, sortBy: "createdAt", sortDirection: "desc" },
        });
        if (data) {
          setUsers(
            data.users.map((u) => ({
              id: u.id,
              name: u.name,
              email: u.email,
              image: u.image ?? null,
              role: u.role,
              createdAt: new Date(u.createdAt),
            }))
          );
          setTotalUsers(data.total);
        }
      } finally {
        setUsersLoading(false);
      }
    }
    void load();
  }, []);

  return (
    <div className="flex flex-1 flex-col gap-4 p-4 sm:p-6">
      <div className="mx-auto w-full max-w-6xl space-y-6">
        <div>
          <h1 className="font-bold text-2xl tracking-tight sm:text-3xl">欢迎回来</h1>
          <p className="text-muted-foreground text-sm sm:text-base">这里是你博客的概览</p>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <StatCard title="总文章数" value={stats?.totalPosts ?? null} icon={FileText} loading={statsLoading} />
          <StatCard title="总浏览量" value={stats?.totalViews ?? null} icon={Eye} loading={statsLoading} />
          <StatCard title="用户总数" value={totalUsers} icon={Users} loading={usersLoading} />
        </div>

        <div className="grid grid-cols-1 gap-4 xl:grid-cols-3">
          <div className="space-y-4 xl:col-span-2">
            <RecentPostsCard posts={recentPosts} loading={postsLoading} />
            <RecentCommentsCard comments={recentComments} loading={commentsLoading} />
          </div>
          <div>
            <RecentUsersCard users={users} loading={usersLoading} />
          </div>
        </div>
      </div>
    </div>
  );
}

function StatCard({
  title,
  value,
  icon: Icon,
  loading,
}: {
  title: string;
  value: number | null;
  icon: React.ComponentType<{ className?: string }>;
  loading: boolean;
}) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0">
        <CardTitle className="font-medium text-sm">{title}</CardTitle>
        <Icon className="h-4 w-4 text-muted-foreground" />
      </CardHeader>
      <CardContent>
        {loading ? (
          <Skeleton className="h-8 w-24" />
        ) : (
          <div className="font-bold text-2xl tabular-nums">{(value ?? 0).toLocaleString()}</div>
        )}
      </CardContent>
    </Card>
  );
}

function RecentPostsCard({
  posts,
  loading,
}: {
  posts: { id: string; title: string; slug: string; createdAt: Date }[] | undefined;
  loading: boolean;
}) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-start justify-between space-y-0">
        <div className="space-y-1">
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-4 w-4" />
            最近发布
          </CardTitle>
          <CardDescription>已发布的最新文章</CardDescription>
        </div>
        <Button asChild variant="ghost" size="sm">
          <Link href="/dashboard/posts">
            查看全部 <ArrowRight className="ml-1 h-3 w-3" />
          </Link>
        </Button>
      </CardHeader>
      <CardContent>
        {loading ? (
          <ListSkeleton rows={5} />
        ) : !posts || posts.length === 0 ? (
          <EmptyState text="还没有发布的文章" />
        ) : (
          <ul className="divide-y divide-border">
            {posts.map((p) => (
              <li key={p.id} className="flex items-center justify-between gap-3 py-3 first:pt-0 last:pb-0">
                <Link
                  href={`/blog/${p.slug}`}
                  className="line-clamp-1 flex-1 font-medium text-sm transition-colors hover:text-seal"
                >
                  {p.title}
                </Link>
                <span className="whitespace-nowrap text-muted-foreground text-xs">
                  {formatDistanceToNow(p.createdAt, { addSuffix: true, locale: zhCN })}
                </span>
              </li>
            ))}
          </ul>
        )}
      </CardContent>
    </Card>
  );
}

function RecentCommentsCard({
  comments,
  loading,
}: {
  comments:
    | {
        id: string;
        content: string;
        createdAt: Date;
        postId: string;
        postTitle: string;
        postSlug: string;
        user: { id: string; name: string; image: string | null };
      }[]
    | undefined;
  loading: boolean;
}) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <MessageSquare className="h-4 w-4" />
          最近评论
        </CardTitle>
        <CardDescription>用户最近留下的评论</CardDescription>
      </CardHeader>
      <CardContent>
        {loading ? (
          <ListSkeleton rows={4} avatar />
        ) : !comments || comments.length === 0 ? (
          <EmptyState text="还没有评论" />
        ) : (
          <ul className="space-y-4">
            {comments.map((c) => (
              <li key={c.id} className="flex gap-3">
                <Avatar className="h-8 w-8 shrink-0">
                  <AvatarImage src={c.user.image ?? undefined} alt={c.user.name} />
                  <AvatarFallback>{c.user.name?.[0]?.toUpperCase() ?? "U"}</AvatarFallback>
                </Avatar>
                <div className="min-w-0 flex-1 space-y-1">
                  <div className="flex flex-wrap items-center gap-x-2 text-sm">
                    <span className="font-medium">{c.user.name}</span>
                    <span className="text-muted-foreground text-xs">在</span>
                    <Link
                      href={`/blog/${c.postSlug}`}
                      className="line-clamp-1 text-muted-foreground text-xs transition-colors hover:text-seal"
                    >
                      {c.postTitle}
                    </Link>
                  </div>
                  <p className="line-clamp-2 text-ink-700 text-sm">{c.content}</p>
                  <span className="text-muted-foreground text-xs">
                    {formatDistanceToNow(c.createdAt, { addSuffix: true, locale: zhCN })}
                  </span>
                </div>
              </li>
            ))}
          </ul>
        )}
      </CardContent>
    </Card>
  );
}

function RecentUsersCard({ users, loading }: { users: UserSummary[]; loading: boolean }) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-start justify-between space-y-0">
        <div className="space-y-1">
          <CardTitle className="flex items-center gap-2">
            <Users className="h-4 w-4" />
            最近用户
          </CardTitle>
          <CardDescription>新加入的用户</CardDescription>
        </div>
        <Button asChild variant="ghost" size="sm">
          <Link href="/dashboard/users">
            查看 <ArrowRight className="ml-1 h-3 w-3" />
          </Link>
        </Button>
      </CardHeader>
      <CardContent>
        {loading ? (
          <ListSkeleton rows={5} avatar />
        ) : users.length === 0 ? (
          <EmptyState text="还没有用户" />
        ) : (
          <ul className="space-y-3">
            {users.map((u) => (
              <li key={u.id} className="flex items-center gap-3">
                <Avatar className="h-9 w-9 shrink-0">
                  <AvatarImage src={u.image ?? undefined} alt={u.name} />
                  <AvatarFallback>{u.name?.[0]?.toUpperCase() ?? "U"}</AvatarFallback>
                </Avatar>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <span className="line-clamp-1 font-medium text-sm">{u.name}</span>
                    {u.role === "admin" && (
                      <Badge variant="outline" className="h-4 px-1 text-[10px]">
                        admin
                      </Badge>
                    )}
                  </div>
                  <p className="line-clamp-1 text-muted-foreground text-xs">{u.email}</p>
                </div>
                <span className="whitespace-nowrap text-muted-foreground text-xs">
                  {formatDistanceToNow(u.createdAt, { addSuffix: true, locale: zhCN })}
                </span>
              </li>
            ))}
          </ul>
        )}
      </CardContent>
    </Card>
  );
}

function ListSkeleton({ rows, avatar }: { rows: number; avatar?: boolean }) {
  return (
    <ul className="space-y-3">
      {Array.from({ length: rows }).map((_, i) => (
        <li key={i} className="flex items-center gap-3">
          {avatar && <Skeleton className="h-8 w-8 shrink-0 rounded-full" />}
          <div className="flex-1 space-y-1.5">
            <Skeleton className="h-4 w-3/4" />
            <Skeleton className="h-3 w-1/3" />
          </div>
        </li>
      ))}
    </ul>
  );
}

function EmptyState({ text }: { text: string }) {
  return <div className="flex h-24 items-center justify-center text-muted-foreground text-sm">{text}</div>;
}
