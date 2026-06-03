import { AuthFormShell } from "@/components/auth/auth-form-shell";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <AuthFormShell>{children}</AuthFormShell>;
}
