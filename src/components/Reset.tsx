import { RotateCcw } from 'lucide-react';
import { useI18n } from '../i18n/I18nContext';
import Button from './ui/button';
import { Popover, PopoverTrigger, PopoverContent } from './ui/popover';
import { cn } from '../utils/cn';

type PopoverAlign = 'start' | 'center' | 'end';

interface ResetProps {
  /** Whether the confirmation popover is open */
  isOpen: boolean;
  /** Toggle the popover open/closed */
  onToggle: () => void;
  /** Close the popover */
  onClose: () => void;
  /** Called after the user confirms the reset */
  onReset: () => void;
  /** Popover alignment relative to trigger */
  align?: PopoverAlign;
  /** Round button shape */
  round?: boolean;
  /** Button size */
  size?: string;
}

/** Reset button with confirmation popover. Asks the user to confirm before erasing all garden data. */
export default function Reset({
  isOpen,
  onToggle,
  onClose,
  onReset,
  align = 'end',
  round = true,
  size = 'lg',
}: ResetProps) {
  const { t } = useI18n();

  const handleConfirm = () => {
    onReset();
    onClose();
  };

  return (
    <Popover
      open={isOpen}
      onOpenChange={(open) => {
        if (open) onToggle();
        else onClose();
      }}
    >
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          round={round}
          size={size}
          icon={<RotateCcw size={14} />}
          className={cn('text-fg', isOpen && 'border-muted')}
          aria-label="Reset garden"
        />
      </PopoverTrigger>
      <PopoverContent
        align={align}
        aria-label="Reset confirmation"
        className="gap-2 w-64 py-3 px-4"
      >
        <p className="text-xs font-bold text-fg lowercase">{t('resetTitle')}</p>
        <p className="text-2xs leading-[1.5] text-subtle">
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
      </PopoverContent>
    </Popover>
  );
}
