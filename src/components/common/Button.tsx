// Button.tsx
import React from 'react';

import { classNames } from '@/utils/ClassNames';

type ButtonProps = {
  size?: 'small' | 'large'
  icon?: React.ReactNode
  children: React.ReactNode
  variant?: 'primary' | 'secondary'
  rounded?: boolean
  outline?: boolean
  className?: string
  width?: number
  height?: number
  onClick: React.MouseEventHandler<HTMLButtonElement> | undefined
  disabled?: boolean
  show?: boolean
};

const Button: React.FC<ButtonProps> = ({
  size = 'small',
  icon,
  children,
  variant = 'primary',
  rounded = true,
  outline = false,
  className,
  height = 24,
  width = 136,
  onClick,
  disabled = false,
  show = true
}) => {
  if (!show) return;
  const baseStyles = 'px-4 font-semibold focus:outline-none transition-colors flex justify-center items-center';
  
  const sizeStyles = size === 'large' ? 'text-lg' : 'text-sm';
  
  const variantStyles = {
    primary: 'bg-black text-white hover:bg-white hover:text-black',
    secondary: 'bg-white text-black hover:bg-black hover:text-white border hover-border-white',
  };

  const outlineStyles = outline ? 'border' : '';
  const roundedStyles = rounded ? 'rounded-full' : 'rounded';
  // const isDisabled = disabled ? 'disa'


  return (
    <button
      disabled={disabled}
      onClick={onClick}
      style={{ width, height }}
      className={`relative disabled:bg-zinc-800 disabled:border-transparent disabled:text-zinc-300 disabled:cursor-not-allowed disabled:font-medium ${className} ${classNames(
        baseStyles,
        sizeStyles,
        variantStyles[variant],
        roundedStyles,
        outlineStyles,
      )}
      `}
    >
      {(outline && !disabled) && (
        <span
          style={{ width, height }}
          className={`${classNames(
            'absolute top-[4px] left-[3px] h-full border z-[-1]',
            rounded ? 'rounded-full' : 'rounded',
          )}`}
        />
      )}
      {icon && <span className="mr-2">{icon}</span>}
      <span>{children}</span>
    </button>
  );
};

export default Button;
