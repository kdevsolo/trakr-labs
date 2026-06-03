import { AlertCircle, CheckCircle2 } from "lucide-react";

import { cn } from "@/lib/utils";

type AuthMessageProps = {
  message: string;
  variant?: "error" | "success";
};

export function AuthMessage({ message, variant = "error" }: AuthMessageProps) {
  const isSuccess = variant === "success";

  return (
    <div
      role="alert"
      className={cn(
        "flex gap-2 rounded-lg border px-3 py-2.5 text-sm",
        isSuccess
          ? "border-primary/20 bg-primary/[0.06] text-foreground"
          : "border-destructive/20 bg-destructive/[0.06] text-destructive",
      )}
    >
      {isSuccess ? (
        <CheckCircle2 className="mt-0.5 size-4 shrink-0 text-primary" aria-hidden />
      ) : (
        <AlertCircle className="mt-0.5 size-4 shrink-0" aria-hidden />
      )}
      <p>{message}</p>
    </div>
  );
}
