"use client";

import Link from "next/link";
import { useState } from "react";

import { requestPasswordReset } from "@/app/auth/actions";
import { AuthFieldLabel } from "@/components/auth/auth-field-label";
import { AuthFormCard } from "@/components/auth/auth-form-card";
import { AuthMessage } from "@/components/auth/auth-message";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export default function ForgotPasswordPage() {
  const [message, setMessage] = useState("");
  const [messageVariant, setMessageVariant] = useState<"error" | "success">(
    "error",
  );
  const [pending, setPending] = useState(false);

  async function handleSubmit(formData: FormData) {
    setMessage("");
    setPending(true);
    const result = await requestPasswordReset(formData);
    if (result?.error) {
      setMessageVariant("error");
      setMessage(result.error);
    }
    if (result?.message) {
      setMessageVariant("success");
      setMessage(result.message);
    }
    setPending(false);
  }

  return (
    <>
      <AuthFormCard>
        <div className="space-y-6">
          <div className="space-y-2">
            <h1 className="text-2xl font-semibold tracking-tight">
              Reset your password
            </h1>
            <p className="text-sm text-muted-foreground">
              Enter your email and we&apos;ll send you a link to choose a new
              password.
            </p>
          </div>

          <form action={handleSubmit} className="space-y-5">
            <div className="space-y-2">
              <AuthFieldLabel htmlFor="email">Email address</AuthFieldLabel>
              <Input
                id="email"
                name="email"
                type="email"
                placeholder="name@company.com"
                autoComplete="email"
                required
                disabled={pending}
              />
            </div>

            {message && (
              <AuthMessage message={message} variant={messageVariant} />
            )}

            <Button
              type="submit"
              className="h-11 w-full text-base"
              disabled={pending}
            >
              {pending ? "Sending link…" : "Send reset link"}
            </Button>
          </form>
        </div>
      </AuthFormCard>

      <p className="text-center text-sm text-muted-foreground">
        Remember your password?{" "}
        <Link
          href="/auth/login"
          className="font-semibold text-primary hover:underline"
        >
          Sign in
        </Link>
      </p>
    </>
  );
}
