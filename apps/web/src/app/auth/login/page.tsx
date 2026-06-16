"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Suspense, useEffect, useState } from "react";

import { signIn } from "@/app/auth/actions";
import { AuthFieldLabel } from "@/components/auth/auth-field-label";
import { AuthFormCard } from "@/components/auth/auth-form-card";
import { AuthMessage } from "@/components/auth/auth-message";
import { AuthOrDivider } from "@/components/auth/auth-or-divider";
import { AuthSocialButtons } from "@/components/auth/auth-social-buttons";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { hasAuthTokensInHash } from "@/lib/auth/callback";

const ERROR_MESSAGES: Record<string, string> = {
  auth_callback_failed:
    "Your sign-in link is invalid or has expired. Try again or request a new link.",
  session_expired:
    "Your session expired. Use your invite or reset link again.",
};

function LoginForm() {
  const searchParams = useSearchParams();
  const [message, setMessage] = useState("");
  const [pending, setPending] = useState(false);

  useEffect(() => {
    const error = searchParams.get("error");
    if (error && ERROR_MESSAGES[error]) {
      setMessage(ERROR_MESSAGES[error]);
    }
  }, [searchParams]);

  useEffect(() => {
    const { search, hash } = window.location;
    if (hasAuthTokensInHash(hash)) {
      window.location.replace(`/auth/callback${search}${hash}`);
    }
  }, []);

  async function handleSubmit(formData: FormData) {
    setMessage("");
    setPending(true);
    const result = await signIn(formData);
    if (result?.error) setMessage(result.error);
    setPending(false);
  }

  return (
    <>
      <AuthFormCard>
        <div className="space-y-6">
          <div className="space-y-2">
            <h1 className="text-2xl font-semibold tracking-tight">
              Welcome back
            </h1>
            <p className="text-sm text-muted-foreground">
              Track goals and progress with your team.
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
              <AuthFieldLabel
                htmlFor="password"
                action={
                  <Link
                    href="/auth/forgot-password"
                    className="text-xs font-medium normal-case tracking-normal text-primary hover:underline"
                  >
                    Forgot password?
                  </Link>
                }
              >
                Password
              </AuthFieldLabel>
              <Input
                id="password"
                name="password"
                type="password"
                placeholder="••••••••"
                autoComplete="current-password"
                required
                disabled={pending}
              />
            </div>

            {message && <AuthMessage message={message} variant="error" />}

            <Button
              type="submit"
              className="h-11 w-full text-base"
              disabled={pending}
            >
              {pending ? "Signing in…" : "Sign in"}
            </Button>
          </form>

          <AuthOrDivider />
          <AuthSocialButtons />
        </div>
      </AuthFormCard>

      <p className="text-center text-sm text-muted-foreground">
        Don&apos;t have an account?{" "}
        <Link
          href="/auth/signup"
          className="font-semibold text-primary hover:underline"
        >
          Create one
        </Link>
      </p>

    </>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={null}>
      <LoginForm />
    </Suspense>
  );
}
