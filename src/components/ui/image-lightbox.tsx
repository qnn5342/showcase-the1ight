"use client";

import { useCallback, useEffect, useState } from "react";
import Lightbox from "yet-another-react-lightbox";
import "yet-another-react-lightbox/styles.css";

interface ImageLightboxProps {
  /** CSS selector scope — all <img> inside this ref become clickable */
  containerRef: React.RefObject<HTMLDivElement | null>;
}

export function ImageLightbox({ containerRef }: ImageLightboxProps) {
  const [open, setOpen] = useState(false);
  const [index, setIndex] = useState(0);
  const [slides, setSlides] = useState<{ src: string }[]>([]);

  const handleClick = useCallback(
    (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (target.tagName !== "IMG") return;

      const container = containerRef.current;
      if (!container) return;

      const images = Array.from(container.querySelectorAll("img"));
      const srcs = images.map((img) => ({ src: img.src }));
      const clickedIndex = images.indexOf(target as HTMLImageElement);

      if (clickedIndex === -1 || srcs.length === 0) return;

      setSlides(srcs);
      setIndex(clickedIndex);
      setOpen(true);
    },
    [containerRef]
  );

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    // Make images look clickable
    const images = container.querySelectorAll("img");
    images.forEach((img) => {
      img.style.cursor = "zoom-in";
    });

    container.addEventListener("click", handleClick);
    return () => container.removeEventListener("click", handleClick);
  }, [containerRef, handleClick]);

  return (
    <Lightbox
      open={open}
      close={() => setOpen(false)}
      index={index}
      slides={slides}
      styles={{
        container: { backgroundColor: "rgba(0, 0, 0, 0.9)" },
      }}
    />
  );
}
