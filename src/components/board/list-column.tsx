"use client";

import { useState } from "react";
import { Draggable, Droppable } from "@hello-pangea/dnd";
import { motion, AnimatePresence } from "framer-motion";
import { CardItem } from "./card-item";

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

interface ListColumnProps {
  list: List;
  index: number;
  onAddCard: (listId: string, title: string) => void;
  onDeleteList: (listId: string) => void;
  onUpdateTitle: (listId: string, title: string) => void;
}

export function ListColumn({
  list,
  index,
  onAddCard,
  onDeleteList,
  onUpdateTitle,
}: ListColumnProps) {
  const [isAddingCard, setIsAddingCard] = useState(false);
  const [newCardTitle, setNewCardTitle] = useState("");
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [title, setTitle] = useState(list.title);
  const [showMenu, setShowMenu] = useState(false);

  const handleAddCard = () => {
    if (!newCardTitle.trim()) return;
    onAddCard(list.id, newCardTitle.trim());
    setNewCardTitle("");
    setIsAddingCard(false);
  };

  const handleTitleSubmit = () => {
    if (title.trim() && title !== list.title) {
      onUpdateTitle(list.id, title.trim());
    } else {
      setTitle(list.title);
    }
    setIsEditingTitle(false);
  };

  return (
    <Draggable draggableId={list.id} index={index}>
      {(provided) => (
        <div
          ref={provided.innerRef}
          {...provided.draggableProps}
          className="shrink-0 w-80"
        >
          <div className="glass-panel rounded-xl flex flex-col max-h-[calc(100vh-11rem)]">
            <div
              {...provided.dragHandleProps}
              className="flex items-center justify-between px-4 py-3 border-b border-[var(--color-outline-variant)]/15"
            >
              <div className="flex items-center gap-2 flex-1 min-w-0">
                <span className="material-symbols-outlined text-[14px] text-[var(--color-on-surface-variant)] cursor-grab">
                  drag_indicator
                </span>
                {isEditingTitle ? (
                  <input
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    onBlur={handleTitleSubmit}
                    onKeyDown={(e) => e.key === "Enter" && handleTitleSubmit()}
                    className="flex-1 px-2 py-1 text-[13px] font-semibold uppercase tracking-[0.1em] bg-[var(--color-surface-container-low)] border border-[var(--color-primary)]/40 rounded outline-none focus:ring-2 focus:ring-[var(--color-primary)]/30 text-[var(--color-on-surface)]"
                    autoFocus
                  />
                ) : (
                  <h3
                    onClick={() => setIsEditingTitle(true)}
                    className="text-[12px] font-semibold uppercase tracking-[0.12em] text-[var(--color-on-surface)] cursor-pointer px-2 py-1 rounded hover:bg-[var(--color-surface-container-high)] transition-colors truncate flex-1"
                  >
                    {list.title}
                  </h3>
                )}
                <span className="bg-[var(--color-surface-container-high)] px-2 py-0.5 rounded-full text-[10px] font-mono text-[var(--color-on-surface-variant)]">
                  {list.cards.length}
                </span>
              </div>

              <div className="relative">
                <button
                  onClick={() => setShowMenu(!showMenu)}
                  className="grid place-items-center w-7 h-7 rounded text-[var(--color-on-surface-variant)] hover:text-[var(--color-primary)] hover:bg-[var(--color-surface-container-high)] transition-colors"
                >
                  <span className="material-symbols-outlined text-[16px]">more_horiz</span>
                </button>

                <AnimatePresence>
                  {showMenu && (
                    <>
                      <div
                        className="fixed inset-0 z-30"
                        onClick={() => setShowMenu(false)}
                      />
                      <motion.div
                        initial={{ opacity: 0, scale: 0.95, y: -4 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: -4 }}
                        className="absolute right-0 top-9 z-40 glass-panel rounded-lg py-1 w-48 shadow-2xl"
                      >
                        <button
                          onClick={() => {
                            setShowMenu(false);
                            onDeleteList(list.id);
                          }}
                          className="w-full px-3 py-2 text-[13px] text-left text-[var(--color-error)] hover:bg-[var(--color-error)]/10 flex items-center gap-2 transition-colors"
                        >
                          <span className="material-symbols-outlined text-[16px]">delete</span>
                          Delete list
                        </button>
                      </motion.div>
                    </>
                  )}
                </AnimatePresence>
              </div>
            </div>

            <Droppable droppableId={list.id} type="card">
              {(provided, snapshot) => (
                <div
                  ref={provided.innerRef}
                  {...provided.droppableProps}
                  className={`px-3 pt-3 pb-1 flex-1 overflow-y-auto list-scroll transition-colors min-h-[20px] ${
                    snapshot.isDraggingOver ? "bg-[var(--color-primary)]/[0.06]" : ""
                  }`}
                >
                  {list.cards.map((card, cardIndex) => (
                    <CardItem key={card.id} card={card} index={cardIndex} />
                  ))}
                  {provided.placeholder}
                </div>
              )}
            </Droppable>

            <div className="px-3 pb-3 pt-1">
              {isAddingCard ? (
                <div>
                  <textarea
                    value={newCardTitle}
                    onChange={(e) => setNewCardTitle(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" && !e.shiftKey) {
                        e.preventDefault();
                        handleAddCard();
                      }
                    }}
                    placeholder="Enter a title for this card…"
                    className="w-full px-3 py-2.5 text-[14px] bg-[var(--color-surface-container-low)] border border-[var(--color-outline-variant)]/40 rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]/40 focus:border-[var(--color-primary)] min-h-[70px] text-[var(--color-on-surface)] placeholder:text-[var(--color-on-surface-variant)]/50"
                    autoFocus
                    rows={2}
                  />
                  <div className="flex items-center gap-2 mt-2">
                    <button
                      onClick={handleAddCard}
                      className="px-4 py-2 bg-[var(--color-primary)] text-[var(--color-on-primary)] rounded-lg text-[12px] font-semibold uppercase tracking-[0.06em] hover:scale-[1.02] active:scale-[0.98] transition-transform"
                    >
                      Add card
                    </button>
                    <button
                      onClick={() => {
                        setIsAddingCard(false);
                        setNewCardTitle("");
                      }}
                      className="grid place-items-center w-9 h-9 rounded-lg text-[var(--color-on-surface-variant)] hover:text-[var(--color-on-surface)] hover:bg-[var(--color-surface-container-high)] transition-colors"
                    >
                      <span className="material-symbols-outlined text-[18px]">close</span>
                    </button>
                  </div>
                </div>
              ) : (
                <button
                  onClick={() => setIsAddingCard(true)}
                  className="w-full text-left px-3 py-2 text-[13px] text-[var(--color-on-surface-variant)] hover:text-[var(--color-primary)] hover:bg-[var(--color-surface-container-high)] rounded-lg flex items-center gap-2 transition-colors"
                >
                  <span className="material-symbols-outlined text-[16px]">add</span>
                  Add a card
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </Draggable>
  );
}
