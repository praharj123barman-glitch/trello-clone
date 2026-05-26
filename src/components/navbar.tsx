"use client";

import { signOut, useSession } from "next-auth/react";
import Link from "next/link";
import { useState, useEffect } from "react";
import { CreateBoardModal } from "@/components/modals/create-board-modal";

export function Navbar() {
  const { data: session } = useSession();
  const [showCreateBoard, setShowCreateBoard] = useState(false);
  const [theme, setTheme] = useState<"dark" | "light">("dark");
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    try {
      const saved = localStorage.getItem("nexus-theme");
      if (saved === "light" || saved === "dark") setTheme(saved);
    } catch {}
  }, []);

  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
    try {
      localStorage.setItem("nexus-theme", theme);
    } catch {}
  }, [theme]);

  const initial = session?.user?.name?.charAt(0).toUpperCase() ?? "·";

  return (
    <>
      <nav className="h-16 sticky top-0 z-50 glass-panel border-x-0 border-t-0 rounded-none">
        <div className="h-full max-w-[1440px] mx-auto px-5 md:px-10 flex items-center justify-between gap-4">
          <div className="flex items-center gap-5">
            <Link href="/boards" className="flex items-center gap-2.5 group">
              <span className="grid place-items-center w-9 h-9 rounded-lg bg-[var(--color-primary)]/15 border border-[var(--color-primary)]/30 text-[var(--color-primary)] group-hover:scale-[1.05] transition-transform">
                <span
                  className="material-symbols-outlined text-[18px]"
                  style={{ fontVariationSettings: "'FILL' 1, 'wght' 600" }}
                >
                  token
                </span>
              </span>
              <span className="font-display font-semibold text-[16px] tracking-tight text-[var(--color-on-surface)] hidden sm:inline">
                Nexus <span className="text-[var(--color-primary)]">Studio</span>
              </span>
            </Link>

            <button
              onClick={() => setShowCreateBoard(true)}
              className="inline-flex items-center gap-1.5 px-4 py-2 bg-[var(--color-primary)] text-[var(--color-on-primary)] rounded-lg text-[12px] font-semibold uppercase tracking-[0.06em] hover:scale-[1.02] active:scale-[0.98] transition-transform shadow-[0_4px_14px_-4px_rgba(192,193,255,0.3)]"
            >
              <span className="material-symbols-outlined text-[16px]">add</span>
              New board
            </button>
          </div>

          <div className="hidden lg:flex flex-1 max-w-md items-center bg-[var(--color-surface-container)]/60 rounded-full px-4 py-2 border border-[var(--color-outline-variant)]/20">
            <span className="material-symbols-outlined text-[18px] text-[var(--color-outline)] mr-2">search</span>
            <input
              type="text"
              placeholder="Search boards…"
              className="bg-transparent border-none focus:ring-0 text-[13px] text-[var(--color-on-surface)] placeholder:text-[var(--color-outline)] w-full p-0 outline-none"
            />
            <span className="hidden xl:inline font-mono text-[10px] uppercase tracking-[0.16em] text-[var(--color-outline)] border border-[var(--color-outline-variant)]/40 rounded px-1.5 py-0.5">
              ⌘K
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              aria-label="Toggle theme"
              onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
              className="w-9 h-9 grid place-items-center rounded-full hover:bg-[var(--color-surface-container-high)] text-[var(--color-primary)] transition-colors"
            >
              <span className="material-symbols-outlined text-[20px]">
                {theme === "dark" ? "light_mode" : "dark_mode"}
              </span>
            </button>

            {session?.user && (
              <div className="relative">
                <button
                  onClick={() => setMenuOpen((s) => !s)}
                  className="flex items-center gap-2 pl-1 pr-3 py-1 rounded-full hover:bg-[var(--color-surface-container-high)] transition-colors group"
                  aria-label="Account menu"
                >
                  <span className="grid place-items-center w-8 h-8 rounded-full bg-gradient-to-br from-[var(--color-primary)] to-[var(--color-tertiary)] text-[var(--color-on-primary)] text-[13px] font-bold">
                    {initial}
                  </span>
                  <span className="hidden sm:inline text-[13px] font-semibold text-[var(--color-on-surface)]">
                    {session.user.name}
                  </span>
                  <span className="material-symbols-outlined text-[16px] text-[var(--color-on-surface-variant)] group-hover:text-[var(--color-primary)] transition-colors">
                    expand_more
                  </span>
                </button>

                {menuOpen && (
                  <>
                    <div className="fixed inset-0 z-30" onClick={() => setMenuOpen(false)} />
                    <div className="absolute right-0 top-12 z-40 w-56 glass-panel rounded-xl py-2 shadow-2xl">
                      <div className="px-4 py-2 border-b border-[var(--color-outline-variant)]/30 mb-1">
                        <div className="text-[13px] font-semibold text-[var(--color-on-surface)]">
                          {session.user.name}
                        </div>
                        <div className="text-[11px] text-[var(--color-on-surface-variant)] truncate">
                          {session.user.email}
                        </div>
                      </div>
                      <Link
                        href="/boards"
                        onClick={() => setMenuOpen(false)}
                        className="flex items-center gap-2.5 px-4 py-2.5 text-[13px] text-[var(--color-on-surface)] hover:bg-[var(--color-surface-container-high)] transition-colors"
                      >
                        <span className="material-symbols-outlined text-[16px]">space_dashboard</span>
                        My boards
                      </Link>
                      <button
                        onClick={() => {
                          setMenuOpen(false);
                          signOut({ callbackUrl: "/" });
                        }}
                        className="w-full flex items-center gap-2.5 px-4 py-2.5 text-[13px] text-[var(--color-error)] hover:bg-[var(--color-error)]/10 transition-colors"
                      >
                        <span className="material-symbols-outlined text-[16px]">logout</span>
                        Sign out
                      </button>
                    </div>
                  </>
                )}
              </div>
            )}
          </div>
        </div>
      </nav>

      <CreateBoardModal
        isOpen={showCreateBoard}
        onClose={() => setShowCreateBoard(false)}
      />
    </>
  );
}
