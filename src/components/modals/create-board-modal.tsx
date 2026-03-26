"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { BOARD_COLORS } from "@/lib/utils";

interface CreateBoardModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function CreateBoardModal({ isOpen, onClose }: CreateBoardModalProps) {
  const router = useRouter();
  const [title, setTitle] = useState("");
  const [selectedColor, setSelectedColor] = useState(BOARD_COLORS[0].value);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    setIsLoading(true);
    try {
      const res = await fetch("/api/boards", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title: title.trim(), color: selectedColor }),
      });

      if (res.ok) {
        const board = await res.json();
        setTitle("");
        setSelectedColor(BOARD_COLORS[0].value);
        onClose();
        router.push(`/board/${board.id}`);
        router.refresh();
      }
    } catch {
      // handle error silently
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-black/50"
            onClick={onClose}
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 10 }}
            transition={{ type: "spring", duration: 0.3 }}
            className="relative bg-white rounded-2xl shadow-2xl p-6 w-full max-w-md mx-4"
          >
            <button
              onClick={onClose}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            <h2 className="text-lg font-semibold text-gray-900 mb-6">
              Create board
            </h2>

            {/* Color preview */}
            <div
              className="w-full h-28 rounded-xl mb-6 transition-colors duration-300"
              style={{ backgroundColor: selectedColor }}
            />

            {/* Color picker */}
            <div className="flex flex-wrap gap-2 mb-6">
              {BOARD_COLORS.map((color) => (
                <button
                  key={color.value}
                  onClick={() => setSelectedColor(color.value)}
                  className={`w-9 h-7 rounded-md transition-all cursor-pointer ${
                    selectedColor === color.value
                      ? "ring-2 ring-offset-2 ring-blue-500 scale-110"
                      : "hover:opacity-80"
                  }`}
                  style={{ backgroundColor: color.value }}
                  title={color.name}
                />
              ))}
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <Input
                id="board-title"
                label="Board title"
                placeholder="Enter board title..."
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
                autoFocus
              />
              <Button
                type="submit"
                className="w-full"
                isLoading={isLoading}
                disabled={!title.trim()}
              >
                Create Board
              </Button>
            </form>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
