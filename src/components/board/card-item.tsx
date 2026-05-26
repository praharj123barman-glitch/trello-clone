"use client";

import { Draggable } from "@hello-pangea/dnd";
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

  const progress =
    totalItems > 0 ? Math.round((completedItems / totalItems) * 100) : 0;

  return (
    <Draggable draggableId={card.id} index={index}>
      {(provided, snapshot) => (
        <div
          ref={provided.innerRef}
          {...provided.draggableProps}
          {...provided.dragHandleProps}
          onClick={() => cardModal.onOpen(card.id)}
          className={`glass-card rounded-lg p-3 mb-2 cursor-pointer group ${
            snapshot.isDragging
              ? "shadow-2xl ring-1 ring-[var(--color-primary)]/40 rotate-1"
              : ""
          } ${card.completed ? "opacity-65" : ""}`}
        >
          {card.labels.length > 0 && (
            <div className="flex flex-wrap gap-1 mb-2">
              {card.labels.map((label) => (
                <span
                  key={label.id}
                  className="h-1.5 w-10 rounded-full"
                  style={{ backgroundColor: label.color }}
                  title={label.name}
                />
              ))}
            </div>
          )}

          <p
            className={`text-[14px] leading-snug text-[var(--color-on-surface)] ${
              card.completed ? "line-through text-[var(--color-on-surface-variant)]" : ""
            }`}
          >
            {card.title}
          </p>

          {totalItems > 0 && (
            <div className="mt-2.5">
              <div className="w-full bg-[var(--color-surface-container-high)] h-1 rounded-full overflow-hidden">
                <div
                  className="bg-[var(--color-primary)] h-full rounded-full transition-all duration-500"
                  style={{ width: `${progress}%` }}
                />
              </div>
            </div>
          )}

          {(card.description || totalItems > 0 || card.dueDate) && (
            <div className="flex items-center gap-3 mt-2.5 flex-wrap">
              {card.dueDate && (
                <span
                  className={`flex items-center gap-1 text-[11px] px-2 py-0.5 rounded-full ${
                    card.completed
                      ? "bg-[var(--color-secondary)]/15 text-[var(--color-secondary)] border border-[var(--color-secondary)]/30"
                      : isOverdue
                      ? "bg-[var(--color-error)]/15 text-[var(--color-error)] border border-[var(--color-error)]/30"
                      : "text-[var(--color-on-surface-variant)]"
                  }`}
                >
                  <span className="material-symbols-outlined text-[12px]">schedule</span>
                  {new Date(card.dueDate).toLocaleDateString("en-US", {
                    month: "short",
                    day: "numeric",
                  })}
                </span>
              )}

              {card.description && (
                <span className="material-symbols-outlined text-[14px] text-[var(--color-on-surface-variant)]">
                  notes
                </span>
              )}

              {totalItems > 0 && (
                <span
                  className={`flex items-center gap-1 text-[11px] font-mono ${
                    completedItems === totalItems
                      ? "text-[var(--color-secondary)]"
                      : "text-[var(--color-on-surface-variant)]"
                  }`}
                >
                  <span className="material-symbols-outlined text-[12px]">check_box</span>
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
