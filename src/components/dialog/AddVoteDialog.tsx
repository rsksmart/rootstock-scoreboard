import React, { useState } from 'react'
import BaseDialog from './BaseDialog'
import Button from '../common/Button'
import Input from '../common/Input'
import ContentDialog from './ContentDialog'
import { useAuth } from '@/context/AuthContext'
import useManager from '@/hooks/useManager'
import { FETCH_STATUS } from '@/constants'
import { ITeam } from '@/interface/ITeam'
import ConnectWalletButton from '../navigation/ConnectWalletButton'

type props = {
  open: boolean,
  closeDialog: Function
}
function AddVoteDialog({ open, closeDialog }: props) {
  const { isLoading, setIsLoading, addVote, getTeams } = useManager();
  const [amount, setAmount] = useState<number | undefined>(0);
  const [error, setError] = useState<string>('');
  const { team, tokenBalance, address } = useAuth();

  const handleVote = () => {
    if (!amount) setError('Amount required');
    if (!tokenBalance || amount! > tokenBalance) setError(`you don't have enough balance`);
    if (amount && tokenBalance && amount! <= tokenBalance) addVote(team?.teamName!, amount!);
  }

  const handleCloseDialog = () => {
    if (isLoading === FETCH_STATUS.COMPLETED) {
      getTeams();
    }
    closeDialog();
    setIsLoading(FETCH_STATUS.INIT);
    setAmount(0);
    setError('');
  }
  const handleReset = () => {
    if (isLoading === FETCH_STATUS.COMPLETED) {
      closeDialog();
      getTeams();
    }
    setIsLoading(FETCH_STATUS.INIT);
    setAmount(0);
    setError('');
  }
  return (
    <BaseDialog open={open} closeDialog={handleCloseDialog} className='w-full max-w-[490px] h-auto min-h-[420px] sm:h-[420px] mx-4 sm:mx-0 bg-black border border-zinc-700'>
      <div className='w-full h-full flex flex-col'>
      {
          !address &&
          <div className='absolute -left-0 w-full h-[90%] mt-1 flex justify-center items-center'>
            <div className='absolute w-full h-full bg-black opacity-80 z-10'></div>
            <div className='relative z-20'>
              <ConnectWalletButton />
            </div>
          </div>
        }
        <ContentDialog
          initialContent={
            <div className='flex flex-col justify-between w-full h-full mt-2'>
              <div className='w-full items-center'>
                <h2 className='bg-custom-green font-bold text-lg sm:text-xl text-black w-max px-1 m-auto'>ADD YOUR VOTE</h2>
              </div>
              <div className='w-full mt-6 space-y-4'>
                <div className='w-full flex flex-wrap items-center gap-x-2 gap-y-1 border-b border-zinc-800 pb-3'>
                  <span className='font-semibold text-sm sm:text-base text-zinc-500'>Team Name:</span>
                  <span className='text-sm sm:text-base text-white break-words'>{team?.teamName}</span>
                </div>
                <div className='w-full flex flex-wrap items-center gap-x-2 gap-y-1 border-b border-zinc-800 pb-3'>
                  <span className='font-semibold text-sm sm:text-base text-zinc-500'>Team Symbol:</span>
                  <span className='text-sm sm:text-base text-custom-green font-medium'>{team?.symbol}</span>
                </div>
                <div className='w-full flex flex-wrap items-center justify-between gap-x-2 gap-y-1 border-b border-custom-green/20 pb-3'>
                  <span className='font-semibold text-sm sm:text-base text-zinc-300'>Your Balance:</span>
                  <span className='text-sm sm:text-base text-custom-green font-bold'>{tokenBalance}</span>
                </div>
                <div className='w-full mt-5 pt-2'>
                  <label htmlFor="amount" className='font-bold text-sm sm:text-base text-white mb-2 block'>
                    Amount to vote
                  </label>
                  <Input
                    type='number'
                    value={amount || ''}
                    onChange={(e) => setAmount(Number(e.target.value))}
                    id='amount'
                    name="amount"
                    placeholder='Enter amount'
                    height={35}
                  />
                  <div className='text-red-500 p-1 text-xs sm:text-sm mt-1'>{ error }</div>
                </div>
              </div>
              <div className='w-full flex mt-6 sm:mt-8 justify-between gap-2 px-1 sm:px-0'>
                <Button
                  onClick={() => handleCloseDialog()}
                  width={80}
                  className='flex-1 sm:flex-none sm:w-[80px]'
                >
                  Cancel
                </Button>
                <Button
                  onClick={() => handleVote()}
                  variant='secondary'
                  outline
                  width={120}
                  className='flex-1 sm:flex-none sm:w-[120px]'
                >
                  Add Vote
                </Button>
              </div>
            </div>
          }
          status={isLoading}
          loadingTitle='Adding vote'
          createdTitle='Vote added'
          onClose={() => handleReset()}
          btnError='try again'
        />
      </div>
    </BaseDialog>
  )
}

export default AddVoteDialog
