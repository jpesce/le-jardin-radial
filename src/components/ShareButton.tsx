import { useState, useCallback, useRef, type ChangeEvent } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Share2, Link, Check, Download, Upload, Image } from 'lucide-react';
import { useI18n } from '../i18n/I18nContext';
import BackButton from './BackButton';
import Button from './Button';
import Popover from './Popover';
import { cn } from '../utils/cn';
import type { ImportCallbacks } from '../types';

interface ShareButtonProps {
  isOpen: boolean;
  onToggle: () => void;
  onClose: () => void;
  onGetShareUrl: () => string;
  onExportJson: () => void;
  onExportSvg: () => void;
  onExportPng: () => void;
  onImportJson: (file: File, callbacks?: ImportCallbacks) => void;
}

export default function ShareButton({
  isOpen,
  onToggle,
  onClose,
  onGetShareUrl,
  onExportJson,
  onExportSvg,
  onExportPng,
  onImportJson,
}: ShareButtonProps) {
  const { t } = useI18n();
  const [copied, setCopied] = useState(false);
  const [pendingFile, setPendingFile] = useState<File | null>(null);
  const [importError, setImportError] = useState<string | null>(null);
  const [showExportOptions, setShowExportOptions] = useState(false);
  const [wasOpen, setWasOpen] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (isOpen && !wasOpen) {
    setPendingFile(null);
    setImportError(null);
    setShowExportOptions(false);
  }
  if (isOpen !== wasOpen) {
    setWasOpen(isOpen);
  }

  const close = useCallback(() => {
    onClose();
    setPendingFile(null);
    setImportError(null);
    setShowExportOptions(false);
  }, [onClose]);

  const handleCopyLink = async () => {
    const url = onGetShareUrl();
    await navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => {
      setCopied(false);
    }, 2000);
  };

  const handleExportJson = () => {
    onExportJson();
    onClose();
  };

  const handleExportSvg = () => {
    onExportSvg();
    close();
  };

  const handleExportPng = () => {
    onExportPng();
    close();
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
    <Popover
      isOpen={isOpen}
      onClose={close}
      trigger={
        <Button
          variant="outline"
          round
          size="lg"
          icon={<Share2 size={14} className="-translate-x-px" />}
          className={cn('text-fg', isOpen && 'border-muted')}
          onClick={onToggle}
          aria-label="Share garden"
        />
      }
      ariaLabel="Share garden"
      className="w-max max-w-64 p-[0.35rem] [&>button]:justify-start"
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
      ) : showExportOptions ? (
        <div className="flex flex-col gap-[0.35rem] px-[0.65rem] py-[0.4rem]">
          <BackButton
            onClick={() => {
              setShowExportOptions(false);
            }}
          >
            {t('backButton')}
          </BackButton>
          <p className="font-['JetBrains_Mono_Variable',monospace] text-xs font-bold lowercase">
            {t('exportImageTitle')}
          </p>
          <p className="font-['JetBrains_Mono_Variable',monospace] text-2xs leading-[1.5] text-subtle">
            {t('exportImageHint')}
          </p>
          <div className="flex gap-[0.4rem] [&>*]:flex-1">
            <Button variant="outline" size="sm" onClick={handleExportSvg}>
              SVG
            </Button>
            <Button variant="outline" size="sm" onClick={handleExportPng}>
              PNG
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
            onClick={handleExportJson}
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
          <Button
            variant="ghost"
            size="md"
            icon={<Image size={13} />}
            onClick={() => {
              setShowExportOptions(true);
            }}
          >
            {t('exportImage')}
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
    </Popover>
  );
}
