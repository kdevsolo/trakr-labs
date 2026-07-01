"use client";

import { useState } from "react";
import { Loader2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
} from "@/components/ui/drawer";
import { Input } from "@/components/ui/input";
import { useCreateProject } from "@/hooks/api/use-create-project";
import type { Project } from "@/lib/api";

import { FieldLabel } from "../onboarding/FieldLabel";

type CreateProjectDrawerProps = {
  open: boolean;
  onClose: () => void;
  onCreated: (project: Project) => void;
};

export function CreateProjectDrawer({
  open,
  onClose,
  onCreated,
}: CreateProjectDrawerProps) {
  const [name, setName] = useState("");
  const [error, setError] = useState<string | null>(null);
  const createProject = useCreateProject();

  function resetForm() {
    setName("");
    setError(null);
  }

  function handleClose() {
    resetForm();
    onClose();
  }

  async function handleSubmit() {
    const trimmedName = name.trim();

    if (!trimmedName) {
      setError("Project name is required.");
      return;
    }

    setError(null);

    try {
      const project = await createProject.mutateAsync({
        name: trimmedName,
      });
      onCreated(project);
      handleClose();
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to create project.",
      );
    }
  }

  return (
    <Drawer open={open} onOpenChange={(isOpen) => !isOpen && handleClose()} direction="right">
      <DrawerContent className="max-w-md">
        <DrawerHeader>
          <DrawerTitle>Create project</DrawerTitle>
          <DrawerDescription>Create a new project to start tracking issues.</DrawerDescription>
        </DrawerHeader>

        <div className="space-y-4 px-4">
          <div className="space-y-2">
            <FieldLabel required>Project name</FieldLabel>
            <Input
              placeholder="e.g. Backend API Rewrite"
              value={name}
              onChange={(event) => setName(event.target.value)}
              disabled={createProject.isPending}
            />
          </div>

          {error && (
            <p className="rounded-md bg-destructive/10 px-3 py-2 text-sm text-destructive">
              {error}
            </p>
          )}
        </div>

        <DrawerFooter className="flex-row justify-end gap-2">
          <DrawerClose asChild>
            <Button variant="outline" disabled={createProject.isPending}>
              Cancel
            </Button>
          </DrawerClose>
          <Button onClick={handleSubmit} disabled={createProject.isPending}>
            {createProject.isPending ? (
              <>
                <Loader2 className="size-4 animate-spin" />
                Creating…
              </>
            ) : (
              "Create project"
            )}
          </Button>
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  );
}
