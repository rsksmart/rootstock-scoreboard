/**
 * RoleGuard Component
 * Conditionally renders children based on user's admin role
 * Provides permission-based UI rendering
 */

'use client';
import React, { ReactNode } from 'react';
import { useAuth } from '@/context/AuthContext';
import { AdminRole, ROLE_NAMES } from '@/types/admin';

interface RoleGuardProps {
  requiredRole: AdminRole;
  children: ReactNode;
  fallback?: ReactNode;
  showError?: boolean;
}

const RoleGuard: React.FC<RoleGuardProps> = ({
  requiredRole,
  children,
  fallback = null,
  showError = false
}) => {
  const { hasRole, userRole, isAdmin, roleLoading } = useAuth();

  // Show loading state
  if (roleLoading) {
    return (
      <div className="flex items-center justify-center p-4">
        <div className="flex items-center gap-2 text-gray-400">
          <div className="w-4 h-4 border-2 border-custom-orange border-t-transparent rounded-full animate-spin" />
          <span className="text-sm">Checking permissions...</span>
        </div>
      </div>
    );
  }

  // Check if user has required role
  if (!isAdmin || !hasRole(requiredRole)) {
    if (showError) {
      return (
        <div className="bg-red-900/20 border border-red-500/40 rounded-lg p-4">
          <div className="flex items-start gap-3">
            <span className="text-red-500 text-xl flex-shrink-0">⚠️</span>
            <div className="flex-1 min-w-0">
              <p className="text-red-400 font-semibold text-sm mb-1">
                Insufficient Permissions
              </p>
              <p className="text-red-300/80 text-xs">
                Required role: <span className="font-mono">{ROLE_NAMES[requiredRole]}</span>
                <br />
                Your role: <span className="font-mono">{ROLE_NAMES[userRole]}</span>
              </p>
            </div>
          </div>
        </div>
      );
    }
    return <>{fallback}</>;
  }

  return <>{children}</>;
};

export default RoleGuard;