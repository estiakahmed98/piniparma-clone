"use client";

import { useEffect, useRef, useState } from "react";
import { Icon } from "./Icons";
import "./ProductGallery.css";

export function ProductGallery({
  images,
  name,
}: {
  images: string[];
  name: string;
}) {
  const [selected, setSelected] = useState<number | null>(null);
  const dialogRef = useRef<HTMLDialogElement>(null);
  const open = selected !== null;

  useEffect(() => {
    if (!open) return;
    const dialog = dialogRef.current;
    const previousFocus = document.activeElement;
    const previousOverflow = document.body.style.overflow;
    dialog?.showModal();
    document.body.style.overflow = "hidden";
    return () => {
      dialog?.close();
      document.body.style.overflow = previousOverflow;
      if (previousFocus instanceof HTMLElement && previousFocus.isConnected)
        previousFocus.focus();
    };
  }, [open]);

  function move(direction: number) {
    setSelected((index) =>
      index === null
        ? null
        : (index + direction + images.length) % images.length,
    );
  }

  return (
    <>
      <div className="product-gallery">
        {images.length ? (
          images.map((image, index) => (
            <button
              type="button"
              className={`gallery-image-button ${index === 0 ? "product-gallery-primary" : "product-gallery-secondary"}`}
              key={image}
              aria-label={`Enlarge ${name}, image ${index + 1}`}
              aria-haspopup="dialog"
              onClick={() => setSelected(index)}
              onPointerMove={(event) => {
                if (event.pointerType !== "mouse") return;
                const bounds = event.currentTarget.getBoundingClientRect();
                event.currentTarget.style.setProperty(
                  "--zoom-x",
                  `${((event.clientX - bounds.left) / bounds.width) * 100}%`,
                );
                event.currentTarget.style.setProperty(
                  "--zoom-y",
                  `${((event.clientY - bounds.top) / bounds.height) * 100}%`,
                );
              }}
              onPointerLeave={(event) => {
                event.currentTarget.style.removeProperty("--zoom-x");
                event.currentTarget.style.removeProperty("--zoom-y");
              }}
            >
              <img
                src={image}
                alt={`${name}, view ${index + 1}`}
                loading={index === 0 ? "eager" : "lazy"}
              />
              <span className="gallery-zoom-icon" aria-hidden="true">
                <Icon name="zoom-in" size={20} />
              </span>
            </button>
          ))
        ) : (
          <div className="image-unavailable">Product images coming soon</div>
        )}
      </div>
      <dialog
        ref={dialogRef}
        className="gallery-lightbox"
        aria-label={`${name} image gallery`}
        onCancel={() => setSelected(null)}
        onClick={(event) => {
          if (event.target === event.currentTarget) setSelected(null);
        }}
        onKeyDown={(event) => {
          if (event.key === "ArrowRight") {
            event.preventDefault();
            move(1);
          }
          if (event.key === "ArrowLeft") {
            event.preventDefault();
            move(-1);
          }
        }}
      >
        {selected !== null && (
          <div className="gallery-lightbox-content">
            <header className="gallery-lightbox-header">
              <span>{name}</span>
              <button
                type="button"
                aria-label="Close image gallery"
                onClick={() => setSelected(null)}
                autoFocus
              >
                <Icon name="close" size={24} />
              </button>
            </header>
            <div className="gallery-lightbox-stage">
              {images.length > 1 && (
                <button
                  type="button"
                  className="gallery-lightbox-previous"
                  aria-label="Previous image"
                  onClick={() => move(-1)}
                >
                  <Icon name="arrow-left" size={25} />
                </button>
              )}
              <img
                className="gallery-lightbox-image"
                src={images[selected]}
                alt={`${name}, view ${selected + 1} of ${images.length}`}
              />
              {images.length > 1 && (
                <button
                  type="button"
                  className="gallery-lightbox-next"
                  aria-label="Next image"
                  onClick={() => move(1)}
                >
                  <Icon name="arrow-right" size={25} />
                </button>
              )}
            </div>
            <div className="gallery-lightbox-bottom">
              <p role="status" aria-live="polite">
                {selected + 1} / {images.length}
              </p>
              <div
                className="gallery-lightbox-thumbnails"
                aria-label="Choose a product image"
              >
                {images.map((image, index) => (
                  <button
                    key={image}
                    type="button"
                    aria-label={`View image ${index + 1}`}
                    aria-pressed={selected === index}
                    onClick={() => setSelected(index)}
                  >
                    <img src={image} alt="" loading="lazy" />
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}
      </dialog>
    </>
  );
}
