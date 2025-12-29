import { useEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";

interface ScrollRevealProps {
  children: React.ReactNode;
  className?: string;
  animation?: "fade-in" | "slide-up" | "slide-in-right" | "slide-in-left" | "scale-in" | "blur-in";
  delay?: number; // in seconds
  duration?: number; // in seconds
  threshold?: number; // 0 to 1
  enable?: boolean;
}

export const ScrollReveal = ({
  children,
  className,
  animation = "slide-up",
  delay = 0,
  duration = 0.8,
  threshold = 0.1,
  enable = true,
}: ScrollRevealProps) => {
  const ref = useRef<HTMLDivElement>(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    if (!enable) {
      setIsVisible(true);
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.unobserve(entry.target);
        }
      },
      {
        threshold,
        rootMargin: "0px 0px -50px 0px", // Trigger slightly before bottom
      }
    );

    if (ref.current) {
      observer.observe(ref.current);
    }

    return () => {
      if (ref.current) {
        observer.unobserve(ref.current);
      }
    };
  }, [threshold, enable]);

  const animationClass = {
    "fade-in": "animate-fade-in",
    "slide-up": "animate-slide-up",
    "slide-in-right": "animate-slide-in-right",
    "slide-in-left": "animate-slide-in-left",
    "scale-in": "animate-scale-in",
    "blur-in": "animate-blur-in",
  }[animation];

  return (
    <div
      ref={ref}
      className={cn(
        enable ? "opacity-0" : "", // Start hidden if enabled
        isVisible && enable ? animationClass : enable ? "" : "",
        isVisible && "opacity-100", // Ensure opacity is 1 after animation or if disabled logic handled by animation itself usually
        className
      )}
      style={
        isVisible && enable
          ? {
              animationDelay: `${delay}s`,
              animationDuration: `${duration}s`,
              animationFillMode: "forwards",
            }
          : undefined
      }
    >
      {children}
    </div>
  );
};
