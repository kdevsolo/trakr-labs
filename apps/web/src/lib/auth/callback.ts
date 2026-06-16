export function resolveNextPath(next: string | null) {
  const path = next ?? "/dashboard";
  if (!path.startsWith("/") || path.startsWith("//")) {
    return "/dashboard";
  }
  return path;
}

export function resolveAuthRedirectPath(
  type: string | null,
  next: string | null,
) {
  if (type === "invite") return "/auth/set-password";
  if (type === "recovery") return "/auth/reset-password";
  return resolveNextPath(next);
}

export function hasAuthTokensInHash(hash: string) {
  return hash.includes("access_token=");
}
