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
  const selectedRef = useRef<HTMLButtonElement | null>(null);

  // Scroll selected card into view.
  useEffect(() => {
    if (selectedRef.current) {
      selectedRef.current.scrollIntoView({
        behavior: "smooth",
        block: "nearest",
      });
    }
  }, [selectedId]);

  return (
    <nav className="marker-list" aria-label="Location list">
      <h2 className="marker-list__heading">Locations</h2>
      <ul className="marker-list__items" role="list">
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
                  ref={isSelected ? selectedRef : null}
                  className={clsx("marker-card", {
                    "marker-card--selected": isSelected,
                  })}
                  variants={selectedVariants}
                  animate={isSelected ? "selected" : "rest"}
                  onClick={() => onCardClick(marker.id)}
                  aria-pressed={isSelected}
                  aria-label={`Select ${marker.title ?? String(marker.id)}`}
                  type="button"
                >
                  <div className="marker-card__icon" aria-hidden="true">
                    📍
                  </div>
                  <div className="marker-card__content">
                    {marker.title && (
                      <span className="marker-card__title">{marker.title}</span>
                    )}
                    {marker.description && (
                      <span className="marker-card__description">
                        {marker.description}
                      </span>
                    )}
                    <span className="marker-card__coords">
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
