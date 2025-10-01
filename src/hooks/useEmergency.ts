'use client';
import { useState, useCallback, useEffect } from 'react';
import { ethers } from 'ethers';
import { useAuth } from '@/context/AuthContext';
import { TEAM_MANAGER_ADDRESS, FETCH_STATUS } from '@/constants';
import { AdminRole } from '@/types/admin';

export interface EmergencyStatus {
  emergencyMode: boolean;
  emergencyTriggeredBy: string;
  emergencyStartTime: number;
}

const useEmergency = () => {
  const { provider, setTx } = useAuth();
  const [isLoading, setIsLoading] = useState(FETCH_STATUS.INIT);
  const [emergencyStatus, setEmergencyStatus] = useState<EmergencyStatus>({
    emergencyMode: false,
    emergencyTriggeredBy: ethers.ZeroAddress,
    emergencyStartTime: 0,
  });

  // Contract ABI for emergency functions
  const EMERGENCY_ABI = [
    'function emergencyMode() view returns (bool)',
    'function emergencyTriggeredBy() view returns (address)',
    'function emergencyStartTime() view returns (uint256)',
    'function triggerEmergency()',
    'function resolveEmergency()',
    'function emergencyAddAdmin(address admin, uint8 role)',
    'event EmergencyModeToggled(bool enabled, address indexed triggeredBy)',
  ];

  // Load emergency status
  const loadEmergencyStatus = useCallback(async () => {
    if (!provider) return;

    try {
      const contract = new ethers.Contract(
        TEAM_MANAGER_ADDRESS!,
        EMERGENCY_ABI,
        provider
      );

      const [emergencyMode, emergencyTriggeredBy, emergencyStartTime] = await Promise.all([
        contract.emergencyMode(),
        contract.emergencyTriggeredBy(),
        contract.emergencyStartTime(),
      ]);

      setEmergencyStatus({
        emergencyMode,
        emergencyTriggeredBy,
        emergencyStartTime: Number(emergencyStartTime),
      });
    } catch (error) {
      console.error('Failed to load emergency status:', error);
    }
  }, [provider]);

  useEffect(() => {
    loadEmergencyStatus();
  }, [loadEmergencyStatus]);

  // Trigger emergency mode
  const triggerEmergency = async () => {
    if (!provider) return;

    try {
      setIsLoading(FETCH_STATUS.WAIT_WALLET);
      const signer = await provider.getSigner();
      const contract = new ethers.Contract(
        TEAM_MANAGER_ADDRESS!,
        EMERGENCY_ABI,
        signer
      );

      const response = await contract.triggerEmergency();
      setIsLoading(FETCH_STATUS.WAIT_TX);
      setTx(response);
      await response.wait();
      setIsLoading(FETCH_STATUS.COMPLETED);

      // Reload emergency status
      await loadEmergencyStatus();
    } catch (error) {
      console.error('Failed to trigger emergency:', error);
      setIsLoading(FETCH_STATUS.ERROR);
    }
  };

  // Resolve emergency mode
  const resolveEmergency = async () => {
    if (!provider) return;

    try {
      setIsLoading(FETCH_STATUS.WAIT_WALLET);
      const signer = await provider.getSigner();
      const contract = new ethers.Contract(
        TEAM_MANAGER_ADDRESS!,
        EMERGENCY_ABI,
        signer
      );

      const response = await contract.resolveEmergency();
      setIsLoading(FETCH_STATUS.WAIT_TX);
      setTx(response);
      await response.wait();
      setIsLoading(FETCH_STATUS.COMPLETED);

      // Reload emergency status
      await loadEmergencyStatus();
    } catch (error) {
      console.error('Failed to resolve emergency:', error);
      setIsLoading(FETCH_STATUS.ERROR);
    }
  };

  // Emergency add admin
  const emergencyAddAdmin = async (address: string, role: AdminRole) => {
    if (!provider) return;

    try {
      setIsLoading(FETCH_STATUS.WAIT_WALLET);
      const signer = await provider.getSigner();
      const contract = new ethers.Contract(
        TEAM_MANAGER_ADDRESS!,
        EMERGENCY_ABI,
        signer
      );

      const response = await contract.emergencyAddAdmin(address, role);
      setIsLoading(FETCH_STATUS.WAIT_TX);
      setTx(response);
      await response.wait();
      setIsLoading(FETCH_STATUS.COMPLETED);
    } catch (error) {
      console.error('Failed to emergency add admin:', error);
      setIsLoading(FETCH_STATUS.ERROR);
    }
  };

  return {
    emergencyStatus,
    isLoading,
    setIsLoading,
    loadEmergencyStatus,
    triggerEmergency,
    resolveEmergency,
    emergencyAddAdmin,
  };
};

export default useEmergency;
