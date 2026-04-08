import { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { RotateCcw } from 'lucide-react';
import { useI18n } from '../i18n/I18nContext.jsx';
import { useClickOutside } from '../hooks/useClickOutside.js';

export default function ResetConfirmation({
  isOpen,
  onToggle,
  onClose,
  onReset,
}) {
  const { t } = useI18n();

  useClickOutside(onClose, isOpen);

  useEffect(() => {
    if (!isOpen) return;
    const handler = (e) => {
      if (e.key === 'Escape') {
        onClose();
        document.activeElement?.blur();
        e.preventDefault();
      }
    };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [isOpen, onClose]);

  const handleConfirm = () => {
    onReset();
    onClose();
  };

  return (
    <div className="popover-anchor">
      <button
        className={'panel-reset' + (isOpen ? ' panel-reset--active' : '')}
        onPointerDown={(e) => e.stopPropagation()}
        onClick={onToggle}
        aria-label="reset"
      >
        <RotateCcw size={14} />
      </button>
      <AnimatePresence>
        {isOpen && (
          <motion.div
            className="reset-confirm"
            onPointerDown={(e) => e.stopPropagation()}
            initial={{ opacity: 0, y: -8, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -8, scale: 0.96 }}
            transition={{ duration: 0.18, ease: 'easeOut' }}
          >
            <p className="reset-confirm-title">{t('resetTitle')}</p>
            <p className="reset-confirm-text">{t('resetConfirm')}</p>
            <div className="reset-confirm-actions">
              <button className="reset-confirm-no" onClick={onClose}>
                {t('resetNo')}
              </button>
              <button className="reset-confirm-yes" onClick={handleConfirm}>
                {t('resetYes')}
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
