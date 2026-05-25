'use client'
import { AdminRole, FETCH_STATUS, GOVERNANCE_TOKEN, TEAM_MANAGER_ADDRESS } from '@/constants'
import { useAuth } from '@/context/AuthContext'
import { ICreateTeam, ITeam } from '@/interface/ITeam'
import { ABI_ERC20, ABI_TEAMS_MANAGER } from '@/utils/Abi'
import { ethers } from 'ethers'
import { DecodedError, ErrorDecoder } from 'ethers-decode-error'
import { useCallback, useEffect, useRef, useState } from 'react'
import { toast } from 'react-toastify'

export const DEFAULT_ALLOWANCE = ethers.MaxUint256;

const RPC_PROVIDER = new ethers.JsonRpcProvider(
  process.env.NEXT_PUBLIC_RPC_URL
);
const errorDecoder = ErrorDecoder.create();

const useManager = () => {
  let PROVIDER = useRef<ethers.JsonRpcSigner | ethers.JsonRpcProvider>(
    RPC_PROVIDER
  )

  const [isLoading, setIsLoading] = useState(FETCH_STATUS.INIT);
  const [contractErrorText, setErrorText] = useState<string>("");
  const [teamManager, setTeamManager] = useState<ethers.Contract>()
  const initPromiseRef = useRef<Promise<ethers.Contract> | null>(null);
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

  const initializeProvider = useCallback(() => {
    if (!initPromiseRef.current) {
      const init = async () => {
        if (!provider) {
          PROVIDER.current = RPC_PROVIDER;
        }
        if (provider) {
          PROVIDER.current = await provider.getSigner()
        }
        const manager = new ethers.Contract(
          TEAM_MANAGER_ADDRESS!,
          ABI_TEAMS_MANAGER,
          PROVIDER.current
        )

        setTeamManager(manager)
        return manager;
      };

      const promise = init();
      promise.catch(() => {
        initPromiseRef.current = null;
      });
      initPromiseRef.current = promise;
    }

    return initPromiseRef.current;
  }, [provider]);

  useEffect(() => {
    initPromiseRef.current = null;
    initializeProvider();
  }, [provider, initializeProvider])

  const getTeams = useCallback(async () => {
    if (address) {
      const signer = await provider?.getSigner();
      const tokenContract = new ethers.Contract(GOVERNANCE_TOKEN!, ABI_ERC20, signer);
      setContract(tokenContract);
      const balance = await tokenContract.balanceOf(address);
      const decimals = await tokenContract.decimals();
      const formattedBalance = ethers.formatUnits(balance, Number(decimals));
      setTokenBalance(Number(formattedBalance));
    }

    try {
      setTeamLoading(true);
      const teamManager = await initializeProvider()
      const items = await teamManager?.getTeamNames();

      const tokenContract = new ethers.Contract(GOVERNANCE_TOKEN!, ABI_ERC20, teamManager?.runner);
      const decimals = await tokenContract.decimals();

      const teamsDetail: ITeam[] = [];
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
        newTeam.score = Number(ethers.formatUnits(score, Number(decimals)));
        if (newTeam.teamName) teamsDetail.push(newTeam);
      }
      setTeams(teamsDetail);
      setTeamLoading(false);
    } catch (error) {
      console.error('error: ', error);
      const decodedError: DecodedError = await errorDecoder.decode(error);
      toast.error(decodedError.reason);
    }
  }, [initializeProvider, address, provider]);

  const addVote = useCallback(async (teamName: string, amount: number) => {
    try {
      const decimals = await contract!.decimals();
      const value = ethers.parseUnits(amount.toString(), Number(decimals));
      setIsLoading(FETCH_STATUS.WAIT_WALLET)
      const allowance = await contract!.allowance(address, TEAM_MANAGER_ADDRESS);
      if (Number(ethers.formatUnits(allowance, Number(decimals))) < 1) {
        setPermissions(true);
        const approve = await contract!.approve(TEAM_MANAGER_ADDRESS, DEFAULT_ALLOWANCE);
        const receipt = await provider?.waitForTransaction(approve.hash);
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
  }, [address, contract, provider, teamManager]);

  const addTeam = useCallback(async (team: ICreateTeam) => {
    const { teamLeaderAddress, teamName, memeTokenAddress } = team;
    try {
      setIsLoading(FETCH_STATUS.WAIT_WALLET)
      // await new Promise((resolve, reject) => setTimeout(() => resolve(''), 3000));
      const response = await teamManager?.addTeam(teamName, memeTokenAddress.toLowerCase(), teamLeaderAddress!);
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
  }, [teamManager]);

  const kickStartVoting = useCallback(async (durationInSeconds: string | number) => {
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
  }, [teamManager]);

  const getVotingStatus = useCallback(async () => {
    try {
      const manager = await initializeProvider();
      if (!manager) return;

      const status = await manager.getVotingStatus();

      const votingTokenContract = new ethers.Contract(status[4], ABI_ERC20, manager.runner);
      const decimals = await votingTokenContract.decimals();

      const formattedStatus = {
        isActive: status[0],
        startTime: Number(status[1]),
        endTime: Number(status[2]),
        totalVotesCount: ethers.formatUnits(status[3], Number(decimals)),
        votingToken: status[4],
      };
      return formattedStatus;
    } catch (error) {
      console.error("Error fetching voting status:", error);
      const decodedError: DecodedError = await errorDecoder.decode(error);
      toast.error(decodedError.reason || "Failed to fetch voting status");
    }
  }, [initializeProvider]);

  const checkAdminPermissions = useCallback(async () => {
    const manager = await initializeProvider();
    if (!address || !manager)
      return { isAdminAuthorized: false, isVotingAuthorized: false, role: AdminRole.NONE };

    try {
      const roleValue = await manager.getAdminRole(address);

      const role = Number(roleValue) as AdminRole;

      const isVotingAuthorized =
        role >= AdminRole.VOTE_ADMIN;
      const isAdminAuthorized =
        role >= AdminRole.TEAM_MANAGER;

      return { isAdminAuthorized, isVotingAuthorized, role };
    } catch (error) {
      console.error("Error checking permissions:", error);
      const decodedError: DecodedError = await errorDecoder.decode(error);
      toast.error(decodedError.reason || "Failed to fetch User permissions");
      return { isAdminAuthorized: false, isVotingAuthorized: false, role: AdminRole.NONE };
    }
  }, [address, initializeProvider]);

  const assignAdminRole = useCallback(async (targetAddress: string, role: AdminRole, isEmergencyMode: boolean) => {
    try {
      setIsLoading(FETCH_STATUS.WAIT_WALLET);

      if (!ethers.isAddress(targetAddress)) {
        toast.error("Invalid wallet address!");
        return false;
      }
      let response;
      if (isEmergencyMode) {
        response = await teamManager?.emergencyAddAdmin(targetAddress, role);
      } else {
        response = await teamManager?.addAdmin(targetAddress, role);
      }

      setIsLoading(FETCH_STATUS.WAIT_TX);
      setTx(response);
      await response?.wait();

      setIsLoading(FETCH_STATUS.COMPLETED);
      return true;
    } catch (error: any) {
      console.error("Error assigning role:", error);
      const decodedError: DecodedError = await errorDecoder.decode(error);

      setErrorText(decodedError.reason || "Failed to assign role");
      setIsLoading(FETCH_STATUS.ERROR);
      return false;
    }
  }, [teamManager]);

  const getIsEmergencyMode = useCallback(async () => {
    try {
      const manager = await initializeProvider();
      if (!manager) return false;
      const status: boolean = await manager.emergencyMode();
      return status;
    } catch (error) {
      console.error("Error fetching emergency mode:", error);
      const decodedError: DecodedError = await errorDecoder.decode(error);
      toast.error(decodedError.reason || "Failed to fetch emergency mode");
      return false;
    }
  }, [initializeProvider]);

  const triggerEmergencyMode = useCallback(async () => {
    try {
      setIsLoading(FETCH_STATUS.WAIT_WALLET);
      const response = await teamManager?.triggerEmergency();

      setIsLoading(FETCH_STATUS.WAIT_TX);
      setTx(response);

      await response?.wait();
      setIsLoading(FETCH_STATUS.COMPLETED);
      return true;
    } catch (error) {
      console.error("Error triggering emergency mode:", error);
      const decodedError = await errorDecoder.decode(error);
      setErrorText(decodedError.reason || "Failed to trigger emergency mode");
      setIsLoading(FETCH_STATUS.ERROR);
      return false;
    }
  }, [teamManager]);

  const resolveEmergency = useCallback(async () => {
    try {
      setIsLoading(FETCH_STATUS.WAIT_WALLET);
      const response = await teamManager?.resolveEmergency();

      setIsLoading(FETCH_STATUS.WAIT_TX);
      setTx(response);

      await response?.wait();
      setIsLoading(FETCH_STATUS.COMPLETED);
      return true;
    } catch (error) {
      console.error("Error resolving emergency mode:", error);
      const decodedError = await errorDecoder.decode(error);
      setErrorText(decodedError.reason || "Failed to resolve emergency mode");
      setIsLoading(FETCH_STATUS.ERROR);
      return false;
    }
  }, [teamManager]);

  const getTokenDecimals = useCallback(async (tokenAddress: string) => {
    try {
      if (!provider) throw new Error("Provider not found");
      const tokenContract = new ethers.Contract(tokenAddress, ABI_ERC20, provider);
      const decimals = await tokenContract.decimals();
      return Number(decimals);
    } catch (error) {
      console.error("Error fetching token decimals:", error);
      throw new Error("Unable to fetch token decimals. Ensure the contract is a valid ERC20.");
    }
  }, [provider]);

  const emergencyWithdraw = useCallback(async (tokenAddress: string, receiver: string, amount: string) => {
    try {
      setIsLoading(FETCH_STATUS.WAIT_WALLET);
      const response = await teamManager?.emergencyWithdraw(tokenAddress, receiver, amount);

      setIsLoading(FETCH_STATUS.WAIT_TX);
      setTx(response);

      await response?.wait();
      setIsLoading(FETCH_STATUS.COMPLETED);
      return true;
    } catch (error) {
      console.error("Error processing emergency withdrawal:", error);
      const decodedError = await errorDecoder.decode(error);
      setErrorText(decodedError.reason || "Failed to process emergency withdrawal");
      setIsLoading(FETCH_STATUS.ERROR);
      return false;
    }
  }, [teamManager]);

  return {
    addVote,
    addTeam,
    getTeams,
    isLoading,
    setIsLoading,
    contractErrorText,
    kickStartVoting,
    getVotingStatus,
    checkAdminPermissions,
    assignAdminRole,
    triggerEmergencyMode,
    emergencyWithdraw,
    resolveEmergency,
    getIsEmergencyMode,
    getTokenDecimals
  }
}

export default useManager
