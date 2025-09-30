/**
 * useAdminRole Hook
 * Manages admin role detection and checking
 */

'use client';
import { useCallback, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { AdminRole, AdminInfo, VotingStatus } from '@/types/admin';
import { TEAM_MANAGER_ADDRESS } from '@/constants';
import { TeamsManager__factory } from '@/typechain-types';

export const useAdminRole = () => {
  const {
    address,
    provider,
    userRole,
    setUserRole,
    isAdmin,
    setIsAdmin,
    adminInfo,
    setAdminInfo,
    roleLoading,
    setRoleLoading,
    votingStatus,
    setVotingStatus,
    votingStatusLoading,
    setVotingStatusLoading,
    hasRole
  } = useAuth();

  // Check user's admin role
  const checkUserRole = useCallback(async () => {
    if (!address || !provider || !TEAM_MANAGER_ADDRESS) {
      setUserRole(AdminRole.NONE);
      setIsAdmin(false);
      setAdminInfo(null);
      return;
    }

    try {
      setRoleLoading(true);
      const signer = await provider.getSigner();
      const contract = TeamsManager__factory.connect(TEAM_MANAGER_ADDRESS, signer);

      // Get role and admin info from contract
      const role = await contract.getAdminRole(address);
      const info = await contract.getAdminInfo(address);

      const adminData: AdminInfo = {
        role: Number(role) as AdminRole,
        joinTimestamp: Number(info.joinTimestamp),
        isActive: info.isActive
      };

      setUserRole(adminData.role);
      setIsAdmin(info.isActive && adminData.role !== AdminRole.NONE);
      setAdminInfo(adminData);

      console.log(`✅ Role detected: ${AdminRole[adminData.role]} (${adminData.role})`);
    } catch (error) {
      console.error('❌ Failed to check admin role:', error);
      setUserRole(AdminRole.NONE);
      setIsAdmin(false);
      setAdminInfo(null);
    } finally {
      setRoleLoading(false);
    }
  }, [address, provider, setUserRole, setIsAdmin, setAdminInfo, setRoleLoading]);

  // Fetch voting status
  const fetchVotingStatus = useCallback(async () => {
    if (!provider || !TEAM_MANAGER_ADDRESS) {
      setVotingStatus(null);
      return;
    }

    try {
      setVotingStatusLoading(true);
      const signer = await provider.getSigner();
      const contract = TeamsManager__factory.connect(TEAM_MANAGER_ADDRESS, signer);

      const status = await contract.getVotingStatus();

      const votingData: VotingStatus = {
        isActive: status.isActive,
        startTime: Number(status.startTime),
        endTime: Number(status.endTime),
        totalVotes: Number(status.totalVotesCount),
        votingToken: status.votingToken
      };

      setVotingStatus(votingData);
      console.log(`✅ Voting status: ${votingData.isActive ? 'Active' : 'Inactive'}`);
    } catch (error) {
      console.error('❌ Failed to fetch voting status:', error);
      setVotingStatus(null);
    } finally {
      setVotingStatusLoading(false);
    }
  }, [provider, setVotingStatus, setVotingStatusLoading]);

  // Auto-check role and voting status when address changes
  useEffect(() => {
    if (address && provider) {
      checkUserRole();
      fetchVotingStatus();
    }
  }, [address, provider, checkUserRole, fetchVotingStatus]);

  return {
    userRole,
    isAdmin,
    adminInfo,
    roleLoading,
    checkUserRole,
    hasRole,
    votingStatus,
    votingStatusLoading,
    fetchVotingStatus
  };
};

export default useAdminRole;