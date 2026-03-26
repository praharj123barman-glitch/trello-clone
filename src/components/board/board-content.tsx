"use client";

import { useState } from "react";
import {
  DragDropContext,
  Droppable,
  type DropResult,
} from "@hello-pangea/dnd";
import { Plus, X } from "lucide-react";
import { ListColumn } from "./list-column";
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

interface BoardContentProps {
  boardId: string;
  initialLists: List[];
  onRefresh: () => void;
}

export function BoardContent({
  boardId,
  initialLists,
  onRefresh,
}: BoardContentProps) {
  const [lists, setLists] = useState<List[]>(initialLists);
  const [isAddingList, setIsAddingList] = useState(false);
  const [newListTitle, setNewListTitle] = useState("");

  // Sync with parent
  useState(() => {
    setLists(initialLists);
  });

  const addList = async () => {
    if (!newListTitle.trim()) return;

    try {
      const res = await fetch("/api/lists", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title: newListTitle.trim(), boardId }),
      });

      if (res.ok) {
        const newList = await res.json();
        setLists((prev) => [...prev, newList]);
        setNewListTitle("");
        setIsAddingList(false);
      }
    } catch {
      // handle error
    }
  };

  const deleteList = async (listId: string) => {
    try {
      await fetch(`/api/lists/${listId}`, { method: "DELETE" });
      setLists((prev) => prev.filter((l) => l.id !== listId));
    } catch {
      // handle error
    }
  };

  const updateListTitle = async (listId: string, title: string) => {
    try {
      await fetch(`/api/lists/${listId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title }),
      });
      setLists((prev) =>
        prev.map((l) => (l.id === listId ? { ...l, title } : l))
      );
    } catch {
      // handle error
    }
  };

  const addCard = async (listId: string, title: string) => {
    try {
      const res = await fetch("/api/cards", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title, listId }),
      });

      if (res.ok) {
        const newCard = await res.json();
        setLists((prev) =>
          prev.map((l) =>
            l.id === listId ? { ...l, cards: [...l.cards, newCard] } : l
          )
        );
      }
    } catch {
      // handle error
    }
  };

  const onDragEnd = async (result: DropResult) => {
    const { destination, source, type } = result;

    if (!destination) return;
    if (
      destination.droppableId === source.droppableId &&
      destination.index === source.index
    )
      return;

    // Reordering lists
    if (type === "list") {
      const reordered = [...lists];
      const [removed] = reordered.splice(source.index, 1);
      reordered.splice(destination.index, 0, removed);

      const updatedLists = reordered.map((list, i) => ({
        ...list,
        position: i,
      }));

      setLists(updatedLists);

      try {
        await fetch(`/api/lists/${lists[0]?.id}/reorder`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            lists: updatedLists.map((l) => ({
              id: l.id,
              position: l.position,
            })),
          }),
        });
      } catch {
        setLists(lists); // revert
      }

      return;
    }

    // Reordering cards
    const sourceList = lists.find((l) => l.id === source.droppableId);
    const destList = lists.find((l) => l.id === destination.droppableId);

    if (!sourceList || !destList) return;

    // Same list
    if (source.droppableId === destination.droppableId) {
      const reorderedCards = [...sourceList.cards];
      const [removed] = reorderedCards.splice(source.index, 1);
      reorderedCards.splice(destination.index, 0, removed);

      const updatedCards = reorderedCards.map((card, i) => ({
        ...card,
        position: i,
      }));

      setLists((prev) =>
        prev.map((l) =>
          l.id === sourceList.id ? { ...l, cards: updatedCards } : l
        )
      );

      try {
        await fetch(`/api/lists/${sourceList.id}/reorder`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            cards: updatedCards.map((c) => ({
              id: c.id,
              position: c.position,
              listId: c.listId,
            })),
          }),
        });
      } catch {
        setLists(lists); // revert
      }
    } else {
      // Different list
      const sourceCards = [...sourceList.cards];
      const [movedCard] = sourceCards.splice(source.index, 1);
      const destCards = [...destList.cards];

      movedCard.listId = destList.id;
      destCards.splice(destination.index, 0, movedCard);

      const updatedSourceCards = sourceCards.map((c, i) => ({
        ...c,
        position: i,
      }));
      const updatedDestCards = destCards.map((c, i) => ({
        ...c,
        position: i,
        listId: destList.id,
      }));

      setLists((prev) =>
        prev.map((l) => {
          if (l.id === sourceList.id) return { ...l, cards: updatedSourceCards };
          if (l.id === destList.id) return { ...l, cards: updatedDestCards };
          return l;
        })
      );

      try {
        await fetch(`/api/lists/${sourceList.id}/reorder`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            cards: [...updatedSourceCards, ...updatedDestCards].map((c) => ({
              id: c.id,
              position: c.position,
              listId: c.listId,
            })),
          }),
        });
      } catch {
        setLists(lists); // revert
      }
    }
  };

  return (
    <div className="flex-1 overflow-x-auto board-scroll p-4">
      <DragDropContext onDragEnd={onDragEnd}>
        <Droppable droppableId="lists" type="list" direction="horizontal">
          {(provided) => (
            <div
              ref={provided.innerRef}
              {...provided.droppableProps}
              className="flex gap-4 items-start h-full"
            >
              {lists.map((list, index) => (
                <ListColumn
                  key={list.id}
                  list={list}
                  index={index}
                  onAddCard={addCard}
                  onDeleteList={deleteList}
                  onUpdateTitle={updateListTitle}
                />
              ))}
              {provided.placeholder}

              {/* Add list */}
              <div className="shrink-0 w-72">
                {isAddingList ? (
                  <div className="bg-white rounded-xl p-3 shadow-sm">
                    <input
                      value={newListTitle}
                      onChange={(e) => setNewListTitle(e.target.value)}
                      onKeyDown={(e) => e.key === "Enter" && addList()}
                      placeholder="Enter list title..."
                      className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                      autoFocus
                    />
                    <div className="flex items-center gap-2 mt-2">
                      <Button size="sm" onClick={addList}>
                        Add list
                      </Button>
                      <button
                        onClick={() => {
                          setIsAddingList(false);
                          setNewListTitle("");
                        }}
                        className="text-gray-400 hover:text-gray-600 p-1 cursor-pointer"
                      >
                        <X className="w-5 h-5" />
                      </button>
                    </div>
                  </div>
                ) : (
                  <button
                    onClick={() => setIsAddingList(true)}
                    className="w-full bg-white/20 hover:bg-white/30 text-white rounded-xl px-4 py-3 flex items-center gap-2 text-sm font-medium transition-colors cursor-pointer"
                  >
                    <Plus className="w-4 h-4" />
                    Add another list
                  </button>
                )}
              </div>
            </div>
          )}
        </Droppable>
      </DragDropContext>
    </div>
  );
}
