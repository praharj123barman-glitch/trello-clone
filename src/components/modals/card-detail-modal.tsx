"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { LABEL_COLORS } from "@/lib/utils";

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

interface CardDetail {
  id: string;
  title: string;
  description: string | null;
  dueDate: string | null;
  completed: boolean;
  labels: Label[];
  checklists: Checklist[];
  list: { title: string; boardId: string };
}

interface CardDetailModalProps {
  cardId: string;
  onClose: () => void;
}

function Icon({ name, className = "" }: { name: string; className?: string }) {
  return <span className={`material-symbols-outlined ${className}`}>{name}</span>;
}

export function CardDetailModal({ cardId, onClose }: CardDetailModalProps) {
  const [card, setCard] = useState<CardDetail | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [isEditingDesc, setIsEditingDesc] = useState(false);
  const [showLabels, setShowLabels] = useState(false);
  const [showDueDate, setShowDueDate] = useState(false);
  const [dueDate, setDueDate] = useState("");
  const [newChecklistTitle, setNewChecklistTitle] = useState("");
  const [showAddChecklist, setShowAddChecklist] = useState(false);
  const [newItemTexts, setNewItemTexts] = useState<Record<string, string>>({});

  useEffect(() => {
    fetchCard();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [cardId]);

  const fetchCard = async () => {
    try {
      const res = await fetch(`/api/cards/${cardId}`);
      if (res.ok) {
        const data = await res.json();
        setCard(data);
        setTitle(data.title);
        setDescription(data.description || "");
        setDueDate(
          data.dueDate ? new Date(data.dueDate).toISOString().split("T")[0] : ""
        );
      }
    } catch {
      // handle error
    } finally {
      setIsLoading(false);
    }
  };

  const updateCard = async (data: Record<string, unknown>) => {
    try {
      const res = await fetch(`/api/cards/${cardId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (res.ok) {
        const updated = await res.json();
        setCard((prev) => (prev ? { ...prev, ...updated } : null));
      }
    } catch {
      // handle error
    }
  };

  const updateTitle = () => {
    if (title.trim() && title !== card?.title) {
      updateCard({ title: title.trim() });
    } else {
      setTitle(card?.title || "");
    }
  };

  const saveDescription = () => {
    updateCard({ description: description || null });
    setIsEditingDesc(false);
  };

  const setCardDueDate = () => {
    updateCard({ dueDate: dueDate ? new Date(dueDate).toISOString() : null });
    setShowDueDate(false);
  };

  const toggleCompleted = () => {
    updateCard({ completed: !card?.completed });
    setCard((prev) => (prev ? { ...prev, completed: !prev.completed } : null));
  };

  const addLabel = async (name: string, color: string) => {
    try {
      const res = await fetch(`/api/cards/${cardId}/labels`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, color }),
      });
      if (res.ok) {
        const label = await res.json();
        setCard((prev) =>
          prev ? { ...prev, labels: [...prev.labels, label] } : null
        );
      }
    } catch {
      // handle error
    }
  };

  const removeLabel = async (labelId: string) => {
    try {
      await fetch(`/api/cards/${cardId}/labels`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ labelId }),
      });
      setCard((prev) =>
        prev
          ? { ...prev, labels: prev.labels.filter((l) => l.id !== labelId) }
          : null
      );
    } catch {
      // handle error
    }
  };

  const addChecklist = async () => {
    if (!newChecklistTitle.trim()) return;
    try {
      const res = await fetch(`/api/cards/${cardId}/checklists`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title: newChecklistTitle.trim() }),
      });
      if (res.ok) {
        const checklist = await res.json();
        setCard((prev) =>
          prev ? { ...prev, checklists: [...prev.checklists, checklist] } : null
        );
        setNewChecklistTitle("");
        setShowAddChecklist(false);
      }
    } catch {
      // handle error
    }
  };

  const deleteChecklist = async (checklistId: string) => {
    try {
      await fetch(`/api/cards/${cardId}/checklists`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ checklistId }),
      });
      setCard((prev) =>
        prev
          ? {
              ...prev,
              checklists: prev.checklists.filter((c) => c.id !== checklistId),
            }
          : null
      );
    } catch {
      // handle error
    }
  };

  const addChecklistItem = async (checklistId: string) => {
    const text = newItemTexts[checklistId]?.trim();
    if (!text) return;
    try {
      const res = await fetch("/api/checklist-items", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text, checklistId }),
      });
      if (res.ok) {
        const item = await res.json();
        setCard((prev) =>
          prev
            ? {
                ...prev,
                checklists: prev.checklists.map((c) =>
                  c.id === checklistId
                    ? { ...c, items: [...c.items, item] }
                    : c
                ),
              }
            : null
        );
        setNewItemTexts((prev) => ({ ...prev, [checklistId]: "" }));
      }
    } catch {
      // handle error
    }
  };

  const toggleChecklistItem = async (
    checklistId: string,
    itemId: string,
    completed: boolean
  ) => {
    try {
      await fetch("/api/checklist-items", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: itemId, completed: !completed }),
      });
      setCard((prev) =>
        prev
          ? {
              ...prev,
              checklists: prev.checklists.map((c) =>
                c.id === checklistId
                  ? {
                      ...c,
                      items: c.items.map((i) =>
                        i.id === itemId ? { ...i, completed: !completed } : i
                      ),
                    }
                  : c
              ),
            }
          : null
      );
    } catch {
      // handle error
    }
  };

  const deleteChecklistItem = async (checklistId: string, itemId: string) => {
    try {
      await fetch("/api/checklist-items", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: itemId }),
      });
      setCard((prev) =>
        prev
          ? {
              ...prev,
              checklists: prev.checklists.map((c) =>
                c.id === checklistId
                  ? { ...c, items: c.items.filter((i) => i.id !== itemId) }
                  : c
              ),
            }
          : null
      );
    } catch {
      // handle error
    }
  };

  const deleteCard = async () => {
    if (!confirm("Delete this card?")) return;
    try {
      await fetch(`/api/cards/${cardId}`, { method: "DELETE" });
      onClose();
    } catch {
      // handle error
    }
  };

  if (isLoading) {
    return (
      <div className="fixed inset-0 z-[100] flex items-center justify-center bg-[var(--color-background)]/80 backdrop-blur-sm">
        <div className="w-9 h-9 border-2 border-[var(--color-primary)]/30 border-t-[var(--color-primary)] rounded-full animate-spin" />
      </div>
    );
  }

  if (!card) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-start justify-center pt-10 pb-10 overflow-y-auto px-4">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-[var(--color-background)]/80 backdrop-blur-sm"
        onClick={onClose}
      />
      <motion.div
        initial={{ opacity: 0, y: 20, scale: 0.98 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ type: "spring", duration: 0.4 }}
        className="relative glass-panel rounded-2xl shadow-2xl w-full max-w-3xl"
      >
        <div className="p-7 pb-4 border-b border-[var(--color-outline-variant)]/15">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 grid place-items-center w-8 h-8 rounded-lg text-[var(--color-on-surface-variant)] hover:text-[var(--color-on-surface)] hover:bg-[var(--color-surface-container-high)] transition-colors"
            aria-label="Close"
          >
            <Icon name="close" className="text-[18px]" />
          </button>

          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            onBlur={updateTitle}
            onKeyDown={(e) => e.key === "Enter" && (e.target as HTMLInputElement).blur()}
            className="font-display font-semibold text-[22px] text-[var(--color-on-surface)] bg-transparent border-none outline-none w-full pr-8 focus:bg-[var(--color-surface-container-low)] focus:px-3 focus:py-1 focus:rounded-lg focus:ring-2 focus:ring-[var(--color-primary)]/40 transition-all tracking-[-0.01em]"
          />
          <p className="text-[12px] font-mono uppercase tracking-[0.14em] text-[var(--color-on-surface-variant)] mt-2 flex items-center gap-1.5">
            <Icon name="view_column" className="text-[14px]" />
            in list <span className="text-[var(--color-primary)]">{card.list.title}</span>
          </p>
        </div>

        <div className="flex flex-col lg:flex-row gap-6 px-7 py-6">
          <div className="flex-1 space-y-7 min-w-0">
            {card.labels.length > 0 && (
              <div>
                <h4 className="text-[10px] font-semibold uppercase tracking-[0.18em] text-[var(--color-on-surface-variant)] mb-3 flex items-center gap-1.5">
                  <Icon name="sell" className="text-[14px]" />
                  Labels
                </h4>
                <div className="flex flex-wrap gap-1.5">
                  {card.labels.map((label) => (
                    <button
                      key={label.id}
                      onClick={() => removeLabel(label.id)}
                      className="group px-3 py-1.5 text-[12px] font-semibold text-white rounded-full hover:opacity-90 hover:scale-[1.03] transition-all flex items-center gap-1.5 shadow-sm"
                      style={{ backgroundColor: label.color }}
                      title={`Click to remove: ${label.name}`}
                    >
                      {label.name}
                      <Icon name="close" className="text-[12px] opacity-60 group-hover:opacity-100 transition-opacity" />
                    </button>
                  ))}
                </div>
              </div>
            )}

            {card.dueDate && (
              <div>
                <h4 className="text-[10px] font-semibold uppercase tracking-[0.18em] text-[var(--color-on-surface-variant)] mb-3 flex items-center gap-1.5">
                  <Icon name="schedule" className="text-[14px]" />
                  Due date
                </h4>
                <div className="flex items-center gap-3">
                  <button
                    onClick={toggleCompleted}
                    className={`grid place-items-center w-5 h-5 rounded border-2 transition-all ${
                      card.completed
                        ? "bg-[var(--color-secondary)] border-[var(--color-secondary)]"
                        : "border-[var(--color-outline-variant)] hover:border-[var(--color-primary)]"
                    }`}
                  >
                    {card.completed && (
                      <Icon name="check" className="text-[14px] text-[var(--color-on-secondary)]" />
                    )}
                  </button>
                  <span
                    className={`text-[13px] px-3 py-1 rounded-full ${
                      card.completed
                        ? "bg-[var(--color-secondary)]/15 text-[var(--color-secondary)] border border-[var(--color-secondary)]/30"
                        : new Date(card.dueDate) < new Date()
                        ? "bg-[var(--color-error)]/15 text-[var(--color-error)] border border-[var(--color-error)]/30"
                        : "bg-[var(--color-surface-container-high)] text-[var(--color-on-surface)]"
                    }`}
                  >
                    {new Date(card.dueDate).toLocaleDateString("en-US", {
                      weekday: "short",
                      month: "short",
                      day: "numeric",
                    })}
                    {card.completed && " · completed"}
                  </span>
                </div>
              </div>
            )}

            <div>
              <h4 className="text-[10px] font-semibold uppercase tracking-[0.18em] text-[var(--color-on-surface-variant)] mb-3 flex items-center gap-1.5">
                <Icon name="notes" className="text-[14px]" />
                Description
              </h4>
              {isEditingDesc ? (
                <div>
                  <textarea
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Add a more detailed description…"
                    className="w-full px-3 py-2.5 text-[14px] bg-[var(--color-surface-container-low)] border border-[var(--color-outline-variant)]/40 rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]/40 focus:border-[var(--color-primary)] min-h-[110px] text-[var(--color-on-surface)] placeholder:text-[var(--color-on-surface-variant)]/50"
                    autoFocus
                  />
                  <div className="flex gap-2 mt-2">
                    <Button size="sm" onClick={saveDescription}>
                      Save
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => {
                        setDescription(card.description || "");
                        setIsEditingDesc(false);
                      }}
                    >
                      Cancel
                    </Button>
                  </div>
                </div>
              ) : (
                <div
                  onClick={() => setIsEditingDesc(true)}
                  className="text-[14px] leading-[1.65] text-[var(--color-on-surface)] bg-[var(--color-surface-container-low)] hover:bg-[var(--color-surface-container)] rounded-lg px-3 py-3 min-h-[60px] cursor-text transition-colors whitespace-pre-wrap"
                >
                  {description || (
                    <span className="text-[var(--color-on-surface-variant)] italic">
                      Add a more detailed description…
                    </span>
                  )}
                </div>
              )}
            </div>

            {card.checklists.map((checklist) => {
              const total = checklist.items.length;
              const done = checklist.items.filter((i) => i.completed).length;
              const percent = total > 0 ? Math.round((done / total) * 100) : 0;

              return (
                <div key={checklist.id}>
                  <div className="flex items-center justify-between mb-3">
                    <h4 className="text-[13px] font-semibold text-[var(--color-on-surface)] flex items-center gap-2">
                      <Icon name="check_box" className="text-[16px] text-[var(--color-primary)]" />
                      {checklist.title}
                    </h4>
                    <button
                      onClick={() => deleteChecklist(checklist.id)}
                      className="text-[11px] font-semibold uppercase tracking-[0.08em] text-[var(--color-on-surface-variant)] hover:text-[var(--color-error)] px-2 py-1 rounded hover:bg-[var(--color-error)]/10 transition-colors"
                    >
                      Delete
                    </button>
                  </div>

                  <div className="flex items-center gap-3 mb-3">
                    <span className="text-[11px] font-mono text-[var(--color-on-surface-variant)] w-10">
                      {percent}%
                    </span>
                    <div className="flex-1 h-1.5 bg-[var(--color-surface-container-high)] rounded-full overflow-hidden">
                      <motion.div
                        className={`h-full rounded-full ${
                          percent === 100
                            ? "bg-[var(--color-secondary)]"
                            : "bg-[var(--color-primary)]"
                        }`}
                        initial={{ width: 0 }}
                        animate={{ width: `${percent}%` }}
                        transition={{ duration: 0.4 }}
                      />
                    </div>
                  </div>

                  <div className="space-y-1">
                    {checklist.items.map((item) => (
                      <div
                        key={item.id}
                        className="flex items-center gap-3 group/item px-2 py-1.5 rounded hover:bg-[var(--color-surface-container-high)] transition-colors"
                      >
                        <button
                          onClick={() =>
                            toggleChecklistItem(checklist.id, item.id, item.completed)
                          }
                          className={`grid place-items-center w-4 h-4 rounded border-2 flex-shrink-0 transition-all ${
                            item.completed
                              ? "bg-[var(--color-primary)] border-[var(--color-primary)]"
                              : "border-[var(--color-outline-variant)] hover:border-[var(--color-primary)]"
                          }`}
                        >
                          {item.completed && (
                            <Icon name="check" className="text-[12px] text-[var(--color-on-primary)]" />
                          )}
                        </button>
                        <span
                          className={`text-[14px] flex-1 ${
                            item.completed
                              ? "line-through text-[var(--color-on-surface-variant)]"
                              : "text-[var(--color-on-surface)]"
                          }`}
                        >
                          {item.text}
                        </span>
                        <button
                          onClick={() =>
                            deleteChecklistItem(checklist.id, item.id)
                          }
                          className="opacity-0 group-hover/item:opacity-100 text-[var(--color-on-surface-variant)] hover:text-[var(--color-error)] p-1 transition-opacity"
                        >
                          <Icon name="close" className="text-[14px]" />
                        </button>
                      </div>
                    ))}
                  </div>

                  <div className="flex items-center gap-2 mt-3">
                    <input
                      value={newItemTexts[checklist.id] || ""}
                      onChange={(e) =>
                        setNewItemTexts((prev) => ({
                          ...prev,
                          [checklist.id]: e.target.value,
                        }))
                      }
                      onKeyDown={(e) =>
                        e.key === "Enter" && addChecklistItem(checklist.id)
                      }
                      placeholder="Add an item…"
                      className="flex-1 px-3 py-2 text-[14px] bg-[var(--color-surface-container-low)] border border-[var(--color-outline-variant)]/40 rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]/40 focus:border-[var(--color-primary)] text-[var(--color-on-surface)] placeholder:text-[var(--color-on-surface-variant)]/50"
                    />
                    <button
                      onClick={() => addChecklistItem(checklist.id)}
                      className="grid place-items-center w-9 h-9 rounded-lg bg-[var(--color-primary)]/15 text-[var(--color-primary)] hover:bg-[var(--color-primary)]/25 transition-colors"
                    >
                      <Icon name="add" className="text-[18px]" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="lg:w-48 space-y-2 flex-shrink-0">
            <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-[var(--color-on-surface-variant)] mb-2">
              Add to card
            </p>

            <div className="relative">
              <button
                onClick={() => setShowLabels(!showLabels)}
                className="w-full bg-[var(--color-surface-container-high)] hover:bg-[var(--color-surface-container-highest)] text-[var(--color-on-surface)] text-[12px] font-semibold uppercase tracking-[0.08em] px-3 py-2 rounded-lg flex items-center gap-2 transition-colors"
              >
                <Icon name="sell" className="text-[16px] text-[var(--color-primary)]" />
                Labels
              </button>
              {showLabels && (
                <>
                  <div className="fixed inset-0 z-30" onClick={() => setShowLabels(false)} />
                  <div className="absolute top-full mt-2 right-0 z-40 glass-panel rounded-xl p-3 w-60 shadow-2xl">
                    <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-[var(--color-on-surface-variant)] mb-2">
                      Select a label
                    </p>
                    <div className="space-y-1">
                      {LABEL_COLORS.map((lc) => (
                        <button
                          key={lc.value}
                          onClick={() => {
                            addLabel(lc.name, lc.value);
                            setShowLabels(false);
                          }}
                          className="w-full h-9 rounded-md text-white text-[12px] font-semibold flex items-center px-3 hover:opacity-90 hover:scale-[1.01] transition-all"
                          style={{ backgroundColor: lc.value }}
                        >
                          {lc.name}
                        </button>
                      ))}
                    </div>
                  </div>
                </>
              )}
            </div>

            <div className="relative">
              <button
                onClick={() => setShowDueDate(!showDueDate)}
                className="w-full bg-[var(--color-surface-container-high)] hover:bg-[var(--color-surface-container-highest)] text-[var(--color-on-surface)] text-[12px] font-semibold uppercase tracking-[0.08em] px-3 py-2 rounded-lg flex items-center gap-2 transition-colors"
              >
                <Icon name="schedule" className="text-[16px] text-[var(--color-primary)]" />
                Due date
              </button>
              {showDueDate && (
                <>
                  <div className="fixed inset-0 z-30" onClick={() => setShowDueDate(false)} />
                  <div className="absolute top-full mt-2 right-0 z-40 glass-panel rounded-xl p-3 w-60 shadow-2xl">
                    <input
                      type="date"
                      value={dueDate}
                      onChange={(e) => setDueDate(e.target.value)}
                      className="w-full px-3 py-2 text-[14px] bg-[var(--color-surface-container-low)] border border-[var(--color-outline-variant)]/40 rounded-lg mb-3 text-[var(--color-on-surface)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]/40"
                    />
                    <div className="flex gap-2">
                      <Button size="sm" onClick={setCardDueDate}>
                        Save
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => {
                          setDueDate("");
                          updateCard({ dueDate: null });
                          setShowDueDate(false);
                        }}
                      >
                        Remove
                      </Button>
                    </div>
                  </div>
                </>
              )}
            </div>

            <div className="relative">
              <button
                onClick={() => setShowAddChecklist(!showAddChecklist)}
                className="w-full bg-[var(--color-surface-container-high)] hover:bg-[var(--color-surface-container-highest)] text-[var(--color-on-surface)] text-[12px] font-semibold uppercase tracking-[0.08em] px-3 py-2 rounded-lg flex items-center gap-2 transition-colors"
              >
                <Icon name="check_box" className="text-[16px] text-[var(--color-primary)]" />
                Checklist
              </button>
              {showAddChecklist && (
                <>
                  <div className="fixed inset-0 z-30" onClick={() => setShowAddChecklist(false)} />
                  <div className="absolute top-full mt-2 right-0 z-40 glass-panel rounded-xl p-3 w-60 shadow-2xl">
                    <input
                      value={newChecklistTitle}
                      onChange={(e) => setNewChecklistTitle(e.target.value)}
                      onKeyDown={(e) => e.key === "Enter" && addChecklist()}
                      placeholder="Checklist title…"
                      className="w-full px-3 py-2 text-[14px] bg-[var(--color-surface-container-low)] border border-[var(--color-outline-variant)]/40 rounded-lg mb-3 text-[var(--color-on-surface)] placeholder:text-[var(--color-on-surface-variant)]/50 focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]/40"
                      autoFocus
                    />
                    <Button size="sm" onClick={addChecklist} className="w-full">
                      Add
                    </Button>
                  </div>
                </>
              )}
            </div>

            <hr className="my-3 border-[var(--color-outline-variant)]/20" />

            <button
              onClick={deleteCard}
              className="w-full bg-[var(--color-error)]/10 hover:bg-[var(--color-error)]/20 text-[var(--color-error)] text-[12px] font-semibold uppercase tracking-[0.08em] px-3 py-2 rounded-lg flex items-center gap-2 transition-colors border border-[var(--color-error)]/20"
            >
              <Icon name="delete" className="text-[16px]" />
              Delete card
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
