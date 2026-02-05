'use client'
import { FETCH_STATUS, GOVERNANCE_TOKEN, TEAM_MANAGER_ADDRESS } from '@/constants'
import { useAuth } from '@/context/AuthContext'
import { ICreateTeam, ITeam } from '@/interface/ITeam'
import { TeamsManagerCore, TeamsManagerCore__factory } from '@/typechain-types'
import { ABI_ERC20 } from '@/utils/Abi'
import { ethers } from 'ethers'
import { DecodedError, ErrorDecoder } from 'ethers-decode-error'
import { useCallback, useEffect, useRef, useState } from 'react'
import { toast } from 'react-toastify'

export const DEFAULT_ALLOWANCE = ethers.MaxUint256;

const useManager = () => {
  const RPC_PROVIDER = new ethers.JsonRpcProvider(
    process.env.NEXT_PUBLIC_RPC_URL
  )
  let PROVIDER = useRef<ethers.JsonRpcSigner | ethers.JsonRpcProvider>(
    RPC_PROVIDER
  )

  const [isLoading, setIsLoading] = useState(FETCH_STATUS.INIT);
  const [contractErrorText, setErrorText] = useState<string>("");
  const [teamManager, setTeamManager] = useState<TeamsManagerCore>()
  const errorDecoder = ErrorDecoder.create();
  const {
    provider,
    address,
    setTx,
    setTeams,
    setTeamLoading,
    setTokenBalance,
    contract,
    setContract,
    setPermissions
  } = useAuth()

  const initializeProvider = useCallback(async () => {
    if (provider) {
      PROVIDER.current = await provider.getSigner()
    }
    const teamManager = TeamsManagerCore__factory.connect(
      TEAM_MANAGER_ADDRESS!,
      PROVIDER.current
    )

    setTeamManager(teamManager)
    return teamManager
  }, [provider]);

  useEffect(() => {
    initializeProvider()
  }, [provider, initializeProvider])

  const getTeams = useCallback(async () => {
    if (address) {
      const signer = await provider?.getSigner();
      const tokenContract = new ethers.Contract(GOVERNANCE_TOKEN!, ABI_ERC20, signer);
      console.log('tokenContract: ', tokenContract);
      setContract(tokenContract);
      const balance = await tokenContract.balanceOf(address);
      const decimals = 18;
      const formattedBalance = ethers.formatUnits(balance, decimals);
      setTokenBalance(Number(formattedBalance));
    }

    try {
      setTeamLoading(true);
      const teamManager = await initializeProvider()
      const items = await teamManager?.getTeamNames();
      const teamsDetail:ITeam[] = [];
      for (const team in items) {
        const detail = await teamManager?.getTeamInfo(items[team]);
        const score = await teamManager.getScore(items[team]);
        const newTeam: ITeam = {
          teamName: detail[0],
          symbol: detail[1],
          uri: detail[2],
          memeTokenAddress: detail[3],
          leaderAddress: detail[4],
        }
        newTeam.score = Number(ethers.formatEther(score));
        if (newTeam.teamName) teamsDetail.push(newTeam);
      }
      setTeams(teamsDetail);
      setTeamLoading(false);
    } catch (error) {
      console.error('error: ', error);
      const decodedError: DecodedError = await errorDecoder.decode(error);
      toast.error(decodedError.reason);
    }
  }, [initializeProvider, setTeams, setTeamLoading, address, provider, setContract, setTokenBalance]);

  const addVote = async (teamName: string, amount:number) => {
    const value = ethers.parseEther(amount.toString());
    console.log('teamName: ', teamName);
    console.log('value: ', value);
    try {
      setIsLoading(FETCH_STATUS.WAIT_WALLET)
      const allowance = await contract!.allowance(address, TEAM_MANAGER_ADDRESS);
      if (Number(ethers.formatEther(allowance)) < 1) {
        setPermissions(true);
        const approve = await contract!.approve(TEAM_MANAGER_ADDRESS, DEFAULT_ALLOWANCE);
        console.log('approving: ', approve);
        const receipt = await provider?.waitForTransaction(approve.hash);
        console.log('receipt: ', receipt);
        setPermissions(false);
      }

      // await new Promise((resolve, reject) => setTimeout(() => resolve(''), 3000));
      const response = await teamManager?.vote(teamName, value);

      setIsLoading(FETCH_STATUS.WAIT_TX)
      setTx(response)
      await response?.wait()
      setIsLoading(FETCH_STATUS.COMPLETED)
    } catch (error) {
      console.error('error: ', error)
      const decodedError: DecodedError = await errorDecoder.decode(error);
      setErrorText(decodedError.reason || "Failed to add vote!");
      setIsLoading(FETCH_STATUS.ERROR)
    }
  }

  const addTeam = async (team: ICreateTeam) => {
    const { teamLeaderAddress, teamName, memeTokenAddress } = team;
    console.log('team: ', team);
    try {
      setIsLoading(FETCH_STATUS.WAIT_WALLET)
      // await new Promise((resolve, reject) => setTimeout(() => resolve(''), 3000));
      console.log('teamManager: ', teamManager);
      const response = await teamManager?.addTeam(teamName, memeTokenAddress, teamLeaderAddress!);
      setIsLoading(FETCH_STATUS.WAIT_TX);
      setTx(response);
      await response?.wait();
      setIsLoading(FETCH_STATUS.COMPLETED)
    } catch (error) {
      console.error('error: ', error)
      const decodedError: DecodedError = await errorDecoder.decode(error);
      setErrorText(decodedError.reason || "Failed to add team!");
      setIsLoading(FETCH_STATUS.ERROR)
    }
  }

  const kickStartVoting = async (durationInSeconds: string | number) => {
    try {
      setIsLoading(FETCH_STATUS.WAIT_WALLET);
      const duration = BigInt(durationInSeconds);
      const response = await teamManager?.setReadyToVote(duration);
      setIsLoading(FETCH_STATUS.WAIT_TX);
      setTx(response);
      await response?.wait();
      setIsLoading(FETCH_STATUS.COMPLETED);
      toast.success("Voting period has officially started!");
      return true;
    } catch (error) {
      console.error("error: ", error);
      const decodedError: DecodedError = await errorDecoder.decode(error);
      setErrorText(decodedError.reason || "Failed to start voting");
      setIsLoading(FETCH_STATUS.ERROR);
      return false;
    }
  };

  return {
    addVote,
    addTeam,
    getTeams,
    isLoading,
    setIsLoading,
    kickStartVoting
  }
}

export default useManager
