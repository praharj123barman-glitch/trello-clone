"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Plus, Trash2, LayoutDashboard } from "lucide-react";
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

  if (isLoading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-12">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <div
              key={i}
              className="h-28 rounded-xl bg-gray-100 animate-pulse"
            />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="flex items-center gap-3 mb-8">
        <LayoutDashboard className="w-6 h-6 text-muted" />
        <h1 className="text-2xl font-bold text-foreground">Your Boards</h1>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {boards.map((board, i) => (
          <motion.div
            key={board.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
            onClick={() => router.push(`/board/${board.id}`)}
            className="group relative h-28 rounded-xl cursor-pointer overflow-hidden shadow-sm hover:shadow-lg transition-all duration-300 hover:-translate-y-1"
            style={{ backgroundColor: board.color }}
          >
            <div className="absolute inset-0 bg-black/10 group-hover:bg-black/20 transition-colors" />
            <div className="relative p-4 h-full flex flex-col justify-between">
              <h3 className="text-white font-semibold text-base truncate">
                {board.title}
              </h3>
              <div className="flex items-center justify-between">
                <span className="text-white/70 text-xs">
                  {board.lists.length} lists &middot; {getTotalCards(board)}{" "}
                  cards
                </span>
                <button
                  onClick={(e) => deleteBoard(e, board.id)}
                  className="opacity-0 group-hover:opacity-100 text-white/70 hover:text-white transition-all p-1 rounded cursor-pointer"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          </motion.div>
        ))}

        {/* Create new board button */}
        <motion.button
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: boards.length * 0.05 }}
          onClick={() => setShowCreateBoard(true)}
          className="h-28 rounded-xl border-2 border-dashed border-gray-300 hover:border-blue-400 hover:bg-blue-50/50 flex items-center justify-center gap-2 text-muted hover:text-blue-600 transition-all cursor-pointer"
        >
          <Plus className="w-5 h-5" />
          <span className="text-sm font-medium">Create new board</span>
        </motion.button>
      </div>

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
