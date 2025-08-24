"use client";

import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";
import { Avatar, AvatarImage, AvatarFallback } from "../ui/avatar";
import { useEffect, useState } from "react";

const avatarVariants = cva("", {
  variants: {
    size: {
      default: "w-9 h-9",
      xs: "h-4 w-4 rounded-full",
      sm: "h-6 w-6",
      base: "h-8 w-8",
      lg: "h-10 w-10",
      xl: "h-[160px] w-[160px]",
    },
  },
  defaultVariants: {
    size: "default",
  },
});

const gradientColors = [
  "from-green-400 to-blue-500",
  "from-purple-400 to-pink-500",
  "from-yellow-400 to-orange-500",
  "from-blue-400 to-purple-500",
  "from-pink-400 to-red-500",
  "from-indigo-400 to-cyan-500",
  "from-teal-400 to-green-500",
  "from-orange-400 to-red-500",
  "from-cyan-400 to-blue-500",
  "from-rose-400 to-pink-500",
];

function stableAvatar(name?: string) {
  if (!name || name.trim() === "") {
    return { gradient: gradientColors[0], initial: "A" }; // SSR 给一个固定值
  }
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = (hash << 5) - hash + name.charCodeAt(i);
    hash |= 0;
  }
  const colorIndex = Math.abs(hash) % gradientColors.length;
  return { gradient: gradientColors[colorIndex], initial: name.charAt(0).toUpperCase() };
}

function randomAvatar() {
  const randomLetter = String.fromCharCode(65 + Math.floor(Math.random() * 26));
  const randomColorIndex = Math.floor(Math.random() * gradientColors.length);
  return { gradient: gradientColors[randomColorIndex], initial: randomLetter };
}

interface UserAvatarProps extends VariantProps<typeof avatarVariants> {
  imgUrl?: string;
  name?: string;
  className?: string;
  onClick?: () => void;
}

export const UserAvatar = ({ imgUrl, name, className, onClick, size }: UserAvatarProps) => {
  // 初始为稳定值（SSR / CSR 一致）
  const [avatar, setAvatar] = useState(() => stableAvatar(name));

  // 客户端挂载后再生成随机值（只影响首次 paint 之后的更新，不触发 hydration error）
  useEffect(() => {
    if (!name || name.trim() === "") {
      setAvatar(randomAvatar());
    }
  }, [name]);

  return (
    <Avatar className={cn(avatarVariants({ size }), className)} onClick={onClick}>
      {imgUrl && <AvatarImage src={imgUrl || "/placeholder.svg"} alt={name || "Anonymous"} />}
      <AvatarFallback
        className={`bg-gradient-to-br ${avatar.gradient} text-white font-medium flex items-center justify-center`}
      >
        {avatar.initial}
      </AvatarFallback>
    </Avatar>
  );
};
