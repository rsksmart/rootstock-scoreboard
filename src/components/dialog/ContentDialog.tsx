import { EXPLORER, FETCH_STATUS } from '@/constants'
import React from 'react'
import Button from '../common/Button'
import { useAuth } from '@/context/AuthContext'

type props = {
  status: string
  onClose: React.MouseEventHandler<HTMLButtonElement> | undefined
  loadingTitle: string
  createdTitle: string
  initialContent: React.ReactNode,
  errorText?: string;
  btnError?: string
}
function ContentDialog({ status, onClose, loadingTitle, createdTitle, initialContent, btnError = 'Close', errorText }: props) {
  const { tx, permissions } = useAuth();
  return (
    <div className='flex flex-col justify-center w-full h-full items-center flex-1'>
      { status === FETCH_STATUS.INIT && initialContent}
      {
        status === FETCH_STATUS.WAIT_WALLET &&
        <>
          <h2 className='bg-custom-orange px-2 text-2xl text-black w-max text-center font-bold mb-10'>
            {
              permissions ? 'Requesting Permissions' : 'Confirm in your wallet'
            }
          </h2>
          <div className='animate-spin border-r border-r-white w-16 h-16 rounded-full mt-4'></div>
        </>
      }
      {
        status === FETCH_STATUS.WAIT_TX &&
        <>
          <h2 className='bg-custom-orange px-2 text-2xl text-black w-full max-w-[90%] text-center font-bold break-words whitespace-pre-wrap'>
          { loadingTitle }
          </h2>
          <a href={`${EXPLORER}/tx/${tx?.hash}`} target="_blank" rel="noopener noreferrer" className='my-10 underline'>view transaction</a>
          <div className='animate-spin border-r border-r-white w-16 h-16 rounded-full mt-4'></div>
        </>
      }
      {
        status === FETCH_STATUS.COMPLETED &&
        <>
          <h2 className='bg-custom-green px-2 text-2xl text-black w-full max-w-[90%] text-center font-bold break-words whitespace-pre-wrap'>
            { createdTitle }
          </h2>
          <a href={`${EXPLORER}/tx/${tx?.hash}`} target="_blank" rel="noopener noreferrer" className='my-10 underline'>view transaction</a>
          <Button
            onClick={onClose}
            width={80}
            variant='secondary'
          >
            Close
          </Button>
        </>
      }
      {
        status === FETCH_STATUS.ERROR &&
        <>
          <h2 className='bg-custom-pink px-2 text-2xl text-black w-full max-w-[90%] text-center font-bold mb-10 break-words whitespace-pre-wrap'>
            {errorText ? errorText : "something was wrong"}
          </h2>
          <Button
            onClick={onClose}
            width={120}
            variant='secondary'
          >
            { btnError }
          </Button>
        </>
      }
    </div>
  )
}

export default ContentDialog
