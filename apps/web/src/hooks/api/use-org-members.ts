import { useOrgMembersStore } from "@/stores/use-org-members-store";

export function useOrgMembers() {
  const members = useOrgMembersStore((state) => state.members);
  const isLoading = useOrgMembersStore((state) => state.isLoading);

  return { data: members, isLoading };
}
