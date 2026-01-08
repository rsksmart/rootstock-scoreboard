import React, { useEffect } from 'react'
import BaseDialog from './BaseDialog'
import MetamaskIcon from '@/components/icons/MetamaskIcon'
import useConnectWallet from '@/hooks/useConnectWallet'
import { useAuth } from '@/context/AuthContext'

type props = {
  closeDialog: Function
  open: boolean
}

function ConnectWalletDialog({ closeDialog, open }: props) {
  const { login, isError, setIsError } = useConnectWallet()
  const { address } = useAuth()

  useEffect(() => {
    init()
    if (address) {
      closeDialog()
      setIsError(false)
    }
  }, [address])

  const init = () => {
    setIsError(false)
    try {
      setTimeout(() => {
        login()
      }, 1500)
    } catch (error: any) {
      setIsError(true)
      console.log('error: ', error)
    }
  }

  return (
    <BaseDialog
      closeDialog={closeDialog}
      open={open}
      className="w-full max-w-[500px] h-auto min-h-[350px] sm:h-[350px] mx-4 sm:mx-0"
    >
      {!isError ? (
        <div className="py-4 sm:py-0">
          <h2 className="text-xl sm:text-2xl text-slate-100 text-center font-semibold mb-8 sm:mb-10 mt-4 sm:mt-6 px-2">
            Connecting wallet
          </h2>
          <div className="relative flex justify-center items-center">
            <MetamaskIcon className="w-[80px] h-[80px] sm:w-[100px] sm:h-[100px] absolute" />
            <div className="animate-spin border-r border-r-slate-300 w-[160px] h-[160px] sm:w-[200px] sm:h-[200px] rounded-full"></div>
          </div>
        </div>
      ) : (
        <div className="flex flex-col items-center py-4 sm:py-0">
          <h2 className="text-lg sm:text-xl text-slate-100 text-center font-semibold mb-8 sm:mb-10 mt-4 sm:mt-6 px-4">
            Make sure you have metamask in your browser
          </h2>
          <MetamaskIcon className="w-[80px] h-[80px] sm:w-[100px] sm:h-[100px]" />
          <a
            href="https://metamask.io/"
            target="_blank"
            rel="noopener noreferrer"
            className="italic hover:underline mt-4 font-bold text-sm sm:text-base"
          >
            get Metamask
          </a>
        </div>
      )}
    </BaseDialog>
  )
}

export default ConnectWalletDialog
