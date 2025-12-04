import React from 'react';
import { cn } from '@/lib/utils';

/**
 * Card Component
 * Base card component with variants and hover effects
 */

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'elevated' | 'outlined' | 'flat';
  hover?: boolean;
  children: React.ReactNode;
}

const Card = React.forwardRef<HTMLDivElement, CardProps>(
  ({ variant = 'elevated', hover = false, children, className, ...props }, ref) => {
    const baseStyles = 'rounded-lg transition-all duration-300';

    const variantStyles = {
      elevated: 'bg-[var(--background-color)] shadow-md border border-[var(--border-color)]',
      outlined: 'bg-transparent border-2 border-[var(--border-color)]',
      flat: 'bg-[var(--background-color)]',
    };

    const hoverStyles = hover
      ? 'hover:shadow-xl hover:scale-[1.03] cursor-pointer hover:-translate-y-1'
      : '';

    return (
      <div
        ref={ref}
        className={cn(baseStyles, variantStyles[variant], hoverStyles, className)}
        {...props}
      >
        {children}
      </div>
    );
  }
);

Card.displayName = 'Card';

export default Card;
