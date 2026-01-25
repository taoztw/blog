"use client";

import { PaginationComponent } from "@/components/pagination";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DataTable } from "@/components/ui/data-table";
import { Input } from "@/components/ui/input";
import { authClient } from "@/lib/auth/authClient";
import { Search, Shield, Trash2, User as UserIcon, Users } from "lucide-react";
import { useSearchParams } from "next/navigation";
import * as React from "react";
import { toast } from "sonner";
import { createUserColumns } from "./columns";
import { UserDetailsModal } from "./user-details-modal";

interface UserData {
  id: string;
  name: string;
  email: string;
  role: string;
  image: string | null;
  emailVerified: boolean;
  createdAt: Date;
  updatedAt: Date;
  banned?: boolean;
  banReason?: string | null;
  banExpires?: number | null;
}

export function UserTable() {
  const { data: session } = authClient.useSession();
  const searchParams = useSearchParams();
  const currentPage = parseInt(searchParams.get("page") || "1", 10);
  const pageSize = 10;
  const [search, setSearch] = React.useState("");
  const [debouncedSearch, setDebouncedSearch] = React.useState("");
  const [selectedUserId, setSelectedUserId] = React.useState<string | null>(null);
  const [userToDelete, setUserToDelete] = React.useState<UserData | null>(null);
  const [users, setUsers] = React.useState<UserData[]>([]);
  const [totalUsers, setTotalUsers] = React.useState(0);
  const [isLoading, setIsLoading] = React.useState(false);

  // Debounce search
  React.useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(search);
    }, 300);

    return () => clearTimeout(timer);
  }, [search]);

  // Fetch users using Better Auth admin API
  const fetchUsers = React.useCallback(async () => {
    setIsLoading(true);
    try {
      const { data, error } = await authClient.admin.listUsers({
        query: {
          limit: pageSize,
          offset: (currentPage - 1) * pageSize,
          searchValue: debouncedSearch || undefined,
          searchField: "email",
          searchOperator: "contains",
        },
      });

      if (error) {
        toast.error(error.message || "获取用户列表失败");
        return;
      }

      if (data) {
        setUsers(data.users as UserData[]);
        setTotalUsers(data.total);
      }
    } catch (error) {
      toast.error("获取用户列表失败");
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  }, [currentPage, debouncedSearch, pageSize]);

  React.useEffect(() => {
    void fetchUsers();
  }, [fetchUsers]);

  // Calculate user stats from the fetched users
  const userStats = React.useMemo(() => {
    const admins = users.filter((u) => u.role === "admin").length;
    const regularUsers = users.filter((u) => u.role === "user").length;
    return {
      total: totalUsers,
      admins,
      users: regularUsers,
    };
  }, [users, totalUsers]);

  const handleViewDetails = (user: UserData) => {
    setSelectedUserId(user.id);
  };

  const handleUpdateRole = async (user: UserData, newRole: string) => {
    try {
      const { error } = await authClient.admin.setRole({
        userId: user.id,
        role: newRole as "admin" | "user",
      });

      if (error) {
        toast.error(error.message || "更新角色失败");
        return;
      }

      toast.success(`用户 ${user.name || user.email} 的角色已更新为 ${newRole === "admin" ? "管理员" : "用户"}`);
      await fetchUsers();
    } catch (error) {
      toast.error("更新角色失败");
      console.error(error);
    }
  };

  const handleBanUser = async (user: UserData) => {
    try {
      const { error } = await authClient.admin.banUser({
        userId: user.id,
        banReason: "违反使用条款",
      });

      if (error) {
        toast.error(error.message || "封禁用户失败");
        return;
      }

      toast.success(`用户 ${user.name || user.email} 已被封禁`);
      await fetchUsers();
    } catch (error) {
      toast.error("封禁用户失败");
      console.error(error);
    }
  };

  const handleUnbanUser = async (user: UserData) => {
    try {
      const { error } = await authClient.admin.unbanUser({
        userId: user.id,
      });

      if (error) {
        toast.error(error.message || "解除封禁失败");
        return;
      }

      toast.success(`用户 ${user.name || user.email} 已解除封禁`);
      await fetchUsers();
    } catch (error) {
      toast.error("解除封禁失败");
      console.error(error);
    }
  };

  const handleDeleteUser = (user: UserData) => {
    setUserToDelete(user);
  };

  const confirmDeleteUser = async () => {
    if (!userToDelete) return;

    try {
      const { error } = await authClient.admin.removeUser({
        userId: userToDelete.id,
      });

      if (error) {
        toast.error(error.message || "删除用户失败");
        return;
      }

      toast.success("用户删除成功");
      setUserToDelete(null);
      await fetchUsers();
    } catch (error) {
      toast.error("删除用户失败");
      console.error(error);
    }
  };

  const columns = createUserColumns({
    onViewDetails: handleViewDetails,
    onUpdateRole: handleUpdateRole,
    onDelete: handleDeleteUser,
    onBanUser: handleBanUser,
    onUnbanUser: handleUnbanUser,
    currentUserId: session?.user?.id || "",
  });

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col space-y-4 md:flex-row md:items-center md:justify-between md:space-y-0">
        <div>
          <h1 className="text-2xl font-bold">用户管理</h1>
          <p className="text-muted-foreground">管理系统中的所有用户账户和权限</p>
        </div>
      </div>

      {/* Stats Cards */}
      {userStats && (
        <div className="grid gap-4 md:grid-cols-3">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">总用户数</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{userStats.total}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">管理员</CardTitle>
              <Shield className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{userStats.admins}</div>
              <div className="flex items-center">
                <Badge
                  variant="default"
                  className="text-xs"
                >
                  {userStats.total > 0 ? Math.round((userStats.admins / userStats.total) * 100) : 0}%
                </Badge>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">普通用户</CardTitle>
              <UserIcon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{userStats.users}</div>
              <div className="flex items-center">
                <Badge
                  variant="secondary"
                  className="text-xs"
                >
                  {userStats.total > 0 ? Math.round((userStats.users / userStats.total) * 100) : 0}%
                </Badge>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Search */}
      <div className="flex items-center space-x-2">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="搜索用户姓名或邮箱..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-8"
          />
        </div>
      </div>

      {/* Data Table */}
      <DataTable
        columns={columns}
        data={users}
        loading={isLoading}
      />

      {/* Pagination */}
      <PaginationComponent
        totalItems={totalUsers}
        itemsPerPage={pageSize}
        isLoading={isLoading}
      />

      {/* User Details Modal */}
      <UserDetailsModal
        userId={selectedUserId}
        open={!!selectedUserId}
        onOpenChange={(open) => {
          if (!open) setSelectedUserId(null);
        }}
      />

      {/* Delete Confirmation Dialog */}
      <AlertDialog
        open={!!userToDelete}
        onOpenChange={() => setUserToDelete(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>确认删除用户</AlertDialogTitle>
            <AlertDialogDescription>
              您确定要删除用户 &quot;{userToDelete?.name || userToDelete?.email}&quot; 吗？
              <br />
              <br />
              <span className="text-red-600 font-medium">此操作无法撤销，所有相关数据都将被永久删除。</span>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>取消</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDeleteUser}
              className="bg-red-600 hover:bg-red-700"
            >
              <Trash2 className="h-4 w-4 mr-2" />
              确认删除
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
