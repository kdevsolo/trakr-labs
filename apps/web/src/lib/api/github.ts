import { apiFetch } from "./client";
import type {
  AvailableRepos,
  GithubConnection,
  InstallUrlResponse,
  LinkRepoInput,
} from "@trakr/schemas";

export function getGithubConnection(projectId: string) {
  return apiFetch<GithubConnection>(`/projects/${projectId}/github`);
}

export function getAvailableRepos(projectId: string) {
  return apiFetch<AvailableRepos>(
    `/projects/${projectId}/github/available-repos`,
  );
}

export function linkRepo(projectId: string, input: LinkRepoInput) {
  return apiFetch<GithubConnection>(`/projects/${projectId}/github/link`, {
    json: input,
  });
}

export function unlinkRepo(projectId: string) {
  return apiFetch<GithubConnection>(`/projects/${projectId}/github/unlink`, {
    method: "POST",
  });
}

export function getInstallUrl() {
  return apiFetch<InstallUrlResponse>(`/github/install-url`);
}
