import {
  useEffect,
  useCallback,
  cloneElement,
  type ReactNode,
  type ReactElement,
  type PointerEvent,
} from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useClickOutside } from '../hooks/useClickOutside';
import { cn } from '../utils/cn';

const ANIMATION = { opacity: 0, y: -8, scale: 0.96 };
const TRANSITION = { duration: 0.18, ease: 'easeOut' as const };

type PopoverAlign = 'right' | 'left' | 'center';

const ALIGN_CLASS: Record<PopoverAlign, string> = {
  right: 'right-0',
  left: 'left-0',
  center: 'left-1/2 -translate-x-1/2',
};

interface PopoverProps {
  /** Whether the popover is visible */
  isOpen: boolean;
  /** Called when clicking outside or pressing Escape */
  onClose: () => void;
  /** Trigger element — gets aria-expanded, aria-haspopup, and stopPropagation injected */
  trigger?: ReactElement;
  /** Horizontal alignment relative to trigger: right, left, or center */
  align?: PopoverAlign;
  /** Accessible label for the dialog */
  ariaLabel?: string;
  /** Additional CSS classes for the dropdown */
  className?: string;
  /** Dropdown content */
  children: ReactNode;
}

/** Animated dropdown with click-outside, Escape key, and optional trigger with injected accessibility attributes. */
export default function Popover({
  isOpen,
  onClose,
  trigger,
  align = 'right',
  ariaLabel,
  className,
  children,
}: PopoverProps) {
  const handleClose = useCallback(() => {
    onClose();
    (document.activeElement as HTMLElement | null)?.blur();
  }, [onClose]);

  useClickOutside(handleClose, isOpen);

  useEffect(() => {
    if (!isOpen) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        handleClose();
        e.preventDefault();
      }
    };
    document.addEventListener('keydown', handler);
    return () => {
      document.removeEventListener('keydown', handler);
    };
  }, [isOpen, handleClose]);

  const content = (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className={cn(
            'absolute top-full z-[101] flex flex-col mt-[0.35rem] bg-surface border border-border rounded-lg shadow-[0_4px_16px_color-mix(in_srgb,var(--color-fg)_8%,transparent)]',
            ALIGN_CLASS[align],
            className,
          )}
          role="dialog"
          aria-label={ariaLabel}
          onPointerDown={(e) => {
            e.stopPropagation();
          }}
          initial={ANIMATION}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={ANIMATION}
          transition={TRANSITION}
        >
          {children}
        </motion.div>
      )}
    </AnimatePresence>
  );

  if (trigger) {
    const enhancedTrigger = cloneElement(
      trigger as ReactElement<Record<string, unknown>>,
      {
        onPointerDown: (e: PointerEvent) => {
          e.stopPropagation();
        },
        'aria-expanded': isOpen,
        'aria-haspopup': 'dialog',
      },
    );

    return (
      <div className="relative">
        {enhancedTrigger}
        {content}
      </div>
    );
  }

  return content;
}
