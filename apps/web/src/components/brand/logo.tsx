"use client";

import { useId } from "react";

import { cn } from "@/lib/utils";

export function LogoIcon({ className }: { className?: string }) {
  const id = useId();
  const gradientId = `${id}-trakr-logo`;

  return (
    <svg
      viewBox="0 0 40 40"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={cn("size-8", className)}
      role="img"
      aria-label="Trakr Labs"
    >
      <defs>
        <linearGradient
          id={gradientId}
          x1="0"
          y1="0"
          x2="40"
          y2="40"
          gradientUnits="userSpaceOnUse"
        >
          <stop stopColor="#8B5CF6" />
          <stop offset="1" stopColor="#3B82F6" />
        </linearGradient>
      </defs>
      <rect width="40" height="40" rx="11" fill={`url(#${gradientId})`} />
      <path
        d="M12.5 20.5L17.5 25.5L28 14.5"
        stroke="white"
        strokeWidth="3.6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

type LogoProps = {
  className?: string;
  iconClassName?: string;
  textClassName?: string;
  showText?: boolean;
};

export function Logo({
  className,
  iconClassName,
  textClassName,
  showText = true,
}: LogoProps) {
  return (
    <div className={cn("flex items-center gap-2.5", className)}>
      <LogoIcon className={iconClassName} />
      {showText ? (
        <span
          className={cn(
            "font-semibold tracking-tight text-foreground",
            textClassName,
          )}
        >
          Trakr Labs
        </span>
      ) : null}
    </div>
  );
}
