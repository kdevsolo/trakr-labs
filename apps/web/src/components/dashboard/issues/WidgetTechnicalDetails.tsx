"use client";

import { ChevronDownIcon } from "lucide-react";
import { useState } from "react";

import { cn } from "@/lib/utils";
import { SafeExternalLink } from "@/components/shared/SafeExternalLink";
import {
  WidgetIssueMetadataSchema,
  type ConsoleLogEntry,
  type FailedNetworkRequest,
  type FeedbackContext,
  type WidgetIssueMetadata,
} from "@trakr/schemas";

type WidgetTechnicalDetailsProps = {
  metadata: unknown;
};

export function WidgetTechnicalDetails({ metadata }: WidgetTechnicalDetailsProps) {
  const parsed = WidgetIssueMetadataSchema.safeParse(metadata);

  if (!parsed.success || parsed.data.source !== "widget") {
    return null;
  }

  const widgetMetadata = parsed.data;

  return (
    <div className="space-y-4">
      <WidgetMetadataSummary metadata={widgetMetadata} />
      {widgetMetadata.context ? (
        <TechnicalContextDetails context={widgetMetadata.context} />
      ) : null}
    </div>
  );
}

function WidgetMetadataSummary({ metadata }: { metadata: WidgetIssueMetadata }) {
  if (!metadata.pageUrl) {
    return null;
  }

  return (
    <div className="grid grid-cols-1 gap-3 rounded-md border border-border bg-muted/20 p-3">
      <MetaRow
        label="Page URL"
        value={
          <SafeExternalLink
            href={metadata.pageUrl}
            className="break-all text-primary hover:underline"
          >
            {metadata.pageUrl}
          </SafeExternalLink>
        }
      />
    </div>
  );
}

function TechnicalContextDetails({ context }: { context: FeedbackContext }) {
  const [open, setOpen] = useState(false);

  return (
    <div className="rounded-md border border-border">
      <button
        type="button"
        onClick={() => setOpen((current) => !current)}
        className="flex w-full items-center justify-between px-3 py-2.5 text-left"
      >
        <span className="text-sm font-semibold text-foreground">
          Technical details
        </span>
        <ChevronDownIcon
          className={cn(
            "size-4 text-muted-foreground transition-transform",
            open && "rotate-180",
          )}
        />
      </button>

      {open ? (
        <div className="space-y-4 border-t border-border px-3 py-3">
          <EnvironmentSection device={context.device} />
          {context.consoleLogs && context.consoleLogs.length > 0 ? (
            <ConsoleSection logs={context.consoleLogs} />
          ) : null}
          {context.failedRequests && context.failedRequests.length > 0 ? (
            <FailedRequestsSection requests={context.failedRequests} />
          ) : null}
        </div>
      ) : null}
    </div>
  );
}

function EnvironmentSection({
  device,
}: {
  device: FeedbackContext["device"];
}) {
  return (
    <Section title="Environment">
      <div className="grid grid-cols-1 gap-2 text-sm">
        <MetaRow label="User agent" value={device.userAgent} mono />
        <MetaRow
          label="Viewport"
          value={`${device.viewport.width} × ${device.viewport.height}`}
        />
        <MetaRow
          label="Screen"
          value={`${device.screen.width} × ${device.screen.height}`}
        />
        {device.timezone ? (
          <MetaRow label="Timezone" value={device.timezone} />
        ) : null}
        {device.online !== undefined ? (
          <MetaRow label="Online" value={device.online ? "Yes" : "No"} />
        ) : null}
        {device.referrer ? (
          <MetaRow label="Referrer" value={device.referrer} mono />
        ) : null}
      </div>
    </Section>
  );
}

function ConsoleSection({ logs }: { logs: ConsoleLogEntry[] }) {
  return (
    <Section title={`Console (${logs.length})`}>
      <div className="max-h-48 space-y-2 overflow-y-auto rounded-md bg-zinc-950 p-3">
        {logs.map((log, index) => (
          <div key={`${log.timestamp}-${index}`} className="text-xs">
            <div className="mb-0.5 flex items-center gap-2">
              <LevelBadge level={log.level} />
              <span className="text-zinc-500">{formatTimestamp(log.timestamp)}</span>
            </div>
            <pre className="whitespace-pre-wrap break-words font-mono text-zinc-100">
              {log.message}
            </pre>
          </div>
        ))}
      </div>
    </Section>
  );
}

function FailedRequestsSection({
  requests,
}: {
  requests: FailedNetworkRequest[];
}) {
  return (
    <Section title={`Failed requests (${requests.length})`}>
      <div className="overflow-x-auto">
        <table className="w-full min-w-[20rem] text-left text-xs">
          <thead>
            <tr className="border-b border-border text-muted-foreground">
              <th className="px-2 py-1.5 font-medium">Method</th>
              <th className="px-2 py-1.5 font-medium">Status</th>
              <th className="px-2 py-1.5 font-medium">Duration</th>
              <th className="px-2 py-1.5 font-medium">URL</th>
            </tr>
          </thead>
          <tbody>
            {requests.map((request, index) => (
              <tr
                key={`${request.timestamp}-${index}`}
                className="border-b border-border/60 align-top"
              >
                <td className="px-2 py-1.5 text-foreground">
                  {request.method ?? "—"}
                </td>
                <td className="px-2 py-1.5 text-foreground">
                  {request.status ?? request.error ?? "—"}
                </td>
                <td className="px-2 py-1.5 text-muted-foreground">
                  {request.durationMs !== undefined
                    ? `${request.durationMs}ms`
                    : "—"}
                </td>
                <td className="max-w-xs px-2 py-1.5">
                  <span className="break-all font-mono text-foreground/80">
                    {request.url}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Section>
  );
}

function Section({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <h4 className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
        {title}
      </h4>
      {children}
    </div>
  );
}

function MetaRow({
  label,
  value,
  mono = false,
}: {
  label: string;
  value: React.ReactNode;
  mono?: boolean;
}) {
  return (
    <div className="flex flex-col gap-0.5">
      <span className="text-xs font-medium text-muted-foreground">{label}</span>
      <span
        className={cn(
          "break-words text-foreground/90",
          mono && "font-mono text-xs",
        )}
      >
        {value}
      </span>
    </div>
  );
}

function LevelBadge({ level }: { level: ConsoleLogEntry["level"] }) {
  const styles: Record<ConsoleLogEntry["level"], string> = {
    log: "bg-zinc-700 text-zinc-100",
    info: "bg-sky-800 text-sky-100",
    warn: "bg-amber-800 text-amber-100",
    error: "bg-red-800 text-red-100",
    debug: "bg-violet-800 text-violet-100",
  };

  return (
    <span
      className={cn(
        "rounded px-1.5 py-0.5 font-mono text-[10px] font-semibold uppercase",
        styles[level],
      )}
    >
      {level}
    </span>
  );
}

function formatTimestamp(timestamp: string): string {
  const date = new Date(timestamp);
  if (Number.isNaN(date.getTime())) return timestamp;
  return date.toLocaleTimeString();
}
