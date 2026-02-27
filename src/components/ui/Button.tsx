'use client';

import React from 'react';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline';
  size?: 'sm' | 'md' | 'lg';
  children: React.ReactNode;
  fullWidth?: boolean;
}

const Button: React.FC<ButtonProps> = ({
  variant = 'primary',
  size = 'md',
  children,
  fullWidth = false,
  className = '',
  ...props
}) => {
  const baseStyles = 'font-medium rounded-lg transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-black';
  
  const variants = {
    primary: 'bg-[var(--surface-text)] text-[var(--surface-bg)] hover:opacity-90 focus:ring-gray-300',
    secondary: 'border border-[var(--surface-border)] text-[var(--surface-text)] hover:border-[var(--surface-border-strong)] hover:bg-[var(--glass-bg)] focus:ring-gray-500',
    outline: 'border border-[var(--surface-border)] text-[var(--surface-text)] hover:bg-[var(--glass-bg)] focus:ring-white/50'
  };

  const sizes = {
    sm: 'px-4 py-2 text-sm min-h-[44px]', // 44px minimum touch target
    md: 'px-6 py-3 text-base min-h-[48px]', // 48px minimum touch target
    lg: 'px-10 py-4 text-lg min-h-[52px]' // 52px minimum touch target
  };

  const combinedClassName = [
    baseStyles,
    variants[variant],
    sizes[size],
    fullWidth ? 'w-full' : '',
    className
  ].filter(Boolean).join(' ');

  return (
    <button className={combinedClassName} {...props}>
      {children}
    </button>
  );
};

export default Button;