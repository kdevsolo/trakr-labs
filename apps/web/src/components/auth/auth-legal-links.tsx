import Link from "next/link";

import {
  PRIVACY_POLICY_URL,
  TERMS_OF_SERVICE_URL,
} from "./auth-legal-urls";

export function AuthLegalLinks() {
  return (
    <nav
      className="flex justify-center gap-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground"
      aria-label="Legal"
    >
      <Link
        href={PRIVACY_POLICY_URL}
        target="_blank"
        rel="noopener noreferrer"
        className="hover:text-foreground"
      >
        Privacy Policy
      </Link>
      <span aria-hidden>·</span>
      <Link
        href={TERMS_OF_SERVICE_URL}
        target="_blank"
        rel="noopener noreferrer"
        className="hover:text-foreground"
      >
        Terms of Service
      </Link>
    </nav>
  );
}
