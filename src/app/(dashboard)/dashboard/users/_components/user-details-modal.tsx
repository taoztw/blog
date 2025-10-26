"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { authClient } from "@/lib/auth/authClient";
import { Ban, CalendarDays, CheckCircle, Mail, Shield, User } from "lucide-react";
import * as React from "react";
import { toast } from "sonner";

interface UserDetailsModalProps {
  userId: string | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

interface UserDetails {
  id: string;
  name: string;
  email: string;
  emailVerified: boolean;
  image: string | null;
  role: string;
  banned?: boolean;
  banReason?: string | null;
  banExpires?: number | null;
  createdAt: Date;
  updatedAt: Date;
}

export function UserDetailsModal({ userId, open, onOpenChange }: UserDetailsModalProps) {
  const [userDetails, setUserDetails] = React.useState<UserDetails | null>(null);
  const [isLoading, setIsLoading] = React.useState(false);

  React.useEffect(() => {
    if (!userId || !open) return;

    const fetchUserDetails = async () => {
      setIsLoading(true);
      try {
        const { data, error } = await authClient.admin.listUsers({
          query: {
            filterField: "id",
            filterValue: userId,
            filterOperator: "eq",
            limit: 1,
          },
        });

        if (error) {
          toast.error("获取用户详情失败");
          return;
        }

        if (data && data.users.length > 0) {
          setUserDetails(data.users[0] as UserDetails);
        }
      } catch (error) {
        toast.error("获取用户详情失败");
        console.error(error);
      } finally {
        setIsLoading(false);
      }
    };

    void fetchUserDetails();
  }, [userId, open]);

  if (!userId) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>用户详细信息</DialogTitle>
          <DialogDescription>查看用户的账户信息和相关数据</DialogDescription>
        </DialogHeader>

        {isLoading ? (
          <div className="space-y-4">
            <div className="flex items-center space-x-4">
              <Skeleton className="h-16 w-16 rounded-full" />
              <div className="space-y-2">
                <Skeleton className="h-4 w-32" />
                <Skeleton className="h-3 w-48" />
              </div>
            </div>
            <Skeleton className="h-20 w-full" />
          </div>
        ) : userDetails ? (
          <div className="space-y-6">
            {/* User Basic Info */}
            <div className="flex items-start space-x-4">
              <Avatar className="h-16 w-16">
                <AvatarImage src={userDetails.image || ""} alt={userDetails.name || ""} />
                <AvatarFallback className="text-lg">
                  {userDetails.name
                    ? userDetails.name.charAt(0).toUpperCase()
                    : userDetails.email.charAt(0).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 space-y-2">
                <div className="flex items-center space-x-2">
                  <h3 className="text-xl font-semibold">{userDetails.name || "未设置姓名"}</h3>
                  <Badge variant={userDetails.role === "admin" ? "default" : "secondary"}>
                    {userDetails.role === "admin" ? (
                      <>
                        <Shield className="h-3 w-3 mr-1" />
                        管理员
                      </>
                    ) : (
                      <>
                        <User className="h-3 w-3 mr-1" />
                        用户
                      </>
                    )}
                  </Badge>
                  {userDetails.banned && (
                    <Badge variant="destructive">
                      <Ban className="h-3 w-3 mr-1" />
                      已封禁
                    </Badge>
                  )}
                </div>
                <div className="flex items-center space-x-1 text-muted-foreground">
                  <Mail className="h-4 w-4" />
                  <span>{userDetails.email}</span>
                  {userDetails.emailVerified && <CheckCircle className="h-4 w-4 text-green-500 ml-1" />}
                </div>
              </div>
            </div>

            <Separator />

            {/* Account Information */}
            <div className="space-y-4">
              <h4 className="text-lg font-semibold">账户信息</h4>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div className="space-y-1">
                  <span className="text-muted-foreground">用户 ID</span>
                  <p className="font-mono text-xs bg-muted p-2 rounded">{userDetails.id}</p>
                </div>
                <div className="space-y-1">
                  <span className="text-muted-foreground">角色</span>
                  <p>{userDetails.role === "admin" ? "管理员" : "普通用户"}</p>
                </div>
                <div className="space-y-1">
                  <span className="text-muted-foreground">邮箱验证</span>
                  <p>{userDetails.emailVerified ? "已验证" : "未验证"}</p>
                </div>
                <div className="space-y-1">
                  <span className="text-muted-foreground">账户状态</span>
                  <p>{userDetails.banned ? "已封禁" : "正常"}</p>
                </div>
                <div className="space-y-1">
                  <span className="text-muted-foreground">注册时间</span>
                  <div className="flex items-center space-x-1">
                    <CalendarDays className="h-4 w-4" />
                    <span>{new Date(userDetails.createdAt).toLocaleString("zh-CN")}</span>
                  </div>
                </div>
                <div className="space-y-1">
                  <span className="text-muted-foreground">最后更新</span>
                  <div className="flex items-center space-x-1">
                    <CalendarDays className="h-4 w-4" />
                    <span>{new Date(userDetails.updatedAt).toLocaleString("zh-CN")}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Ban Information */}
            {userDetails.banned && (
              <>
                <Separator />
                <div className="space-y-4">
                  <h4 className="text-lg font-semibold text-red-600">封禁信息</h4>
                  <div className="grid grid-cols-1 gap-4 text-sm">
                    {userDetails.banReason && (
                      <div className="space-y-1">
                        <span className="text-muted-foreground">封禁原因</span>
                        <p className="bg-red-50 p-2 rounded border border-red-200">{userDetails.banReason}</p>
                      </div>
                    )}
                    {userDetails.banExpires && (
                      <div className="space-y-1">
                        <span className="text-muted-foreground">封禁到期时间</span>
                        <p>{new Date(userDetails.banExpires).toLocaleString("zh-CN")}</p>
                      </div>
                    )}
                  </div>
                </div>
              </>
            )}
          </div>
        ) : (
          <div className="text-center py-8">
            <p className="text-muted-foreground">无法加载用户信息</p>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
