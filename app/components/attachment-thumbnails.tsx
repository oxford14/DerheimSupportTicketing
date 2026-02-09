"use client";

import { useState, useMemo } from "react";
import Image from "next/image";
import { createPortal } from "react-dom";
import { PhotoViewer, type PhotoViewerItem } from "./photo-viewer";

export type AttachmentForThumbnail = {
  id: string;
  signed_url: string | null;
  file_name: string;
  content_type: string | null;
};

type AttachmentThumbnailsProps = {
  attachments: AttachmentForThumbnail[];
  thumbnailSize?: "sm" | "md" | "lg";
  borderClass?: string;
};

const IMAGE_TYPES = /^image\//;
const IMAGE_EXTENSIONS = /\.(jpe?g|png|gif|webp|avif|bmp|svg)$/i;

function isImage(att: AttachmentForThumbnail): boolean {
  if (att.content_type && IMAGE_TYPES.test(att.content_type)) return true;
  if (IMAGE_EXTENSIONS.test(att.file_name)) return true;
  return false;
}

const sizeClasses = {
  sm: "w-16 h-16",
  md: "w-20 h-20",
  lg: "w-24 h-24",
};

const sizePx = {
  sm: 64,
  md: 80,
  lg: 120,
};

export function AttachmentThumbnails({
  attachments,
  thumbnailSize = "lg",
  borderClass = "border-neutral-200 dark:border-neutral-700",
}: AttachmentThumbnailsProps) {
  const [viewerIndex, setViewerIndex] = useState<number | null>(null);

  const imageAttachments = useMemo(
    () => attachments.filter((a) => a.signed_url && isImage(a)),
    [attachments]
  );

  const viewerItems: PhotoViewerItem[] = useMemo(
    () =>
      imageAttachments.map((a) => ({
        id: a.id,
        url: a.signed_url!,
        alt: a.file_name,
      })),
    [imageAttachments]
  );

  const openViewer = (index: number) => {
    setViewerIndex(index);
  };

  const closeViewer = () => {
    setViewerIndex(null);
  };

  const px = sizePx[thumbnailSize];
  const sizeCls = sizeClasses[thumbnailSize];

  return (
    <>
      <div className="flex flex-wrap gap-2">
        {attachments.map((a) => {
          if (!a.signed_url) return null;
          const isImg = isImage(a);
          const imgIndex = isImg ? imageAttachments.findIndex((x) => x.id === a.id) : -1;

          if (isImg) {
            return (
              <button
                key={a.id}
                type="button"
                onClick={() => openViewer(imgIndex)}
                className={`block rounded-lg overflow-hidden border ${borderClass} hover:opacity-90 transition-opacity focus:outline-none focus:ring-2 focus:ring-neutral-400 dark:focus:ring-neutral-500 focus:ring-offset-2`}
              >
                <Image
                  src={a.signed_url}
                  alt={a.file_name}
                  width={px}
                  height={px}
                  className={`object-cover ${sizeCls}`}
                />
              </button>
            );
          }

          return (
            <a
              key={a.id}
              href={a.signed_url}
              target="_blank"
              rel="noopener noreferrer"
              className={`flex items-center justify-center rounded-lg border ${borderClass} ${sizeCls} hover:opacity-90 transition-opacity`}
              title={a.file_name}
            >
              <svg
                className="w-8 h-8 text-neutral-500 dark:text-neutral-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z"
                />
              </svg>
            </a>
          );
        })}
      </div>

      {viewerIndex !== null &&
        viewerItems.length > 0 &&
        typeof document !== "undefined" &&
        createPortal(
          <PhotoViewer
            items={viewerItems}
            currentIndex={viewerIndex}
            onClose={closeViewer}
            onPrev={() => setViewerIndex((i) => (i !== null && i > 0 ? i - 1 : i))}
            onNext={() =>
              setViewerIndex((i) => (i !== null && i < viewerItems.length - 1 ? i + 1 : i))
            }
          />,
          document.body
        )}
    </>
  );
}
