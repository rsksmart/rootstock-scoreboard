/**
 * RoleBadge Component
 * Displays user's admin role with appropriate styling
 * Fully responsive across all devices
 */

'use client';
import React from 'react';
import { AdminRole, ROLE_NAMES, ROLE_STYLES, ROLE_ICONS } from '@/types/admin';

interface RoleBadgeProps {
  role: AdminRole;
  size?: 'xs' | 'sm' | 'md' | 'lg';
  showIcon?: boolean;
  className?: string;
}

const RoleBadge: React.FC<RoleBadgeProps> = ({
  role,
  size = 'sm',
  showIcon = true,
  className = ''
}) => {
  // Don't render badge for regular users
  if (role === AdminRole.NONE) return null;

  // Responsive size classes
  const sizeClasses = {
    xs: 'px-1.5 py-0.5 text-[10px] gap-0.5',
    sm: 'px-2 py-1 text-xs gap-1',
    md: 'px-3 py-1.5 text-sm gap-1.5',
    lg: 'px-4 py-2 text-base gap-2'
  };

  const iconSizes = {
    xs: 'text-[10px]',
    sm: 'text-xs',
    md: 'text-sm',
    lg: 'text-base'
  };

  return (
    <span
      className={`
        inline-flex items-center justify-center
        border rounded-full font-medium
        whitespace-nowrap
        transition-all duration-200
        ${sizeClasses[size]}
        ${ROLE_STYLES[role]}
        ${className}
      `}
      title={`${ROLE_NAMES[role]} - ${ROLE_ICONS[role]}`}
    >
      {showIcon && ROLE_ICONS[role] && (
        <span className={`${iconSizes[size]} leading-none`} aria-hidden="true">
          {ROLE_ICONS[role]}
        </span>
      )}
      <span className="font-semibold leading-none">
        {ROLE_NAMES[role]}
      </span>
    </span>
  );
};

export default RoleBadge;