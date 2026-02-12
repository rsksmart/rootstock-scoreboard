import React, { useState } from 'react'
import BaseDialog from './BaseDialog'
import Button from '../common/Button'
import Input from '../common/Input'
import ContentDialog from './ContentDialog'
import { useAuth } from '@/context/AuthContext'
import useManager from '@/hooks/useManager'
import { FETCH_STATUS } from '@/constants'
import ConnectWalletButton from '../navigation/ConnectWalletButton'

type props = {
  open: boolean,
  closeDialog: Function
}
function AddVoteDialog({ open, closeDialog }: props) {
  const { isLoading, setIsLoading, addVote, getTeams, contractErrorText } = useManager();
  const [amount, setAmount] = useState<number | undefined>(0);
  const [error, setError] = useState<string>('');
  const { team, tokenBalance, address } = useAuth();

  const handleVote = async() => {
    setError('');
    if (!amount || amount <= 0) {
      setError('Amount required');
      return;
    }
    if (!tokenBalance || amount > tokenBalance) {
      setError(`you don't have enough balance`);
      return;
    };
    if (!team?.teamName) {
      setError('No team selected');
      return;
    }
    await addVote(team.teamName, amount);
  }

  const handleCloseDialog = async () => {
    if (isLoading === FETCH_STATUS.COMPLETED) {
      await getTeams();
    }
    closeDialog();
    setIsLoading(FETCH_STATUS.INIT);
    setAmount(0);
    setError('');
  }
  const handleReset = async () => {
    if (isLoading === FETCH_STATUS.COMPLETED) {
      closeDialog();
      await getTeams();
    }
    setIsLoading(FETCH_STATUS.INIT);
    setAmount(0);
    setError('');
  }
  return (
    <BaseDialog open={open} closeDialog={handleCloseDialog} className='w-[490px] h-[420px]'>
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
                <h2 className='bg-custom-green font-bold text-xl text-black w-max px-1 m-auto'>ADD YOUR VOTE</h2>
              </div>
              <div className='w-full'>
                <div className='w-full p-1'>
                  <label htmlFor="name" className='font-bold text-base ml-3 mb-1 block'>Team Name</label>
                  <div className='team-detail ml-3'>{team?.teamName}</div>
                </div>
                <div className='w-full p-1'>
                  <label htmlFor="name" className='font-bold text-base ml-3 mb-1 block'>Team Symbol</label>
                  <div className='team-detail ml-3'>{team?.symbol}</div>
                </div>
                <div className='w-full p-2'>
                  <label htmlFor="name" className='font-bold text-base ml-3 mb-1 flex justify-between items-center'>
                    Amount to vote
                    <span className='text-xs text-zinc-400'>Balance: {tokenBalance}</span>
                  </label>
                  <Input
                    type='number'
                    className='ml-2'
                    value={amount || ''}
                    onChange={(e) => setAmount(Number(e.target.value))}
                    id='amount'
                    name="amoun"
                    placeholder='Amoun to vote'
                    height={35}
                  />
                  <div className='ml-3 text-red-600 p-1 text-sm'>{ error }</div>
                </div>
              </div>
              <div className='w-full flex mt-10 justify-between'>
                <Button
                  onClick={() => handleCloseDialog()}
                  width={80}
                >
                  Cancel
                </Button>
                <Button
                  onClick={() => handleVote()}
                  variant='secondary'
                  outline
                  width={120}
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
          errorText={contractErrorText}
        />
      </div>
    </BaseDialog>
  )
}

export default AddVoteDialog
