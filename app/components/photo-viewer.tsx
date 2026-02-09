"use client";

import { useEffect } from "react";

export type PhotoViewerItem = {
  id: string;
  url: string;
  alt?: string;
};

type PhotoViewerProps = {
  items: PhotoViewerItem[];
  currentIndex: number;
  onClose: () => void;
  onPrev?: () => void;
  onNext?: () => void;
};

export function PhotoViewer({ items, currentIndex, onClose, onPrev, onNext }: PhotoViewerProps) {
  const item = items[currentIndex];
  const hasPrev = currentIndex > 0;
  const hasNext = currentIndex < items.length - 1;

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
      if (e.key === "ArrowLeft") hasPrev && onPrev?.();
      if (e.key === "ArrowRight") hasNext && onNext?.();
    };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [onClose, onPrev, onNext, hasPrev, hasNext]);

  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "";
    };
  }, []);

  if (items.length === 0 || !item) return null;

  return (
    <div
      className="fixed inset-0 z-[2000] flex items-center justify-center bg-black/90"
      role="dialog"
      aria-modal="true"
      aria-label="Photo viewer"
      onClick={onClose}
    >
      <div
        className="relative max-w-[90vw] max-h-[90vh] flex items-center justify-center"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          type="button"
          onClick={onClose}
          className="absolute -top-12 right-0 rounded-lg p-2 text-white/80 hover:text-white hover:bg-white/10 transition-colors"
          aria-label="Close"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        {hasPrev && (
          <button
            type="button"
            onClick={onPrev}
            className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-14 rounded-lg p-2 text-white/80 hover:text-white hover:bg-white/10 transition-colors"
            aria-label="Previous image"
          >
            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
        )}

        <img
          src={item.url}
          alt={item.alt ?? "Attachment"}
          className="max-w-[90vw] max-h-[90vh] object-contain"
          draggable={false}
          onClick={(e) => e.stopPropagation()}
        />

        {hasNext && (
          <button
            type="button"
            onClick={onNext}
            className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-14 rounded-lg p-2 text-white/80 hover:text-white hover:bg-white/10 transition-colors"
            aria-label="Next image"
          >
            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>
        )}

        {items.length > 1 && (
          <div className="absolute -bottom-10 left-1/2 -translate-x-1/2 text-sm text-white/70">
            {currentIndex + 1} / {items.length}
          </div>
        )}
      </div>
    </div>
  );
}
