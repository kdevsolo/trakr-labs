export function AuthFormCard({ children }: { children: React.ReactNode }) {
  return (
    <div className="rounded-xl border border-border bg-card px-8 py-10 shadow-sm">
      {children}
    </div>
  );
}
