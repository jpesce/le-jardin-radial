import { RotateCcw } from 'lucide-react';
import { useI18n } from '../i18n/I18nContext';
import Button from './Button';
import Popover from './Popover';
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

  const handleConfirm = () => {
    onReset();
    onClose();
  };

  return (
    <Popover
      isOpen={isOpen}
      onClose={onClose}
      trigger={
        <Button
          variant="outline"
          round
          size="lg"
          icon={<RotateCcw size={14} />}
          className={cn('text-fg', isOpen && 'border-muted')}
          onClick={onToggle}
          aria-label="Reset garden"
        />
      }
      ariaLabel={t('resetTitle') as string}
      className="gap-2 w-64 py-3 px-4"
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
    </Popover>
  );
}
