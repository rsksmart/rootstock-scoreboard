'use client';
import { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { AdminRole } from '@/types/admin';
import RoleBadge from '../RoleBadge';
import SidebarLink from './SidebarLink';

export default function Sidebar() {
  const { userRole, isAdmin } = useAuth();
  const [isOpen, setIsOpen] = useState(false);

  const menuItems = [
    {
      href: '/admin',
      icon: '🗳️',
      label: 'Voting Control',
      requiredRole: AdminRole.VOTE_ADMIN,
    },
    {
      href: '/admin/activity',
      icon: '📋',
      label: 'Activity Log',
      requiredRole: AdminRole.TEAM_MANAGER,
    },
    {
      href: '/admin/teams',
      icon: '👥',
      label: 'Team Management',
      requiredRole: AdminRole.TEAM_MANAGER,
      badge: 'Soon'
    },
    {
      href: '/admin/admins',
      icon: '👑',
      label: 'Admin Management',
      requiredRole: AdminRole.SUPER_ADMIN,
    },
    {
      href: '/admin/governance',
      icon: '⚖️',
      label: 'Multi-Sig Governance',
      requiredRole: AdminRole.TEAM_MANAGER,
    },
    {
      href: '/admin/timelock',
      icon: '🕐',
      label: 'Time-Locked Actions',
      requiredRole: AdminRole.SUPER_ADMIN,
    },
    {
      href: '/admin/emergency',
      icon: '🚨',
      label: 'Emergency Controls',
      requiredRole: AdminRole.RECOVERY_ADMIN,
    },
  ];

  // Filter menu items based on user role
  const filteredMenuItems = menuItems.filter(
    item => !item.requiredRole || userRole >= item.requiredRole
  );

  return (
    <>
      {/* Mobile Menu Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="lg:hidden fixed top-20 left-4 z-50 p-2 bg-zinc-900 border border-zinc-700 rounded-lg text-white hover:bg-zinc-800 transition"
      >
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          {isOpen ? (
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          ) : (
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
          )}
        </svg>
      </button>

      {/* Overlay for mobile */}
      {isOpen && (
        <div
          className="lg:hidden fixed inset-0 bg-black/30 z-30"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`
          fixed left-0 top-16 sm:top-20
          lg:sticky lg:top-0
          h-[calc(100vh-64px)] sm:h-[calc(100vh-80px)]
          w-64 sm:w-72 bg-black border-r border-zinc-800
          transform transition-transform duration-300 ease-in-out z-40
          ${isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
        `}
      >
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="p-4 sm:p-6 border-b border-zinc-800">
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-lg sm:text-xl font-bold text-white">Admin Dashboard</h2>
              <button
                onClick={() => setIsOpen(false)}
                className="lg:hidden text-zinc-400 hover:text-white"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            {isAdmin && (
              <div className="flex items-center gap-2">
                <span className="text-xs text-zinc-500">Your Role:</span>
                <RoleBadge role={userRole} size="sm" />
              </div>
            )}
          </div>

          {/* Navigation */}
          <nav className="flex-1 p-3 sm:p-4 space-y-2 overflow-y-auto">
            <div className="mb-4">
              <h3 className="text-xs font-semibold text-zinc-600 uppercase tracking-wider px-3 sm:px-4 mb-2">
                Management
              </h3>
              {filteredMenuItems.map((item) => (
                <SidebarLink key={item.href} {...item} />
              ))}
            </div>

            <div className="pt-4 border-t border-zinc-800">
              <h3 className="text-xs font-semibold text-zinc-600 uppercase tracking-wider px-3 sm:px-4 mb-2">
                General
              </h3>
              <SidebarLink
                href="/"
                icon="🏠"
                label="Main Dashboard"
              />
            </div>
          </nav>

          {/* Footer */}
          <div className="p-3 sm:p-4 border-t border-zinc-800">
            <div className="text-xs text-zinc-600 space-y-1">
              <p className="font-semibold text-zinc-500">Need Help?</p>
              <a
                href="https://dev.rootstock.io/"
                target="_blank"
                rel="noopener noreferrer"
                className="text-custom-green hover:underline block"
              >
                Documentation →
              </a>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
}
