import { useEffect } from "react";

export function useClickOutside(callback, enabled = true, excludeRefs = []) {
  useEffect(() => {
    if (!enabled) return;
    const handler = (e) => {
      for (const ref of excludeRefs) {
        if (ref.current?.contains(e.target)) return;
      }
      callback();
    };
    document.addEventListener("pointerdown", handler);
    return () => document.removeEventListener("pointerdown", handler);
  }, [callback, enabled, ...excludeRefs]);
}
