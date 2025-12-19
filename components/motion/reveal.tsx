"use client";

import * as React from "react";
import { easeOut, motion, type MotionProps } from "motion/react";
import { useUiPreloader } from "@/stores/ui-preloader";

const containerVariants = {
  hidden: {},
  show: {
    transition: {
      staggerChildren: 0.12,
      delayChildren: 0.05,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 18 },
  show: { opacity: 1, y: 0, transition: { duration: 0.45, ease: easeOut } },
};

type RevealGroupProps = React.PropsWithChildren<{
  className?: string;
  once?: boolean;
  amount?: number;
}>;

export function RevealGroup({ children, className, once = true, amount = 0.22 }: RevealGroupProps) {
  const isPreloaderDone = useUiPreloader((s) => s.isPreloaderDone);

  // sebelum preloader selesai: jangan mulai whileInView (hindari animasi berjalan)
  if (!isPreloaderDone) {
    return (
      <div className={className} aria-hidden="true">
        {children}
      </div>
    );
  }

  return (
    <motion.div className={className} variants={containerVariants} initial="hidden" whileInView="show" viewport={{ once, amount }}>
      {children}
    </motion.div>
  );
}

type RevealItemProps = React.PropsWithChildren<
  {
    className?: string;
  } & MotionProps
>;

export function RevealItem({ children, className, ...props }: RevealItemProps) {
  const isPreloaderDone = useUiPreloader((s) => s.isPreloaderDone);

  // sebelum preloader selesai: render biasa, tidak motion (biar tidak animate duluan)
  if (!isPreloaderDone) {
    return <div className={className}>{children}</div>;
  }

  return (
    <motion.div className={className} variants={itemVariants} {...props}>
      {children}
    </motion.div>
  );
}
