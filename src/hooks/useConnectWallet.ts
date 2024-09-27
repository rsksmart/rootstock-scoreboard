import { useState, useCallback } from 'react'
import { ethers } from 'ethers'
import { useAuth } from '@/context/AuthContext'

const useConnectWallet = () => {
  const [isError, setIsError] = useState(false);
  const { setAddress, setProvider } = useAuth();

  const login = useCallback(async () => {
    const { ethereum } = window as any
    try {
      const web3Provider: ethers.BrowserProvider = new ethers.BrowserProvider(ethereum);
      const signer = await web3Provider.getSigner()
      const address = await signer.getAddress()
      setProvider(web3Provider);
      setAddress(address.toLowerCase());
    } catch (error) {
      console.error('Error connecting to wallet', error)
      setIsError(!ethereum)
    }
  }, [])

  return {
    login,
    isError,
    setIsError,
  }
}

export default useConnectWallet
