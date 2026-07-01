"use client";

import type { ReactNode } from "react";

import { safeExternalHref } from "@/lib/safe-url";

type SafeExternalLinkProps = {
  href: string;
  children: ReactNode;
  className?: string;
};

export function SafeExternalLink({
  href,
  children,
  className,
}: SafeExternalLinkProps) {
  const safeHref = safeExternalHref(href);

  if (!safeHref) {
    return <span className={className}>{children}</span>;
  }

  return (
    <a
      href={safeHref}
      target="_blank"
      rel="noopener noreferrer"
      className={className}
    >
      {children}
    </a>
  );
}
