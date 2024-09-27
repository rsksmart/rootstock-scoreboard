'use client'
import React, { useState } from 'react'
import MetamaskIcon from '../icons/MetamaskIcon'
import ConnectWalletDialog from '../dialog/ConnectWalletDialog'
import Button from '../common/Button'

type props = {
  title?: string
  width?: number
}

const ConnectWalletButton = ({ title = 'Connect wallet', width = 200 }: props) => {
  const [dialog, setDialog] = useState<boolean>(false)

  return (
    <>
      {dialog && (
        <ConnectWalletDialog
          closeDialog={() => setDialog(false)}
          open={dialog}
        />
      )}
      <Button
        variant='primary'
        outline
        onClick={() => setDialog(true)}
        width={width}
      >
        <span className='flex justify-center items-center'>
          <MetamaskIcon className="w-5 mr-2" /> { title }
        </span>
      </Button>
    </>
  )
}

export default ConnectWalletButton
