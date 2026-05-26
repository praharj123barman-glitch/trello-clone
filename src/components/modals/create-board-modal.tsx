"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
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
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-[var(--color-background)]/80 backdrop-blur-sm"
            onClick={onClose}
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 12 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 12 }}
            transition={{ type: "spring", duration: 0.4 }}
            className="relative glass-panel rounded-2xl p-7 w-full max-w-md shadow-2xl"
          >
            <button
              onClick={onClose}
              className="absolute top-4 right-4 grid place-items-center w-8 h-8 rounded-lg text-[var(--color-on-surface-variant)] hover:text-[var(--color-on-surface)] hover:bg-[var(--color-surface-container-high)] transition-colors"
              aria-label="Close"
            >
              <span className="material-symbols-outlined text-[18px]">close</span>
            </button>

            <div className="mb-6">
              <div className="inline-flex items-center gap-2 mb-2">
                <span className="material-symbols-outlined text-[14px] text-[var(--color-primary)]">add_box</span>
                <span className="font-mono text-[10px] uppercase tracking-[0.18em] text-[var(--color-on-surface-variant)]">
                  New board
                </span>
              </div>
              <h2 className="font-display font-semibold text-[24px] text-[var(--color-on-surface)] tracking-[-0.01em]">
                Create board
              </h2>
            </div>

            <div
              className="w-full h-32 rounded-xl mb-5 transition-all duration-500 relative overflow-hidden border border-[var(--color-outline-variant)]/20"
              style={{
                background: `linear-gradient(135deg, ${selectedColor}, ${selectedColor}cc)`,
              }}
            >
              <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent" />
              <div className="absolute bottom-3 left-4 right-4 flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-white/80" />
                <span className="text-white/90 text-[11px] font-mono uppercase tracking-[0.12em]">
                  Preview
                </span>
              </div>
            </div>

            <div className="mb-6">
              <label className="block text-[11px] font-semibold tracking-[0.14em] uppercase text-[var(--color-on-surface-variant)] mb-3">
                Color
              </label>
              <div className="grid grid-cols-8 gap-2">
                {BOARD_COLORS.map((color) => (
                  <button
                    key={color.value}
                    onClick={() => setSelectedColor(color.value)}
                    className={`aspect-square rounded-lg transition-all cursor-pointer ${
                      selectedColor === color.value
                        ? "ring-2 ring-offset-2 ring-offset-[var(--color-surface)] ring-[var(--color-primary)] scale-110"
                        : "hover:scale-105 hover:opacity-90"
                    }`}
                    style={{ backgroundColor: color.value }}
                    title={color.name}
                    type="button"
                  />
                ))}
              </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
              <Input
                id="board-title"
                label="Board title"
                placeholder="e.g. Sprint 12 · Mobile relaunch"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
                autoFocus
              />
              <Button
                type="submit"
                className="w-full"
                size="lg"
                isLoading={isLoading}
                disabled={!title.trim()}
              >
                Create board
                <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
              </Button>
            </form>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
