"use client";

import { motion } from "framer-motion";
import { ReactNode } from "react";

export const FadeIn = ({ 
    children, 
    delay = 0, 
    direction = "up",
    duration = 0.5
}: { 
    children: ReactNode, 
    delay?: number, 
    direction?: "up" | "down" | "left" | "right" | "none",
    duration?: number
}) => {
  const directions = {
    up: { y: 20, x: 0 },
    down: { y: -20, x: 0 },
    left: { x: 20, y: 0 },
    right: { x: -20, y: 0 },
    none: { x: 0, y: 0 }
  };

  return (
    <motion.div
      initial={{ 
        opacity: 0, 
        ...directions[direction] 
      }}
      animate={{ 
        opacity: 1, 
        y: 0, 
        x: 0 
      }}
      transition={{ 
        duration: duration, 
        delay: delay,
        ease: [0.21, 0.47, 0.32, 0.98] // Cubic bezier pour un effet fluide
      }}
    >
      {children}
    </motion.div>
  );
};

export const StaggerContainer = ({ children, delayChildren = 0 }: { children: ReactNode, delayChildren?: number }) => {
  return (
    <motion.div
      initial="hidden"
      animate="show"
      variants={{
        hidden: { opacity: 0 },
        show: {
          opacity: 1,
          transition: {
            staggerChildren: 0.1,
            delayChildren: delayChildren,
          },
        },
      }}
    >
      {children}
    </motion.div>
  );
};
