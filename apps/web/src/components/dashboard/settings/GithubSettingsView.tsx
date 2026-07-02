"use client";

import { GithubIcon, Link2Icon, Unlink2Icon } from "lucide-react";
import { useEffect, useMemo, useState } from "react";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import {
  useAvailableRepos,
  useGithubConnection,
  useGithubInstallUrl,
  useLinkRepo,
  useUnlinkRepo,
} from "@/hooks/api/use-github";
import type { Project } from "@/lib/api";

type GithubSettingsViewProps = {
  project: Project | null;
};

type SetupBanner = "connected" | "error" | null;

function readSetupBanner(): SetupBanner {
  if (typeof window === "undefined") return null;
  const value = new URLSearchParams(window.location.search).get("github");
  if (value === "connected" || value === "error") {
    return value;
  }
  return null;
}

export function GithubSettingsView({ project }: GithubSettingsViewProps) {
  const [picking, setPicking] = useState(false);
  const [selectedRepo, setSelectedRepo] = useState<string>("");
  const [banner, setBanner] = useState<SetupBanner>(null);

  const projectId = project?.id ?? "";
  const { data: connection, isLoading: connectionLoading } =
    useGithubConnection(projectId);

  const installed = connection?.installed ?? false;
  const connected = connection?.connected ?? false;

  const showPicker = installed && (picking || !connected);

  const { data: repos = [], isLoading: reposLoading } = useAvailableRepos(
    projectId,
    showPicker,
  );

  const installUrl = useGithubInstallUrl();
  const linkRepo = useLinkRepo(projectId);
  const unlinkRepo = useUnlinkRepo(projectId);

  useEffect(() => {
    setBanner(readSetupBanner());
    if (readSetupBanner() && typeof window !== "undefined") {
      const url = new URL(window.location.href);
      url.searchParams.delete("github");
      window.history.replaceState({}, "", url.toString());
    }
  }, []);

  useEffect(() => {
    setPicking(false);
    setSelectedRepo("");
  }, [projectId]);

  const selectedRepoObject = useMemo(
    () => repos.find((repo) => `${repo.owner}/${repo.name}` === selectedRepo),
    [repos, selectedRepo],
  );

  async function handleConnect() {
    const result = await installUrl.mutateAsync();
    window.location.href = result.url;
  }

  async function handleLink() {
    if (!selectedRepoObject) return;
    await linkRepo.mutateAsync({
      repoOwner: selectedRepoObject.owner,
      repoName: selectedRepoObject.name,
    });
    setPicking(false);
    setSelectedRepo("");
  }

  async function handleDisconnect() {
    await unlinkRepo.mutateAsync();
    setPicking(false);
    setSelectedRepo("");
  }

  return (
    <>
      {banner ? (
        <div
          className={
            banner === "connected"
              ? "rounded-lg border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-800"
              : "rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-800"
          }
        >
          {banner === "connected"
            ? "GitHub connected. Select a repository to link it to a project below."
            : "GitHub connection failed. Please try connecting again."}
        </div>
      ) : null}

      {!project ? (
        <p className="text-sm text-muted-foreground">
          Create a project to link a GitHub repository.
        </p>
      ) : (
        <section className="rounded-lg border border-border bg-white p-5">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div className="flex items-start gap-3">
              <GithubIcon className="mt-0.5 size-5 text-foreground" />
              <div>
                <h2 className="text-base font-semibold text-foreground">
                  GitHub repository
                </h2>
                <p className="text-sm text-muted-foreground">
                  {connectionLoading
                    ? "Loading connection…"
                    : connected && connection?.repo
                      ? `Linked to ${connection.repo.owner}/${connection.repo.name} (${connection.repo.defaultBranch})`
                      : installed
                        ? "GitHub is connected. Link a repository to this project."
                        : "Connect the GitHub app to link repositories (read-only access)."}
                </p>
              </div>
            </div>

            {connected && !picking ? (
              <div className="flex gap-2">
                <Button variant="outline" onClick={() => setPicking(true)}>
                  Change repository
                </Button>
                <Button
                  variant="destructive"
                  onClick={handleDisconnect}
                  disabled={unlinkRepo.isPending}
                >
                  <Unlink2Icon className="size-4" />
                  Disconnect
                </Button>
              </div>
            ) : null}
          </div>

          {!installed && !connectionLoading ? (
            <div className="mt-4">
              <Button
                onClick={handleConnect}
                disabled={installUrl.isPending}
              >
                <GithubIcon className="size-4" />
                Connect GitHub
              </Button>
            </div>
          ) : null}

          {showPicker ? (
            <div className="mt-4 flex flex-wrap items-center gap-3">
              <Select value={selectedRepo} onValueChange={setSelectedRepo}>
                <SelectTrigger className="w-72">
                  <SelectValue
                    placeholder={
                      reposLoading ? "Loading repositories…" : "Select a repository"
                    }
                  />
                </SelectTrigger>
                <SelectContent>
                  {repos.map((repo) => (
                    <SelectItem
                      key={repo.repoId}
                      value={`${repo.owner}/${repo.name}`}
                    >
                      {repo.owner}/{repo.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Button
                onClick={handleLink}
                disabled={!selectedRepoObject || linkRepo.isPending}
              >
                <Link2Icon className="size-4" />
                Link repository
              </Button>
              {connected && picking ? (
                <Button variant="ghost" onClick={() => setPicking(false)}>
                  Cancel
                </Button>
              ) : null}
              {!reposLoading && repos.length === 0 ? (
                <p className="text-sm text-muted-foreground">
                  No repositories available. Grant the GitHub app access to a
                  repository, then refresh.
                </p>
              ) : null}
            </div>
          ) : null}
        </section>
      )}
    </>
  );
}
