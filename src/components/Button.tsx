import {
  forwardRef,
  useState,
  useEffect,
  type ComponentPropsWithoutRef,
  type ReactNode,
} from 'react';
import { motion } from 'framer-motion';
import useMeasure from 'react-use-measure';
import { buttonClass, innerClass } from '../utils/buttonStyles';
import { cn } from '../utils/cn';

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
