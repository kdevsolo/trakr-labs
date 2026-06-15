import { cn } from '@/lib/utils'

type OrgAccessBadgeProps = {
  label: string
  className?: string
}

export function OrgAccessBadge({ label, className }: OrgAccessBadgeProps) {
  const styles: Record<string, string> = {
    'Org Admin': 'bg-violet-50 text-violet-700 ring-violet-200',
    Admin: 'bg-blue-50 text-blue-700 ring-blue-200',
    'Project creator': 'bg-amber-50 text-amber-700 ring-amber-200',
    Member: 'bg-muted text-muted-foreground ring-border',
  }

  return (
    <span
      className={cn(
        'inline-flex rounded-full px-2.5 py-0.5 text-[11px] font-semibold ring-1 ring-inset',
        styles[label] ?? styles.Member,
        className,
      )}
    >
      {label}
    </span>
  )
}
