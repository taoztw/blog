"use client";

import { useState } from "react";
import { motion } from "framer-motion";

interface MusicVisualizerProps {
  isPlaying: boolean;
  className?: string;
}

export function MusicVisualizer({ isPlaying, className = "" }: MusicVisualizerProps) {
  const [bars] = useState(Array.from({ length: 20 }, (_, i) => i));

  return (
    <div className={`flex items-end justify-center space-x-1 h-12 ${className}`}>
      {bars.map((bar) => (
        <motion.div
          key={bar}
          className="bg-gradient-to-t from-purple-500 via-pink-500 to-blue-500 rounded-full"
          style={{
            width: "3px",
            minHeight: "4px",
          }}
          animate={
            isPlaying
              ? {
                  height: [
                    Math.random() * 20 + 10,
                    Math.random() * 35 + 15,
                    Math.random() * 25 + 8,
                    Math.random() * 40 + 20,
                  ],
                  opacity: [0.4, 1, 0.6, 0.9],
                }
              : {
                  height: 4,
                  opacity: 0.3,
                }
          }
          transition={{
            duration: 0.5,
            repeat: isPlaying ? Number.POSITIVE_INFINITY : 0,
            repeatType: "reverse",
            delay: bar * 0.1,
          }}
        />
      ))}
    </div>
  );
}
