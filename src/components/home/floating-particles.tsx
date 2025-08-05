"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";

interface Particle {
  id: number;
  x: number;
  y: number;
  size: number;
  color: string;
  duration: number;
}

interface FloatingParticlesProps {
  isActive: boolean;
  className?: string;
}

export function FloatingParticles({ isActive, className = "" }: FloatingParticlesProps) {
  const [particles, setParticles] = useState<Particle[]>([]);

  const colors = ["#8B5CF6", "#EC4899", "#06B6D4", "#10B981", "#F59E0B"];

  useEffect(() => {
    if (isActive) {
      const newParticles = Array.from({ length: 15 }, (_, i) => ({
        id: i,
        x: Math.random() * 100,
        y: Math.random() * 100,
        size: Math.random() * 4 + 2,
        color: colors[Math.floor(Math.random() * colors.length)],
        duration: Math.random() * 3 + 2,
      }));
      setParticles(newParticles);
    } else {
      setParticles([]);
    }
  }, [isActive]);

  return (
    <div className={`absolute inset-0 overflow-hidden pointer-events-none ${className}`}>
      {particles.map((particle) => (
        <motion.div
          key={particle.id}
          className="absolute rounded-full opacity-60"
          style={{
            backgroundColor: particle.color,
            width: particle.size,
            height: particle.size,
            left: `${particle.x}%`,
            top: `${particle.y}%`,
          }}
          animate={{
            y: [0, -20, 0],
            x: [0, Math.random() * 20 - 10, 0],
            opacity: [0, 0.8, 0],
            scale: [0, 1, 0],
          }}
          transition={{
            duration: particle.duration,
            repeat: Number.POSITIVE_INFINITY,
            repeatType: "loop",
            delay: Math.random() * 2,
          }}
        />
      ))}
    </div>
  );
}
