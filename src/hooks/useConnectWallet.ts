import { useState, useCallback } from 'react'
import { ethers } from 'ethers'
import { useAuth } from '@/context/AuthContext'

const useConnectWallet = () => {
  const [isError, setIsError] = useState(false);
  const { setAddress, setProvider } = useAuth();

  const login = useCallback(async () => {
    const { ethereum } = window as any
    try {
      // Get network configuration from environment variables
      const chainId = process.env.NEXT_PUBLIC_CHAIN_ID || '31337';
      const chainIdHex = `0x${parseInt(chainId).toString(16)}`;
      const networkName = process.env.NEXT_PUBLIC_NETWORK_NAME || 'Localhost 8545';
      const rpcUrl = process.env.NEXT_PUBLIC_RPC_URL || 'http://127.0.0.1:8545';

      // Try to switch to the configured network
      try {
        await ethereum.request({
          method: 'wallet_switchEthereumChain',
          params: [{ chainId: chainIdHex }],
        });
      } catch (switchError: any) {
        // This error code indicates that the chain has not been added to MetaMask
        if (switchError.code === 4902) {
          try {
            await ethereum.request({
              method: 'wallet_addEthereumChain',
              params: [
                {
                  chainId: chainIdHex,
                  chainName: networkName,
                  rpcUrls: [rpcUrl],
                  nativeCurrency: {
                    name: 'ETH',
                    symbol: 'ETH',
                    decimals: 18
                  }
                },
              ],
            });
          } catch (addError) {
            console.error('Failed to add network:', addError);
            throw addError;
          }
        }
      }

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
