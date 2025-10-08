"use client";

import * as React from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { CalendarDays, Mail, MapPin, Shield, User, ExternalLink } from "lucide-react";
import { api } from "@/trpc/react";
import { Skeleton } from "@/components/ui/skeleton";
import { ROLES_ENUM } from "@/server/db/schema";

interface UserDetailsModalProps {
  userId: string | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function UserDetailsModal({ userId, open, onOpenChange }: UserDetailsModalProps) {
  const { data: userDetails, isLoading } = api.user.getById.useQuery({ id: userId! }, { enabled: !!userId && open });

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
                  <Badge variant={userDetails.role === ROLES_ENUM.ADMIN ? "default" : "secondary"}>
                    {userDetails.role === ROLES_ENUM.ADMIN ? (
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
                </div>
                <div className="flex items-center space-x-1 text-muted-foreground">
                  <Mail className="h-4 w-4" />
                  <span>{userDetails.email}</span>
                </div>
                {userDetails.location && (
                  <div className="flex items-center space-x-1 text-muted-foreground">
                    <MapPin className="h-4 w-4" />
                    <span>{userDetails.location}</span>
                  </div>
                )}
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
                  <p>{userDetails.role === ROLES_ENUM.ADMIN ? "管理员" : "普通用户"}</p>
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

            {/* Linked Accounts */}
            {userDetails.accounts && userDetails.accounts.length > 0 && (
              <>
                <Separator />
                <div className="space-y-4">
                  <h4 className="text-lg font-semibold">关联账户</h4>
                  <div className="space-y-2">
                    {userDetails.accounts.map((account, index) => (
                      <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                        <div className="flex items-center space-x-3">
                          <div className="h-8 w-8 bg-muted rounded-full flex items-center justify-center">
                            <ExternalLink className="h-4 w-4" />
                          </div>
                          <div>
                            <p className="font-medium capitalize">{account.provider}</p>
                            <p className="text-sm text-muted-foreground">{account.type}</p>
                          </div>
                        </div>
                        <div className="text-right text-sm text-muted-foreground">
                          <p>关联于</p>
                          <p>{new Date(account.createdAt).toLocaleDateString("zh-CN")}</p>
                        </div>
                      </div>
                    ))}
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
