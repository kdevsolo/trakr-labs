'use client'

import { useState } from 'react'
import { Loader2 } from 'lucide-react'

import { Button } from '@/components/ui/button'
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
} from '@/components/ui/drawer'
import { Input } from '@/components/ui/input'
import { useInviteMember } from '@/hooks/api/use-invite-member'
import {
  deriveOrgPermissions,
  type OrgRole,
} from '@/lib/permissions/org-role'

import { FieldLabel } from '../onboarding/FieldLabel'
import { OrgRoleSelect } from './OrgRoleSelect'

type AddMemberDrawerProps = {
  open: boolean
  onClose: () => void
}

export function AddMemberDrawer({ open, onClose }: AddMemberDrawerProps) {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [orgRole, setOrgRole] = useState<OrgRole>('member')
  const [error, setError] = useState<string | null>(null)

  const inviteMember = useInviteMember()

  function resetForm() {
    setName('')
    setEmail('')
    setOrgRole('member')
    setError(null)
  }

  function handleClose() {
    resetForm()
    onClose()
  }

  async function handleSubmit() {
    if (!name.trim() || !email.trim()) {
      setError('Name and email are required.')
      return
    }

    setError(null)

    try {
      await inviteMember.mutateAsync({
        name: name.trim(),
        email: email.trim(),
        permissions: deriveOrgPermissions(orgRole),
      })
      handleClose()
    } catch (err) {
      setError(
        err instanceof Error ? err.message : 'Failed to send invite.',
      )
    }
  }

  return (
    <Drawer
      open={open}
      onOpenChange={(o) => !o && handleClose()}
      direction="right"
    >
      <DrawerContent className="flex h-full w-full flex-col overflow-hidden sm:max-w-md">
        <DrawerHeader className="border-b border-border px-5 py-4">
          <DrawerTitle className="text-base font-semibold">
            Add team member
          </DrawerTitle>
          <p className="text-sm text-muted-foreground">
            Send an invite and set organization-level access.
          </p>
        </DrawerHeader>

        <div className="flex-1 space-y-4 overflow-y-auto px-5 py-4">
          <div className="space-y-2">
            <FieldLabel>Name</FieldLabel>
            <Input
              placeholder="John Doe"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <FieldLabel>Email address</FieldLabel>
            <Input
              type="email"
              placeholder="colleague@company.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <FieldLabel>Organization access</FieldLabel>
            <OrgRoleSelect value={orgRole} onValueChange={setOrgRole} />
          </div>

          {error && (
            <p className="rounded-md bg-destructive/10 px-3 py-2 text-sm text-destructive">
              {error}
            </p>
          )}
        </div>

        <DrawerFooter className="border-t border-border px-5 py-4">
          <div className="flex gap-2">
            <DrawerClose asChild>
              <Button variant="outline" className="flex-1" onClick={handleClose}>
                Cancel
              </Button>
            </DrawerClose>
            <Button
              className="flex-1"
              onClick={handleSubmit}
              disabled={inviteMember.isPending}
            >
              {inviteMember.isPending ? (
                <>
                  <Loader2 className="size-4 animate-spin" />
                  Sending…
                </>
              ) : (
                'Send invite'
              )}
            </Button>
          </div>
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  )
}
