import Link from "next/link";
import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { Layout, CheckSquare, Users, Zap } from "lucide-react";

export default async function LandingPage() {
  const session = await auth();
  if (session?.user) redirect("/boards");

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-600 via-blue-700 to-indigo-800">
      {/* Navbar */}
      <nav className="flex items-center justify-between px-6 py-4 max-w-7xl mx-auto">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center">
            <Layout className="w-5 h-5 text-white" />
          </div>
          <span className="text-xl font-bold text-white">Taskflow</span>
        </div>
        <div className="flex items-center gap-3">
          <Link
            href="/sign-in"
            className="text-white/90 hover:text-white px-4 py-2 text-sm font-medium transition-colors"
          >
            Log in
          </Link>
          <Link
            href="/sign-up"
            className="bg-white text-blue-700 hover:bg-blue-50 px-5 py-2 rounded-lg text-sm font-semibold transition-all shadow-lg shadow-black/10"
          >
            Get Started Free
          </Link>
        </div>
      </nav>

      {/* Hero */}
      <main className="max-w-7xl mx-auto px-6 pt-20 pb-32">
        <div className="text-center max-w-3xl mx-auto">
          <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm rounded-full px-4 py-1.5 mb-6">
            <Zap className="w-4 h-4 text-yellow-300" />
            <span className="text-white/90 text-sm font-medium">
              Project management made simple
            </span>
          </div>
          <h1 className="text-5xl md:text-6xl font-extrabold text-white leading-tight tracking-tight">
            Organize your work,{" "}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-200 to-cyan-200">
              your way
            </span>
          </h1>
          <p className="mt-6 text-lg text-blue-100/80 max-w-xl mx-auto leading-relaxed">
            Taskflow brings all your tasks, teammates, and tools together.
            Manage projects with beautiful boards, lists, and cards.
          </p>
          <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              href="/sign-up"
              className="w-full sm:w-auto bg-white text-blue-700 hover:bg-blue-50 px-8 py-3.5 rounded-xl text-base font-semibold transition-all shadow-xl shadow-black/10 hover:shadow-2xl hover:-translate-y-0.5"
            >
              Start for free
            </Link>
            <Link
              href="/sign-in"
              className="w-full sm:w-auto border border-white/30 text-white hover:bg-white/10 px-8 py-3.5 rounded-xl text-base font-medium transition-all"
            >
              Sign in
            </Link>
          </div>
        </div>

        {/* Features */}
        <div className="mt-32 grid md:grid-cols-3 gap-8">
          {[
            {
              icon: Layout,
              title: "Boards & Lists",
              desc: "Organize projects into boards with customizable lists and drag-and-drop cards.",
            },
            {
              icon: CheckSquare,
              title: "Cards & Checklists",
              desc: "Break work into cards with descriptions, labels, due dates, and checklists.",
            },
            {
              icon: Users,
              title: "Built for You",
              desc: "A personal workspace to manage all your projects, tasks, and ideas in one place.",
            },
          ].map((feature) => (
            <div
              key={feature.title}
              className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 hover:bg-white/15 transition-all"
            >
              <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center mb-4">
                <feature.icon className="w-5 h-5 text-white" />
              </div>
              <h3 className="text-lg font-semibold text-white mb-2">
                {feature.title}
              </h3>
              <p className="text-blue-100/70 text-sm leading-relaxed">
                {feature.desc}
              </p>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}
