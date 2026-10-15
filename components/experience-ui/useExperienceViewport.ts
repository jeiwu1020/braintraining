import { useEffect, useState } from 'react';
import type { CSSProperties } from 'react';

// Scoped to the two new experiences. Browser chrome can leave less visible
// height than the layout viewport. Pinch zoom must keep its normal pan/zoom.
export function readExperienceHeight(layoutHeight: number, viewport?: { height: number; scale: number }): number | null {
  if (viewport && Math.abs(viewport.scale - 1) > 0.01) return null;
  const visible = viewport && viewport.height > 0 ? viewport.height : layoutHeight;
  return Math.max(1, Math.min(layoutHeight, visible));
}
export function useExperienceViewport(): CSSProperties {
  const [height, setHeight] = useState(() => readExperienceHeight(window.innerHeight, window.visualViewport ?? undefined) ?? window.innerHeight);
  useEffect(() => {
    const viewport = window.visualViewport;
    const update = () => {
      const next = readExperienceHeight(window.innerHeight, viewport ?? undefined);
      if (next !== null) setHeight(next);
    };
    window.addEventListener('resize', update);
    viewport?.addEventListener('resize', update);
    update();
    return () => { window.removeEventListener('resize', update); viewport?.removeEventListener('resize', update); };
  }, []);
  return { '--experience-height': `${height}px` } as CSSProperties;
}
