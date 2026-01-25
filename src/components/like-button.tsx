"use client";

import { Button } from "@/components/ui/button";
import { api } from "@/trpc/react";
import { AnimatePresence, motion } from "framer-motion";
import Image from "next/image";
import { useEffect, useRef, useState } from "react";

interface LikeButtonProps {
  initialCount: number;
  postId: string;
}

export function LikeButton({ initialCount, postId }: LikeButtonProps) {
  if (!initialCount || initialCount < 0) initialCount = 0;
  const [count, setCount] = useState(initialCount);
  const [pendingLikes, setPendingLikes] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);
  const [floaters, setFloaters] = useState<{ id: number }[]>([]);
  const postLike = api.post.postLike.useMutation();
  const sendLikesToServer = (count: number, postId: string) => {
    setTimeout(() => {
      console.log("✅ 点赞成功");
      postLike.mutate({ postId, count });
    }, 500);
  };

  const debounceRef = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  const floaterIdRef = useRef(0);

  // 发送请求（防抖）
  useEffect(() => {
    if (pendingLikes > 0) {
      if (debounceRef.current) clearTimeout(debounceRef.current);

      debounceRef.current = setTimeout(async () => {
        const likesToSend = pendingLikes;
        setPendingLikes(0);
        try {
          sendLikesToServer(count, postId);
        } catch (err) {
          console.error("❌ 点赞失败", err);
          setCount((prev) => prev - likesToSend); // 回滚
        }
      }, 500);
    }
  }, [pendingLikes]);

  const handleLike = () => {
    setCount((prev) => prev + 1);
    setPendingLikes((prev) => prev + 1);

    // 缩放动画
    setIsAnimating(true);
    setTimeout(() => setIsAnimating(false), 200);

    // 添加漂浮 +1
    const id = floaterIdRef.current++;
    setFloaters((prev) => [...prev, { id }]);
    setTimeout(() => {
      setFloaters((prev) => prev.filter((f) => f.id !== id));
    }, 800);
  };

  return (
    <div className="relative flex items-center">
      <div className="relative">
        <Button
          variant="ghost"
          size="sm"
          onClick={handleLike}
          className="bg-none px-1"
        >
          <motion.div
            animate={{ scale: isAnimating ? 1.4 : 1 }}
            transition={{ type: "spring", stiffness: 400, damping: 10 }}
            whileTap={{ scale: 0.9 }}
            whileHover={{ scale: 1.2 }}
          >
            <Image
              src="/thirds/clap-svgrepo-com.svg"
              alt="clap"
              width={15}
              height={15}
              className="h-5 w-5 dark:invert"
            />
          </motion.div>
        </Button>

        {/* "+1" 往上漂浮 */}
        <AnimatePresence>
          {floaters.map((f) => (
            <motion.span
              key={f.id}
              initial={{ opacity: 0, y: 0 }}
              animate={{ opacity: 1, y: -30 }} // Y 负方向 = 上移
              exit={{ opacity: 0, y: -50 }} // 再往上消失
              transition={{ duration: 0.6 }}
              className="absolute left-1/2 -translate-x-1/2 text-red-500 text-xs font-bold pointer-events-none"
            >
              +1
            </motion.span>
          ))}
        </AnimatePresence>
      </div>

      <span className="text-sm font-medium font-mono inline-block text-center w-[4ch]">{count}</span>
    </div>
  );
}
