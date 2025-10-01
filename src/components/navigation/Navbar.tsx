'use client';
import logo from '@/app/assets/img/logo.svg';
import Link from 'next/link';
import ConnectWalletButton from './ConnectWalletButton';
import { useAuth } from '@/context/AuthContext';
import MetamaskIcon from '../icons/MetamaskIcon';
import RoleBadge from '../admin/RoleBadge';
import Image from 'next/image';

function Navbar() {
  const { address, logout, isAdmin, userRole } = useAuth();

  const formatAddress = () => {
    return `${address.substring(0, 4)}...${address.substring(address.length - 4)}`;
  };

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
            {/* Admin Dashboard Link - only for admins */}
            {isAdmin && (
              <Link
                href="/admin"
                className="hidden sm:flex items-center gap-2 px-3 py-1.5 bg-custom-green/10 border border-custom-green/20 rounded-lg text-custom-green text-sm font-medium hover:bg-custom-green/20 transition-colors"
              >
                <span>⚙️</span>
                <span>Admin</span>
              </Link>
            )}

            {/* Address display - responsive */}
            <div className="bg-white flex items-center gap-2 sm:gap-3 rounded-md text-black px-2 sm:px-3 py-1 sm:py-1.5">
              <MetamaskIcon className="w-4 h-4 sm:w-5 sm:h-5 flex-shrink-0" />
              <span className="text-xs sm:text-sm font-mono">
                {formatAddress()}
              </span>
            </div>

            {/* Role badge - only show on larger screens to save space */}
            {isAdmin && (
              <div className="hidden md:block">
                <RoleBadge role={userRole} size="sm" />
              </div>
            )}

            {/* Logout button - responsive */}
            <button
              onClick={logout}
              className="bg-zinc-800 border border-zinc-600 rounded-md px-2 sm:px-4 py-1 sm:py-1.5 hover:bg-zinc-700 transition-colors text-xs sm:text-sm text-white"
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