import {
  forwardRef,
  useState,
  useEffect,
  type ComponentPropsWithoutRef,
  type ReactNode,
} from 'react';
import { motion } from 'framer-motion';
import useMeasure from 'react-use-measure';
import { cn } from '../utils/cn';
interface ButtonClassParams {
  variant?: string;
  round?: boolean;
  size?: string;
  color?: string;
  iconOnly?: boolean;
}

const BASE =
  'flex items-center justify-center overflow-hidden font-[inherit] lowercase tracking-[0.03em] cursor-pointer transition-all duration-200 ease-out';

const VARIANT: Record<string, string> = {
  outline:
    'text-subtle bg-transparent border border-solid border-border-input hover:text-text hover:border-muted',
  solid: 'text-bg bg-text border-none hover:opacity-85',
  ghost:
    'text-subtle bg-transparent border-none hover:text-text hover:bg-divider',
};

const SIZE_BTN: Record<string, string> = {
  xs: '',
  sm: 'text-2xs',
  md: 'text-xs',
  lg: 'text-sm',
};

const SIZE_INNER: Record<string, string> = {
  xs: 'p-1',
  sm: 'px-[0.6rem] py-[0.4rem]',
  md: 'px-[0.7rem] py-[0.5rem]',
  lg: 'px-[1.1rem] py-[0.55rem]',
};

const SIZE_INNER_ICON: Record<string, string> = {
  xs: 'p-1',
  sm: 'p-[0.4rem]',
  md: 'p-[0.5rem]',
  lg: 'p-[0.55rem]',
};

function buttonClass({
  variant = 'outline',
  round,
  size = 'md',
  color,
  iconOnly,
}: ButtonClassParams): string {
  const cls = [BASE, VARIANT[variant] ?? ''];
  cls.push(SIZE_BTN[size] ?? '');
  cls.push('leading-none');
  cls.push(round ? 'rounded-full' : 'rounded-md');
  if (color === 'danger' && variant === 'solid') cls.push('bg-danger');
  if (color === 'danger' && variant === 'ghost')
    cls.push('hover:text-warning hover:bg-transparent');
  if (iconOnly) cls.push('aspect-square');
  return cls.join(' ');
}

function innerClass(size = 'md', iconOnly = false): string {
  const base =
    'flex gap-[0.35rem] items-center justify-center w-max whitespace-nowrap';
  const padding = iconOnly
    ? (SIZE_INNER_ICON[size] ?? '')
    : (SIZE_INNER[size] ?? '');
  return `${base} ${padding}`;
}

const SPRING = { type: 'spring' as const, bounce: 0, duration: 0.4 };
const INSTANT = { duration: 0 };

interface AnimatedButtonInnerProps extends ComponentPropsWithoutRef<'button'> {
  icon?: ReactNode;
  innerClassName?: string;
}

const AnimatedButton = forwardRef<HTMLButtonElement, AnimatedButtonInnerProps>(
  function AnimatedButton(
    { className, icon, innerClassName, children, ...rest },
    ref,
  ) {
    const [measureRef, bounds] = useMeasure();
    const hasChildren = children !== undefined && children !== null;

    const [ready, setReady] = useState(false);
    useEffect(() => {
      void document.fonts.ready.then(() => {
        setReady(true);
      });
    }, []);

    return (
      <motion.button
        ref={ref}
        className={className}
        initial={false}
        animate={{ width: bounds.width > 0 ? bounds.width : 'auto' }}
        transition={ready ? SPRING : INSTANT}
        {...(rest as Record<string, unknown>)}
      >
        <span ref={measureRef} className={innerClassName}>
          {icon}
          {hasChildren && <span>{children}</span>}
        </span>
      </motion.button>
    );
  },
);

export interface ButtonProps extends ComponentPropsWithoutRef<'button'> {
  variant?: string;
  round?: boolean;
  size?: string;
  color?: string;
  icon?: ReactNode;
  animated?: boolean;
}

const Button = forwardRef<HTMLButtonElement, ButtonProps>(function Button(
  { variant, round, size, color, icon, animated, className, children, ...rest },
  ref,
) {
  const iconOnly = icon && (children === undefined || children === null);
  const cls = cn(
    buttonClass({ variant, round, size, color, iconOnly: !!iconOnly }),
    className,
  );
  const inner = innerClass(size, !!iconOnly);

  if (animated) {
    return (
      <AnimatedButton
        ref={ref}
        className={cls}
        icon={icon}
        innerClassName={inner}
        {...rest}
      >
        {children}
      </AnimatedButton>
    );
  }

  return (
    <button ref={ref} className={cls} {...rest}>
      <span className={inner}>
        {icon}
        {children !== undefined && children !== null && <span>{children}</span>}
      </span>
    </button>
  );
});

export default Button;
