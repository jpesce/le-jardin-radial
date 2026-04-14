import { useState, useCallback, type CSSProperties } from 'react';
import { motion } from 'framer-motion';
import { Eye, ArrowLeft } from 'lucide-react';
import { useI18n } from '../i18n/I18nContext';
import { isLight } from '../utils/logoColors';
import Button from './Button';
import { Popover, PopoverTrigger, PopoverContent } from './ui/popover';

interface SharedBannerProps {
  /** Banner background color — text and button contrast are derived automatically */
  backgroundColor: string;
  /** Called when the user confirms saving the shared garden */
  onSave: () => void;
  /** Called when the user dismisses the shared garden */
  onDismiss: () => void;
  /** Animate the banner height on mount */
  animateEntry: boolean;
}

/** Read-only banner shown when viewing a shared garden. Derives text and button contrast from the background color. */
export default function SharedBanner({
  backgroundColor,
  onSave,
  onDismiss,
  animateEntry,
}: SharedBannerProps) {
  const { t } = useI18n();
  const [confirmOpen, setConfirmOpen] = useState(false);
  const light = isLight(backgroundColor);
  const textColor = light ? 'rgba(0,0,0,0.8)' : 'rgba(255,255,255,0.95)';
  const btnBg = light ? 'rgba(0,0,0,0.08)' : 'rgba(255,255,255,0.15)';
  const btnHoverBg = light ? 'rgba(0,0,0,0.15)' : 'rgba(255,255,255,0.25)';

  const closeConfirm = useCallback(() => {
    setConfirmOpen(false);
  }, []);

  return (
    <motion.div
      className="w-full text-xs leading-normal"
      style={{ background: backgroundColor, color: textColor }}
      initial={
        animateEntry ? { height: 0, overflow: 'hidden' as const } : false
      }
      animate={{
        height: 'auto',
        overflow: 'hidden' as const,
        transitionEnd: { overflow: 'visible' as const },
      }}
      exit={{ height: 0, overflow: 'hidden' as const }}
      transition={{ height: { duration: 0.3, ease: 'easeInOut' } }}
    >
      <div className="flex gap-2 sm:gap-4 items-center justify-between px-4 sm:px-8 py-[0.4rem]">
        <button
          className="group/back flex gap-[0.35rem] items-center p-0 text-xs lowercase tracking-[0.03em] whitespace-nowrap cursor-pointer bg-transparent border-none opacity-80 transition-opacity duration-150 hover:opacity-100"
          style={{ color: textColor }}
          onClick={onDismiss}
        >
          <ArrowLeft
            className="shrink-0 transition-transform duration-150 ease-out group-hover/back:-translate-x-[3px]"
            size={11}
          />{' '}
          <span className="sm:hidden">{t('backButton')}</span>
          <span className="max-sm:hidden">{t('dismissShared')}</span>
        </button>
        <div className="flex gap-2 sm:gap-3 items-center">
          <span className="flex gap-[0.4rem] items-center tracking-[0.03em] opacity-80">
            <Eye size={14} />
            <span className="sm:hidden">{t('sharedBannerShort')}</span>
            <span className="max-sm:hidden">{t('sharedBanner')}</span>
          </span>
          <Popover
            open={confirmOpen}
            onOpenChange={(open) => {
              if (!open) closeConfirm();
            }}
          >
            <PopoverTrigger asChild>
              <button
                className="py-[0.3rem] px-3 text-2xs lowercase tracking-[0.03em] whitespace-nowrap cursor-pointer border-none rounded bg-[var(--btn-bg)] transition-[background] duration-150 hover:bg-[var(--btn-hover-bg)]"
                style={
                  {
                    '--btn-bg': btnBg,
                    '--btn-hover-bg': btnHoverBg,
                    color: textColor,
                  } as CSSProperties
                }
                onClick={() => {
                  setConfirmOpen((prev) => !prev);
                }}
              >
                <span className="sm:hidden">{t('saveToMyGardenShort')}</span>
                <span className="max-sm:hidden">{t('saveToMyGarden')}</span>
              </button>
            </PopoverTrigger>
            <PopoverContent className="z-[200] gap-2 w-64 py-3 px-4 text-fg">
              <p className="text-xs font-bold text-fg lowercase">
                {t('replaceTitle')}
              </p>
              <p className="text-2xs leading-[1.5] text-subtle">
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
            </PopoverContent>
          </Popover>
        </div>
      </div>
    </motion.div>
  );
}
