"use client";

import { Draggable } from "@hello-pangea/dnd";
import { AlignLeft, CheckSquare, Clock } from "lucide-react";
import { useCardModal } from "@/store/use-card-modal";

interface Label {
  id: string;
  name: string;
  color: string;
}

interface ChecklistItem {
  id: string;
  text: string;
  completed: boolean;
}

interface Checklist {
  id: string;
  title: string;
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

interface CardItemProps {
  card: Card;
  index: number;
}

export function CardItem({ card, index }: CardItemProps) {
  const cardModal = useCardModal();

  const totalItems = card.checklists.reduce(
    (acc, cl) => acc + cl.items.length,
    0
  );
  const completedItems = card.checklists.reduce(
    (acc, cl) => acc + cl.items.filter((i) => i.completed).length,
    0
  );

  const isOverdue =
    card.dueDate && !card.completed && new Date(card.dueDate) < new Date();

  return (
    <Draggable draggableId={card.id} index={index}>
      {(provided, snapshot) => (
        <div
          ref={provided.innerRef}
          {...provided.draggableProps}
          {...provided.dragHandleProps}
          onClick={() => cardModal.onOpen(card.id)}
          className={`bg-white rounded-lg shadow-sm border border-gray-200 p-2.5 mb-1.5 cursor-pointer hover:border-blue-400 transition-all group ${
            snapshot.isDragging ? "shadow-lg rotate-2 scale-105" : ""
          }`}
        >
          {/* Labels */}
          {card.labels.length > 0 && (
            <div className="flex flex-wrap gap-1 mb-1.5">
              {card.labels.map((label) => (
                <span
                  key={label.id}
                  className="h-2 w-10 rounded-full"
                  style={{ backgroundColor: label.color }}
                  title={label.name}
                />
              ))}
            </div>
          )}

          {/* Title */}
          <p className="text-sm text-gray-700 leading-snug">{card.title}</p>

          {/* Badges */}
          {(card.description || totalItems > 0 || card.dueDate) && (
            <div className="flex items-center gap-2.5 mt-2 flex-wrap">
              {card.dueDate && (
                <span
                  className={`flex items-center gap-1 text-xs px-1.5 py-0.5 rounded ${
                    card.completed
                      ? "bg-green-100 text-green-700"
                      : isOverdue
                        ? "bg-red-100 text-red-600"
                        : "text-gray-500"
                  }`}
                >
                  <Clock className="w-3 h-3" />
                  {new Date(card.dueDate).toLocaleDateString("en-US", {
                    month: "short",
                    day: "numeric",
                  })}
                </span>
              )}

              {card.description && (
                <AlignLeft className="w-3.5 h-3.5 text-gray-400" />
              )}

              {totalItems > 0 && (
                <span
                  className={`flex items-center gap-1 text-xs ${
                    completedItems === totalItems
                      ? "text-green-600"
                      : "text-gray-500"
                  }`}
                >
                  <CheckSquare className="w-3 h-3" />
                  {completedItems}/{totalItems}
                </span>
              )}
            </div>
          )}
        </div>
      )}
    </Draggable>
  );
}
