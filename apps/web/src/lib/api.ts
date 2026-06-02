const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3001";

export async function fetchHealth() {
  const response = await fetch(`${API_URL}/health`, {
    cache: "no-store",
  });

  if (!response.ok) {
    throw new Error("Failed to fetch API health");
  }

  return response.json() as Promise<{
    status: string;
    timestamp: string;
  }>;
}
