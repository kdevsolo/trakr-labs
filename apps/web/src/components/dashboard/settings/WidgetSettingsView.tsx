"use client";

import dynamic from "next/dynamic";
import { ChevronDownIcon, CopyIcon, FolderIcon, RefreshCwIcon } from "lucide-react";
import { useEffect, useMemo, useState } from "react";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import {
  useDisableWidget,
  useEnableWidget,
  useRotateWidgetSecret,
  useWidgetConfig,
} from "@/hooks/api/use-widget";
import { useProjects } from "@/hooks/api/use-projects";
import type { Project } from "@/lib/api";

import "@trakr/widget-ui/styles.css";

const FeedbackWidget = dynamic(
  () => import("@trakr/widget-ui").then((mod) => mod.FeedbackWidget),
  { ssr: false },
);

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3001";
const WIDGET_URL =
  process.env.NEXT_PUBLIC_WIDGET_URL ?? "http://localhost:5173/trakr-widget.js";

function buildEmbedSnippet(
  projectKey: string,
  widgetSecret: string,
): string {
  return `<script
  src="${WIDGET_URL}"
  data-project-key="${projectKey}"
  data-widget-secret="${widgetSecret}"
  data-api-url="${API_URL}"
  async
></script>`;
}

export function WidgetSettingsView() {
  const { data: projects = [], isLoading: projectsLoading } = useProjects();
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [revealedSecret, setRevealedSecret] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [projectMenuOpen, setProjectMenuOpen] = useState(false);

  const projectId = selectedProject?.id ?? "";
  const { data: widgetConfig, isLoading: configLoading } =
    useWidgetConfig(projectId);
  const enableWidget = useEnableWidget(projectId);
  const rotateSecret = useRotateWidgetSecret(projectId);
  const disableWidget = useDisableWidget(projectId);

  useEffect(() => {
    if (projects.length === 0) {
      setSelectedProject(null);
      return;
    }

    setSelectedProject((current) => {
      if (current && projects.some((project) => project.id === current.id)) {
        return current;
      }
      return projects[0] ?? null;
    });
  }, [projects]);

  useEffect(() => {
    setRevealedSecret(null);
  }, [projectId]);

  const embedSnippet = useMemo(() => {
    if (!widgetConfig?.projectKey || !revealedSecret) {
      return null;
    }
    return buildEmbedSnippet(widgetConfig.projectKey, revealedSecret);
  }, [revealedSecret, widgetConfig?.projectKey]);

  async function handleEnable() {
    const result = await enableWidget.mutateAsync();
    setRevealedSecret(result.widgetSecret);
  }

  async function handleRotate() {
    const result = await rotateSecret.mutateAsync();
    setRevealedSecret(result.widgetSecret);
  }

  async function handleDisable() {
    await disableWidget.mutateAsync();
    setRevealedSecret(null);
  }

  async function handleCopySnippet() {
    if (!embedSnippet) return;
    await navigator.clipboard.writeText(embedSnippet);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 2000);
  }

  const previewReady =
    widgetConfig?.enabled && revealedSecret && widgetConfig.projectKey;

  return (
    <div className="space-y-8">
      <div className="flex items-center gap-2">
        <span className="text-sm font-medium text-muted-foreground">
          Project:
        </span>
        <DropdownMenu open={projectMenuOpen} onOpenChange={setProjectMenuOpen}>
          <DropdownMenuTrigger asChild>
            <button
              type="button"
              disabled={projectsLoading}
              className="flex h-8 items-center gap-2 rounded-md border border-input bg-background px-3 text-sm font-medium transition-colors hover:bg-accent focus:outline-none disabled:opacity-50"
            >
              <FolderIcon className="size-3.5 text-muted-foreground" />
              {projectsLoading
                ? "Loading projects…"
                : selectedProject?.name ?? "Select project"}
              <ChevronDownIcon className="size-3.5 text-muted-foreground" />
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start" className="w-56">
            <DropdownMenuLabel>Switch project</DropdownMenuLabel>
            <DropdownMenuSeparator />
            {projects.map((project) => (
              <DropdownMenuItem
                key={project.id}
                onClick={() => {
                  setSelectedProject(project);
                  setProjectMenuOpen(false);
                }}
              >
                {project.name}
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {!selectedProject ? (
        <p className="text-sm text-muted-foreground">
          Create a project to configure the feedback widget.
        </p>
      ) : (
        <>
          <section className="rounded-lg border border-border bg-white p-5">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <h2 className="text-base font-semibold text-foreground">
                  Widget status
                </h2>
                <p className="text-sm text-muted-foreground">
                  {configLoading
                    ? "Loading configuration…"
                    : widgetConfig?.enabled
                      ? "Enabled — copy the embed code after enabling or rotating the secret."
                      : "Disabled — enable the widget to generate credentials."}
                </p>
              </div>
              <div className="flex flex-wrap gap-2">
                {!widgetConfig?.enabled ? (
                  <Button
                    onClick={handleEnable}
                    disabled={enableWidget.isPending || configLoading}
                  >
                    Enable widget
                  </Button>
                ) : (
                  <>
                    <Button
                      variant="outline"
                      onClick={handleRotate}
                      disabled={rotateSecret.isPending}
                    >
                      <RefreshCwIcon className="size-4" />
                      Rotate secret
                    </Button>
                    <Button
                      variant="destructive"
                      onClick={handleDisable}
                      disabled={disableWidget.isPending}
                    >
                      Disable
                    </Button>
                  </>
                )}
              </div>
            </div>

            {widgetConfig ? (
              <dl className="mt-4 grid gap-3 text-sm sm:grid-cols-2">
                <div>
                  <dt className="text-muted-foreground">Project key</dt>
                  <dd className="font-mono text-xs">{widgetConfig.projectKey}</dd>
                </div>
                <div>
                  <dt className="text-muted-foreground">Secret configured</dt>
                  <dd>{widgetConfig.hasSecret ? "Yes" : "No"}</dd>
                </div>
              </dl>
            ) : null}
          </section>

          {revealedSecret ? (
            <section className="rounded-lg border border-amber-200 bg-amber-50 p-5">
              <h2 className="text-base font-semibold text-foreground">
                Save your widget secret
              </h2>
              <p className="mt-1 text-sm text-muted-foreground">
                Copy the embed code below now. The secret is not stored in your
                browser and will not be shown again after you leave this page.
              </p>
              <p className="mt-3 font-mono text-xs break-all rounded-md bg-white p-3 border border-border">
                {revealedSecret}
              </p>
            </section>
          ) : null}

          {embedSnippet ? (
            <section className="rounded-lg border border-border bg-white p-5">
              <div className="mb-3 flex items-center justify-between gap-3">
                <h2 className="text-base font-semibold text-foreground">
                  Embed code
                </h2>
                <Button variant="outline" size="sm" onClick={handleCopySnippet}>
                  <CopyIcon className="size-4" />
                  {copied ? "Copied" : "Copy snippet"}
                </Button>
              </div>
              <pre className="overflow-x-auto rounded-md bg-zinc-950 p-4 text-xs text-zinc-100">
                {embedSnippet}
              </pre>
            </section>
          ) : widgetConfig?.enabled && widgetConfig.hasSecret ? (
            <p className="text-sm text-muted-foreground">
              Rotate the secret to reveal the embed code and live preview.
            </p>
          ) : null}

          <section className="rounded-lg border border-border bg-white p-5">
            <h2 className="text-base font-semibold text-foreground">
              Live preview
            </h2>
            <p className="mt-1 text-sm text-muted-foreground">
              Test the same widget your users will embed, including image uploads.
            </p>

            <div className="mt-4 rounded-lg border border-dashed border-border bg-zinc-50 p-6">
              {previewReady ? (
                <div className="trakr-widget mx-auto max-w-md">
                  <FeedbackWidget
                    mode="inline"
                    projectKey={widgetConfig.projectKey}
                    widgetSecret={revealedSecret}
                    apiUrl={API_URL}
                  />
                </div>
              ) : widgetConfig?.enabled && widgetConfig.hasSecret ? (
                <p className="text-center text-sm text-muted-foreground">
                  Rotate the secret to restore the live preview in this session.
                </p>
              ) : (
                <p className="text-center text-sm text-muted-foreground">
                  Enable the widget to preview submissions here.
                </p>
              )}
            </div>
          </section>
        </>
      )}
    </div>
  );
}
