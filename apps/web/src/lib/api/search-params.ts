export function toSearchParams(
  params?: Record<string, string | number | undefined>,
): string {
  if (!params) return "";

  const search = new URLSearchParams();

  for (const [key, value] of Object.entries(params)) {
    if (value !== undefined && value !== "") {
      search.set(key, String(value));
    }
  }

  const query = search.toString();
  return query ? `?${query}` : "";
}
