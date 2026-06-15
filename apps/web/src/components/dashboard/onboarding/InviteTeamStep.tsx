'use client'

import { useState } from 'react'
import { ArrowRight, Loader2, Plus } from 'lucide-react'
import { type InviteUserInput } from '@trakr/schemas'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { inviteOrgMember } from '@/lib/api/users'
import {
  deriveOrgPermissions,
  type OrgRole,
} from '@/lib/permissions/org-role'

import { OnboardingCard } from './OnboardingCard'
import { FieldLabel } from './FieldLabel'
import { OrgRoleSelect } from '../team/OrgRoleSelect'
import { useOnboardingStore } from '@/stores/use-onboarding-store'

type LocalInvite = {
  name: string
  email: string
  orgRole: OrgRole
}

const DEFAULT_INVITE: LocalInvite = {
  name: '',
  email: '',
  orgRole: 'member',
}

export default function InviteTeamStep() {
  const { setInvites, setStep } = useOnboardingStore()
  const [localInvites, setLocalInvites] = useState<LocalInvite[]>([{ ...DEFAULT_INVITE }])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  function updateInvite<K extends keyof LocalInvite>(index: number, field: K, value: LocalInvite[K]) {
    setLocalInvites(prev =>
      prev.map((invite, i) => i === index ? { ...invite, [field]: value } : invite)
    )
  }

  async function handleContinue() {
    const validInvites: InviteUserInput[] = localInvites
      .filter(i => i.name.trim() && i.email.trim())
      .map(i => ({
        name: i.name,
        email: i.email,
        permissions: deriveOrgPermissions(i.orgRole),
      }))

    if (validInvites.length === 0) {
      setStep(3)
      return
    }

    setLoading(true)
    setError(null)

    try {
      await Promise.all(validInvites.map(invite => inviteOrgMember(invite)))
      setInvites(validInvites)
      setStep(3)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to send invites. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  function handleSkip() {
    setInvites([])
    setStep(3)
  }

  return (
    <OnboardingCard step={2}>
      <div className="space-y-2">
        <h1 className="text-3xl font-bold tracking-tight text-foreground">
          Invite your team
        </h1>
        <p className="text-sm leading-relaxed text-muted-foreground">
          Collaboration is key. Add engineers, QA, and product managers to
          start triaging issues immediately.{' '}
          <span className="text-foreground/70">(Optional)</span>
        </p>
      </div>

      <div className="space-y-4">
        {localInvites.map((invite, index) => (
          <div key={index} className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <FieldLabel>Name</FieldLabel>
              <Input
                type="text"
                placeholder="John Doe"
                value={invite.name}
                onChange={e => updateInvite(index, 'name', e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <FieldLabel>Email Address</FieldLabel>
              <Input
                type="email"
                placeholder="colleague@company.com"
                value={invite.email}
                onChange={e => updateInvite(index, 'email', e.target.value)}
              />
            </div>
            <div className="col-span-2 space-y-2">
              <FieldLabel>Organization Access</FieldLabel>
              <OrgRoleSelect
                value={invite.orgRole}
                onValueChange={(value) =>
                  updateInvite(index, 'orgRole', value)
                }
              />
            </div>
          </div>
        ))}

        <button
          type="button"
          onClick={() => setLocalInvites(prev => [...prev, { ...DEFAULT_INVITE }])}
          className="inline-flex items-center gap-1.5 text-sm font-medium text-primary transition-colors hover:text-primary/80"
        >
          <Plus className="size-4" />
          Add another member
        </button>
      </div>

      {error && (
        <p className="rounded-md bg-destructive/10 px-3 py-2 text-sm text-destructive">
          {error}
        </p>
      )}

      <div className="flex items-center justify-between border-t border-border pt-6">
        <Button variant="ghost" onClick={handleSkip} disabled={loading}>
          Skip for now
        </Button>
        <Button className="font-semibold" onClick={handleContinue} disabled={loading}>
          {loading ? (
            <>
              <Loader2 className="size-4 animate-spin" />
              Sending Invites…
            </>
          ) : (
            <>
              Send Invites &amp; Continue
              <ArrowRight className="size-4" />
            </>
          )}
        </Button>
      </div>
    </OnboardingCard>
  )
}
