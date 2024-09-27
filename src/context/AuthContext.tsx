'use client'
import { ITeam } from '@/interface/ITeam'
import { ContractTransactionResponse } from 'ethers'
import { ethers } from 'ethers'
import React, {
  createContext,
  useContext,
  useState,
  ReactNode,
  useCallback,
} from 'react'

interface AuthContextType {
  provider: ethers.BrowserProvider | undefined
  address: string
  logout: () => void
  setAddress: React.Dispatch<React.SetStateAction<string>>
  setProvider: React.Dispatch<React.SetStateAction<ethers.BrowserProvider | undefined>>
  setTx: React.Dispatch<React.SetStateAction<ContractTransactionResponse | undefined>>
  tx: ContractTransactionResponse | undefined
  setTeamLoading: React.Dispatch<React.SetStateAction<boolean>>
  teamLoading: boolean
  setTeams: React.Dispatch<React.SetStateAction<ITeam[] | undefined>>
  teams: ITeam[] | undefined
  setTeam: React.Dispatch<React.SetStateAction<ITeam | undefined>>
  team: ITeam | undefined
  tokenBalance: number
  setTokenBalance: React.Dispatch<React.SetStateAction<number>>
  contract: ethers.Contract | undefined
  setContract: React.Dispatch<React.SetStateAction<ethers.Contract| undefined>>
  permissions: boolean
  setPermissions: React.Dispatch<React.SetStateAction<boolean>>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export const AuthProvider: React.FC<{ children: ReactNode }> = ({
  children,
}) => {
  const [address, setAddress] = useState<string>('');
  const [tx, setTx] = useState<ContractTransactionResponse>();
  const [teams, setTeams] = useState<ITeam[]>();
  const [team, setTeam] = useState<ITeam>();
  const [teamLoading, setTeamLoading] = useState<boolean>(false);
  const [permissions, setPermissions] = useState<boolean>(false);
  const [tokenBalance, setTokenBalance] = useState<number>(0);
  const [contract, setContract] = useState<ethers.Contract | undefined>();

  const [provider, setProvider] = useState<ethers.BrowserProvider | undefined>(
    undefined
  )

  const logout = useCallback(() => {
    setProvider(undefined);
    setAddress('');
    setTx(undefined);
  }, [])

  return (
    <AuthContext.Provider
      value={{
        logout,
        provider,
        setProvider,
        address,
        setAddress,
        teamLoading,
        setTeamLoading,
        teams,
        setTeams,
        team,
        setTeam,
        setTx,
        tx,
        tokenBalance,
        setTokenBalance,
        contract,
        setContract,
        permissions,
        setPermissions
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}
