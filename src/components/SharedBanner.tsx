import { useState, useCallback, type CSSProperties } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Eye, ArrowLeft } from 'lucide-react';
import { useI18n } from '../i18n/I18nContext';
import { useClickOutside } from '../hooks/useClickOutside';
import { colorsFromName, isLight } from './logo-colors';
import Button from './Button';

interface SharedBannerProps {
  owner: string;
  onSave: () => void;
  onDismiss: () => void;
  animateEntry: boolean;
}

export default function SharedBanner({
  owner,
  onSave,
  onDismiss,
  animateEntry,
}: SharedBannerProps) {
  const { t } = useI18n();
  const [confirmOpen, setConfirmOpen] = useState(false);
  const { outer } = colorsFromName(owner);
  const light = isLight(outer);
  const textColor = light ? 'rgba(0,0,0,0.8)' : 'rgba(255,255,255,0.95)';
  const btnBg = light ? 'rgba(0,0,0,0.08)' : 'rgba(255,255,255,0.15)';
  const btnHoverBg = light ? 'rgba(0,0,0,0.15)' : 'rgba(255,255,255,0.25)';

  const closeConfirm = useCallback(() => {
    setConfirmOpen(false);
  }, []);
  useClickOutside(closeConfirm, confirmOpen);

  return (
    <motion.div
      className="w-full text-xs leading-normal"
      style={{ background: outer, color: textColor }}
      initial={
        animateEntry ? { height: 0, overflow: 'hidden' as const } : false
      }
      animate={{ height: 'auto', overflow: 'visible' as const }}
      exit={{ height: 0, overflow: 'hidden' as const }}
      transition={{ height: { duration: 0.3, ease: 'easeInOut' } }}
    >
      <div className="flex gap-4 items-center justify-between px-8 py-[0.4rem]">
        <button
          className="group/back flex gap-[0.35rem] items-center p-0 font-[inherit] text-xs lowercase tracking-[0.03em] whitespace-nowrap cursor-pointer bg-transparent border-none opacity-80 transition-opacity duration-150 hover:opacity-100"
          style={{ color: textColor }}
          onClick={onDismiss}
        >
          <ArrowLeft
            className="shrink-0 transition-transform duration-150 ease-out group-hover/back:-translate-x-[3px]"
            size={11}
          />{' '}
          {t('dismissShared')}
        </button>
        <div className="relative flex gap-3 items-center">
          <span className="flex gap-[0.4rem] items-center tracking-[0.03em] opacity-80">
            <Eye size={14} />
            {t('sharedBanner')}
          </span>
          <button
            className="py-[0.3rem] px-3 font-[inherit] text-2xs lowercase tracking-[0.03em] whitespace-nowrap cursor-pointer border-none rounded bg-[var(--btn-bg)] transition-[background] duration-150 hover:bg-[var(--btn-hover-bg)]"
            style={
              {
                '--btn-bg': btnBg,
                '--btn-hover-bg': btnHoverBg,
                color: textColor,
              } as CSSProperties
            }
            onPointerDown={(e) => {
              e.stopPropagation();
            }}
            onClick={() => {
              setConfirmOpen((prev) => !prev);
            }}
          >
            {t('saveToMyGarden')}
          </button>
          <AnimatePresence>
            {confirmOpen && (
              <motion.div
                className="absolute top-full right-0 z-[200] flex flex-col gap-2 w-64 py-3 px-4 mt-2 text-fg bg-surface border border-border rounded-lg shadow-[0_4px_16px_color-mix(in_srgb,var(--color-fg)_8%,transparent)]"
                onPointerDown={(e) => {
                  e.stopPropagation();
                }}
                initial={{ opacity: 0, y: -8, scale: 0.96 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -8, scale: 0.96 }}
                transition={{ duration: 0.18, ease: 'easeOut' }}
              >
                <p className="font-['JetBrains_Mono_Variable',monospace] text-xs font-bold text-fg lowercase">
                  {t('replaceTitle')}
                </p>
                <p className="font-['JetBrains_Mono_Variable',monospace] text-2xs leading-[1.5] text-subtle">
                  {t('replaceConfirm')}
                </p>
                <div className="flex gap-[0.4rem] [&>*]:flex-1">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setConfirmOpen(false);
                    }}
                  >
                    {t('replaceKeep')}
                  </Button>
                  <Button
                    variant="solid"
                    size="sm"
                    color="danger"
                    onClick={onSave}
                  >
                    {t('replaceYes')}
                  </Button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </motion.div>
  );
}
