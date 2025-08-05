"use client";

import { ReactNode, useEffect } from "react";

type Props = {
  onClose: () => void;
  /** Extra classes for the content container */
  contentClassName?: string;
  children: ReactNode;
};

export default function Modal({
  onClose,
  contentClassName = "",
  children,
}: Props) {
  // lock scroll + handle Escape
  useEffect(() => {
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);

    return () => {
      document.body.style.overflow = prevOverflow;
      window.removeEventListener("keydown", onKey);
    };
  }, [onClose]);

  const onBackdropClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget) onClose();
  };

  return (
    <div
      className="fixed inset-0 bg-overlay flex-center z-8000"
      onClick={onBackdropClick}
    >
      <div
        className={`bg-surface border border-default flex flex-col max-h-9/10 max-w-lg overflow-hidden relative rounded-xl shadow-2xl w-full ${contentClassName}`}
      >
        <button
          onClick={onClose}
          className="absolute top-0 right-2 text-secondary text-2xl hover:text-primary"
          aria-label="Close"
        >
          &times;
        </button>
        <div className="overflow-y-auto mr-3 mt-8 mb-2 p-6">{children}</div>
      </div>
    </div>
  );
}
