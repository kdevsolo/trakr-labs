import { BarChart3, Shield, Zap } from "lucide-react";

const features = [
  {
    icon: BarChart3,
    title: "Track what matters",
    description: "Monitor goals and progress in one place.",
  },
  {
    icon: Zap,
    title: "Move faster",
    description: "Streamlined workflows built for teams.",
  },
  {
    icon: Shield,
    title: "Secure by default",
    description: "Enterprise-grade auth powered by Supabase.",
  },
] as const;

export function AuthBrandPanel() {
  return (
    <div className="relative hidden flex-col justify-between overflow-hidden border-r border-border bg-card p-10 lg:flex">
      <div
        className="pointer-events-none absolute inset-0"
        aria-hidden
        style={{
          backgroundImage:
            "radial-gradient(ellipse 80% 60% at 10% 0%, oklch(0.94 0.04 264 / 0.9), transparent 55%), radial-gradient(ellipse 70% 50% at 90% 100%, oklch(0.95 0.05 290 / 0.8), transparent 50%)",
        }}
      />
      <div className="relative z-10">
        <div className="flex items-center gap-2.5">
          <div className="flex size-9 items-center justify-center rounded-lg bg-primary/10 text-sm font-semibold text-primary">
            T
          </div>
          <span className="text-lg font-semibold tracking-tight text-foreground">
            Trakr Labs
          </span>
        </div>
      </div>
      <div className="relative z-10 space-y-8">
        <div className="space-y-3">
          <h2 className="text-3xl font-semibold tracking-tight text-balance text-foreground">
            Build habits that stick
          </h2>
          <p className="max-w-sm text-sm leading-relaxed text-muted-foreground">
            The modern platform for tracking goals, measuring progress, and
            staying accountable with your team.
          </p>
        </div>
        <ul className="space-y-5">
          {features.map(({ icon: Icon, title, description }) => (
            <li key={title} className="flex gap-3">
              <div className="flex size-9 shrink-0 items-center justify-center rounded-lg border border-border/80 bg-background text-primary shadow-sm">
                <Icon className="size-4" aria-hidden />
              </div>
              <div className="space-y-0.5">
                <p className="text-sm font-medium text-foreground">{title}</p>
                <p className="text-sm text-muted-foreground">{description}</p>
              </div>
            </li>
          ))}
        </ul>
      </div>
      <p className="relative z-10 text-xs text-muted-foreground">
        © {new Date().getFullYear()} Trakr Labs
      </p>
    </div>
  );
}
