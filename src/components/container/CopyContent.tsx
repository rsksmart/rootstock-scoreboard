import React, { useState } from 'react'
import CopyIcon from '../icons/CopyIcon';

function CopyContent({ address }: { address: string }) {
  const [copied, setCopied] = useState<boolean>(false);

  const formatAddress = (address: string) => {
    if (!address) return;
    let subs1 = address.substring(0, 4);
    let subs2 = address.substring(address.length - 4);
    return `${subs1}...${subs2}`;
  }
  const copyAddress = (address: string) => {
    setCopied(true);
    navigator.clipboard.writeText(address)
    setTimeout(() => {
      setCopied(false);
    }, 1000);
  }

  return (
    <div className='text-zinc-300 mb-2 flex justify-center items-center gap-2 '>
      <div>{formatAddress(address)}</div>
      <button className="relative w-4 h-4" onClick={() => copyAddress(address)}>
        {
          copied && <span className='absolute -left-4 -top-6 transition-all duration-500'>copied</span>
        }
        <CopyIcon className='hover:fill-zinc-200 fill-zinc-400 relative w-4 h-4' />
      </button>
    </div>
  )
}

export default CopyContent
