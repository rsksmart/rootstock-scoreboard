'use client';
import { useState, useRef, useEffect } from 'react';
import logo from '@/app/assets/img/logo.svg';
import Link from 'next/link';
import ConnectWalletButton from './ConnectWalletButton';
import { useAuth } from '@/context/AuthContext';
import MetamaskIcon from '../icons/MetamaskIcon';
import RoleBadge from '../admin/RoleBadge';
import Image from 'next/image';

function Navbar() {
  const { address, logout, isAdmin, userRole } = useAuth();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const formatAddress = () => {
    return `${address.substring(0, 4)}...${address.substring(address.length - 4)}`;
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setDropdownOpen(false);
      }
    };

    if (dropdownOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [dropdownOpen]);

  return (
    <nav className="h-16 sm:h-20">
      <div className="w-full px-3 sm:px-6 py-3 sm:py-4 flex justify-between items-center z-10 fixed bg-black border-b border-zinc-600">
        {/* Logo */}
        <Link href="/" className="flex-shrink-0">
          <Image
            src={logo.src}
            alt="Rootstock Logo"
            style={{ width: 'auto', height: 'auto' }}
            width={140}
            height={80}
            className="sm:w-[170px]"
            priority
          />
        </Link>

        {/* Right side content */}
        {address ? (
          <div className="flex items-center gap-2 sm:gap-4">
            {/* Transparency Link - visible to all */}
            <Link
              href="/transparency"
              className="hidden sm:flex items-center gap-2 px-3 py-1.5 bg-zinc-800/50 border border-zinc-700 rounded-lg text-zinc-300 text-sm font-medium hover:bg-zinc-800 hover:text-white transition-colors"
            >
              <span>🔍</span>
              <span>Transparency</span>
            </Link>

            {/* Admin Dashboard Link - only for admins on desktop */}
            {isAdmin && (
              <Link
                href="/admin"
                className="hidden sm:flex items-center gap-2 px-3 py-1.5 bg-custom-green/10 border border-custom-green/20 rounded-lg text-custom-green text-sm font-medium hover:bg-custom-green/20 transition-colors"
              >
                <span>⚙️</span>
                <span>Admin</span>
              </Link>
            )}

            {/* Mobile Menu Button with Address - visible on mobile/tablet when admin */}
            <div className="relative sm:hidden" ref={dropdownRef}>
              <button
                onClick={() => setDropdownOpen(!dropdownOpen)}
                className="bg-white flex items-center gap-2 rounded-md text-black px-2 py-1"
              >
                <MetamaskIcon className="w-4 h-4 flex-shrink-0" />
                <span className="text-xs font-mono">{formatAddress()}</span>
                <svg
                  className={`w-3 h-3 transition-transform ${dropdownOpen ? 'rotate-180' : ''}`}
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>

              {/* Dropdown Menu */}
              {dropdownOpen && (
                <div className="absolute right-0 mt-2 w-48 bg-zinc-900 border border-zinc-700 rounded-lg shadow-lg py-2 z-50">
                  {isAdmin && (
                    <>
                      <div className="px-3 py-2 border-b border-zinc-800">
                        <RoleBadge role={userRole} size="sm" />
                      </div>
                      <Link
                        href="/admin"
                        onClick={() => setDropdownOpen(false)}
                        className="flex items-center gap-2 px-3 py-2 text-custom-green hover:bg-zinc-800 transition-colors text-sm"
                      >
                        <span>⚙️</span>
                        <span>Admin Dashboard</span>
                      </Link>
                    </>
                  )}
                  <Link
                    href="/transparency"
                    onClick={() => setDropdownOpen(false)}
                    className="flex items-center gap-2 px-3 py-2 text-zinc-300 hover:bg-zinc-800 transition-colors text-sm"
                  >
                    <span>🔍</span>
                    <span>Transparency</span>
                  </Link>
                  <button
                    onClick={() => {
                      logout();
                      setDropdownOpen(false);
                    }}
                    className="w-full flex items-center gap-2 px-3 py-2 text-red-400 hover:bg-zinc-800 transition-colors text-sm"
                  >
                    <span>🚪</span>
                    <span>Logout</span>
                  </button>
                </div>
              )}
            </div>

            {/* Desktop Address display - hidden on mobile when admin */}
            <div className={`bg-white ${isAdmin ? 'hidden sm:flex' : 'flex'} items-center gap-2 sm:gap-3 rounded-md text-black px-2 sm:px-3 py-1 sm:py-1.5`}>
              <MetamaskIcon className="w-4 h-4 sm:w-5 sm:h-5 flex-shrink-0" />
              <span className="text-xs sm:text-sm font-mono">
                {formatAddress()}
              </span>
            </div>

            {/* Role badge - only show on larger screens */}
            {isAdmin && (
              <div className="hidden md:block">
                <RoleBadge role={userRole} size="sm" />
              </div>
            )}

            {/* Desktop Logout button - hidden on mobile when admin */}
            <button
              onClick={logout}
              className={`bg-zinc-800 border border-zinc-600 rounded-md px-2 sm:px-4 py-1 sm:py-1.5 hover:bg-zinc-700 transition-colors text-xs sm:text-sm text-white ${isAdmin ? 'hidden sm:block' : ''}`}
            >
              <span className="hidden sm:inline">Logout</span>
              <span className="sm:hidden">Exit</span>
            </button>
          </div>
        ) : (
          <ConnectWalletButton />
        )}
      </div>
    </nav>
  );
}

export default Navbar;