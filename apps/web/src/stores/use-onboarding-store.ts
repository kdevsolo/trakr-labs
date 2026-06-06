import { TeamInvite } from "@/components/dashboard/onboarding/types";
import { create } from "zustand";

type OnboardingState = {
  step: 1 | 2 | 3;
  orgName: string;
  orgSlug: string;
  invites: TeamInvite[];
  projectName: string;
  setStep: (step: 1 | 2 | 3) => void;
  setOrgName: (orgName: string) => void;
  setOrgSlug: (orgSlug: string) => void;
  setInvites: (invites: TeamInvite[]) => void;
  setProjectName: (projectName: string) => void;
};

export const useOnboardingStore = create<OnboardingState>((set) => ({
  step: 1,
  orgName: '',
  orgSlug: '',
  invites: [],
  projectName: '',
  setStep: (step: 1 | 2 | 3) => set({ step }),
  setOrgName: (orgName: string) => set({ orgName }),
  setOrgSlug: (orgSlug: string) => set({ orgSlug }),
  setInvites: (invites: TeamInvite[]) => set({ invites }),
  setProjectName: (projectName: string) => set({ projectName }),
}));
