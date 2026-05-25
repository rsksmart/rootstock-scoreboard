import React, { useEffect, useRef } from 'react'
import XIcon from '../icons/XIcon'

interface Props {
  children: React.ReactNode
  closeDialog: Function
  className?: string
  open: boolean
  titleId?: string
}

function BaseDialog({ children, closeDialog, className, open, titleId = "dialog-title" }: Props) {
  const dialogRef = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    const dialogNode = dialogRef.current;
    if (!dialogNode) return;

    if (open) {
      if (!dialogNode.open) {
        dialogNode.showModal();
      }
    } else {
      if (dialogNode.open) {
        dialogNode.close();
      }
    }
  }, [open]);

  const handleCancel = (e: React.SyntheticEvent) => {
    e.preventDefault();
    closeDialog();
  };

  return (
    <dialog
      ref={dialogRef}
      onCancel={handleCancel}
      className={`bg-secondary p-6 rounded-lg shadow-lg relative ${className} bg-black border border-zinc-700 backdrop:bg-black/80 backdrop:backdrop-blur-sm m-auto`}
      style={{ maxHeight: '98vh' }}
      aria-labelledby={titleId}
    >
      <button
        className='absolute w-[20px] right-2 text-[20px] font-semibold top-4'
        id="close-btn"
        aria-label="Close dialog"
        onClick={() => closeDialog()}
      >
        <XIcon className='stroke-white' />
      </button>
      <div className='w-full h-full'>
        { children }
      </div>
    </dialog>
  )
}

export default BaseDialog;
