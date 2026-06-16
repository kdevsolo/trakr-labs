"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";

import {
  resolveAuthRedirectPath,
  resolveNextPath,
} from "@/lib/auth/callback";
import { createClient } from "@/utils/supabase/client";

export function AuthCallbackHandler() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [message, setMessage] = useState("Completing sign in…");

  useEffect(() => {
    let cancelled = false;

    async function handleCallback() {
      const supabase = createClient();
      const next = searchParams.get("next");

      const hash = window.location.hash.startsWith("#")
        ? window.location.hash.slice(1)
        : window.location.hash;

      if (hash) {
        const hashParams = new URLSearchParams(hash);
        const accessToken = hashParams.get("access_token");
        const refreshToken = hashParams.get("refresh_token");
        const type = hashParams.get("type");

        if (accessToken && refreshToken) {
          const { error } = await supabase.auth.setSession({
            access_token: accessToken,
            refresh_token: refreshToken,
          });

          if (cancelled) return;

          if (error) {
            router.replace("/auth/login?error=auth_callback_failed");
            return;
          }

          window.history.replaceState(
            null,
            "",
            `${window.location.pathname}${window.location.search}`,
          );
          router.replace(resolveAuthRedirectPath(type, next));
          return;
        }
      }

      const code = searchParams.get("code");
      if (code) {
        const { error } = await supabase.auth.exchangeCodeForSession(code);

        if (cancelled) return;

        if (error) {
          router.replace("/auth/login?error=auth_callback_failed");
          return;
        }

        router.replace(resolveNextPath(next));
        return;
      }

      router.replace("/auth/login?error=auth_callback_failed");
    }

    void handleCallback();

    return () => {
      cancelled = true;
    };
  }, [router, searchParams]);

  return (
    <p className="text-center text-sm text-muted-foreground">{message}</p>
  );
}
