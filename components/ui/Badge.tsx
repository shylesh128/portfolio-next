import React from 'react';
import { cn } from '@/lib/utils';

/**
 * Badge Component
 * Used for tech stack tags and categories
 * Color-coded with accessible contrast ratios
 */

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: 'default' | 'primary' | 'success' | 'warning' | 'info';
  size?: 'sm' | 'md';
  children: React.ReactNode;
}

const Badge = React.forwardRef<HTMLSpanElement, BadgeProps>(
  ({ variant = 'default', size = 'sm', children, className, ...props }, ref) => {
    const baseStyles =
      'inline-flex items-center font-medium rounded-full transition-colors';

    const variantStyles = {
      default: 'bg-[var(--border-color)] text-[var(--text-color)]',
      primary: 'bg-[var(--link-color)] text-[var(--text-active-color)]',
      success: 'bg-green-500 text-white',
      warning: 'bg-yellow-500 text-black',
      info: 'bg-blue-500 text-white',
    };

    const sizeStyles = {
      sm: 'text-xs px-2 py-0.5',
      md: 'text-sm px-3 py-1',
    };

    return (
      <span
        ref={ref}
        className={cn(baseStyles, variantStyles[variant], sizeStyles[size], className)}
        {...props}
      >
        {children}
      </span>
    );
  }
);

Badge.displayName = 'Badge';

export default Badge;
