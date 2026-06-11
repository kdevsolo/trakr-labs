"use client";

import Link from "next/link";
import { useState } from "react";

import { signUp } from "@/app/auth/actions";
import { AuthFieldLabel } from "@/components/auth/auth-field-label";
import { AuthFormCard } from "@/components/auth/auth-form-card";
import { AuthMessage } from "@/components/auth/auth-message";
import { AuthOrDivider } from "@/components/auth/auth-or-divider";
import { AuthSocialButtons } from "@/components/auth/auth-social-buttons";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export default function SignUpPage() {
  const [message, setMessage] = useState("");
  const [messageVariant, setMessageVariant] = useState<"error" | "success">(
    "error",
  );
  const [pending, setPending] = useState(false);

  async function handleSubmit(formData: FormData) {
    setMessage("");
    const password = formData.get("password") as string;
    const confirmPassword = formData.get("confirmPassword") as string;

    if (password !== confirmPassword) {
      setMessageVariant("error");
      setMessage("Passwords do not match.");
      return;
    }

    if (password.length < 8) {
      setMessageVariant("error");
      setMessage("Password must be at least 8 characters.");
      return;
    }

    setPending(true);
    const result = await signUp(formData);
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
              Create your account
            </h1>
            <p className="text-sm text-muted-foreground">
              Get started with Trakr Labs in seconds.
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

            <div className="space-y-2">
              <AuthFieldLabel htmlFor="password">Password</AuthFieldLabel>
              <Input
                id="password"
                name="password"
                type="password"
                placeholder="At least 8 characters"
                autoComplete="new-password"
                minLength={8}
                required
                disabled={pending}
              />
            </div>

            <div className="space-y-2">
              <AuthFieldLabel htmlFor="confirmPassword">
                Confirm password
              </AuthFieldLabel>
              <Input
                id="confirmPassword"
                name="confirmPassword"
                type="password"
                placeholder="••••••••"
                autoComplete="new-password"
                minLength={8}
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
              {pending ? "Creating account…" : "Sign up"}
            </Button>
          </form>

          <AuthOrDivider />
          <AuthSocialButtons />
        </div>
      </AuthFormCard>

      <p className="text-center text-sm text-muted-foreground">
        Already have an account?{" "}
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
