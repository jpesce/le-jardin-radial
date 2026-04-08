import { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Share2, Link, Download, Upload } from 'lucide-react';
import { useI18n } from '../i18n/I18nContext.jsx';
import { useClickOutside } from '../hooks/useClickOutside.js';

export default function ShareButton({
  isOpen,
  onToggle,
  onClose,
  onGetShareUrl,
  onExportJson,
  onImportJson,
}) {
  const { t } = useI18n();
  const [copied, setCopied] = useState(false);
  const [pendingFile, setPendingFile] = useState(null);
  const [importError, setImportError] = useState(null);
  const [wasOpen, setWasOpen] = useState(false);
  const fileInputRef = useRef(null);

  // Reset stale internal state when reopened (React "store previous props" pattern)
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
    const handler = (e) => {
      if (e.key === 'Escape') {
        close();
        document.activeElement?.blur();
        e.preventDefault();
      }
    };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [isOpen, close]);

  const handleCopyLink = async () => {
    const url = onGetShareUrl();
    await navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleExport = () => {
    onExportJson();
    onClose();
  };

  const handleFileSelect = (e) => {
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
        onError: (reason) => setImportError(reason),
      });
    }
  };

  const cancelImport = () => {
    setPendingFile(null);
    setImportError(null);
  };

  return (
    <div className="popover-anchor">
      <button
        className={'panel-reset' + (isOpen ? ' panel-reset--active' : '')}
        onPointerDown={(e) => e.stopPropagation()}
        onClick={onToggle}
        aria-label="share"
      >
        <Share2 size={14} />
      </button>
      <AnimatePresence>
        {isOpen && (
          <motion.div
            className="share-dropdown"
            onPointerDown={(e) => e.stopPropagation()}
            initial={{ opacity: 0, y: -8, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -8, scale: 0.96 }}
            transition={{ duration: 0.18, ease: 'easeOut' }}
          >
            {pendingFile ? (
              <>
                <p className="share-confirm-title">{t('importConfirmTitle')}</p>
                <p className="share-confirm-text">{t('importConfirmText')}</p>
                {importError && (
                  <p className="share-confirm-error">{t('importError')}</p>
                )}
                <div className="share-confirm-actions">
                  <button
                    className="share-confirm-btn share-confirm-cancel"
                    onClick={cancelImport}
                  >
                    {t('cancel')}
                  </button>
                  <button
                    className="share-confirm-btn share-confirm-yes"
                    onClick={confirmImport}
                  >
                    {t('importJson')}
                  </button>
                </div>
              </>
            ) : (
              <>
                <button className="share-option" onClick={handleCopyLink}>
                  <Link size={13} />
                  {copied ? t('linkCopied') : t('copyLink')}
                </button>
                <button className="share-option" onClick={handleExport}>
                  <Download size={13} />
                  {t('exportJson')}
                </button>
                <button
                  className="share-option"
                  onClick={() => fileInputRef.current?.click()}
                >
                  <Upload size={13} />
                  {t('importJson')}
                </button>
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
