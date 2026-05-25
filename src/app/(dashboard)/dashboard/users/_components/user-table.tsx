"use client";

import * as React from "react";
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
import { DataTable } from "@/components/data-table/data-table";
import { DataTableToolbar } from "@/components/data-table/data-table-toolbar";
import { DataTableSkeleton } from "@/components/data-table/data-table-skeleton";
import { useDataTable } from "@/hooks/use-data-table";
import { authClient } from "@/lib/auth/authClient";
import { Trash2 } from "lucide-react";
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
  const [selectedUserId, setSelectedUserId] = React.useState<string | null>(null);
  const [userToDelete, setUserToDelete] = React.useState<UserData | null>(null);
  const [users, setUsers] = React.useState<UserData[]>([]);
  const [totalUsers, setTotalUsers] = React.useState(0);
  const [isLoading, setIsLoading] = React.useState(false);

  const fetchUsers = React.useCallback(async () => {
    setIsLoading(true);
    try {
      const { data, error } = await authClient.admin.listUsers({
        query: {
          limit: 100,
          offset: 0,
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
  }, []);

  React.useEffect(() => {
    void fetchUsers();
  }, [fetchUsers]);

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

  const columns = React.useMemo(
    () =>
      createUserColumns({
        onViewDetails: handleViewDetails,
        onUpdateRole: handleUpdateRole,
        onDelete: handleDeleteUser,
        onBanUser: handleBanUser,
        onUnbanUser: handleUnbanUser,
        currentUserId: session?.user?.id || "",
      }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [session?.user?.id],
  );

  const { table } = useDataTable({
    data: users,
    columns,
  });

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col space-y-4 md:flex-row md:items-center md:justify-between md:space-y-0">
        <div>
          <h1 className="text-2xl font-bold">用户管理</h1>
          <p className="text-muted-foreground">
            共 {userStats.total} 位用户 · {userStats.admins} 管理员 · {userStats.users} 普通用户
          </p>
        </div>
      </div>

      {/* Data Table */}
      {isLoading && users.length === 0 ? (
        <DataTableSkeleton columnCount={6} rowCount={10} filterCount={2} />
      ) : (
        <DataTable table={table}>
          <DataTableToolbar table={table} />
        </DataTable>
      )}

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
            <AlertDialogAction onClick={confirmDeleteUser} className="bg-red-600 hover:bg-red-700">
              <Trash2 className="h-4 w-4 mr-2" />
              确认删除
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
