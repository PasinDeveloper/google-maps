"use client";

import { useEffect, useRef } from "react";
import { AnimatePresence, motion, type Variants } from "motion/react";
import clsx from "clsx";
import { MarkerData } from "../Map/Map";

interface MarkerListProps {
  markers: readonly MarkerData[];
  selectedId: string | number | null;
  onCardClick: (id: string | number) => void;
}

const cardVariants: Variants = {
  initial: { opacity: 0, y: 8 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.2 } },
  exit: { opacity: 0, y: -8, transition: { duration: 0.15 } },
};

const selectedVariants: Variants = {
  rest: { scale: 1 },
  selected: {
    scale: 1.02,
    transition: { type: "spring", stiffness: 300, damping: 20 },
  },
};

/**
 * Left-panel card list that stays in sync with the map markers.
 * Clicking a card highlights both the card and the corresponding map marker.
 */
export default function MarkerList({
  markers,
  selectedId,
  onCardClick,
}: MarkerListProps) {
  const listRef = useRef<HTMLElement | null>(null);
  const cardRefs = useRef(new Map<string, HTMLButtonElement>());

  const getCardKey = (id: string | number) => String(id);

  const setCardRef = (id: string | number, node: HTMLButtonElement | null) => {
    const cardKey = getCardKey(id);

    if (node) {
      cardRefs.current.set(cardKey, node);
      return;
    }

    cardRefs.current.delete(cardKey);
  };

  const getScrollContainer = (element: HTMLElement) => {
    let current: HTMLElement | null = element.parentElement;

    while (current) {
      const { overflowY } = window.getComputedStyle(current);
      const canScroll = /(auto|scroll|overlay)/.test(overflowY);

      if (canScroll && current.scrollHeight > current.clientHeight) {
        return current;
      }

      current = current.parentElement;
    }

    return null;
  };

  useEffect(() => {
    if (selectedId === null || !listRef.current) {
      return;
    }

    const selectedCard = cardRefs.current.get(getCardKey(selectedId));

    if (!selectedCard) {
      return;
    }

    const listPanel = getScrollContainer(selectedCard) ?? listRef.current;

    if (!listPanel) {
      return;
    }

    const frameId = window.requestAnimationFrame(() => {
      const panelRect = listPanel.getBoundingClientRect();
      const cardRect = selectedCard.getBoundingClientRect();

      const scrollPadding = 16;
      const nextScrollTop =
        cardRect.top < panelRect.top + scrollPadding
          ? listPanel.scrollTop + cardRect.top - panelRect.top - scrollPadding
          : cardRect.bottom > panelRect.bottom - scrollPadding
            ? listPanel.scrollTop +
              cardRect.bottom -
              panelRect.bottom +
              scrollPadding
            : null;

      if (nextScrollTop !== null) {
        listPanel.scrollTo({
          top: nextScrollTop,
          behavior: "smooth",
        });
      }
    });

    return () => {
      window.cancelAnimationFrame(frameId);
    };
  }, [selectedId]);

  return (
    <nav ref={listRef} className="px-4 py-4 md:px-5" aria-label="Location list">
      <h2 className="mb-3 border-b-2 border-slate-200 pb-2 text-lg font-bold text-slate-900">
        Locations
      </h2>
      <ul className="flex list-none flex-col gap-2" role="list">
        <AnimatePresence initial={false}>
          {markers.map((marker) => {
            const isSelected = marker.id === selectedId;
            return (
              <motion.li
                key={marker.id}
                variants={cardVariants}
                initial="initial"
                animate="animate"
                exit="exit"
                layout
              >
                <motion.button
                  ref={(node) => setCardRef(marker.id, node)}
                  className={clsx(
                    "flex w-full cursor-pointer items-start gap-2.5 rounded-xl border bg-white p-3 text-left transition-[colors,shadow] duration-150 ",
                    isSelected
                      ? "border-blue-500 bg-blue-50 shadow-md shadow-blue-500"
                      : "border-slate-200 shadow-sm hover:border-blue-500 hover:shadow-sm",
                  )}
                  variants={selectedVariants}
                  animate={isSelected ? "selected" : "rest"}
                  onClick={() => onCardClick(marker.id)}
                  aria-pressed={isSelected}
                  aria-label={`Select ${marker.title ?? String(marker.id)}`}
                  type="button"
                >
                  <div
                    className="mt-0.5 shrink-0 text-[1.4rem] leading-none"
                    aria-hidden="true"
                  >
                    📍
                  </div>
                  <div className="flex min-w-0 flex-col gap-0.5">
                    {marker.title && (
                      <span className="truncate text-sm font-semibold text-slate-900">
                        {marker.title}
                      </span>
                    )}
                    {marker.description && (
                      <span className="line-clamp-2 text-xs text-slate-600">
                        {marker.description}
                      </span>
                    )}
                    <span className="text-[0.72rem] tabular-nums text-slate-400">
                      {marker.lat.toFixed(4)}, {marker.lng.toFixed(4)}
                    </span>
                  </div>
                </motion.button>
              </motion.li>
            );
          })}
        </AnimatePresence>
      </ul>
    </nav>
  );
}
