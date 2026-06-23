import Link from "next/link";

import { cn } from "@/lib/utils";

import {
  PRIVACY_POLICY_URL,
  TERMS_OF_SERVICE_URL,
} from "./auth-legal-urls";

type AuthTermsAcceptanceProps = {
  checked: boolean;
  onCheckedChange: (checked: boolean) => void;
  disabled?: boolean;
  id?: string;
  name?: string;
};

export function AuthTermsAcceptance({
  checked,
  onCheckedChange,
  disabled = false,
  id = "tncAccepted",
  name = "tncAccepted",
}: AuthTermsAcceptanceProps) {
  return (
    <label
      htmlFor={id}
      className={cn(
        "flex cursor-pointer gap-3 rounded-lg border border-border/60 bg-muted/30 p-3 text-sm leading-relaxed text-muted-foreground",
        disabled && "cursor-not-allowed opacity-60",
      )}
    >
      <input
        id={id}
        name={name}
        type="checkbox"
        checked={checked}
        onChange={(event) => onCheckedChange(event.target.checked)}
        disabled={disabled}
        className="mt-0.5 size-4 shrink-0 accent-primary"
        required
      />
      <span>
        I agree to Trakr Labs&apos;{" "}
        <Link
          href={TERMS_OF_SERVICE_URL}
          target="_blank"
          rel="noopener noreferrer"
          className="font-medium text-primary hover:underline"
          onClick={(event) => event.stopPropagation()}
        >
          Terms of Service
        </Link>{" "}
        and{" "}
        <Link
          href={PRIVACY_POLICY_URL}
          target="_blank"
          rel="noopener noreferrer"
          className="font-medium text-primary hover:underline"
          onClick={(event) => event.stopPropagation()}
        >
          Privacy Policy
        </Link>
        . By signing up you confirm that you have read and understood how we
        handle your data.
      </span>
    </label>
  );
}
