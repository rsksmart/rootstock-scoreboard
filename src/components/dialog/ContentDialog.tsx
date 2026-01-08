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
  btnError?: string
}
function ContentDialog({ status, onClose, loadingTitle, createdTitle, initialContent, btnError = 'Close' }: props) {
  const { tx, permissions } = useAuth();
  return (
    <div className='flex flex-col justify-center w-full h-full items-center flex-1'>
      { status === FETCH_STATUS.INIT && initialContent}
      {
        status === FETCH_STATUS.WAIT_WALLET &&
        <>
          <h2 className='bg-custom-orange px-2 text-lg sm:text-2xl text-black w-max text-center font-bold mb-8 sm:mb-10 mx-2'>
            {
              permissions ? 'Requesting Permissions' : 'Confirm in your wallet'
            }
          </h2>
          <div className='animate-spin border-r border-r-white w-12 h-12 sm:w-16 sm:h-16 rounded-full mt-4'></div>
        </>
      }
      {
        status === FETCH_STATUS.WAIT_TX &&
        <>
          <h2 className='bg-custom-orange px-2 text-lg sm:text-2xl text-black w-max text-center font-bold mx-2'>
          { loadingTitle }
          </h2>
          <a href={`${EXPLORER}/tx/${tx?.hash}`} target="_blank" rel="noopener noreferrer" className='my-8 sm:my-10 underline text-sm sm:text-base hover:opacity-70 transition-opacity px-4 text-center break-all'>view transaction</a>
          <div className='animate-spin border-r border-r-white w-12 h-12 sm:w-16 sm:h-16 rounded-full mt-4'></div>
        </>
      }
      {
        status === FETCH_STATUS.COMPLETED &&
        <>
          <h2 className='bg-custom-green px-2 text-lg sm:text-2xl text-black w-max text-center font-bold mx-2'>
            { createdTitle }
          </h2>
          <a href={`${EXPLORER}/tx/${tx?.hash}`} target="_blank" rel="noopener noreferrer" className='my-8 sm:my-10 underline text-sm sm:text-base hover:opacity-70 transition-opacity px-4 text-center break-all'>view transaction</a>
          <Button
            onClick={onClose}
            width={80}
            variant='secondary'
            className='sm:w-[80px]'
          >
            Close
          </Button>
        </>
      }
      {
        status === FETCH_STATUS.ERROR &&
        <>
          <h2 className='bg-custom-pink px-2 text-lg sm:text-2xl text-black w-max text-center font-bold mb-8 sm:mb-10 mx-2'>
            something was wrong
          </h2>
          <Button
            onClick={onClose}
            width={95}
            variant='secondary'
            className='sm:w-[95px]'
          >
            { btnError }
          </Button>
        </>
      }
    </div>
  )
}

export default ContentDialog
