import { Suspense } from "react";

import { AuthCallbackHandler } from "@/components/auth/auth-callback-handler";

export default function AuthCallbackPage() {
  return (
    <Suspense
      fallback={
        <p className="text-center text-sm text-muted-foreground">
          Completing sign in…
        </p>
      }
    >
      <AuthCallbackHandler />
    </Suspense>
  );
}
