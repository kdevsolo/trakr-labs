"use client";

import dynamic from "next/dynamic";
import { CopyIcon, RefreshCwIcon } from "lucide-react";
import { useEffect, useMemo, useState } from "react";

import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  useDisableWidget,
  useEnableWidget,
  useRotateWidgetSecret,
  useUpdateWidgetSettings,
  useWidgetConfig,
} from "@/hooks/api/use-widget";
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

type WidgetSettingsViewProps = {
  project: Project | null;
};

export function WidgetSettingsView({ project }: WidgetSettingsViewProps) {
  const [freshSecret, setFreshSecret] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const projectId = project?.id ?? "";
  const { data: widgetConfig, isLoading: configLoading } =
    useWidgetConfig(projectId);
  const enableWidget = useEnableWidget(projectId);
  const rotateSecret = useRotateWidgetSecret(projectId);
  const disableWidget = useDisableWidget(projectId);
  const updateSettings = useUpdateWidgetSettings(projectId);

  useEffect(() => {
    setFreshSecret(null);
  }, [projectId]);

  const widgetSecret = widgetConfig?.widgetSecret ?? freshSecret;

  const embedSnippet = useMemo(() => {
    if (!widgetConfig?.projectKey || !widgetSecret) {
      return null;
    }
    return buildEmbedSnippet(widgetConfig.projectKey, widgetSecret);
  }, [widgetSecret, widgetConfig?.projectKey]);

  async function handleEnable() {
    const result = await enableWidget.mutateAsync();
    setFreshSecret(result.widgetSecret);
  }

  async function handleRotate() {
    const result = await rotateSecret.mutateAsync();
    setFreshSecret(result.widgetSecret);
  }

  async function handleDisable() {
    await disableWidget.mutateAsync();
    setFreshSecret(null);
  }

  async function handleCopySnippet() {
    if (!embedSnippet) return;
    await navigator.clipboard.writeText(embedSnippet);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 2000);
  }

  const previewReady =
    widgetConfig?.enabled && widgetSecret && widgetConfig.projectKey;
  const needsSecretRotation =
    widgetConfig?.enabled && widgetConfig.hasSecret && !widgetSecret;

  return (
    <>
      {!project ? (
        <p className="text-sm text-muted-foreground">
          Create a project to configure the feedback widget.
        </p>
      ) : (
        <div className="space-y-8">
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
                      ? "Enabled — copy the embed code below."
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

          {widgetConfig?.enabled ? (
            <section className="rounded-lg border border-border bg-white p-5">
              <h2 className="text-base font-semibold text-foreground">
                Automatic reporting
              </h2>
              <p className="mt-1 text-sm text-muted-foreground">
                Crashes and server or network failures are reported as issues
                without user action. HTTP 4xx responses are not auto-reported.
              </p>

              <div className="mt-4 space-y-4">
                <label className="flex items-start gap-3 text-sm">
                  <input
                    type="checkbox"
                    className="mt-1"
                    checked={widgetConfig.autoCrashReport}
                    disabled={updateSettings.isPending || configLoading}
                    onChange={(event) => {
                      void updateSettings.mutateAsync({
                        autoCrashReport: event.target.checked,
                      });
                    }}
                  />
                  <span>
                    <Label className="text-foreground">Auto-report crashes</Label>
                    <span className="mt-0.5 block text-muted-foreground">
                      Uncaught errors and unhandled promise rejections.
                    </span>
                  </span>
                </label>

                <label className="flex items-start gap-3 text-sm">
                  <input
                    type="checkbox"
                    className="mt-1"
                    checked={widgetConfig.autoNetworkReport}
                    disabled={updateSettings.isPending || configLoading}
                    onChange={(event) => {
                      void updateSettings.mutateAsync({
                        autoNetworkReport: event.target.checked,
                      });
                    }}
                  />
                  <span>
                    <Label className="text-foreground">
                      Auto-report network failures
                    </Label>
                    <span className="mt-0.5 block text-muted-foreground">
                      HTTP 5xx responses, timeouts, and network errors.
                    </span>
                  </span>
                </label>
              </div>
            </section>
          ) : null}

          {freshSecret ? (
            <section className="rounded-lg border border-amber-200 bg-amber-50 p-5">
              <h2 className="text-base font-semibold text-foreground">
                Secret updated
              </h2>
              <p className="mt-1 text-sm text-muted-foreground">
                Update the embed code on your site if you rotated the secret.
                Existing installs will stop working until you deploy the new
                snippet.
              </p>
              <p className="mt-3 font-mono text-xs break-all rounded-md bg-white p-3 border border-border">
                {freshSecret}
              </p>
            </section>
          ) : null}

          {widgetConfig?.enabled ? (
            <section className="rounded-lg border border-border bg-white p-5">
              <div className="mb-3 flex items-center justify-between gap-3">
                <h2 className="text-base font-semibold text-foreground">
                  Embed code
                </h2>
                {embedSnippet ? (
                  <Button variant="outline" size="sm" onClick={handleCopySnippet}>
                    <CopyIcon className="size-4" />
                    {copied ? "Copied" : "Copy snippet"}
                  </Button>
                ) : null}
              </div>
              {embedSnippet ? (
                <>
                  <pre className="overflow-x-auto rounded-md bg-zinc-950 p-4 text-xs text-zinc-100">
                    {embedSnippet}
                  </pre>
                  <p className="mt-3 text-sm text-muted-foreground">
                    Add <code className="text-xs">data-ui=&quot;false&quot;</code> to
                    disable the feedback button while keeping automatic crash and
                    network reporting.
                  </p>
                </>
              ) : needsSecretRotation ? (
                <p className="text-sm text-muted-foreground">
                  Rotate the secret once to restore the embed code for projects
                  enabled before encrypted storage was added.
                </p>
              ) : (
                <p className="text-sm text-muted-foreground">
                  Enable the widget to generate embed code.
                </p>
              )}
            </section>
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
                    widgetSecret={widgetSecret}
                    apiUrl={API_URL}
                  />
                </div>
              ) : needsSecretRotation ? (
                <p className="text-center text-sm text-muted-foreground">
                  Rotate the secret once to restore the live preview for projects
                  enabled before encrypted storage was added.
                </p>
              ) : (
                <p className="text-center text-sm text-muted-foreground">
                  Enable the widget to preview submissions here.
                </p>
              )}
            </div>
          </section>
        </div>
      )}
    </>
  );
}
