"use client";

import React from "react";
import { motion, HTMLMotionProps, Variants } from "framer-motion";

// -- Animation Variants --

// Smooth ease-out curve similar to Apple's
const transition = { duration: 0.6, ease: [0.25, 0.1, 0.25, 1.0] as const };

const fadeInVariants: Variants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition },
};

const scaleInVariants: Variants = {
  hidden: { opacity: 0, scale: 0.95 },
  visible: { opacity: 1, scale: 1, transition },
};

const slideInLeftVariants: Variants = {
  hidden: { opacity: 0, x: -30 },
  visible: { opacity: 1, x: 0, transition },
};

const slideInRightVariants: Variants = {
  hidden: { opacity: 0, x: 30 },
  visible: { opacity: 1, x: 0, transition },
};

const staggerContainerVariants: Variants = {
  hidden: {},
  visible: {
    transition: {
      staggerChildren: 0.1,
    },
  },
};

const blurInVariants: Variants = {
    hidden: { opacity: 0, filter: "blur(10px)" },
    visible: { opacity: 1, filter: "blur(0px)", transition: { duration: 0.8, ease: "easeOut" } },
};

// -- Components --

interface MotionProps extends HTMLMotionProps<"div"> {
  children: React.ReactNode;
  delay?: number;
  className?: string;
  viewportMargin?: string;
}

export const FadeIn: React.FC<MotionProps> = ({ children, delay = 0, className, viewportMargin = "-50px", ...props }) => {
  return (
    <motion.div
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: viewportMargin }}
      variants={fadeInVariants}
      transition={{ ...transition, delay }}
      className={className}
      {...props}
    >
      {children}
    </motion.div>
  );
};

export const ScaleIn: React.FC<MotionProps> = ({ children, delay = 0, className, viewportMargin = "-50px", ...props }) => {
  return (
    <motion.div
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: viewportMargin }}
      variants={scaleInVariants}
      transition={{ ...transition, delay }}
      className={className}
      {...props}
    >
      {children}
    </motion.div>
  );
};

export const SlideInLeft: React.FC<MotionProps> = ({ children, delay = 0, className, viewportMargin = "-50px", ...props }) => {
  return (
    <motion.div
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: viewportMargin }}
      variants={slideInLeftVariants}
      transition={{ ...transition, delay }}
      className={className}
      {...props}
    >
      {children}
    </motion.div>
  );
};

export const SlideInRight: React.FC<MotionProps> = ({ children, delay = 0, className, viewportMargin = "-50px", ...props }) => {
  return (
    <motion.div
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: viewportMargin }}
      variants={slideInRightVariants}
      transition={{ ...transition, delay }}
      className={className}
      {...props}
    >
      {children}
    </motion.div>
  );
};

export const BlurIn: React.FC<MotionProps> = ({ children, delay = 0, className, viewportMargin = "-50px", ...props }) => {
    return (
      <motion.div
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: viewportMargin }}
        variants={blurInVariants}
        transition={{ ...transition, delay }}
        className={className}
        {...props}
      >
        {children}
      </motion.div>
    );
  };

export const StaggerContainer: React.FC<MotionProps> = ({ children, className, viewportMargin = "-50px", ...props }) => {
  return (
    <motion.div
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: viewportMargin }}
      variants={staggerContainerVariants}
      className={className}
      {...props}
    >
      {children}
    </motion.div>
  );
};

export const StaggerItem: React.FC<MotionProps> = ({ children, className, ...props }) => {
  return (
    <motion.div variants={fadeInVariants} className={className} {...props}>
      {children}
    </motion.div>
  );
};
