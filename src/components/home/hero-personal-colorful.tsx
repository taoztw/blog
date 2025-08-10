"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Play,
  Pause,
  SkipForward,
  Heart,
  MapPin,
  Coffee,
  Code,
  Music,
  Volume2,
  Users,
  Users2,
  TrendingUp,
  FolderOpen,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import Image from "next/image";
import MusicPlayer from "./music-player";
import { AnimatedNumber, AnimatedNumberK } from "../ui_custom/animated-number";
import Link from "next/link";
import { formatK } from "@/lib/utils";

const photos = [
  {
    src: "/tmp/home3.jpg",
    caption: "放空",
    location: "月球",
  },
  {
    src: "/tmp/home2.jpg",
    caption: "故宫的雪",
    location: "BeiJing",
  },
  {
    src: "/tmp/home1.jpg",
    caption: "香山一角",
    location: "香山",
  },
];

const currentMusic = {
  title: "Lofi Hip Hop Radio",
  artist: "ChilledCow",
  cover: "/placeholder.svg?height=60&width=60",
  isPlaying: false,
};

const currentStatus = {
  mood: "🚀 专注开发中",
  learning: "Next.js 15 新特性",
  reading: "《Clean Architecture》",
  location: "北京",
};

export function HeroPersonalColorful() {
  const [currentPhotoIndex, setCurrentPhotoIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState("");

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(
        new Date().toLocaleTimeString("zh-CN", {
          hour: "2-digit",
          minute: "2-digit",
        })
      );
    }, 1000);

    const photoTimer = setInterval(() => {
      setCurrentPhotoIndex((prev) => (prev + 1) % photos.length);
    }, 4000);

    return () => {
      clearInterval(timer);
      clearInterval(photoTimer);
    };
  }, []);

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 6) return "深夜好";
    if (hour < 12) return "早上好";
    if (hour < 18) return "下午好";
    return "晚上好";
  };

  return (
    <section className="min-h-screen relative overflow-hidden bg-white dark:bg-gray-950">
      {/* Simple background pattern */}
      <div className="absolute inset-0 bg-grid-slate-100/[0.02] dark:bg-grid-slate-700/[0.02]" />

      <div className="container mx-auto px-4 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 min-h-screen items-center pb-16">
          {/* Left Side - Photos */}
          <div className="lg:col-span-4 space-y-6">
            {/* Main Photo Display */}
            <motion.div
              className="relative px-4"
              initial={{ opacity: 0, x: -50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8 }}
            >
              <div className="overflow-hidden transform rotate-2 hover:rotate-0 transition-transform duration-500 shadow-2xl border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 w-full h-96 rounded-3xl">
                <div className="relative h-96">
                  <AnimatePresence mode="wait">
                    <motion.div
                      key={currentPhotoIndex}
                      initial={{ opacity: 0, scale: 1.1 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.9 }}
                      transition={{ duration: 0.5 }}
                      className="absolute inset-0"
                    >
                      <Image
                        src={photos[currentPhotoIndex]!.src || "/placeholder.svg"}
                        alt={photos[currentPhotoIndex]!.caption}
                        fill
                        className="object-cover"
                      />
                    </motion.div>
                  </AnimatePresence>

                  {/* Photo Caption */}
                  <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent p-4">
                    <p className="text-white text-sm font-medium">{photos[currentPhotoIndex]!.caption}</p>
                    <p className="text-white/80 text-xs flex items-center mt-1">
                      <MapPin className="w-3 h-3 mr-1" />
                      {photos[currentPhotoIndex]!.location}
                    </p>
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Photo Thumbnails */}
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
              <div className="flex space-x-3 justify-center">
                {photos.map((photo, index) => (
                  <motion.button
                    key={index}
                    onClick={() => setCurrentPhotoIndex(index)}
                    className={`relative w-16 h-16 rounded-lg overflow-hidden border-1 transition-all ${
                      index === currentPhotoIndex
                        ? "border-blue-500 scale-110 shadow-lg shadow-blue-500/25"
                        : "border-gray-300 dark:border-gray-600 hover:border-blue-400 dark:hover:border-blue-500"
                    }`}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <Image src={photo.src || "/placeholder.svg"} alt={photo.caption} fill className="object-cover" />
                  </motion.button>
                ))}
              </div>
            </motion.div>
          </div>

          {/* Center - Main Content */}
          <div className="lg:col-span-5 space-y-8">
            {/* Greeting & Time */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="text-center lg:text-left"
            >
              <div className="flex items-center justify-center lg:justify-start space-x-2 mb-2">
                <span className="text-2xl">👋</span>
                <span className="text-base text-gray-600 dark:text-gray-400">
                  {getGreeting()}，现在是 {currentTime}
                </span>
              </div>

              <h1 className="text-4xl lg:text-6xl font-bold bg-gradient-to-r from-gray-900 via-gray-700 to-gray-600 dark:from-white dark:via-gray-200 dark:to-gray-400 bg-clip-text text-transparent mb-4">
                我是 Tz
              </h1>

              <p className="text-base text-gray-600 dark:text-gray-400 mb-6 leading-relaxed">
                全栈开发工程师 · AI 技术爱好者✨
                <br />
                {/* <span className="text-gray-800 dark:text-gray-300 font-medium">用代码创造价值，用文字分享知识</span> ✨ */}
              </p>
            </motion.div>

            {/* Current Status */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="grid grid-cols-1 md:grid-cols-2 gap-4"
            >
              {/* 实时访客 */}
              <Card className="p-4 hover:shadow-lg transition-all duration-300  dark:from-blue-950/50 dark:to-cyan-950/50">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 rounded-full flex items-center justify-center">
                    <Users2 className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">当前在线</p>
                    <p className="font-medium text-sm">{1000} 位访客</p>
                  </div>
                </div>
              </Card>

              {/* 今日访问 */}
              <Card className="p-4 hover:shadow-lg transition-all duration-300">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-purple-100 dark:bg-purple-900 rounded-full flex items-center justify-center border border-purple-200 dark:border-purple-700">
                    <TrendingUp className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">今日访问</p>
                    <p className="font-medium text-sm">{formatK(123123)} 次浏览</p>
                  </div>
                </div>
              </Card>
            </motion.div>

            {/* Action Buttons */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 }}
              className="flex flex-col sm:flex-row gap-4"
            >
              <div className="flex flex-col sm:flex-row gap-3">
                {/* 查看我的博客 - 主按钮（绿色渐变） */}
                <Link href="/blog">
                  <Button variant="default" className="shadow-md hover:opacity-90">
                    <Heart className="w-4 h-4 mr-1" />
                    进入博客
                  </Button>
                </Link>

                {/* 查看我的项目 - 次按钮（浅灰） */}
                <Link href="/projects">
                  <Button variant="secondary" className="dark:text-gray-400 shadow-md hover:bg-secondary/80">
                    <FolderOpen className="w-4 h-4 mr-2" />
                    进入项目
                  </Button>
                </Link>
              </div>
            </motion.div>
          </div>

          {/* Right Side - Music Player & More Info */}
          <div className="lg:col-span-3 space-y-6">
            {/* Music Player with Visualizer */}
            <motion.div initial={{ opacity: 0, x: 50 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.3 }}>
              <MusicPlayer />
            </motion.div>

            {/* 合并的博客统计 */}
            <motion.div initial={{ opacity: 0, x: 50 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.5 }}>
              <Card className="p-6 bg-gradient-to-br gap-3  hover:shadow-lg transition-all duration-300">
                <div className="flex items-center space-x-3">
                  <div className="w-6 h-6 rounded-full flex items-center justify-center border border-gray-400 ">
                    <TrendingUp className="w-4 h-4 text-muted-foreground" />
                  </div>
                  <div>
                    <h3 className="font-normal text-sm text-gray-600 dark:text-gray-400">数据</h3>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="text-center space-y-1">
                    <div className="text-sm text-muted-foreground">技术文章</div>
                    <p className="text-base font-medium text-gray-600 dark:text-gray-400">
                      <AnimatedNumber value={127} />+
                    </p>
                  </div>
                  <div className="text-center space-y-1">
                    <div className="text-sm text-muted-foreground">总阅读量</div>

                    <p className="text-base font-medium text-gray-600 dark:text-gray-400">
                      <AnimatedNumberK value={3992938} />+
                    </p>
                  </div>
                </div>
              </Card>
            </motion.div>
          </div>
        </div>
      </div>
    </section>
  );
}
