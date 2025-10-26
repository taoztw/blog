import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { authClient } from "@/lib/auth/authClient";

import { cn } from "@/lib/utils";
import { useRouter } from "next/navigation";
import { Spinner } from "../ui/spinner";

interface Props {
  id: string | null;
  name: string;
  imageUrl?: string | null;
  className?: string;
  fallbackClassName?: string;
}

const UserAvatarHeader = ({ id, name, imageUrl, className = "size-9", fallbackClassName }: Props) => {
  // 安全生成用户名字缩写
  const router = useRouter();
  const { data: session, isPending } = authClient.useSession();
  const initials = name
    ? name
        .trim()
        .split(/\s+/)
        .filter(Boolean)
        .map((word) => word[0]?.toUpperCase() ?? "")
        .join("")
        .slice(0, 2)
    : "";

  const handleLogout = async () => {
    await authClient.signOut({
      fetchOptions: {
        onSuccess: () => {
          router.push("/sign-in"); // redirect to login page
        },
      },
    });
  };

  if (isPending) {
    return <Spinner />;
  }

  return (
    <DropdownMenu modal={false}>
      <DropdownMenuTrigger asChild>
        <Avatar className={cn(className, "cursor-pointer size-7")}>
          {imageUrl ? (
            <AvatarImage src={imageUrl} alt={name} />
          ) : (
            <AvatarFallback
              className={cn(
                "primary-gradient font-bold tracking-wider dark:text-gray-300 text-black/80",
                fallbackClassName
              )}
            >
              {initials}
            </AvatarFallback>
          )}
        </Avatar>
      </DropdownMenuTrigger>

      <DropdownMenuContent className="w-48" align="end">
        <DropdownMenuLabel>{name}</DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={() => handleLogout()} className="cursor-pointer text-red-500">
          退出登录
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default UserAvatarHeader;
