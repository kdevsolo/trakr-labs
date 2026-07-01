"use client";

import { useEffect } from "react";
import { useQueryClient } from "@tanstack/react-query";

import { queryKeys } from "@/lib/api";
import type { User } from "@/lib/api/types";

type MeHydrationProps = {
  initialMe: User | null;
  children: React.ReactNode;
};

export function MeHydration({ initialMe, children }: MeHydrationProps) {
  const queryClient = useQueryClient();

  useEffect(() => {
    if (initialMe) {
      queryClient.setQueryData(queryKeys.users.me(), initialMe);
    }
  }, [initialMe, queryClient]);

  return children;
}
