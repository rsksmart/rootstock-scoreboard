'use client'
import logo from '@/app/assets/img/logo.svg';
import ConnectWalletButton from './ConnectWalletButton';
import { useAuth } from '@/context/AuthContext';
import MetamaskIcon from '../icons/MetamaskIcon';
import Image from 'next/image';

function Navbar() {
  const { address, logout } = useAuth();


  const formatAddress = () => {
    return `${address.substring(0, 4)}...${address.substring(address.length - 4)}`
  }
  return (
    <nav className="h-8">
    <div className="w-full px-6 py-4 flex justify-between z-10 fixed bg-black border-b border-zinc-600">
      <Image src={logo.src} alt="logo" style={{ width: 'auto', height: 'auto' }} width={170} height={100}  />
      {address ? (
        <div className="flex gap-4">
          <div className="bg-white flex items-center gap-4 rounded-md text-black px-2 py-1">
            <MetamaskIcon className="w-5 h-5" />
            {formatAddress()}
          </div>
          <button
            onClick={logout}
            className="bg-card border border-border rounded-md px-4 hover:opacity-90"
          >
            logout
          </button>
        </div>)
        :
        <ConnectWalletButton />
      }
    </div>
    </nav>
  )
}

export default Navbar
