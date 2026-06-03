import Link from "next/link";

export function AuthLegalLinks() {
  return (
    <nav
      className="flex justify-center gap-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground"
      aria-label="Legal"
    >
      <Link href="#" className="hover:text-foreground">
        Privacy Policy
      </Link>
      <span aria-hidden>·</span>
      <Link href="#" className="hover:text-foreground">
        Terms of Service
      </Link>
    </nav>
  );
}
