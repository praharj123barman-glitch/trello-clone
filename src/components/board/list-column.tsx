"use client";

import { useState } from "react";
import { Draggable, Droppable } from "@hello-pangea/dnd";
import { MoreHorizontal, Plus, X, Trash2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { CardItem } from "./card-item";
import { Button } from "@/components/ui/button";

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
          className="shrink-0 w-72"
        >
          <div className="bg-gray-100 rounded-xl shadow-sm">
            {/* List header */}
            <div
              {...provided.dragHandleProps}
              className="flex items-center justify-between px-3 py-2.5"
            >
              {isEditingTitle ? (
                <input
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  onBlur={handleTitleSubmit}
                  onKeyDown={(e) => e.key === "Enter" && handleTitleSubmit()}
                  className="flex-1 px-2 py-0.5 text-sm font-semibold bg-white rounded border border-blue-400 outline-none"
                  autoFocus
                />
              ) : (
                <h3
                  onClick={() => setIsEditingTitle(true)}
                  className="text-sm font-semibold text-gray-700 cursor-pointer px-2 py-0.5 rounded hover:bg-gray-200 transition-colors truncate"
                >
                  {list.title}
                </h3>
              )}

              <div className="relative">
                <button
                  onClick={() => setShowMenu(!showMenu)}
                  className="text-gray-400 hover:text-gray-600 p-1 rounded hover:bg-gray-200 transition-colors cursor-pointer"
                >
                  <MoreHorizontal className="w-4 h-4" />
                </button>

                <AnimatePresence>
                  {showMenu && (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.95 }}
                      className="absolute right-0 top-8 bg-white rounded-lg shadow-lg border border-gray-200 py-1 w-48 z-50"
                    >
                      <button
                        onClick={() => {
                          setShowMenu(false);
                          onDeleteList(list.id);
                        }}
                        className="w-full px-3 py-2 text-sm text-left text-red-600 hover:bg-red-50 flex items-center gap-2 cursor-pointer"
                      >
                        <Trash2 className="w-4 h-4" />
                        Delete list
                      </button>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>

            {/* Cards */}
            <Droppable droppableId={list.id} type="card">
              {(provided, snapshot) => (
                <div
                  ref={provided.innerRef}
                  {...provided.droppableProps}
                  className={`px-2 pb-1 min-h-[4px] max-h-[calc(100vh-16rem)] overflow-y-auto list-scroll transition-colors rounded-lg mx-1 ${
                    snapshot.isDraggingOver ? "bg-gray-200/50" : ""
                  }`}
                >
                  {list.cards.map((card, cardIndex) => (
                    <CardItem key={card.id} card={card} index={cardIndex} />
                  ))}
                  {provided.placeholder}
                </div>
              )}
            </Droppable>

            {/* Add card */}
            <div className="px-2 pb-2">
              {isAddingCard ? (
                <div className="pt-1">
                  <textarea
                    value={newCardTitle}
                    onChange={(e) => setNewCardTitle(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" && !e.shiftKey) {
                        e.preventDefault();
                        handleAddCard();
                      }
                    }}
                    placeholder="Enter a title for this card..."
                    className="w-full px-3 py-2 text-sm bg-white border border-gray-200 rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-blue-500/50 min-h-[60px]"
                    autoFocus
                    rows={2}
                  />
                  <div className="flex items-center gap-2 mt-1.5">
                    <Button size="sm" onClick={handleAddCard}>
                      Add card
                    </Button>
                    <button
                      onClick={() => {
                        setIsAddingCard(false);
                        setNewCardTitle("");
                      }}
                      className="text-gray-400 hover:text-gray-600 p-1 cursor-pointer"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              ) : (
                <button
                  onClick={() => setIsAddingCard(true)}
                  className="w-full text-left px-3 py-1.5 text-sm text-gray-500 hover:text-gray-700 hover:bg-gray-200 rounded-lg flex items-center gap-1.5 transition-colors cursor-pointer"
                >
                  <Plus className="w-4 h-4" />
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
