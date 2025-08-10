"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";
import { Ghost, Music2, Pause, Play, SkipForward } from "lucide-react";

type Track = {
  title: string;
  artist?: string;
  url: string;
  cover?: string;
};

const defaultTracks: Track[] = [
  {
    title: "So Far Away",
    artist: "Adam Christopher",
    url: "https://r2.tz1.me/blog/Adam%20Christopher%20-%20So%20Far%20Away%20(Acoustic).mp3",
    cover: "https://r2.tz1.me/blog/offline-1313584359-so-for-away.jpg",
  },
  {
    title: "Apollo's Triumph",
    artist: "Audiomachine",
    url: "https://r2.tz1.me/blog/Audiomachine%20-%20Apollo's%20Triumph%20(Paul%20Dinletir%20Remix).mp3",
    cover: "https://r2.tz1.me/blog/offline-29809102-apollo.jpg",
  },
  {
    title: "Shots",
    artist: "Imagine Dragons,Broiler",
    url: "https://r2.tz1.me/blog/Imagine%20Dragons%2CBroiler%20-%20Shots%20(Broiler%20Remix).mp3",
    cover: "https://r2.tz1.me/blog/offline-31311695-shots.jpg",
  },
];

function formatTime(sec: number) {
  if (!isFinite(sec) || sec < 0) return "0:00";
  const m = Math.floor(sec / 60);
  const s = Math.floor(sec % 60);
  return `${m}:${s.toString().padStart(2, "0")}`;
}

