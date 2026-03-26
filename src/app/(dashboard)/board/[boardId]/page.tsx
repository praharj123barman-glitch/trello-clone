"use client";

import { useEffect, useState, use } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, MoreHorizontal } from "lucide-react";
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
      <div className="flex-1 flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-white/30 border-t-white rounded-full animate-spin" />
      </div>
    );
  }

  if (!board) return null;

  return (
    <div
      className="flex-1 flex flex-col min-h-[calc(100vh-3.5rem)]"
      style={{ backgroundColor: board.color }}
    >
      {/* Board header */}
      <div className="flex items-center gap-3 px-4 py-3 bg-black/20">
        <button
          onClick={() => router.push("/boards")}
          className="text-white/80 hover:text-white transition-colors p-1 rounded hover:bg-white/10 cursor-pointer"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>

        {isEditingTitle ? (
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            onBlur={updateTitle}
            onKeyDown={(e) => e.key === "Enter" && updateTitle()}
            className="bg-white/20 text-white font-bold text-lg px-2 py-0.5 rounded outline-none focus:bg-white/30"
            autoFocus
          />
        ) : (
          <h1
            onClick={() => setIsEditingTitle(true)}
            className="text-white font-bold text-lg cursor-pointer hover:bg-white/10 px-2 py-0.5 rounded transition-colors"
          >
            {board.title}
          </h1>
        )}

        <div className="ml-auto">
          <button
            onClick={deleteBoard}
            className="text-white/70 hover:text-white hover:bg-white/10 p-1.5 rounded transition-colors cursor-pointer"
          >
            <MoreHorizontal className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Board content with lists */}
      <BoardContent
        boardId={boardId}
        initialLists={board.lists}
        onRefresh={fetchBoard}
      />

      {/* Card detail modal */}
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
