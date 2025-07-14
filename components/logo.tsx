// CodeLogo.jsx

"use client";
import { motion } from "framer-motion";

const GeometricLogo = () => {
  return (
    <div className="flex items-center space-x-3">
      <motion.svg width="40" height="40" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
        {/* 外圆 */}
        <motion.circle
          cx="20"
          cy="20"
          r="18"
          stroke="url(#gradient)"
          strokeWidth="2"
          initial={{ pathLength: 0 }}
          animate={{ pathLength: 1 }}
          transition={{ duration: 2, ease: "easeInOut" }}
        />

        {/* 内部六边形 */}
        <motion.path
          d="M20 8 L30 14 L30 26 L20 32 L10 26 L10 14 Z"
          fill="url(#gradient)"
          initial={{ scale: 0, rotate: 0 }}
          animate={{ scale: 1, rotate: 360 }}
          transition={{ duration: 1, delay: 0.5 }}
          whileHover={{
            scale: 1.1,
            rotate: 720,
            transition: { duration: 0.5 },
          }}
        />

        {/* 渐变定义 */}
        <defs>
          <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#3B82F6" />
            <stop offset="100%" stopColor="#8B5CF6" />
          </linearGradient>
        </defs>
      </motion.svg>

      <motion.span
        className="text-xl font-bold bg-gradient-to-r from-blue-500 to-purple-500 bg-clip-text text-transparent"
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 1 }}
      >
        TechBlog
      </motion.span>
    </div>
  );
};

// TerminalLogo.jsx
import { useState, useEffect } from "react";

const TerminalLogo = () => {
  const [showCursor, setShowCursor] = useState(true);

  // 光标闪烁效果
  useEffect(() => {
    const interval = setInterval(() => {
      setShowCursor((prev) => !prev);
    }, 500);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="flex items-center space-x-2">
      {/* 终端图标 */}
      <motion.div
        className="relative w-10 h-10 bg-gray-800 rounded-md border border-gray-700"
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
      >
        {/* 终端顶部栏 */}
        <div className="absolute top-1 left-1 right-1 h-2 bg-gray-700 rounded-sm flex items-center space-x-1 px-1">
          <motion.div
            className="w-1 h-1 bg-red-500 rounded-full"
            animate={{ scale: [1, 1.2, 1] }}
            transition={{ duration: 2, repeat: Infinity }}
          />
          <motion.div
            className="w-1 h-1 bg-yellow-500 rounded-full"
            animate={{ scale: [1, 1.2, 1] }}
            transition={{ duration: 2, delay: 0.2, repeat: Infinity }}
          />
          <motion.div
            className="w-1 h-1 bg-green-500 rounded-full"
            animate={{ scale: [1, 1.2, 1] }}
            transition={{ duration: 2, delay: 0.4, repeat: Infinity }}
          />
        </div>

        {/* 命令行文本 */}
        <motion.div
          className="absolute bottom-1 left-1 text-xs text-green-400 font-mono"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5 }}
        >
          $&gt;
          {showCursor && <span className="inline-block w-1 h-3 bg-green-400 ml-1" />}
        </motion.div>
      </motion.div>

      {/* 博客名称 */}
      <motion.div
        className="font-mono"
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
      >
        <span className="text-gray-400">dev</span>
        <span className="text-blue-400">.</span>
        <span className="text-gray-100">blog</span>
      </motion.div>
    </div>
  );
};

export { GeometricLogo, TerminalLogo };
