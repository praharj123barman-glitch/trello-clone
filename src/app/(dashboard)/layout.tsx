import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { SessionProvider } from "@/components/providers/session-provider";
import { Navbar } from "@/components/navbar";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();
  if (!session?.user) redirect("/sign-in");

  return (
    <SessionProvider>
      <div className="relative min-h-screen bg-[var(--color-background)]">
        <div className="absolute inset-0 grid-noise opacity-30 pointer-events-none" />
        <div className="absolute inset-x-0 top-0 h-[420px] aurora opacity-60 pointer-events-none" />
        <div className="relative z-10 flex flex-col min-h-screen">
          <Navbar />
          {children}
        </div>
      </div>
    </SessionProvider>
  );
}
