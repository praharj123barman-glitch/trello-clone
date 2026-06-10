import Link from "next/link";
import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";

export default async function LandingPage() {
  const session = await auth();
  if (session?.user) redirect("/boards");

  return (
    <div className="relative min-h-screen overflow-hidden bg-[var(--color-background)]">
      <div className="absolute inset-0 aurora" />
      <div className="absolute inset-0 grid-noise opacity-[0.55]" />
      <div className="absolute inset-x-0 bottom-0 h-48 bg-gradient-to-t from-[var(--color-background)] to-transparent pointer-events-none" />

      <div className="relative z-10">
        <nav className="max-w-[1280px] mx-auto px-6 md:px-10 py-6 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2.5 group">
            <span className="grid place-items-center w-9 h-9 rounded-lg bg-[var(--color-primary)]/15 border border-[var(--color-primary)]/30 text-[var(--color-primary)] group-hover:scale-[1.05] transition-transform">
              <span
                className="material-symbols-outlined text-[18px]"
                style={{ fontVariationSettings: "'FILL' 1, 'wght' 600" }}
              >
                token
              </span>
            </span>
            <span className="font-display font-semibold text-[18px] tracking-tight text-[var(--color-on-surface)]">
              Nexus <span className="text-[var(--color-primary)]">Studio</span>
            </span>
          </Link>

          <div className="flex items-center gap-2 md:gap-3">
            <Link
              href="/sign-in"
              className="text-[13px] font-semibold uppercase tracking-[0.08em] text-[var(--color-on-surface-variant)] hover:text-[var(--color-primary)] px-4 py-2 transition-colors"
            >
              Log in
            </Link>
            <Link
              href="/sign-up"
              className="btn-shimmer inline-flex items-center gap-2 px-5 py-2.5 bg-[var(--color-primary)] text-[var(--color-on-primary)] text-[12px] font-semibold uppercase tracking-[0.08em] rounded hover:scale-[1.02] transition-transform"
            >
              Get started
            </Link>
          </div>
        </nav>

        <main className="max-w-[1280px] mx-auto px-6 md:px-10 pt-20 md:pt-28 pb-24">
          <div className="text-center max-w-4xl mx-auto">
            <h1 className="font-display font-semibold text-[44px] sm:text-[64px] md:text-[80px] lg:text-[96px] leading-[1.02] tracking-[-0.04em] text-[var(--color-on-surface)]">
              Project work,{" "}
              <span className="italic font-medium bg-clip-text text-transparent bg-gradient-to-r from-[var(--color-primary)] via-[var(--color-secondary)] to-[var(--color-tertiary)]">
                rendered.
              </span>
            </h1>

            <p className="mt-7 text-[17px] md:text-[19px] leading-[1.65] text-[var(--color-on-surface-variant)] max-w-2xl mx-auto">
              Nexus Studio is the premium workspace for teams that care about
              craft. Boards, lists, cards — wired together with drag-and-drop,
              progress tracking, and a UI that disappears so the work can take
              the stage.
            </p>

            <div className="mt-12 flex flex-col sm:flex-row items-center justify-center gap-3">
              <Link
                href="/sign-up"
                className="btn-shimmer w-full sm:w-auto inline-flex items-center justify-center gap-2 px-7 py-4 bg-[var(--color-primary)] text-[var(--color-on-primary)] text-[13px] font-semibold uppercase tracking-[0.1em] rounded hover:scale-[1.02] transition-transform"
              >
                Start for free
                <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
              </Link>
              <Link
                href="/sign-in"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-7 py-4 border border-[var(--color-outline-variant)]/40 bg-[var(--color-surface-container)]/40 backdrop-blur-md text-[var(--color-on-surface)] text-[13px] font-semibold uppercase tracking-[0.1em] rounded hover:bg-[var(--color-surface-container)] transition-colors"
              >
                Sign in
              </Link>
            </div>

            <div className="mt-10 flex flex-wrap justify-center items-center gap-x-6 gap-y-3 text-[11px] font-mono uppercase tracking-[0.16em] text-[var(--color-on-surface-variant)]/70">
              <span className="inline-flex items-center gap-1.5">
                <span className="material-symbols-outlined text-[14px] text-[var(--color-primary)]">bolt</span>
                Instant boards
              </span>
              <span className="opacity-30">·</span>
              <span className="inline-flex items-center gap-1.5">
                <span className="material-symbols-outlined text-[14px] text-[var(--color-primary)]">lock</span>
                Private by default
              </span>
              <span className="opacity-30">·</span>
              <span className="inline-flex items-center gap-1.5">
                <span className="material-symbols-outlined text-[14px] text-[var(--color-primary)]">cloud_done</span>
                No setup
              </span>
            </div>
          </div>

          <div className="mt-28 md:mt-36 grid md:grid-cols-3 gap-5">
            {[
              {
                icon: "view_kanban",
                title: "Drag-and-drop boards",
                body: "Build the layout your work actually has. Reorder lists, move cards across columns — every change saves instantly.",
                accent: "primary",
              },
              {
                icon: "task_alt",
                title: "Cards with depth",
                body: "Descriptions, labels, due dates, multi-step checklists with live progress bars. Everything a task needs, nothing it doesn't.",
                accent: "secondary",
              },
              {
                icon: "palette",
                title: "Studio-grade UI",
                body: "Glassmorphism, real typography, light + dark theme, micro-animations. The opposite of generic SaaS.",
                accent: "tertiary",
              },
            ].map((f, i) => {
              const accentColor =
                f.accent === "primary"
                  ? "text-[var(--color-primary)] border-[var(--color-primary)]/30 bg-[var(--color-primary)]/10"
                  : f.accent === "secondary"
                  ? "text-[var(--color-secondary)] border-[var(--color-secondary)]/30 bg-[var(--color-secondary)]/10"
                  : "text-[var(--color-tertiary)] border-[var(--color-tertiary)]/30 bg-[var(--color-tertiary)]/10";
              return (
                <div
                  key={i}
                  className="glass-panel rounded-2xl p-7 hover:border-[var(--color-primary)]/30 transition-colors"
                >
                  <div className={`inline-flex items-center justify-center w-12 h-12 rounded-xl border mb-5 ${accentColor}`}>
                    <span
                      className="material-symbols-outlined text-[22px]"
                      style={{ fontVariationSettings: "'FILL' 1, 'wght' 500" }}
                    >
                      {f.icon}
                    </span>
                  </div>
                  <h3 className="font-display font-semibold text-[20px] text-[var(--color-on-surface)] mb-2">
                    {f.title}
                  </h3>
                  <p className="text-[14px] leading-[1.65] text-[var(--color-on-surface-variant)]">
                    {f.body}
                  </p>
                </div>
              );
            })}
          </div>

          <div className="mt-28 md:mt-36">
            <div className="relative glass-panel rounded-3xl p-10 md:p-14 text-center overflow-hidden">
              <div className="aurora opacity-50" />
              <div className="relative z-10">
                <h2 className="font-display font-semibold text-[32px] md:text-[44px] tracking-[-0.02em] text-[var(--color-on-surface)] mb-4">
                  Ship the next sprint with less drag.
                </h2>
                <p className="text-[16px] text-[var(--color-on-surface-variant)] max-w-xl mx-auto mb-8">
                  Free forever for personal use. Sign up takes 20 seconds.
                </p>
                <Link
                  href="/sign-up"
                  className="btn-shimmer inline-flex items-center justify-center gap-2 px-8 py-4 bg-[var(--color-primary)] text-[var(--color-on-primary)] text-[13px] font-semibold uppercase tracking-[0.1em] rounded hover:scale-[1.02] transition-transform"
                >
                  Create your workspace
                  <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
                </Link>
              </div>
            </div>
          </div>
        </main>

        <footer className="border-t border-[var(--color-outline-variant)]/15 py-8">
          <div className="max-w-[1280px] mx-auto px-6 md:px-10 flex flex-col sm:flex-row justify-between items-center gap-3 text-[12px] text-[var(--color-on-surface-variant)]">
            <span className="font-mono tracking-[0.08em]">
              © {new Date().getFullYear()} Nexus Studio
            </span>
            <span>Built with care · Premium workspace theme override</span>
          </div>
        </footer>
      </div>
    </div>
  );
}
