import {
  ORG_ROLE_OPTIONS,
  type OrgRole,
} from '@/lib/permissions/org-role'

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

type OrgRoleSelectProps = {
  value: OrgRole
  onValueChange: (value: OrgRole) => void
  disabled?: boolean
}

export function OrgRoleSelect({
  value,
  onValueChange,
  disabled,
}: OrgRoleSelectProps) {
  return (
    <Select
      value={value}
      onValueChange={(v) => onValueChange(v as OrgRole)}
      disabled={disabled}
    >
      <SelectTrigger className="w-full">
        <SelectValue placeholder="Select access level" />
      </SelectTrigger>
      <SelectContent>
        {ORG_ROLE_OPTIONS.map((option) => (
          <SelectItem key={option.value} value={option.value}>
            <span className="flex flex-col">
              <span>{option.label}</span>
              <span className="text-xs text-muted-foreground">
                {option.hint}
              </span>
            </span>
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  )
}
