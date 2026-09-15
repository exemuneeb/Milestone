import { useQuery } from "@tanstack/react-query";
import type { Client, Consultant } from "@workspace/api-client-react";

export type AccountRole = "consultant" | "client";
export type CurrentProfile = {
  role: AccountRole | null;
  profile: Consultant | Client | null;
};

export const currentProfileQueryKey = ["current-profile"];

export async function fetchCurrentProfile(): Promise<CurrentProfile> {
  const response = await fetch("/api/me", { credentials: "include" });
  if (!response.ok) throw new Error("Unable to load your account.");
  return response.json() as Promise<CurrentProfile>;
}

export function useCurrentProfile(enabled = true) {
  return useQuery({
    queryKey: currentProfileQueryKey,
    queryFn: fetchCurrentProfile,
    enabled,
    staleTime: 30_000,
  });
}

export async function createAccountProfile(data: Record<string, unknown>) {
  const response = await fetch("/api/me/role", {
    method: "POST",
    credentials: "include",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(data),
  });
  const result = await response.json();
  if (!response.ok) throw new Error(result.error ?? "Unable to finish account setup.");
  return result as CurrentProfile;
}