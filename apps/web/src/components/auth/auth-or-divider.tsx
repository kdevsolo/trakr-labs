export function AuthOrDivider() {
  return (
    <div className="relative py-1">
      <div className="absolute inset-0 flex items-center" aria-hidden>
        <span className="w-full border-t border-border" />
      </div>
      <div className="relative flex justify-center text-xs font-semibold uppercase tracking-wider">
        <span className="bg-card px-3 text-muted-foreground">
          Or continue with
        </span>
      </div>
    </div>
  );
}