export default function MusicPlayer({ tracks: initialTracks }: { tracks?: Track[] } = {}) {
  const tracks = useMemo(() => initialTracks ?? defaultTracks, [initialTracks]);

  // Audio + visualizer refs
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const audioCtxRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const srcNodeRef = useRef<MediaElementAudioSourceNode | null>(null);
  const freqDataRef = useRef<Uint8Array | null>(null);
  const rafRef = useRef<number | null>(null);

  // State
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [duration, setDuration] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);

  // Init audio element once
  useEffect(() => {
    if (!audioRef.current) {
      const audio = new Audio();
      audio.preload = "metadata";
      audio.crossOrigin = "anonymous";
      audioRef.current = audio;
    }
    return () => {
      if (audioRef.current) audioRef.current.pause();
    };
  }, []);

  // Load a track
  const loadTrack = useCallback(
    async (index: number, autoPlay = false) => {
      const audio = audioRef.current;
      const track = tracks[index];
      if (!audio || !track) return;

      audio.pause();
      setIsPlaying(false);
      setCurrentTime(0);
      setDuration(0);

      audio.crossOrigin = "anonymous";
      audio.src = track.url;
      try {
        await audio.load();
      } catch {}

      if (autoPlay) {
        try {
          await audio.play();
          setIsPlaying(true);
          ensureAudioGraph();
          startVisualizer();
        } catch {
          setIsPlaying(false);
        }
      }
    },
    [tracks]
  );

  // Ensure AudioContext and graph
  const ensureAudioGraph = useCallback(() => {
    const audio = audioRef.current;
    if (!audio) return;
    if (!audioCtxRef.current) {
      const Ctx = window.AudioContext || (window as any).webkitAudioContext;
      audioCtxRef.current = new Ctx();
    }
    const ctx = audioCtxRef.current;
    if (ctx.state === "suspended") ctx.resume().catch(() => {});
    if (!srcNodeRef.current) {
      srcNodeRef.current = ctx.createMediaElementSource(audio);
    }
    if (!analyserRef.current) {
      const analyser = ctx.createAnalyser();
      analyser.fftSize = 256;
      analyser.smoothingTimeConstant = 0.85;
      analyserRef.current = analyser;
    }
    try {
      srcNodeRef.current!.disconnect();
    } catch {}
    try {
      analyserRef.current!.disconnect();
    } catch {}
    srcNodeRef.current!.connect(analyserRef.current!);
    analyserRef.current!.connect(ctx.destination);

    freqDataRef.current = new Uint8Array(analyserRef.current!.frequencyBinCount);
  }, []);

  // Visualizer
  const drawVisualizer = useCallback(() => {
    const canvas = canvasRef.current;
    const analyser = analyserRef.current;
    const data = freqDataRef.current;
    if (!canvas || !analyser || !data) return;

    const dpr = window.devicePixelRatio || 1;
    const width = canvas.clientWidth;
    const height = canvas.clientHeight;
    if (canvas.width !== width * dpr || canvas.height !== height * dpr) {
      canvas.width = width * dpr;
      canvas.height = height * dpr;
    }
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

    analyser.getByteFrequencyData(data);
    ctx.clearRect(0, 0, width, height);

    const barCount = 24;
    const step = Math.floor(data.length / barCount);
    const barWidth = Math.max(2, (width - barCount * 3) / barCount);
    const gradient = ctx.createLinearGradient(0, 0, 0, height);
    gradient.addColorStop(0, "#f59e0b");
    gradient.addColorStop(1, "#7c3aed");

    for (let i = 0; i < barCount; i++) {
      const v = (data[i * step] ?? 0) / 255;
      const h = Math.max(2, v * height);
      const x = i * (barWidth + 3);
      const y = height - h;
      ctx.fillStyle = gradient;
      // rounded rect
      const r = Math.min(4, barWidth / 2);
      ctx.beginPath();
      ctx.moveTo(x + r, y);
      ctx.arcTo(x + barWidth, y, x + barWidth, y + h, r);
      ctx.arcTo(x + barWidth, y + h, x, y + h, r);
      ctx.arcTo(x, y + h, x, y, r);
      ctx.arcTo(x, y, x + barWidth, y, r);
      ctx.closePath();
      ctx.fill();
    }
  }, []);

  const startVisualizer = useCallback(() => {
    if (rafRef.current != null) return;
    const loop = () => {
      drawVisualizer();
      rafRef.current = requestAnimationFrame(loop);
    };
    rafRef.current = requestAnimationFrame(loop);
  }, [drawVisualizer]);

  const stopVisualizer = useCallback(() => {
    if (rafRef.current != null) {
      cancelAnimationFrame(rafRef.current);
      rafRef.current = null;
    }
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    if (canvas && ctx) ctx.clearRect(0, 0, canvas.width, canvas.height);
  }, []);

  // Initial load
  useEffect(() => {
    loadTrack(0, false);
  }, [loadTrack]);

  // Audio events
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const onLoadedMetadata = () => setDuration(audio.duration || 0);
    const onTimeUpdate = () => setCurrentTime(audio.currentTime || 0);
    const onEnded = () => handleNext();

    audio.addEventListener("loadedmetadata", onLoadedMetadata);
    audio.addEventListener("timeupdate", onTimeUpdate);
    audio.addEventListener("ended", onEnded);
    return () => {
      audio.removeEventListener("loadedmetadata", onLoadedMetadata);
      audio.removeEventListener("timeupdate", onTimeUpdate);
      audio.removeEventListener("ended", onEnded);
    };
  }, []);

  // Controls
  const handlePlayPause = useCallback(async () => {
    const audio = audioRef.current;
    if (!audio) return;
    ensureAudioGraph();
    if (isPlaying) {
      audio.pause();
      setIsPlaying(false);
      stopVisualizer();
    } else {
      try {
        await audio.play();
        setIsPlaying(true);
        startVisualizer();
      } catch {}
    }
  }, [ensureAudioGraph, isPlaying, startVisualizer, stopVisualizer]);

  const handleNext = useCallback(() => {
    const next = (currentIndex + 1) % tracks.length;
    setCurrentIndex(next);
    loadTrack(next, true);
  }, [currentIndex, loadTrack, tracks.length]);

  const handleSelectTrack = useCallback(
    (idx: number) => {
      setCurrentIndex(idx);
      loadTrack(idx, true);
    },
    [loadTrack]
  );

  const handleSeek = useCallback(
    (values: number[]) => {
      const audio = audioRef.current;
      if (!audio || duration === 0) return;
      const pct = values[0] ?? 0;
      audio.currentTime = (pct / 100) * duration;
    },
    [duration]
  );

  const progressPct = duration > 0 ? (currentTime / duration) * 100 : 0;
  const currentTrack = tracks[currentIndex];

  return (
    <>
      <Card className="h-[380px] overflow-hidden">
        {/* Header: 正在播放 + 控制按钮（暂停/下一首）放在一行 */}
        <CardHeader className="px-3">
          <div className="flex items-center justify-between gap-2">
            <div className="min-w-0 flex items-center gap-2">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={currentTrack!.cover || "/placeholder.svg?height=40&width=40&query=album%20cover"}
                alt="专辑封面"
                className="h-8 w-8 rounded-sm object-cover"
                loading="eager"
              />
              <div className="min-w-0">
                <div className="flex items-center gap-1 text-xs text-muted-foreground">
                  <span className="inline-block h-1.5 w-1.5 rounded-full bg-green-500" aria-hidden="true" />
                  <span>正在播放</span>
                </div>
                <p className="truncate text-sm font-normal text-gray-800 dark:text-gray-400">{currentTrack!.title}</p>
              </div>
            </div>
            <div className="flex items-center gap-1">
              <Button size="icon" variant="ghost" onClick={handlePlayPause} aria-label={isPlaying ? "暂停" : "播放"}>
                {isPlaying ? <Pause className="h-5 w-5" /> : <Play className="h-5 w-5" />}
              </Button>
              <Button size="icon" variant="outline" onClick={handleNext} aria-label="下一首">
                <SkipForward className="h-5 w-5" />
              </Button>
            </div>
          </div>
        </CardHeader>

        <CardContent className="p-3  pt-0">
          {/* Slim visualizer */}
          <div className="mb-2 relative overflow-hidden rounded-md border bg-muted">
            {/* 示例动态效果：流动渐变层 */}
            <div aria-hidden="true" className="absolute inset-0 shimmer-motion pointer-events-none opacity-70" />
            {/* 原有频谱可视化 */}
            <canvas ref={canvasRef} className="relative h-[56px] w-full" aria-hidden="true" />
          </div>

          {/* Progress */}
          <div className="mb-2">
            <Slider value={[progressPct]} onValueChange={handleSeek} max={100} step={0.5} aria-label="播放进度" />
            <div className="mt-1 flex items-center justify-between text-[10px] text-muted-foreground">
              <span>{formatTime(currentTime)}</span>
              <span>{formatTime(duration)}</span>
            </div>
          </div>

          {/* Playlist */}
          <div className="rounded-md border">
            <div className="flex items-center gap-1 px-2 py-1.5 text-xs text-muted-foreground">
              <Music2 className="h-3.5 w-3.5" />
              播放列表
            </div>
            <ScrollArea className="h-[142px]">
              <ul className="divide-y">
                {tracks.map((t, idx) => {
                  const active = idx === currentIndex;
                  return (
                    <li
                      key={`${t.url}-${idx}`}
                      className={cn(
                        "flex cursor-pointer items-center gap-2 px-2 py-2 text-sm transition-colors hover:bg-accent/60",
                        active && "bg-accent"
                      )}
                      onClick={() => handleSelectTrack(idx)}
                      aria-current={active ? "true" : "false"}
                    >
                      <span
                        className={cn(
                          "inline-flex h-5 w-5 items-center justify-center rounded-sm border text-[10px] text-muted-foreground",
                          active && "border-transparent bg-primary/10 text-foreground"
                        )}
                        aria-hidden="true"
                      >
                        {idx + 1}
                      </span>
                      <div className="min-w-0 flex-1">
                        <p
                          className={cn(
                            "truncate font-normal text-muted-foreground",
                            active && "font-medium text-primary/80 "
                          )}
                        >
                          {t.title}
                        </p>
                        <p className="truncate text-xs text-muted-foreground">{t.artist || "未知艺术家"}</p>
                      </div>
                      {active ? <span className="text-[10px] text-muted-foreground">播放中</span> : null}
                    </li>
                  );
                })}
              </ul>
            </ScrollArea>
          </div>
        </CardContent>
      </Card>

      {/* 示例动态效果样式（仅作用于本组件） */}
      <style jsx>{`
        .shimmer-motion {
          background: linear-gradient(
            100deg,
            rgba(124, 58, 237, 0.1) 0%,
            rgba(245, 158, 11, 0.2) 40%,
            rgba(16, 185, 129, 0.12) 60%,
            rgba(124, 58, 237, 0.1) 100%
          );
          background-size: 200% 100%;
          animation: shimmer 8s linear infinite;
        }
        @keyframes shimmer {
          0% {
            background-position: 0% 0%;
          }
          100% {
            background-position: -200% 0%;
          }
        }
        @media (prefers-reduced-motion: reduce) {
          .shimmer-motion {
            animation: none;
          }
        }
      `}</style>
    </>
  );
}
