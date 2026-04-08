import { useEffect, useRef } from 'react';

export function useClickOutside(callback, enabled = true, excludeRefs = []) {
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
    const handler = (e) => {
      for (const ref of excludeRefsRef.current) {
        if (ref.current?.contains(e.target)) return;
      }
      callbackRef.current();
    };
    document.addEventListener('pointerdown', handler);
    return () => document.removeEventListener('pointerdown', handler);
  }, [enabled]);
}
