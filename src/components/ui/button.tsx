import {
  forwardRef,
  useState,
  useEffect,
  useLayoutEffect,
  useCallback,
  useRef,
  type ComponentPropsWithoutRef,
  type ReactNode,
} from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { buttonClass, innerClass } from './buttonStyles';
import { cn } from '../../utils/cn';

const SPRING = { type: 'spring' as const, bounce: 0, duration: 0.4 };
const FADE_IN = { duration: 0.3, delay: 0.05 };
const FADE_OUT = { duration: 0.15 };
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
    const innerRef = useRef<HTMLSpanElement>(null);
    const [width, setWidth] = useState<number | null>(null);
    const hasChildren = children !== undefined && children !== null;

    // Track label changes: counter serves as remount key + first-change gate.
    // Uses referential equality — assumes children are primitives (string/number).
    const [prevChildren, setPrevChildren] = useState(children);
    const [changeCount, setChangeCount] = useState(0);
    if (children !== prevChildren) {
      setPrevChildren(children);
      setChangeCount((c) => c + 1);
    }

    const [ready, setReady] = useState(
      () => document.fonts.status === 'loaded',
    );
    useEffect(() => {
      if (!ready) {
        void document.fonts.ready.then(() => {
          setReady(true);
        });
      }
    }, [ready]);

    const measure = useCallback(() => {
      if (innerRef.current) {
        setWidth(innerRef.current.getBoundingClientRect().width);
      }
    }, []);

    // Measure synchronously before paint on content, font, or style changes
    useLayoutEffect(measure, [children, ready, measure, innerClassName, icon]);

    // Re-measure on external size changes (e.g. breakpoint-driven font size)
    useEffect(() => {
      const el = innerRef.current;
      if (!el) return;
      const ro = new ResizeObserver(() => {
        measure();
      });
      ro.observe(el);
      return () => {
        ro.disconnect();
      };
    }, [measure]);

    // Only spring-animate after the first label change; before that settle instantly
    const widthTransition = ready && changeCount > 0 ? SPRING : INSTANT;

    return (
      <motion.button
        ref={ref}
        className={cn(className, 'justify-start')}
        initial={false}
        animate={width !== null ? { width } : {}}
        transition={widthTransition}
        {...(rest as Record<string, unknown>)}
      >
        <span ref={innerRef} className={innerClassName}>
          {icon}
          <AnimatePresence mode="popLayout" initial={false}>
            {hasChildren && (
              <motion.span
                key={changeCount}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1, transition: FADE_IN }}
                exit={{ opacity: 0, transition: FADE_OUT }}
              >
                {children}
              </motion.span>
            )}
          </AnimatePresence>
        </span>
      </motion.button>
    );
  },
);

export interface ButtonProps extends ComponentPropsWithoutRef<'button'> {
  /** Visual style: outline, solid, or ghost */
  variant?: string;
  /** Use rounded-full shape */
  round?: boolean;
  /** Button size: xs, sm, md, or lg */
  size?: string;
  /** Color scheme: default or danger */
  color?: string;
  /** Icon element rendered before children */
  icon?: ReactNode;
  /** Enable animated width transitions */
  animated?: boolean;
}

/** Reusable button with variant, size, shape, and color options. Supports icons and animated width transitions. */
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
