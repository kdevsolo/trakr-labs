import { cn } from '@/lib/utils'

type FieldLabelProps = {
  children: React.ReactNode
  required?: boolean
  className?: string
}

export function FieldLabel({ children, required, className }: FieldLabelProps) {
  return (
    <label
      className={cn(
        'text-[11px] font-semibold tracking-wider text-muted-foreground uppercase',
        className,
      )}
    >
      {children}
      {required && <span className="ml-0.5 text-destructive">*</span>}
    </label>
  )
}
