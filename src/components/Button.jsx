import { forwardRef, useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import useMeasure from 'react-use-measure';
import './Button.css';

function buttonClass({
  variant = 'outline',
  round,
  size = 'md',
  color,
  iconOnly,
}) {
  const cls = ['btn', `btn--${variant}`, `btn--${size}`];
  if (round) cls.push('btn--round');
  if (color === 'danger') cls.push('btn--danger');
  if (iconOnly) cls.push('btn--icon-only');
  return cls.join(' ');
}

const SPRING = { type: 'spring', bounce: 0, duration: 0.4 };
const INSTANT = { duration: 0 };

const AnimatedButton = forwardRef(function AnimatedButton(
  { className, icon, children, ...rest },
  ref,
) {
  const [measureRef, bounds] = useMeasure();
  const hasChildren = children !== undefined && children !== null;

  const [ready, setReady] = useState(false);
  useEffect(() => {
    document.fonts.ready.then(() => setReady(true));
  }, []);

  return (
    <motion.button
      ref={ref}
      className={className}
      initial={false}
      animate={{ width: bounds.width > 0 ? bounds.width : 'auto' }}
      transition={ready ? SPRING : INSTANT}
      {...rest}
    >
      <span ref={measureRef} className="btn-inner">
        {icon}
        {hasChildren && <span>{children}</span>}
      </span>
    </motion.button>
  );
});

const Button = forwardRef(function Button(
  { variant, round, size, color, icon, animated, className, children, ...rest },
  ref,
) {
  const iconOnly = icon && (children === undefined || children === null);
  const cls =
    buttonClass({ variant, round, size, color, iconOnly }) +
    (className ? ` ${className}` : '');

  if (animated) {
    return (
      <AnimatedButton ref={ref} className={cls} icon={icon} {...rest}>
        {children}
      </AnimatedButton>
    );
  }

  return (
    <button ref={ref} className={cls} {...rest}>
      <span className="btn-inner">
        {icon}
        {children !== undefined && children !== null && <span>{children}</span>}
      </span>
    </button>
  );
});

export default Button;
