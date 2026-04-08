import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { RotateCcw } from 'lucide-react';
import { useI18n } from '../i18n/I18nContext.jsx';
import { useClickOutside } from '../hooks/useClickOutside.js';

export default function ResetConfirmation({
  onReset,
  isOpen: panelIsOpen,
  onClosePanel,
}) {
  const { t } = useI18n();
  const [openState, setOpenState] = useState(false);
  const open = openState && !panelIsOpen;

  const close = useCallback(() => setOpenState(false), []);

  // Click outside closes confirmation
  useClickOutside(close, open);

  // Escape closes confirmation
  useEffect(() => {
    if (!open) return;
    const handler = (e) => {
      if (e.key === 'Escape') {
        setOpenState(false);
        document.activeElement?.blur();
        e.preventDefault();
      }
    };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [open]);

  const handleToggle = () => {
    if (panelIsOpen) onClosePanel();
    setOpenState((prev) => !prev);
  };

  const handleConfirm = () => {
    onReset();
    setOpenState(false);
  };

  return (
    <>
      <button
        className={'panel-reset' + (open ? ' panel-reset--active' : '')}
        onPointerDown={(e) => e.stopPropagation()}
        onClick={handleToggle}
        aria-label="reset"
      >
        <RotateCcw size={14} />
      </button>
      <AnimatePresence>
        {open && (
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
              <button className="reset-confirm-no" onClick={close}>
                {t('resetNo')}
              </button>
              <button className="reset-confirm-yes" onClick={handleConfirm}>
                {t('resetYes')}
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
