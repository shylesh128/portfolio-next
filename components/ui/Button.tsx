import React from 'react';
import { cn } from '@/lib/utils';

/**
 * Button Component
 * Accessible, reusable button with multiple variants
 * Follows WCAG AA guidelines for contrast and keyboard navigation
 */

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost' | 'outline';
  size?: 'sm' | 'md' | 'lg';
  isLoading?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  children: React.ReactNode;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      variant = 'primary',
      size = 'md',
      isLoading = false,
      leftIcon,
      rightIcon,
      children,
      className,
      disabled,
      ...props
    },
    ref
  ) => {
    const baseStyles =
      'inline-flex items-center justify-center font-medium transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed';

    const variantStyles = {
      primary:
        'bg-[var(--link-color)] text-[var(--text-active-color)] hover:opacity-90 focus:ring-[var(--link-color)]',
      secondary:
        'bg-[var(--border-color)] text-[var(--text-color)] hover:bg-opacity-80 focus:ring-[var(--border-color)]',
      ghost:
        'bg-transparent text-[var(--text-color)] hover:bg-[var(--border-color)] hover:bg-opacity-20 focus:ring-[var(--text-color)]',
      outline:
        'border-2 border-[var(--link-color)] text-[var(--link-color)] hover:bg-[var(--link-color)] hover:text-[var(--text-active-color)] focus:ring-[var(--link-color)]',
    };

    const sizeStyles = {
      sm: 'text-sm px-3 py-1.5 rounded gap-1.5',
      md: 'text-base px-4 py-2 rounded-md gap-2',
      lg: 'text-lg px-6 py-3 rounded-lg gap-2.5',
    };

    return (
      <button
        ref={ref}
        className={cn(
          baseStyles,
          variantStyles[variant],
          sizeStyles[size],
          className
        )}
        disabled={disabled || isLoading}
        {...props}
      >
        {isLoading ? (
          <>
            <svg
              className="animate-spin h-4 w-4"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              aria-hidden="true"
            >
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
              />
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
              />
            </svg>
            <span>Loading...</span>
          </>
        ) : (
          <>
            {leftIcon && <span aria-hidden="true">{leftIcon}</span>}
            {children}
            {rightIcon && <span aria-hidden="true">{rightIcon}</span>}
          </>
        )}
      </button>
    );
  }
);

Button.displayName = 'Button';

export default Button;
