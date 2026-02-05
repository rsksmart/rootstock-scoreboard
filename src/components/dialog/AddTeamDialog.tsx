import BaseDialog from './BaseDialog'
import Input from '../common/Input'
import Button from '../common/Button'
import { FETCH_STATUS } from '@/constants'
import { ChangeEvent, useEffect, useState } from 'react'
import ContentDialog from './ContentDialog'
import { ICreateTeam } from '@/interface/ITeam'
import { useAuth } from '@/context/AuthContext'
import useManager from '@/hooks/useManager'
import ConnectWalletButton from '../navigation/ConnectWalletButton'
import { ethers } from 'ethers'

type props = {
  open: boolean
  closeDialog: Function
}
const STEP_STATUS = {
  INIT: 0,
  CONFIRM: 1,
  ADD: 2
}
const CREATE_TEAM_STATE: ICreateTeam = {
  teamName: '',
  memeTokenAddress: '',
}

function AddTeamDialog({ open, closeDialog }: props) {
  const { isLoading, setIsLoading, addTeam, getTeams } = useManager();
  const { address, teams } = useAuth();
  const [formCompleted, setFormCompleted] = useState<boolean>(true);
  const [validAddress, setValidAddress] = useState<boolean>(true);
  const [createTeam, setCreateTeam] = useState<ICreateTeam>(CREATE_TEAM_STATE);
  const [step, setStep] = useState(STEP_STATUS.INIT);

  const init = () => {
    setIsLoading(FETCH_STATUS.INIT);
    setCreateTeam(CREATE_TEAM_STATE);
    setStep(STEP_STATUS.INIT);
    setValidAddress(true);
   }
  const handleCloseDialog = () => {
    if (isLoading === FETCH_STATUS.COMPLETED) {
      getTeams();
    }
    closeDialog();
    setFormCompleted(true);
    init();
  }
  const handleReset = async () => {
    if (isLoading === FETCH_STATUS.COMPLETED) {
      closeDialog();
      await getTeams();
    }
    init();
  }

  const areAllFieldsFilled = () => {
    return Object.values(createTeam).every(value => value !== '' && value !== 0);
  };

  const handleFormCreateAirdrop = (e: ChangeEvent<HTMLInputElement>) => {
    if(e.target.name === 'teamName') {
      if(e.target.value.length > 30) {
        return
      }
    }
    setCreateTeam((prevState) => ({
      ...prevState,
      [e.target.name]: e.target.value
    }));
    setFormCompleted(true);
  }

  const createNewTeam = async () => {
    const validAddress = ethers.isAddress(createTeam.memeTokenAddress.toLowerCase());
    setValidAddress(validAddress);
    setFormCompleted(areAllFieldsFilled());
    createTeam.teamLeaderAddress = address;
    if (step === STEP_STATUS.INIT && areAllFieldsFilled() && validAddress) {
      setStep(STEP_STATUS.CONFIRM);
      setValidAddress(true);
      return
    }
    if (areAllFieldsFilled() && step === STEP_STATUS.CONFIRM) {
      await addTeam(createTeam);
    }
  }
  return (
    <BaseDialog open={open} closeDialog={handleCloseDialog} className={`w-[490px] h-[440px] bg-black border border-zinc-700 transition-all duration-200`}>
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
            <>
              <h2 className={`${step === STEP_STATUS.INIT ? 'bg-custom-green' : 'bg-custom-pink'} mt-1 font-bold text-xl text-black w-max px-1 items-start`}>
                {
                  step === STEP_STATUS.INIT ? 'CREATE TEAM' : 'CONFIRM TEAM DATA'
                }
              </h2>
              <form className={`w-full mt-7 items-center flex flex-wrap form-team ${step === STEP_STATUS.CONFIRM ? 'confirm' : ''}`}>
                <div className='w-full p-2'>
                  <label htmlFor="name" className='font-bold text-base ml-3 mb-1 block'>Team Name</label>
                  <Input
                    value={createTeam.teamName}
                    onChange={(e) => handleFormCreateAirdrop(e)}
                    id='teamName'
                    name='teamName'
                    placeholder='Team name ...'
                    height={35}
                  />
                  <div className='team-detail ml-3'>{createTeam.teamName}</div>
                </div>
                <div className='w-full p-2'>
                  <label htmlFor="name" className='font-bold text-base ml-3 mb-1 block'>Meme Token Address</label>
                  <Input
                    value={createTeam.memeTokenAddress}
                    onChange={(e) => handleFormCreateAirdrop(e)}
                    id='memeTokenAddress'
                    name='memeTokenAddress'
                    placeholder='0x0123..'
                    height={35}
                  />
                  {
                    !validAddress && <span className='text-red-500 text-sm ml-3'>enter a valid address</span>
                  }
                  <div className='team-detail ml-3'>{createTeam.memeTokenAddress}</div>
                </div>
                <div className='w-full p-2'>
                  <label htmlFor="name" className='font-bold text-base ml-3 mb-1 flex items-center'>
                    Team Leader Address
                    <span className='text-sm text-zinc-600'> (wallet Address)</span>
                  </label>
                  <div className='ml-3 text-zinc-400'>{ address }</div>
                </div>
              </form>
              <div className='italic text-red-500 my-2'>
                {
                  !formCompleted && 'All fields are required'
                }
              </div>
              <div className='w-full flex mt-4 justify-between'>
                <Button
                  outline
                  onClick={() => {step === STEP_STATUS.INIT ?  handleCloseDialog() : setStep(STEP_STATUS.INIT)}}
                  width={80}
                >
                  {
                    step === STEP_STATUS.INIT ? 'Cancel' : 'Back'
                  }
                </Button>
                <Button
                  onClick={() => createNewTeam()}
                  variant='secondary'
                  outline
                  width={140}
                >
                  {
                    step === STEP_STATUS.INIT ? 'Add Team' : 'Create Team'
                  }
                </Button>
              </div>
            </>
          }
          status={isLoading}
          loadingTitle='Creating Team'
          createdTitle='Team was Created'
          onClose={() => handleReset()}
          btnError='try again'
        />
      </div>
    </BaseDialog>
  )
}

export default AddTeamDialog
