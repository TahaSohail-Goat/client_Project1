import { useEffect, useRef } from 'react';
import type { Photo } from '../../content/media';
import { PhotoImage } from '../PhotoImage';
export function AccessibleLightbox({ items, active, onChange, onClose }: { items: Photo[]; active: Photo; onChange: (item: Photo) => void; onClose: () => void }) {
  const ref = useRef<HTMLDialogElement>(null);
  const index = items.findIndex(item => item.slug === active.slug);
  const change = (delta: number) => onChange(items[(index + delta + items.length) % items.length]);
  useEffect(() => {
    const dialog = ref.current!;
    const trigger = document.activeElement as HTMLElement;
    const overflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    dialog.showModal();
    return () => { dialog.close(); document.body.style.overflow = overflow; trigger?.focus({ preventScroll: true }); };
  }, []);
  return <dialog ref={ref} className="lightbox" aria-labelledby="lightbox-title" aria-describedby="lightbox-description" data-lenis-prevent onCancel={event => { event.preventDefault(); onClose(); }} onClick={event => { if (event.target === event.currentTarget) onClose(); }} onKeyDown={event => { if (event.key === 'ArrowRight') { event.preventDefault(); change(1); } if (event.key === 'ArrowLeft') { event.preventDefault(); change(-1); } }}><div className="lightbox-toolbar"><span className="eyebrow">{active.category} / {index + 1} of {items.length}</span><button onClick={onClose} autoFocus aria-label="Close photograph">Close <span aria-hidden="true">×</span></button></div><div className="lightbox-image"><PhotoImage key={active.slug} item={active} full priority /></div><div className="lightbox-caption"><div><h2 id="lightbox-title">{active.title}</h2><p id="lightbox-description">{active.description}</p></div><div className="lightbox-controls"><button onClick={() => change(-1)} aria-label="Previous photograph">←</button><button onClick={() => change(1)} aria-label="Next photograph">→</button></div></div><span className="lightbox-hint">Use ← → to explore · Escape to close</span></dialog>;
}
