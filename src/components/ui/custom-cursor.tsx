"use client";

import { motion, useSpring } from "framer-motion";
import { useEffect, useState } from "react";

export const CustomCursor = () => {
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [isHovering, setIsHovering] = useState(false);

  const springConfig = { damping: 25, stiffness: 150 };
  const cursorX = useSpring(0, springConfig);
  const cursorY = useSpring(0, springConfig);

  useEffect(() => {
    const moveMouse = (e: MouseEvent) => {
      cursorX.set(e.clientX - 8);
      cursorY.set(e.clientY - 8);
    };

    const handleHover = (e: MouseEvent) => {
        const target = e.target as HTMLElement;
        if (target.tagName === 'BUTTON' || target.tagName === 'A' || target.closest('button')) {
            setIsHovering(true);
        } else {
            setIsHovering(false);
        }
    };

    window.addEventListener("mousemove", moveMouse);
    window.addEventListener("mouseover", handleHover);

    return () => {
      window.removeEventListener("mousemove", moveMouse);
      window.removeEventListener("mouseover", handleHover);
    };
  }, [cursorX, cursorY]);

  return (
    <motion.div
      className="fixed top-0 left-0 w-4 h-4 bg-primary rounded-full pointer-events-none z-[9999] mix-blend-screen hidden md:block"
      style={{
        x: cursorX,
        y: cursorY,
        scale: isHovering ? 2.5 : 1,
        boxShadow: "0 0 15px rgba(231,138,83,0.5)",
      }}
      animate={{
        backgroundColor: isHovering ? "#e78a53" : "#e78a53",
        opacity: [0.6, 1, 0.6],
      }}
      transition={{
        opacity: { repeat: Infinity, duration: 2 }
      }}
    />
  );
};
