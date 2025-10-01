'use client';
import { useState, useEffect } from 'react';
import { ethers } from 'ethers';
import { useAuth } from '@/context/AuthContext';
import AdvancedGovernanceABI from '@/contracts/AdvancedGovernance.json';

export default function useGovernanceContract() {
  const { provider } = useAuth();
  const [governanceContract, setGovernanceContract] = useState<ethers.Contract | null>(null);

  useEffect(() => {
    const initContract = async () => {
      if (!provider) {
        setGovernanceContract(null);
        return;
      }

      const contractAddress = process.env.NEXT_PUBLIC_ADVANCED_GOVERNANCE_ADDRESS;

      if (!contractAddress) {
        console.warn('NEXT_PUBLIC_ADVANCED_GOVERNANCE_ADDRESS not set');
        setGovernanceContract(null);
        return;
      }

      try {
        const signer = await provider.getSigner();
        const contract = new ethers.Contract(
          contractAddress,
          AdvancedGovernanceABI.abi,
          signer
        );

        // Verify contract exists by checking code
        const code = await provider.getCode(contractAddress);
        if (code === '0x') {
          console.error('No contract found at address:', contractAddress);
          console.error('Make sure you are connected to the correct network (localhost:8545)');
          setGovernanceContract(null);
          return;
        }

        console.log('✅ Governance contract initialized:', contractAddress);
        setGovernanceContract(contract);
      } catch (error) {
        console.error('Failed to initialize governance contract:', error);
        setGovernanceContract(null);
      }
    };

    initContract();
  }, [provider]);

  return governanceContract;
}
