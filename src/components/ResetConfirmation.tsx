import { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { RotateCcw } from 'lucide-react';
import { useI18n } from '../i18n/I18nContext';
import { useClickOutside } from '../hooks/useClickOutside';
import Button from './Button';

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
    <div className="popover-anchor">
      <Button
        variant="outline"
        round
        size="lg"
        icon={<RotateCcw size={14} />}
        className={isOpen ? 'btn--active' : ''}
        onPointerDown={(e) => {
          e.stopPropagation();
        }}
        onClick={onToggle}
        aria-label="Reset garden"
      />
      <AnimatePresence>
        {isOpen && (
          <motion.div
            className="reset-confirm"
            onPointerDown={(e) => {
              e.stopPropagation();
            }}
            initial={{ opacity: 0, y: -8, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -8, scale: 0.96 }}
            transition={{ duration: 0.18, ease: 'easeOut' }}
          >
            <p className="reset-confirm-title">{t('resetTitle')}</p>
            <p className="reset-confirm-text">{t('resetConfirm')}</p>
            <div className="reset-confirm-actions">
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
