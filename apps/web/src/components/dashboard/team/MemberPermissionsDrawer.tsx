'use client'

import { useEffect, useState } from 'react'
import { Loader2, XIcon } from 'lucide-react'

import { Button } from '@/components/ui/button'
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
} from '@/components/ui/drawer'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { useMemberPermissions } from '@/hooks/api/use-member-permissions'
import { useProjects } from '@/hooks/api/use-projects'
import {
  useAddProjectMember,
  useRemoveProjectMember,
  useSetOrgPermissions,
  useSetProjectPermissions,
} from '@/hooks/api/use-permission-mutations'
import type { User } from '@/lib/api/types'
import {
  deriveOrgPermissions,
  inferOrgRole,
  type OrgRole,
} from '@/lib/permissions/org-role'
import {
  deriveProjectGrants,
  inferProjectAccessLevel,
  PROJECT_ACCESS_OPTIONS,
  type ProjectAccessLevel,
} from '@/lib/permissions/project-access'

import { OrgRoleSelect } from './OrgRoleSelect'

type MemberPermissionsDrawerProps = {
  member: User | null
  open: boolean
  onClose: () => void
}

export function MemberPermissionsDrawer({
  member,
  open,
  onClose,
}: MemberPermissionsDrawerProps) {
  const userId = member?.id ?? null
  const { data: permissions, isLoading: permissionsLoading } =
    useMemberPermissions(userId, open)
  const { data: projects = [], isLoading: projectsLoading } = useProjects()

  const setOrgPermissions = useSetOrgPermissions(userId ?? '')
  const setProjectPermissions = useSetProjectPermissions(userId ?? '')
  const removeProjectMember = useRemoveProjectMember(userId ?? '')
  const addProjectMember = useAddProjectMember()

  const [orgRole, setOrgRole] = useState<OrgRole>('member')
  const [projectLevels, setProjectLevels] = useState<
    Record<string, ProjectAccessLevel>
  >({})
  const [orgError, setOrgError] = useState<string | null>(null)
  const [projectError, setProjectError] = useState<string | null>(null)

  useEffect(() => {
    if (!permissions) return
    setOrgRole(inferOrgRole(permissions.orgWide))
    const levels: Record<string, ProjectAccessLevel> = {}
    for (const project of projects) {
      const grants = permissions.byProject[project.id]
      levels[project.id] = grants
        ? inferProjectAccessLevel(grants)
        : 'none'
    }
    setProjectLevels(levels)
  }, [permissions, projects])

  async function handleSaveOrgAccess() {
    if (!userId || member?.isOrgAdmin) return
    setOrgError(null)
    try {
      await setOrgPermissions.mutateAsync(deriveOrgPermissions(orgRole))
    } catch (err) {
      setOrgError(
        err instanceof Error ? err.message : 'Failed to update org access.',
      )
    }
  }

  async function handleSaveProjectAccess() {
    if (!userId) return
    setProjectError(null)

    try {
      const updates: Promise<void>[] = []

      for (const project of projects) {
        const level = projectLevels[project.id] ?? 'none'
        const existingGrants = permissions?.byProject[project.id]
        const existingLevel = existingGrants
          ? inferProjectAccessLevel(existingGrants)
          : 'none'

        if (level === existingLevel) continue

        if (level === 'none') {
          if (existingLevel !== 'none') {
            updates.push(
              removeProjectMember.mutateAsync(project.id).then(() => undefined),
            )
          }
          continue
        }

        updates.push(
          addProjectMember
            .mutateAsync({ projectId: project.id, userId })
            .then(() =>
              setProjectPermissions.mutateAsync({
                projectId: project.id,
                grants: deriveProjectGrants(level),
              }),
            )
            .then(() => undefined),
        )
      }

      await Promise.all(updates)
    } catch (err) {
      setProjectError(
        err instanceof Error
          ? err.message
          : 'Failed to update project access.',
      )
    }
  }

  const projectSaving =
    setProjectPermissions.isPending ||
    removeProjectMember.isPending ||
    addProjectMember.isPending

  return (
    <Drawer
      open={open}
      onOpenChange={(o) => !o && onClose()}
      direction="right"
    >
      <DrawerContent className="flex h-full w-full flex-col overflow-hidden sm:max-w-lg">
        {member && (
          <>
            <DrawerHeader className="flex-shrink-0 border-b border-border px-5 py-4">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0 flex-1">
                  <DrawerTitle className="text-base font-semibold">
                    {member.name}
                  </DrawerTitle>
                  <p className="text-sm text-muted-foreground">{member.email}</p>
                </div>
                <DrawerClose asChild>
                  <button
                    type="button"
                    onClick={onClose}
                    className="flex size-7 shrink-0 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
                  >
                    <XIcon className="size-3.5" />
                  </button>
                </DrawerClose>
              </div>
            </DrawerHeader>

            <div className="flex-1 overflow-y-auto px-5 py-4">
              {permissionsLoading ? (
                <div className="flex justify-center py-12">
                  <Loader2 className="size-6 animate-spin text-muted-foreground" />
                </div>
              ) : (
                <div className="space-y-8">
                  <section className="space-y-3">
                    <h3 className="text-sm font-semibold text-foreground">
                      Organization access
                    </h3>
                    {member.isOrgAdmin ? (
                      <p className="text-sm text-muted-foreground">
                        This member is an organization admin and bypasses all
                        permission checks. Org-level grants cannot be changed
                        here.
                      </p>
                    ) : (
                      <>
                        <OrgRoleSelect
                          value={orgRole}
                          onValueChange={setOrgRole}
                        />
                        {orgError && (
                          <p className="text-sm text-destructive">{orgError}</p>
                        )}
                        <Button
                          size="sm"
                          onClick={handleSaveOrgAccess}
                          disabled={setOrgPermissions.isPending}
                        >
                          {setOrgPermissions.isPending ? (
                            <>
                              <Loader2 className="size-4 animate-spin" />
                              Saving…
                            </>
                          ) : (
                            'Save org access'
                          )}
                        </Button>
                      </>
                    )}
                  </section>

                  <section className="space-y-3">
                    <h3 className="text-sm font-semibold text-foreground">
                      Project access
                    </h3>
                    {projectsLoading ? (
                      <Loader2 className="size-5 animate-spin text-muted-foreground" />
                    ) : projects.length === 0 ? (
                      <p className="text-sm text-muted-foreground">
                        No projects yet. Create a project to assign project-level
                        access.
                      </p>
                    ) : (
                      <div className="space-y-3">
                        {projects.map((project) => (
                          <div
                            key={project.id}
                            className="flex items-center justify-between gap-4"
                          >
                            <span className="text-sm font-medium text-foreground">
                              {project.name}
                            </span>
                            <Select
                              value={projectLevels[project.id] ?? 'none'}
                              onValueChange={(value) =>
                                setProjectLevels((prev) => ({
                                  ...prev,
                                  [project.id]: value as ProjectAccessLevel,
                                }))
                              }
                            >
                              <SelectTrigger className="w-[140px]">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                {PROJECT_ACCESS_OPTIONS.map((option) => (
                                  <SelectItem
                                    key={option.value}
                                    value={option.value}
                                  >
                                    {option.label}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>
                        ))}
                        {projectError && (
                          <p className="text-sm text-destructive">
                            {projectError}
                          </p>
                        )}
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={handleSaveProjectAccess}
                          disabled={projectSaving}
                        >
                          {projectSaving ? (
                            <>
                              <Loader2 className="size-4 animate-spin" />
                              Saving…
                            </>
                          ) : (
                            'Save project access'
                          )}
                        </Button>
                      </div>
                    )}
                  </section>
                </div>
              )}
            </div>
          </>
        )}
      </DrawerContent>
    </Drawer>
  )
}
