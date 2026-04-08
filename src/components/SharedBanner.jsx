import { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Eye, ArrowLeft } from 'lucide-react';
import { useI18n } from '../i18n/I18nContext.jsx';
import { useClickOutside } from '../hooks/useClickOutside.js';
import { colorsFromName, isLight } from './logo-colors.js';
import './SharedBanner.css';

export default function SharedBanner({
  owner,
  onSave,
  onDismiss,
  animateEntry,
}) {
  const { t } = useI18n();
  const [confirmOpen, setConfirmOpen] = useState(false);
  const { outer } = colorsFromName(owner);
  const light = isLight(outer);
  const textColor = light ? 'rgba(0,0,0,0.8)' : 'rgba(255,255,255,0.95)';
  const btnBg = light ? 'rgba(0,0,0,0.08)' : 'rgba(255,255,255,0.15)';
  const btnHoverBg = light ? 'rgba(0,0,0,0.15)' : 'rgba(255,255,255,0.25)';

  const closeConfirm = useCallback(() => setConfirmOpen(false), []);
  useClickOutside(closeConfirm, confirmOpen);

  return (
    <motion.div
      className="shared-banner"
      style={{ background: outer, color: textColor }}
      initial={animateEntry ? { height: 0, overflow: 'hidden' } : false}
      animate={{ height: 'auto', overflow: 'visible' }}
      exit={{ height: 0, overflow: 'hidden' }}
      transition={{ height: { duration: 0.3, ease: 'easeInOut' } }}
    >
      <div className="shared-banner-content">
        <button
          className="shared-banner-back"
          style={{ color: textColor }}
          onClick={onDismiss}
        >
          <ArrowLeft className="shared-banner-arrow" size={11} />{' '}
          {t('dismissShared')}
        </button>
        <div className="shared-banner-actions">
          <span className="shared-banner-text">
            <Eye size={14} />
            {t('sharedBanner')}
          </span>
          <button
            className="shared-banner-btn shared-banner-save"
            style={{
              '--btn-bg': btnBg,
              '--btn-hover-bg': btnHoverBg,
              color: textColor,
            }}
            onPointerDown={(e) => e.stopPropagation()}
            onClick={() => setConfirmOpen((prev) => !prev)}
          >
            {t('saveToMyGarden')}
          </button>
          <AnimatePresence>
            {confirmOpen && (
              <motion.div
                className="shared-confirm"
                onPointerDown={(e) => e.stopPropagation()}
                initial={{ opacity: 0, y: -8, scale: 0.96 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -8, scale: 0.96 }}
                transition={{ duration: 0.18, ease: 'easeOut' }}
              >
                <p className="shared-confirm-title">{t('replaceTitle')}</p>
                <p className="shared-confirm-text">{t('replaceConfirm')}</p>
                <div className="shared-confirm-actions">
                  <button
                    className="shared-confirm-btn shared-confirm-keep"
                    onClick={() => setConfirmOpen(false)}
                  >
                    {t('replaceKeep')}
                  </button>
                  <button
                    className="shared-confirm-btn shared-confirm-replace"
                    onClick={onSave}
                  >
                    {t('replaceYes')}
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </motion.div>
  );
}
