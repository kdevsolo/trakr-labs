import Link from "next/link";

import {
  PRIVACY_POLICY_URL,
  TERMS_OF_SERVICE_URL,
} from "./auth-legal-urls";

export function AuthFormShell({ children }: { children: React.ReactNode }) {
  const year = new Date().getFullYear();

  return (
    <div className="flex min-h-svh flex-col bg-background">
      <main className="flex flex-1 flex-col items-center justify-center px-4 py-10">
        <div className="w-full max-w-[420px] space-y-6">{children}</div>
      </main>
      <footer className="flex flex-col gap-3 border-t border-border/60 px-6 py-6 text-xs text-muted-foreground sm:flex-row sm:items-center sm:justify-between">
        <p>© {year} Trakr Labs. All rights reserved.</p>
        <nav className="flex flex-wrap gap-x-4 gap-y-1">
          <Link
            href={PRIVACY_POLICY_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-foreground"
          >
            Privacy Policy
          </Link>
          <Link
            href={TERMS_OF_SERVICE_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-foreground"
          >
            Terms of Service
          </Link>
          <Link href="#" className="hover:text-foreground">
            Support
          </Link>
        </nav>
      </footer>
    </div>
  );
}
