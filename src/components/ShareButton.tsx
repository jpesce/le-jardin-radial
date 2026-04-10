import {
  useState,
  useEffect,
  useCallback,
  useRef,
  type ChangeEvent,
} from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Share2, Link, Check, Download, Upload } from 'lucide-react';
import { useI18n } from '../i18n/I18nContext';
import { useClickOutside } from '../hooks/useClickOutside';
import Button from './Button';
import { cn } from '../utils/cn';

interface ImportCallbacks {
  onSuccess?: () => void;
  onError?: (reason: string) => void;
}

interface ShareButtonProps {
  isOpen: boolean;
  onToggle: () => void;
  onClose: () => void;
  onGetShareUrl: () => string;
  onExportJson: () => void;
  onImportJson: (file: File, callbacks?: ImportCallbacks) => void;
}

export default function ShareButton({
  isOpen,
  onToggle,
  onClose,
  onGetShareUrl,
  onExportJson,
  onImportJson,
}: ShareButtonProps) {
  const { t } = useI18n();
  const [copied, setCopied] = useState(false);
  const [pendingFile, setPendingFile] = useState<File | null>(null);
  const [importError, setImportError] = useState<string | null>(null);
  const [wasOpen, setWasOpen] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (isOpen && !wasOpen) {
    setPendingFile(null);
    setImportError(null);
  }
  if (isOpen !== wasOpen) {
    setWasOpen(isOpen);
  }

  const close = useCallback(() => {
    onClose();
    setPendingFile(null);
    setImportError(null);
  }, [onClose]);

  useClickOutside(close, isOpen);

  useEffect(() => {
    if (!isOpen) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        close();
        (document.activeElement as HTMLElement | null)?.blur();
        e.preventDefault();
      }
    };
    document.addEventListener('keydown', handler);
    return () => {
      document.removeEventListener('keydown', handler);
    };
  }, [isOpen, close]);

  const handleCopyLink = async () => {
    const url = onGetShareUrl();
    await navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => {
      setCopied(false);
    }, 2000);
  };

  const handleExport = () => {
    onExportJson();
    onClose();
  };

  const handleFileSelect = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) setPendingFile(file);
    e.target.value = '';
  };

  const confirmImport = () => {
    if (pendingFile) {
      setImportError(null);
      onImportJson(pendingFile, {
        onSuccess: () => {
          setPendingFile(null);
          onClose();
        },
        onError: (reason: string) => {
          setImportError(reason);
        },
      });
    }
  };

  const cancelImport = () => {
    setPendingFile(null);
    setImportError(null);
  };

  return (
    <div className="relative">
      <Button
        variant="outline"
        round
        size="lg"
        icon={<Share2 size={14} />}
        className={cn('text-text', isOpen && 'border-muted')}
        onPointerDown={(e) => {
          e.stopPropagation();
        }}
        onClick={onToggle}
        aria-label="Share garden"
      />
      <AnimatePresence>
        {isOpen && (
          <motion.div
            className="absolute top-full right-0 z-[101] flex flex-col w-max max-w-64 p-[0.35rem] mt-[0.35rem] bg-bg border border-border rounded-lg shadow-[0_4px_16px_color-mix(in_srgb,var(--color-text)_8%,transparent)] [&>button]:justify-start"
            onPointerDown={(e) => {
              e.stopPropagation();
            }}
            initial={{ opacity: 0, y: -8, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -8, scale: 0.96 }}
            transition={{ duration: 0.18, ease: 'easeOut' }}
          >
            {pendingFile ? (
              <div className="flex flex-col gap-2 px-[0.65rem] py-[0.4rem]">
                <p className="font-['JetBrains_Mono_Variable',monospace] text-xs font-bold lowercase">
                  {t('importConfirmTitle')}
                </p>
                <p className="font-['JetBrains_Mono_Variable',monospace] text-2xs leading-[1.5] text-subtle">
                  {t('importConfirmText')}
                </p>
                {importError && (
                  <p className="font-['JetBrains_Mono_Variable',monospace] text-2xs leading-[1.5] text-danger">
                    {t('importError')}
                  </p>
                )}
                <div className="flex gap-[0.4rem] [&>*]:flex-1">
                  <Button variant="outline" size="sm" onClick={cancelImport}>
                    {t('cancel')}
                  </Button>
                  <Button
                    variant="solid"
                    size="sm"
                    color="danger"
                    onClick={confirmImport}
                  >
                    {t('importJson')}
                  </Button>
                </div>
              </div>
            ) : (
              <>
                <Button
                  variant="ghost"
                  size="md"
                  icon={
                    <AnimatePresence mode="wait" initial={false}>
                      <motion.span
                        key={copied ? 'check' : 'link'}
                        style={{ display: 'flex' }}
                        initial={{ scale: 0, rotate: -90 }}
                        animate={{
                          scale: 1,
                          rotate: 0,
                          transition: {
                            type: 'spring',
                            duration: 0.5,
                            bounce: 0.5,
                          },
                        }}
                        exit={{
                          scale: 0,
                          rotate: 90,
                          transition: { duration: 0.15, ease: 'easeIn' },
                        }}
                      >
                        {copied ? <Check size={13} /> : <Link size={13} />}
                      </motion.span>
                    </AnimatePresence>
                  }
                  onClick={() => {
                    void handleCopyLink();
                  }}
                >
                  {copied ? t('linkCopied') : t('copyLink')}
                </Button>
                <Button
                  variant="ghost"
                  size="md"
                  icon={<Download size={13} />}
                  onClick={handleExport}
                >
                  {t('exportJson')}
                </Button>
                <Button
                  variant="ghost"
                  size="md"
                  icon={<Upload size={13} />}
                  onClick={() => fileInputRef.current?.click()}
                >
                  {t('importJson')}
                </Button>
              </>
            )}
            <input
              ref={fileInputRef}
              type="file"
              accept=".json"
              onChange={handleFileSelect}
              style={{ display: 'none' }}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
