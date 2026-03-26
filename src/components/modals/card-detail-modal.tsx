"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import {
  X,
  AlignLeft,
  Tag,
  Clock,
  CheckSquare,
  Trash2,
  Plus,
} from "lucide-react";
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
          prev
            ? { ...prev, checklists: [...prev.checklists, checklist] }
            : null
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
                        i.id === itemId
                          ? { ...i, completed: !completed }
                          : i
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

  const deleteChecklistItem = async (
    checklistId: string,
    itemId: string
  ) => {
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
      <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50">
        <div className="w-8 h-8 border-4 border-white/30 border-t-white rounded-full animate-spin" />
      </div>
    );
  }

  if (!card) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-start justify-center pt-12 pb-12 overflow-y-auto">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/50"
        onClick={onClose}
      />
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative bg-gray-50 rounded-2xl shadow-2xl w-full max-w-2xl mx-4"
      >
        {/* Header */}
        <div className="p-6 pb-4">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 p-1 rounded-lg hover:bg-gray-200 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>

          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            onBlur={updateTitle}
            onKeyDown={(e) => e.key === "Enter" && updateTitle()}
            className="text-xl font-semibold text-gray-900 bg-transparent border-none outline-none w-full focus:bg-white focus:px-2 focus:py-1 focus:rounded-lg focus:ring-2 focus:ring-blue-500/50 transition-all"
          />
          <p className="text-sm text-gray-500 mt-1">
            in list <span className="font-medium">{card.list.title}</span>
          </p>
        </div>

        <div className="flex flex-col lg:flex-row gap-4 px-6 pb-6">
          {/* Main content */}
          <div className="flex-1 space-y-6">
            {/* Labels */}
            {card.labels.length > 0 && (
              <div>
                <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
                  Labels
                </h4>
                <div className="flex flex-wrap gap-1.5">
                  {card.labels.map((label) => (
                    <span
                      key={label.id}
                      onClick={() => removeLabel(label.id)}
                      className="px-3 py-1 text-xs font-medium text-white rounded-full cursor-pointer hover:opacity-80 transition-opacity"
                      style={{ backgroundColor: label.color }}
                      title={`Click to remove: ${label.name}`}
                    >
                      {label.name}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Due date display */}
            {card.dueDate && (
              <div>
                <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
                  Due Date
                </h4>
                <div className="flex items-center gap-2">
                  <button
                    onClick={toggleCompleted}
                    className={`w-5 h-5 rounded border-2 flex items-center justify-center transition-colors cursor-pointer ${
                      card.completed
                        ? "bg-green-500 border-green-500"
                        : "border-gray-300 hover:border-gray-400"
                    }`}
                  >
                    {card.completed && (
                      <svg
                        className="w-3 h-3 text-white"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                        strokeWidth={3}
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M5 13l4 4L19 7"
                        />
                      </svg>
                    )}
                  </button>
                  <span
                    className={`text-sm px-2 py-1 rounded ${
                      card.completed
                        ? "bg-green-100 text-green-700"
                        : new Date(card.dueDate) < new Date()
                          ? "bg-red-100 text-red-600"
                          : "bg-gray-100 text-gray-700"
                    }`}
                  >
                    {new Date(card.dueDate).toLocaleDateString("en-US", {
                      weekday: "short",
                      month: "short",
                      day: "numeric",
                    })}
                    {card.completed && " (completed)"}
                  </span>
                </div>
              </div>
            )}

            {/* Description */}
            <div>
              <div className="flex items-center gap-2 mb-2">
                <AlignLeft className="w-4 h-4 text-gray-500" />
                <h4 className="text-sm font-semibold text-gray-700">
                  Description
                </h4>
              </div>
              {isEditingDesc ? (
                <div>
                  <textarea
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Add a more detailed description..."
                    className="w-full px-3 py-2 text-sm bg-white border border-gray-200 rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-blue-500/50 min-h-[100px]"
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
                  className="text-sm text-gray-600 bg-gray-100 hover:bg-gray-200 rounded-lg px-3 py-2 min-h-[60px] cursor-pointer transition-colors whitespace-pre-wrap"
                >
                  {description || "Add a more detailed description..."}
                </div>
              )}
            </div>

            {/* Checklists */}
            {card.checklists.map((checklist) => {
              const total = checklist.items.length;
              const done = checklist.items.filter((i) => i.completed).length;
              const percent = total > 0 ? Math.round((done / total) * 100) : 0;

              return (
                <div key={checklist.id}>
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <CheckSquare className="w-4 h-4 text-gray-500" />
                      <h4 className="text-sm font-semibold text-gray-700">
                        {checklist.title}
                      </h4>
                    </div>
                    <button
                      onClick={() => deleteChecklist(checklist.id)}
                      className="text-xs text-gray-400 hover:text-red-500 px-2 py-1 rounded hover:bg-gray-100 transition-colors cursor-pointer"
                    >
                      Delete
                    </button>
                  </div>

                  {/* Progress bar */}
                  <div className="flex items-center gap-2 mb-3">
                    <span className="text-xs text-gray-500 w-8">
                      {percent}%
                    </span>
                    <div className="flex-1 h-1.5 bg-gray-200 rounded-full overflow-hidden">
                      <motion.div
                        className={`h-full rounded-full ${
                          percent === 100 ? "bg-green-500" : "bg-blue-500"
                        }`}
                        initial={{ width: 0 }}
                        animate={{ width: `${percent}%` }}
                        transition={{ duration: 0.3 }}
                      />
                    </div>
                  </div>

                  {/* Items */}
                  <div className="space-y-1">
                    {checklist.items.map((item) => (
                      <div
                        key={item.id}
                        className="flex items-center gap-2 group/item px-1 py-1 rounded hover:bg-gray-100"
                      >
                        <button
                          onClick={() =>
                            toggleChecklistItem(
                              checklist.id,
                              item.id,
                              item.completed
                            )
                          }
                          className={`w-4 h-4 rounded border-2 flex-shrink-0 flex items-center justify-center transition-colors cursor-pointer ${
                            item.completed
                              ? "bg-blue-500 border-blue-500"
                              : "border-gray-300"
                          }`}
                        >
                          {item.completed && (
                            <svg
                              className="w-2.5 h-2.5 text-white"
                              fill="none"
                              viewBox="0 0 24 24"
                              stroke="currentColor"
                              strokeWidth={3}
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                d="M5 13l4 4L19 7"
                              />
                            </svg>
                          )}
                        </button>
                        <span
                          className={`text-sm flex-1 ${
                            item.completed
                              ? "line-through text-gray-400"
                              : "text-gray-700"
                          }`}
                        >
                          {item.text}
                        </span>
                        <button
                          onClick={() =>
                            deleteChecklistItem(checklist.id, item.id)
                          }
                          className="opacity-0 group-hover/item:opacity-100 text-gray-400 hover:text-red-500 p-0.5 cursor-pointer"
                        >
                          <X className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ))}
                  </div>

                  {/* Add item */}
                  <div className="flex items-center gap-2 mt-2">
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
                      placeholder="Add an item..."
                      className="flex-1 px-2 py-1 text-sm bg-transparent border-b border-gray-200 focus:border-blue-400 outline-none"
                    />
                    <button
                      onClick={() => addChecklistItem(checklist.id)}
                      className="text-blue-500 hover:text-blue-600 p-1 cursor-pointer"
                    >
                      <Plus className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Sidebar actions */}
          <div className="lg:w-44 space-y-2">
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">
              Add to card
            </p>

            {/* Labels button */}
            <div className="relative">
              <button
                onClick={() => setShowLabels(!showLabels)}
                className="w-full bg-gray-200 hover:bg-gray-300 text-gray-700 text-sm font-medium px-3 py-1.5 rounded-lg flex items-center gap-2 transition-colors cursor-pointer"
              >
                <Tag className="w-4 h-4" />
                Labels
              </button>
              {showLabels && (
                <div className="absolute top-full mt-1 right-0 bg-white rounded-lg shadow-lg border border-gray-200 p-3 w-56 z-50">
                  <p className="text-xs font-semibold text-gray-500 mb-2">
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
                        className="w-full h-8 rounded-md text-white text-xs font-medium flex items-center px-3 hover:opacity-80 transition-opacity cursor-pointer"
                        style={{ backgroundColor: lc.value }}
                      >
                        {lc.name}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Due date button */}
            <div className="relative">
              <button
                onClick={() => setShowDueDate(!showDueDate)}
                className="w-full bg-gray-200 hover:bg-gray-300 text-gray-700 text-sm font-medium px-3 py-1.5 rounded-lg flex items-center gap-2 transition-colors cursor-pointer"
              >
                <Clock className="w-4 h-4" />
                Due Date
              </button>
              {showDueDate && (
                <div className="absolute top-full mt-1 right-0 bg-white rounded-lg shadow-lg border border-gray-200 p-3 w-56 z-50">
                  <input
                    type="date"
                    value={dueDate}
                    onChange={(e) => setDueDate(e.target.value)}
                    className="w-full px-2 py-1.5 text-sm border border-gray-200 rounded-lg mb-2"
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
              )}
            </div>

            {/* Checklist button */}
            <div className="relative">
              <button
                onClick={() => setShowAddChecklist(!showAddChecklist)}
                className="w-full bg-gray-200 hover:bg-gray-300 text-gray-700 text-sm font-medium px-3 py-1.5 rounded-lg flex items-center gap-2 transition-colors cursor-pointer"
              >
                <CheckSquare className="w-4 h-4" />
                Checklist
              </button>
              {showAddChecklist && (
                <div className="absolute top-full mt-1 right-0 bg-white rounded-lg shadow-lg border border-gray-200 p-3 w-56 z-50">
                  <input
                    value={newChecklistTitle}
                    onChange={(e) => setNewChecklistTitle(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && addChecklist()}
                    placeholder="Checklist title..."
                    className="w-full px-2 py-1.5 text-sm border border-gray-200 rounded-lg mb-2"
                    autoFocus
                  />
                  <Button size="sm" onClick={addChecklist}>
                    Add
                  </Button>
                </div>
              )}
            </div>

            <hr className="my-3 border-gray-200" />

            {/* Delete card */}
            <button
              onClick={deleteCard}
              className="w-full bg-red-50 hover:bg-red-100 text-red-600 text-sm font-medium px-3 py-1.5 rounded-lg flex items-center gap-2 transition-colors cursor-pointer"
            >
              <Trash2 className="w-4 h-4" />
              Delete Card
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
