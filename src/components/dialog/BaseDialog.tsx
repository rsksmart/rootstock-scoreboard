import React from 'react'
import XIcon from '../icons/XIcon'

interface Props {
  children: React.ReactNode
  closeDialog: Function
  className?: string
  open: boolean
}

function BaseDialog({ children, closeDialog, className, open }: Props) {
  if (!open) return null;
  return (
    <div className="fixed overflow-hidden w-screen h-screen inset-0 bg-black bg-opacity-80 z-50 flex justify-center items-center">
      <div className={`bg-secondary p-6 rounded-lg shadow-lg z-50 relative ${className} bg-black border border-zinc-700`} id="dialog" style={{ maxHeight: '98vh'}}
      >
        <button className='absolute w-[20px] right-2 text-[20px] font-semibold top-4' id="close-btn" onClick={() => closeDialog()}>
          <XIcon className='stroke-white' />
        </button>
        <div className='w-full h-full'>
          { children }
        </div>
      </div>
    </div>
  )
}

export default BaseDialog;
