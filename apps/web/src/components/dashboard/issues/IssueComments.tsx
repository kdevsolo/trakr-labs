"use client";

import { useState } from "react";

import { Button } from "@/components/ui/button";
import {
  useCreateIssueComment,
  useIssueComments,
} from "@/hooks/api/use-issue-comments";
import { cn } from "@/lib/utils";

import { formatRelativeTime } from "./IssueTable";

type IssueCommentsProps = {
  projectId: string;
  issueId: string;
};

export function IssueComments({ projectId, issueId }: IssueCommentsProps) {
  const { data: comments = [], isLoading } = useIssueComments(
    projectId,
    issueId,
  );
  const createComment = useCreateIssueComment(projectId, issueId);
  const [content, setContent] = useState("");

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    const trimmed = content.trim();
    if (!trimmed || createComment.isPending) return;

    createComment.mutate(
      { content: trimmed },
      {
        onSuccess: () => {
          setContent("");
        },
      },
    );
  }

  return (
    <div className="space-y-4">
      <h3 className="text-sm font-semibold text-foreground">Comments</h3>

      {isLoading ? (
        <p className="text-sm text-muted-foreground">Loading comments…</p>
      ) : comments.length === 0 ? (
        <p className="text-sm text-muted-foreground">No comments yet.</p>
      ) : (
        <ul className="space-y-4">
          {comments.map((comment) => (
            <li key={comment.id} className="space-y-1">
              <div className="flex items-baseline justify-between gap-2">
                <span className="text-sm font-medium text-foreground">
                  {comment.author?.name ?? "Unknown user"}
                </span>
                <time
                  dateTime={comment.createdAt}
                  className="shrink-0 text-xs text-muted-foreground"
                >
                  {formatRelativeTime(comment.createdAt)}
                </time>
              </div>
              <p className="whitespace-pre-wrap text-sm leading-relaxed text-foreground/80">
                {comment.content}
              </p>
            </li>
          ))}
        </ul>
      )}

      <form onSubmit={handleSubmit} className="space-y-3">
        <textarea
          value={content}
          onChange={(event) => setContent(event.target.value)}
          placeholder="Add a comment…"
          rows={3}
          disabled={createComment.isPending}
          className={cn(
            "flex w-full resize-none rounded-md border border-input bg-card px-3 py-2 text-sm shadow-sm transition-colors placeholder:text-muted-foreground focus-visible:border-ring focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/25 disabled:cursor-not-allowed disabled:opacity-50",
          )}
        />
        <div className="flex justify-end">
          <Button
            type="submit"
            size="sm"
            disabled={!content.trim() || createComment.isPending}
          >
            {createComment.isPending ? "Posting…" : "Post comment"}
          </Button>
        </div>
      </form>
    </div>
  );
}
