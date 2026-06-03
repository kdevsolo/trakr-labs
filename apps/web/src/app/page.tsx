import { HomeDemo } from "@/components/home-demo";

export const dynamic = "force-dynamic";

export default function Home() {
  return (
    <main className="flex min-h-full flex-1 items-center justify-center bg-background p-6">
      <HomeDemo />
    </main>
  );
}
