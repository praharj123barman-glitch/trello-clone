"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { CreateBoardModal } from "@/components/modals/create-board-modal";

interface Board {
  id: string;
  title: string;
  color: string;
  updatedAt: string;
  lists: { _count: { cards: number } }[];
}

export default function BoardsPage() {
  const router = useRouter();
  const [boards, setBoards] = useState<Board[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showCreateBoard, setShowCreateBoard] = useState(false);

  useEffect(() => {
    fetchBoards();
  }, []);

  const fetchBoards = async () => {
    try {
      const res = await fetch("/api/boards");
      if (res.ok) {
        const data = await res.json();
        setBoards(data);
      }
    } catch {
      // handle error
    } finally {
      setIsLoading(false);
    }
  };

  const deleteBoard = async (e: React.MouseEvent, boardId: string) => {
    e.stopPropagation();
    if (!confirm("Delete this board? This cannot be undone.")) return;

    try {
      await fetch(`/api/boards/${boardId}`, { method: "DELETE" });
      setBoards((prev) => prev.filter((b) => b.id !== boardId));
    } catch {
      // handle error
    }
  };

  const getTotalCards = (board: Board) =>
    board.lists.reduce((acc, list) => acc + list._count.cards, 0);

  const totalCards = boards.reduce((acc, b) => acc + getTotalCards(b), 0);
  const totalLists = boards.reduce((acc, b) => acc + b.lists.length, 0);

  return (
    <div className="max-w-[1440px] mx-auto px-5 md:px-10 py-10 md:py-12">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
        <div>
          <div className="inline-flex items-center gap-2 mb-4">
            <span className="material-symbols-outlined text-[14px] text-[var(--color-primary)]">space_dashboard</span>
            <span className="font-mono text-[10px] uppercase tracking-[0.18em] text-[var(--color-on-surface-variant)]">
              Workspace · Overview
            </span>
          </div>
          <h1 className="font-display font-semibold text-[40px] md:text-[52px] tracking-[-0.03em] text-[var(--color-on-surface)] leading-[1.05]">
            Your boards.
          </h1>
          <p className="mt-3 text-[15px] text-[var(--color-on-surface-variant)]">
            Pick up where you left off, or spin up a new one.
          </p>
        </div>

        <div className="flex items-center gap-6">
          <Stat label="Boards" value={boards.length} />
          <span className="w-px h-10 bg-[var(--color-outline-variant)]/40" />
          <Stat label="Lists" value={totalLists} />
          <span className="w-px h-10 bg-[var(--color-outline-variant)]/40" />
          <Stat label="Cards" value={totalCards} />
        </div>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
          {[...Array(4)].map((_, i) => (
            <div
              key={i}
              className="h-40 rounded-2xl bg-[var(--color-surface-container)] animate-pulse"
            />
          ))}
        </div>
      ) : boards.length === 0 ? (
        <div className="glass-panel rounded-2xl p-12 text-center">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-[var(--color-primary)]/15 border border-[var(--color-primary)]/30 text-[var(--color-primary)] mb-5">
            <span className="material-symbols-outlined text-[26px]">view_kanban</span>
          </div>
          <h3 className="font-display font-semibold text-[22px] text-[var(--color-on-surface)] mb-2">
            Your first board is one click away.
          </h3>
          <p className="text-[14px] text-[var(--color-on-surface-variant)] max-w-md mx-auto mb-7">
            Boards hold lists, lists hold cards, cards hold the work. Start with a sprint, a backlog, or a personal weekly plan.
          </p>
          <button
            onClick={() => setShowCreateBoard(true)}
            className="btn-shimmer inline-flex items-center gap-2 px-6 py-3 bg-[var(--color-primary)] text-[var(--color-on-primary)] rounded-lg text-[12px] font-semibold uppercase tracking-[0.08em] hover:scale-[1.02] transition-transform"
          >
            <span className="material-symbols-outlined text-[16px]">add</span>
            Create your first board
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
          {boards.map((board, i) => (
            <motion.div
              key={board.id}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.04, duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
              whileHover={{ y: -3 }}
              onClick={() => router.push(`/board/${board.id}`)}
              className="group relative h-40 rounded-2xl cursor-pointer overflow-hidden glass-panel hover:border-[var(--color-primary)]/40 transition-all duration-300"
            >
              <div
                className="absolute inset-x-0 top-0 h-16 opacity-90"
                style={{
                  background: `linear-gradient(135deg, ${board.color}, ${board.color}cc)`,
                }}
              />
              <div className="absolute inset-x-0 top-0 h-16 bg-gradient-to-b from-transparent to-[var(--color-background)]/40" />

              <div className="relative h-full flex flex-col justify-between p-5">
                <div className="flex justify-between items-start">
                  <span
                    className="w-3 h-3 rounded-full shadow-[0_0_8px_rgba(255,255,255,0.4)]"
                    style={{ backgroundColor: board.color }}
                  />
                  <button
                    onClick={(e) => deleteBoard(e, board.id)}
                    className="opacity-0 group-hover:opacity-100 grid place-items-center w-7 h-7 rounded text-[var(--color-on-surface-variant)] hover:text-[var(--color-error)] hover:bg-[var(--color-error)]/10 transition-all"
                    title="Delete board"
                  >
                    <span className="material-symbols-outlined text-[16px]">delete</span>
                  </button>
                </div>

                <div>
                  <h3 className="font-display font-semibold text-[18px] text-[var(--color-on-surface)] truncate mb-1">
                    {board.title}
                  </h3>
                  <div className="flex items-center gap-3 text-[11px] font-mono uppercase tracking-[0.12em] text-[var(--color-on-surface-variant)]">
                    <span className="inline-flex items-center gap-1">
                      <span className="material-symbols-outlined text-[12px]">view_column</span>
                      {board.lists.length} lists
                    </span>
                    <span className="inline-flex items-center gap-1">
                      <span className="material-symbols-outlined text-[12px]">style</span>
                      {getTotalCards(board)} cards
                    </span>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}

          <motion.button
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: boards.length * 0.04, duration: 0.5 }}
            onClick={() => setShowCreateBoard(true)}
            className="h-40 rounded-2xl border-2 border-dashed border-[var(--color-outline-variant)]/40 hover:border-[var(--color-primary)]/50 hover:bg-[var(--color-primary)]/[0.04] flex flex-col items-center justify-center gap-2 text-[var(--color-on-surface-variant)] hover:text-[var(--color-primary)] transition-all cursor-pointer"
          >
            <span className="grid place-items-center w-10 h-10 rounded-full bg-[var(--color-primary)]/15 border border-[var(--color-primary)]/30 text-[var(--color-primary)]">
              <span className="material-symbols-outlined text-[20px]">add</span>
            </span>
            <span className="text-[12px] font-semibold uppercase tracking-[0.1em]">
              Create new board
            </span>
          </motion.button>
        </div>
      )}

      <CreateBoardModal
        isOpen={showCreateBoard}
        onClose={() => {
          setShowCreateBoard(false);
          fetchBoards();
        }}
      />
    </div>
  );
}

function Stat({ label, value }: { label: string; value: number }) {
  return (
    <div className="text-center">
      <div className="font-display font-semibold text-[28px] text-[var(--color-primary)] leading-none">
        {value}
      </div>
      <div className="text-[10px] font-mono uppercase tracking-[0.18em] text-[var(--color-on-surface-variant)] mt-1.5">
        {label}
      </div>
    </div>
  );
}
