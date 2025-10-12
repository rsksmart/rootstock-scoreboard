'use client';
import { useState, useCallback, useEffect } from 'react';
import { ethers } from 'ethers';
import { useAuth } from '@/context/AuthContext';
import { TEAM_MANAGER_ADDRESS, FETCH_STATUS } from '@/constants';
import { AdminRole } from '@/types/admin';

export interface AdminInfo {
  address: string;
  role: AdminRole;
  joinTimestamp: number;
  isActive: boolean;
}

const useAdmin = () => {
  const { provider, setTx } = useAuth();
  const [isLoading, setIsLoading] = useState(FETCH_STATUS.INIT);
  const [admins, setAdmins] = useState<AdminInfo[]>([]);

  // Contract ABI for admin functions
  const ADMIN_ABI = [
    'function getAllAdmins() view returns (address[])',
    'function getAdminInfo(address) view returns (tuple(uint8 role, uint256 joinTimestamp, bool isActive))',
    'function addAdmin(address newAdmin, uint8 role)',
    'function removeAdmin(address admin)',
    'function changeAdminRole(address admin, uint8 newRole)',
    'event AdminAdded(address indexed admin, uint8 role)',
    'event AdminRemoved(address indexed admin, uint8 role)',
    'event AdminRoleChanged(address indexed admin, uint8 oldRole, uint8 newRole)',
  ];

  // Load all admins
  const loadAdmins = useCallback(async () => {
    if (!provider) return;

    try {
      const contract = new ethers.Contract(
        TEAM_MANAGER_ADDRESS!,
        ADMIN_ABI,
        provider
      );

      const adminAddresses = await contract.getAllAdmins();
      const adminInfos: AdminInfo[] = [];

      for (const addr of adminAddresses) {
        const info = await contract.getAdminInfo(addr);
        adminInfos.push({
          address: addr,
          role: info.role,
          joinTimestamp: Number(info.joinTimestamp),
          isActive: info.isActive,
        });
      }

      setAdmins(adminInfos);
    } catch (error) {
      console.error('Failed to load admins:', error);
    }
  }, [provider]);

  useEffect(() => {
    loadAdmins();
  }, [loadAdmins]);

  // Add new admin
  const addAdmin = async (address: string, role: AdminRole) => {
    if (!provider) return;

    try {
      setIsLoading(FETCH_STATUS.WAIT_WALLET);
      const signer = await provider.getSigner();
      const contract = new ethers.Contract(
        TEAM_MANAGER_ADDRESS!,
        ADMIN_ABI,
        signer
      );

      const response = await contract.addAdmin(address, role);
      setIsLoading(FETCH_STATUS.WAIT_TX);
      setTx(response);
      await response.wait();
      setIsLoading(FETCH_STATUS.COMPLETED);

      // Reload admins
      await loadAdmins();
    } catch (error) {
      console.error('Failed to add admin:', error);
      setIsLoading(FETCH_STATUS.ERROR);
    }
  };

  // Remove admin
  const removeAdmin = async (address: string) => {
    if (!provider) return;

    try {
      setIsLoading(FETCH_STATUS.WAIT_WALLET);
      const signer = await provider.getSigner();
      const contract = new ethers.Contract(
        TEAM_MANAGER_ADDRESS!,
        ADMIN_ABI,
        signer
      );

      const response = await contract.removeAdmin(address);
      setIsLoading(FETCH_STATUS.WAIT_TX);
      setTx(response);
      await response.wait();
      setIsLoading(FETCH_STATUS.COMPLETED);

      // Reload admins
      await loadAdmins();
    } catch (error) {
      console.error('Failed to remove admin:', error);
      setIsLoading(FETCH_STATUS.ERROR);
    }
  };

  // Change admin role
  const changeAdminRole = async (address: string, newRole: AdminRole) => {
    if (!provider) return;

    try {
      setIsLoading(FETCH_STATUS.WAIT_WALLET);
      const signer = await provider.getSigner();
      const contract = new ethers.Contract(
        TEAM_MANAGER_ADDRESS!,
        ADMIN_ABI,
        signer
      );

      const response = await contract.changeAdminRole(address, newRole);
      setIsLoading(FETCH_STATUS.WAIT_TX);
      setTx(response);
      await response.wait();
      setIsLoading(FETCH_STATUS.COMPLETED);

      // Reload admins
      await loadAdmins();
    } catch (error) {
      console.error('Failed to change admin role:', error);
      setIsLoading(FETCH_STATUS.ERROR);
    }
  };

  return {
    admins,
    isLoading,
    setIsLoading,
    loadAdmins,
    addAdmin,
    removeAdmin,
    changeAdminRole,
  };
};

export default useAdmin;
