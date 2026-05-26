"use client";

import { useEffect, useState, use } from "react";
import { useRouter } from "next/navigation";
import { BoardContent } from "@/components/board/board-content";
import { CardDetailModal } from "@/components/modals/card-detail-modal";
import { useCardModal } from "@/store/use-card-modal";

interface Label {
  id: string;
  name: string;
  color: string;
  cardId: string;
}

interface ChecklistItem {
  id: string;
  text: string;
  completed: boolean;
  checklistId: string;
}

interface Checklist {
  id: string;
  title: string;
  cardId: string;
  items: ChecklistItem[];
}

interface Card {
  id: string;
  title: string;
  description: string | null;
  position: number;
  dueDate: string | null;
  completed: boolean;
  listId: string;
  labels: Label[];
  checklists: Checklist[];
}

interface List {
  id: string;
  title: string;
  position: number;
  boardId: string;
  cards: Card[];
}

interface Board {
  id: string;
  title: string;
  color: string;
  lists: List[];
}

export default function BoardPage({
  params,
}: {
  params: Promise<{ boardId: string }>;
}) {
  const { boardId } = use(params);
  const router = useRouter();
  const [board, setBoard] = useState<Board | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [title, setTitle] = useState("");
  const cardModal = useCardModal();

  useEffect(() => {
    fetchBoard();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [boardId]);

  const fetchBoard = async () => {
    try {
      const res = await fetch(`/api/boards/${boardId}`);
      if (res.ok) {
        const data = await res.json();
        setBoard(data);
        setTitle(data.title);
      } else {
        router.push("/boards");
      }
    } catch {
      router.push("/boards");
    } finally {
      setIsLoading(false);
    }
  };

  const updateTitle = async () => {
    if (!title.trim() || title === board?.title) {
      setTitle(board?.title || "");
      setIsEditingTitle(false);
      return;
    }

    try {
      await fetch(`/api/boards/${boardId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title: title.trim() }),
      });
      setBoard((prev) => (prev ? { ...prev, title: title.trim() } : null));
    } catch {
      setTitle(board?.title || "");
    }
    setIsEditingTitle(false);
  };

  const deleteBoard = async () => {
    if (!confirm("Delete this board and all its contents?")) return;
    try {
      await fetch(`/api/boards/${boardId}`, { method: "DELETE" });
      router.push("/boards");
    } catch {
      // handle error
    }
  };

  if (isLoading) {
    return (
      <div className="flex-1 flex items-center justify-center min-h-[60vh]">
        <div className="w-9 h-9 border-2 border-[var(--color-primary)]/30 border-t-[var(--color-primary)] rounded-full animate-spin" />
      </div>
    );
  }

  if (!board) return null;

  const totalCards = board.lists.reduce((acc, l) => acc + l.cards.length, 0);

  return (
    <div className="flex-1 flex flex-col min-h-[calc(100vh-4rem)]">
      <div className="border-b border-[var(--color-outline-variant)]/20 bg-[var(--color-surface-container-lowest)]/40 backdrop-blur-md">
        <div className="max-w-[1440px] mx-auto px-5 md:px-10 py-5 flex items-center gap-4">
          <button
            onClick={() => router.push("/boards")}
            className="grid place-items-center w-9 h-9 rounded-lg text-[var(--color-on-surface-variant)] hover:text-[var(--color-primary)] hover:bg-[var(--color-surface-container-high)] transition-colors"
            title="Back to boards"
          >
            <span className="material-symbols-outlined text-[20px]">arrow_back</span>
          </button>

          <span
            className="w-2.5 h-2.5 rounded-full shadow-[0_0_8px_currentColor]"
            style={{ backgroundColor: board.color, color: board.color }}
          />

          {isEditingTitle ? (
            <input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              onBlur={updateTitle}
              onKeyDown={(e) => e.key === "Enter" && updateTitle()}
              className="bg-[var(--color-surface-container)] font-display font-semibold text-[20px] text-[var(--color-on-surface)] px-3 py-1 rounded-lg outline-none focus:ring-2 focus:ring-[var(--color-primary)]/40 border border-[var(--color-outline-variant)]/40"
              autoFocus
            />
          ) : (
            <h1
              onClick={() => setIsEditingTitle(true)}
              className="font-display font-semibold text-[22px] text-[var(--color-on-surface)] cursor-pointer hover:bg-[var(--color-surface-container-high)] px-3 py-1 rounded-lg transition-colors tracking-[-0.01em]"
            >
              {board.title}
            </h1>
          )}

          <div className="hidden md:flex items-center gap-3 ml-2 text-[11px] font-mono uppercase tracking-[0.14em] text-[var(--color-on-surface-variant)]">
            <span className="inline-flex items-center gap-1.5">
              <span className="material-symbols-outlined text-[14px] text-[var(--color-primary)]">view_column</span>
              {board.lists.length} lists
            </span>
            <span className="opacity-40">·</span>
            <span className="inline-flex items-center gap-1.5">
              <span className="material-symbols-outlined text-[14px] text-[var(--color-primary)]">style</span>
              {totalCards} cards
            </span>
          </div>

          <div className="ml-auto flex items-center gap-2">
            <button
              onClick={deleteBoard}
              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg text-[12px] font-semibold uppercase tracking-[0.06em] text-[var(--color-error)] hover:bg-[var(--color-error)]/10 transition-colors"
              title="Delete board"
            >
              <span className="material-symbols-outlined text-[16px]">delete</span>
              <span className="hidden sm:inline">Delete</span>
            </button>
          </div>
        </div>
      </div>

      <BoardContent
        boardId={boardId}
        initialLists={board.lists}
        onRefresh={fetchBoard}
      />

      {cardModal.isOpen && cardModal.id && (
        <CardDetailModal
          cardId={cardModal.id}
          onClose={() => {
            cardModal.onClose();
            fetchBoard();
          }}
        />
      )}
    </div>
  );
}
