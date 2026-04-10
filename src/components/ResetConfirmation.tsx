import { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { RotateCcw } from 'lucide-react';
import { useI18n } from '../i18n/I18nContext';
import { useClickOutside } from '../hooks/useClickOutside';
import Button from './Button';
import { cn } from '../utils/cn';

interface ResetConfirmationProps {
  isOpen: boolean;
  onToggle: () => void;
  onClose: () => void;
  onReset: () => void;
}

export default function ResetConfirmation({
  isOpen,
  onToggle,
  onClose,
  onReset,
}: ResetConfirmationProps) {
  const { t } = useI18n();

  useClickOutside(onClose, isOpen);

  useEffect(() => {
    if (!isOpen) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
        (document.activeElement as HTMLElement | null)?.blur();
        e.preventDefault();
      }
    };
    document.addEventListener('keydown', handler);
    return () => {
      document.removeEventListener('keydown', handler);
    };
  }, [isOpen, onClose]);

  const handleConfirm = () => {
    onReset();
    onClose();
  };

  return (
    <div className="relative">
      <Button
        variant="outline"
        round
        size="lg"
        icon={<RotateCcw size={14} />}
        className={cn('text-fg', isOpen && 'border-muted')}
        onPointerDown={(e) => {
          e.stopPropagation();
        }}
        onClick={onToggle}
        aria-label="Reset garden"
      />
      <AnimatePresence>
        {isOpen && (
          <motion.div
            className="absolute top-full right-0 z-[101] flex flex-col gap-2 w-64 py-3 px-4 mt-[0.35rem] bg-surface border border-border rounded-lg shadow-[0_4px_16px_color-mix(in_srgb,var(--color-fg)_8%,transparent)]"
            onPointerDown={(e) => {
              e.stopPropagation();
            }}
            initial={{ opacity: 0, y: -8, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -8, scale: 0.96 }}
            transition={{ duration: 0.18, ease: 'easeOut' }}
          >
            <p className="font-['JetBrains_Mono_Variable',monospace] text-xs font-bold text-fg lowercase">
              {t('resetTitle')}
            </p>
            <p className="font-['JetBrains_Mono_Variable',monospace] text-2xs leading-[1.5] text-subtle">
              {t('resetConfirm')}
            </p>
            <div className="flex gap-[0.4rem] [&>*]:flex-1">
              <Button variant="outline" size="sm" onClick={onClose}>
                {t('resetNo')}
              </Button>
              <Button
                variant="solid"
                size="sm"
                color="danger"
                onClick={handleConfirm}
              >
                {t('resetYes')}
              </Button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
