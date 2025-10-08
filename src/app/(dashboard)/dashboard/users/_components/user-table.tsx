"use client";

import * as React from "react";
import { useSearchParams } from "next/navigation";
import { DataTable } from "@/components/dashboard/data-table";
import { api } from "@/trpc/react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { PaginationComponent } from "@/components/ui_custom/pagination";
import { createUserColumns } from "./columns";
import { UserDetailsModal } from "./user-details-modal";
import { toast } from "sonner";
import { Search, Users, Shield, User as UserIcon, Trash2 } from "lucide-react";
import { useSession } from "next-auth/react";
import { Badge } from "@/components/ui/badge";
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

interface UserData {
  id: string;
  name: string | null;
  email: string;
  role: string;
  image: string | null;
  location: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export function UserTable() {
  const { data: session } = useSession();
  const searchParams = useSearchParams();
  const currentPage = parseInt(searchParams.get("page") || "1", 10);
  const [search, setSearch] = React.useState("");
  const [debouncedSearch, setDebouncedSearch] = React.useState("");
  const [selectedUserId, setSelectedUserId] = React.useState<string | null>(null);
  const [userToDelete, setUserToDelete] = React.useState<UserData | null>(null);

  const utils = api.useUtils();

  // Debounce search
  React.useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(search);
    }, 300);

    return () => clearTimeout(timer);
  }, [search]);

  const { data: usersData, isFetching } = api.user.getAll.useQuery({
    page: currentPage,
    pageSize: 10,
    search: debouncedSearch || undefined,
  });

  const { data: userStats } = api.user.getStats.useQuery();

  const updateRoleMutation = api.user.updateRole.useMutation({
    onSuccess: (updatedUser) => {
      utils.user.getAll.invalidate();
      utils.user.getStats.invalidate();
      toast.success(
        `用户 ${updatedUser.name || updatedUser.email} 的角色已更新为 ${updatedUser.role === "admin" ? "管理员" : "用户"}`
      );
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  const deleteUserMutation = api.user.deleteUser.useMutation({
    onSuccess: () => {
      utils.user.getAll.invalidate();
      utils.user.getStats.invalidate();
      toast.success("用户删除成功");
      setUserToDelete(null);
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  const handleViewDetails = (user: UserData) => {
    setSelectedUserId(user.id);
  };

  const handleUpdateRole = (user: UserData, newRole: string) => {
    updateRoleMutation.mutate({ id: user.id, role: newRole as "admin" | "user" });
  };

  const handleDeleteUser = (user: UserData) => {
    setUserToDelete(user);
  };

  const confirmDeleteUser = () => {
    if (userToDelete) {
      deleteUserMutation.mutate({ id: userToDelete.id });
    }
  };

  const columns = createUserColumns({
    onViewDetails: handleViewDetails,
    onUpdateRole: handleUpdateRole,
    onDelete: handleDeleteUser,
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
                <Badge variant="default" className="text-xs">
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
                <Badge variant="secondary" className="text-xs">
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
      <DataTable columns={columns} data={usersData?.users ?? []} loading={isFetching} />

      {/* Pagination */}
      <PaginationComponent totalItems={usersData?.total ?? 0} itemsPerPage={10} isLoading={isFetching} />

      {/* User Details Modal */}
      <UserDetailsModal
        userId={selectedUserId}
        open={!!selectedUserId}
        onOpenChange={(open) => {
          if (!open) setSelectedUserId(null);
        }}
      />

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={!!userToDelete} onOpenChange={() => setUserToDelete(null)}>
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
              disabled={deleteUserMutation.isPending}
            >
              {deleteUserMutation.isPending ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                  删除中...
                </>
              ) : (
                <>
                  <Trash2 className="h-4 w-4 mr-2" />
                  确认删除
                </>
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
