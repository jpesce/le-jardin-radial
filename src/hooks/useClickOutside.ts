import { useEffect, useRef, type RefObject } from 'react';

export function useClickOutside(
  callback: () => void,
  enabled: boolean = true,
  excludeRefs: RefObject<HTMLElement | null>[] = [],
): void {
  const callbackRef = useRef(callback);
  const excludeRefsRef = useRef(excludeRefs);

  useEffect(() => {
    callbackRef.current = callback;
  });
  useEffect(() => {
    excludeRefsRef.current = excludeRefs;
  });

  useEffect(() => {
    if (!enabled) return;
    const handler = (e: PointerEvent) => {
      for (const ref of excludeRefsRef.current) {
        if (ref.current?.contains(e.target as Node)) return;
      }
      callbackRef.current();
    };
    document.addEventListener('pointerdown', handler);
    return () => {
      document.removeEventListener('pointerdown', handler);
    };
  }, [enabled]);
}
