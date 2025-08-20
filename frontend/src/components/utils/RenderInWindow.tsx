"use client";

import React, { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";

interface RenderInWindowProps {
  children: React.ReactNode;
  title?: string;
  width?: number;
  height?: number;
  onReady?: (win: Window) => void; // callback once popup is ready
}

export const RenderInWindow: React.FC<RenderInWindowProps> = ({
  children,
  title = "Popup Window",
  width = 600,
  height = 400,
  onReady,
}) => {
  const [container, setContainer] = useState<HTMLDivElement | null>(null);
  const newWindowRef = useRef<Window | null>(null);

  useEffect(() => {
    const div = document.createElement("div");
    setContainer(div);
  }, []);

  useEffect(() => {
    if (!container) return;

    newWindowRef.current = window.open(
      "",
      title,
      `width=${width},height=${height},left=200,top=200`,
    );

    const win = newWindowRef.current;
    if (!win) return;

    win.document.body.appendChild(container);

    // Let parent know window is ready
    if (onReady) onReady(win);

    return () => {
      win.close();
    };
  }, [container, title, width, height, onReady]);

  return container ? createPortal(children, container) : null;
};
