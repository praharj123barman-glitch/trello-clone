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
      <div className="min-h-screen bg-background">
        <Navbar />
        {children}
      </div>
    </SessionProvider>
  );
}
