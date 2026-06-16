"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

import { updatePassword } from "@/app/auth/actions";
import { AuthFieldLabel } from "@/components/auth/auth-field-label";
import { AuthFormCard } from "@/components/auth/auth-form-card";
import { AuthMessage } from "@/components/auth/auth-message";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { createClient } from "@/utils/supabase/client";

export default function SetPasswordPage() {
  const [message, setMessage] = useState("");
  const [messageVariant, setMessageVariant] = useState<"error" | "success">(
    "error",
  );
  const [pending, setPending] = useState(false);
  const [sessionChecked, setSessionChecked] = useState(false);
  const [hasSession, setHasSession] = useState(false);

  useEffect(() => {
    async function checkSession() {
      const supabase = createClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();
      setHasSession(Boolean(user));
      setSessionChecked(true);
    }

    void checkSession();
  }, []);

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
    const result = await updatePassword(formData);
    if (result?.error) {
      setMessageVariant("error");
      setMessage(result.error);
    }
    setPending(false);
  }

  if (!sessionChecked) {
    return null;
  }

  if (!hasSession) {
    return (
      <>
        <AuthFormCard>
          <div className="space-y-4">
            <div className="space-y-2">
              <h1 className="text-2xl font-semibold tracking-tight">
                Link expired
              </h1>
              <p className="text-sm text-muted-foreground">
                Your invite link has expired or is invalid. Ask your team admin
                to send a new invite.
              </p>
            </div>
            <Button asChild className="h-11 w-full text-base">
              <Link href="/auth/login">Back to sign in</Link>
            </Button>
          </div>
        </AuthFormCard>
      </>
    );
  }

  return (
    <>
      <AuthFormCard>
        <div className="space-y-6">
          <div className="space-y-2">
            <h1 className="text-2xl font-semibold tracking-tight">
              Set your password
            </h1>
            <p className="text-sm text-muted-foreground">
              Create a password to finish setting up your Trakr Labs account.
            </p>
          </div>

          <form action={handleSubmit} className="space-y-5">
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
              {pending ? "Saving password…" : "Continue to dashboard"}
            </Button>
          </form>
        </div>
      </AuthFormCard>
    </>
  );
}
