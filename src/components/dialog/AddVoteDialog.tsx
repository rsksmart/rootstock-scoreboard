import React, { useEffect, useState } from 'react'
import BaseDialog from './BaseDialog'
import Button from '../common/Button'
import Input from '../common/Input'
import ContentDialog from './ContentDialog'
import { useAuth } from '@/context/AuthContext'
import useManager from '@/hooks/useManager'
import { FETCH_STATUS, TEAM_MANAGER_ADDRESS } from '@/constants'
import { ITeam } from '@/interface/ITeam'
import ConnectWalletButton from '../navigation/ConnectWalletButton'
import { ethers } from 'ethers'
import { toast } from 'react-toastify'
import useConnectWallet from '@/hooks/useConnectWallet'

type props = {
  open: boolean,
  closeDialog: Function
}
function AddVoteDialog({ open, closeDialog }: props) {
  const { isLoading, setIsLoading, addVote, getTeams } = useManager();
  const [amount, setAmount] = useState<number | undefined>(0);
  const [error, setError] = useState<string>('');
  const { team, tokenBalance, address } = useAuth();
  const {login} = useConnectWallet()

 

  const handleVote = () => {
    if (!amount) setError('Amount required');
    if (!tokenBalance || amount! > tokenBalance) setError(`you don't have enough balance`);
    if (amount && tokenBalance && amount! <= tokenBalance) addVote(team?.teamName!, amount!);
  }
  useEffect(() => {
    if (!address) return; 
    const contractABI = [
      {
        inputs: [
          {
            internalType: "string",
            name: "teamName",
            type: "string",
          },
          {
            internalType: "uint256",
            name: "transferAmount",
            type: "uint256",
          },
        ],
        name: "vote",
        outputs: [],
        stateMutability: "nonpayable",
        type: "function",
      },
    ];
    
    let contract: ethers.Contract;
  
    const setupEventListeners = async () => {
      try {
        const { ethereum } = window as any;
        if (!ethereum) {
          console.error("No Ethereum provider found.");
          return;
        }
  
        const web3Provider = new ethers.BrowserProvider(ethereum);
        const signer = await web3Provider.getSigner();
  
        contract = new ethers.Contract(TEAM_MANAGER_ADDRESS, contractABI, signer);
  

        contract.on("TeamVotedSuccessfully", (teamName, transferAmount, event) => {
          console.log(`Team ${teamName}  voted successfully ${transferAmount}.`);
          toast.success(`Team ${teamName} voted successfully ${transferAmount}.`);
     
        });
      } catch (error) {
        console.error("Error setting up contract event listeners", error);
      }
    };
  
    setupEventListeners();


    
    // Clean up the event listener on component unmount
    return () => {
      contract.removeAllListeners("TeamVotedSuccessfully");
    };
  });
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
        />
      </div>
    </BaseDialog>
  )
}

export default AddVoteDialog
