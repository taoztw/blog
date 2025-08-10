"use client";

import { formatK } from "@/lib/utils";
import { useInView, useSpring } from "framer-motion";
import { useRef, useEffect } from "react";

export function AnimatedNumber({ value }: { value: number }) {
  const ref = useRef<HTMLSpanElement>(null);
  const isInView = useInView(ref, { once: true });
  const spring = useSpring(0, { damping: 30, stiffness: 100 });

  useEffect(() => {
    if (isInView) {
      spring.set(value);
    }
  }, [isInView, value, spring]);

  useEffect(() => {
    const unsubscribe = spring.on("change", (latest) => {
      if (ref.current) {
        ref.current.textContent = new Intl.NumberFormat().format(Math.round(latest));
      }
    });
    return unsubscribe;
  }, [spring]);

  return <span ref={ref}>0</span>;
}

export function AnimatedNumberK({ value }: { value: number }) {
  const ref = useRef<HTMLSpanElement>(null);
  const isInView = useInView(ref, { once: true });
  const spring = useSpring(0, { damping: 30, stiffness: 100 });

  useEffect(() => {
    if (isInView) {
      spring.set(value);
    }
  }, [isInView, value, spring]);

  useEffect(() => {
    const unsubscribe = spring.on("change", (latest) => {
      if (ref.current) {
        ref.current.textContent = formatK(latest).toString();
      }
    });
    return unsubscribe;
  }, [spring]);

  return <span ref={ref}>0</span>;
}
