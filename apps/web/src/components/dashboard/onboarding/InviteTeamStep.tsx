'use client'

import { ArrowRight, ChevronDown, Plus } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { cn } from '@/lib/utils'

import { OnboardingCard } from './OnboardingCard'
import { FieldLabel } from './FieldLabel'
import type { TeamRole } from './types'
import { useOnboardingStore } from '@/stores/use-onboarding-store'

const roles: TeamRole[] = ['Developer', 'QA', 'Product Manager', 'Admin']


export default function InviteTeamStep() {
  const { setInvites, setStep, invites } = useOnboardingStore()

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
        {invites.map((invite, index) => (
          <div key={index} className="grid gap-4 sm:grid-cols-[1fr_140px]">
            <div className="space-y-2">
              <FieldLabel>Email Address</FieldLabel>
              <Input
                type="email"
                placeholder="colleague@company.com"
                value={invite.email}
                onChange={(event) =>
                  setInvites(invites.map((invite, inviteIndex) =>
                    inviteIndex === index ? { ...invite, email: event.target.value } : invite,
                  ))
                }
              />
            </div>

            <div className="space-y-2">
              <FieldLabel>Role</FieldLabel>
              <div className="relative">
                <select
                  value={invite.role}
                  onChange={(event) =>
                    setInvites(invites.map((invite, inviteIndex) =>
                      inviteIndex === index ? { ...invite, role: event.target.value as TeamRole } : invite,
                    ))
                  }
                  className={cn(
                    'flex h-10 w-full appearance-none rounded-md border border-input bg-card px-3 py-2 pr-9 text-sm shadow-sm transition-colors',
                    'focus-visible:border-ring focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/25',
                  )}
                >
                  {roles.map((role) => (
                    <option key={role} value={role}>
                      {role}
                    </option>
                  ))}
                </select>
                <ChevronDown className="pointer-events-none absolute top-1/2 right-3 size-4 -translate-y-1/2 text-muted-foreground" />
              </div>
            </div>
          </div>
        ))}

        <button
          type="button"
          onClick={() => setInvites([...invites, { email: '', role: 'Developer' }])}
          className="inline-flex items-center gap-1.5 text-sm font-medium text-primary transition-colors hover:text-primary/80"
        >
          <Plus className="size-4" />
          Add another member
        </button>
      </div>

      <div className="flex items-center justify-between border-t border-border pt-6">
        <Button variant="ghost" onClick={() => setStep(3)}>
          Skip for now
        </Button>
        <Button className="font-semibold" onClick={() => {}}>
          Send Invites &amp; Continue
          <ArrowRight className="size-4" />
        </Button>
      </div>
    </OnboardingCard>
  )
}
