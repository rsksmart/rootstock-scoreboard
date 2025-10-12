'use client';
import { useState, useEffect, useCallback } from 'react';
import { ethers } from 'ethers';
import { FETCH_STATUS } from '@/constants';
import { AdminRole } from '@/types/admin';

export enum ActionType {
  ADD_ADMIN = 0,
  REMOVE_ADMIN = 1,
  CHANGE_ROLE = 2,
  EMERGENCY_ACTION = 3,
  STAKE_SLASH = 4,
}

export interface AdminAction {
  id: number;
  actionType: ActionType;
  proposer: string;
  target: string;
  newRole: AdminRole;
  amount: bigint;
  data: string;
  confirmations: number;
  requiredConfirmations: number;
  deadline: number;
  executed: boolean;
  cancelled: boolean;
  reason: string;
}

export interface TimeLock {
  id: number;
  action: AdminAction;
  unlockTime: number;
  executed: boolean;
  cancelled: boolean;
}

export default function useGovernance(governanceContract: ethers.Contract | null) {
  const [isLoading, setIsLoading] = useState<number>(FETCH_STATUS.IDLE);
  const [tx, setTx] = useState<ethers.ContractTransactionResponse | null>(null);
  const [pendingActions, setPendingActions] = useState<AdminAction[]>([]);
  const [timeLocks, setTimeLocks] = useState<TimeLock[]>([]);
  const [requiredConfirmations, setRequiredConfirmations] = useState<number>(2);

  // Load all pending actions
  const loadPendingActions = useCallback(async () => {
    if (!governanceContract) return;

    try {
      const count = await governanceContract.getPendingActionsCount();
      const actions: AdminAction[] = [];

      for (let i = 1; i <= count; i++) {
        const action = await governanceContract.getPendingAction(i);

        if (!action.executed && !action.cancelled) {
          actions.push({
            id: Number(action.id),
            actionType: Number(action.actionType),
            proposer: action.proposer,
            target: action.target,
            newRole: Number(action.newRole),
            amount: action.amount,
            data: action.data,
            confirmations: Number(action.confirmations),
            requiredConfirmations: Number(action.requiredConfirmations),
            deadline: Number(action.deadline),
            executed: action.executed,
            cancelled: action.cancelled,
            reason: action.reason,
          });
        }
      }

      setPendingActions(actions);
    } catch (error) {
      console.error('Failed to load pending actions:', error);
    }
  }, [governanceContract]);

  // Load time-locks
  const loadTimeLocks = useCallback(async () => {
    if (!governanceContract) return;

    try {
      const nextId = await governanceContract.nextTimeLockId();
      const locks: TimeLock[] = [];

      for (let i = 1; i < nextId; i++) {
        const lock = await governanceContract.getTimeLock(i);

        if (!lock.executed && !lock.cancelled) {
          locks.push({
            id: Number(lock.id),
            action: {
              id: Number(lock.action.id),
              actionType: Number(lock.action.actionType),
              proposer: lock.action.proposer,
              target: lock.action.target,
              newRole: Number(lock.action.newRole),
              amount: lock.action.amount,
              data: lock.action.data,
              confirmations: Number(lock.action.confirmations),
              requiredConfirmations: Number(lock.action.requiredConfirmations),
              deadline: Number(lock.action.deadline),
              executed: lock.action.executed,
              cancelled: lock.action.cancelled,
              reason: lock.action.reason,
            },
            unlockTime: Number(lock.unlockTime),
            executed: lock.executed,
            cancelled: lock.cancelled,
          });
        }
      }

      setTimeLocks(locks);
    } catch (error) {
      console.error('Failed to load time locks:', error);
    }
  }, [governanceContract]);

  // Load required confirmations
  const loadRequiredConfirmations = useCallback(async () => {
    if (!governanceContract) return;

    try {
      const required = await governanceContract.requiredConfirmations();
      setRequiredConfirmations(Number(required));
    } catch (error) {
      console.error('Failed to load required confirmations:', error);
    }
  }, [governanceContract]);

  // Propose add admin
  const proposeAddAdmin = async (address: string, role: AdminRole, reason: string) => {
    if (!governanceContract) return;

    try {
      setIsLoading(FETCH_STATUS.WAIT_WALLET);
      const response = await governanceContract.proposeAddAdmin(address, role, reason);
      setIsLoading(FETCH_STATUS.WAIT_TX);
      setTx(response);
      await response.wait();
      setIsLoading(FETCH_STATUS.COMPLETED);
      await loadPendingActions();
    } catch (error) {
      console.error('Failed to propose add admin:', error);
      setIsLoading(FETCH_STATUS.ERROR);
    }
  };

  // Propose remove admin
  const proposeRemoveAdmin = async (address: string, reason: string) => {
    if (!governanceContract) return;

    try {
      setIsLoading(FETCH_STATUS.WAIT_WALLET);
      const response = await governanceContract.proposeRemoveAdmin(address, reason);
      setIsLoading(FETCH_STATUS.WAIT_TX);
      setTx(response);
      await response.wait();
      setIsLoading(FETCH_STATUS.COMPLETED);
      await loadPendingActions();
    } catch (error) {
      console.error('Failed to propose remove admin:', error);
      setIsLoading(FETCH_STATUS.ERROR);
    }
  };

  // Propose role change
  const proposeRoleChange = async (address: string, newRole: AdminRole, reason: string) => {
    if (!governanceContract) return;

    try {
      setIsLoading(FETCH_STATUS.WAIT_WALLET);
      const response = await governanceContract.proposeRoleChange(address, newRole, reason);
      setIsLoading(FETCH_STATUS.WAIT_TX);
      setTx(response);
      await response.wait();
      setIsLoading(FETCH_STATUS.COMPLETED);
      await loadPendingActions();
    } catch (error) {
      console.error('Failed to propose role change:', error);
      setIsLoading(FETCH_STATUS.ERROR);
    }
  };

  // Confirm action
  const confirmAction = async (actionId: number) => {
    if (!governanceContract) return;

    try {
      setIsLoading(FETCH_STATUS.WAIT_WALLET);
      const response = await governanceContract.confirmAction(actionId);
      setIsLoading(FETCH_STATUS.WAIT_TX);
      setTx(response);
      await response.wait();
      setIsLoading(FETCH_STATUS.COMPLETED);
      await loadPendingActions();
    } catch (error) {
      console.error('Failed to confirm action:', error);
      setIsLoading(FETCH_STATUS.ERROR);
    }
  };

  // Execute action
  const executeAction = async (actionId: number) => {
    if (!governanceContract) return;

    try {
      setIsLoading(FETCH_STATUS.WAIT_WALLET);
      const response = await governanceContract.executeAction(actionId);
      setIsLoading(FETCH_STATUS.WAIT_TX);
      setTx(response);
      await response.wait();
      setIsLoading(FETCH_STATUS.COMPLETED);
      await loadPendingActions();
    } catch (error) {
      console.error('Failed to execute action:', error);
      setIsLoading(FETCH_STATUS.ERROR);
    }
  };

  // Cancel action
  const cancelAction = async (actionId: number) => {
    if (!governanceContract) return;

    try {
      setIsLoading(FETCH_STATUS.WAIT_WALLET);
      const response = await governanceContract.cancelAction(actionId);
      setIsLoading(FETCH_STATUS.WAIT_TX);
      setTx(response);
      await response.wait();
      setIsLoading(FETCH_STATUS.COMPLETED);
      await loadPendingActions();
    } catch (error) {
      console.error('Failed to cancel action:', error);
      setIsLoading(FETCH_STATUS.ERROR);
    }
  };

  // Schedule time-locked admin addition
  const scheduleTimeLockAddAdmin = async (address: string, role: AdminRole, delayHours: number) => {
    if (!governanceContract) return;

    try {
      setIsLoading(FETCH_STATUS.WAIT_WALLET);
      const delaySeconds = delayHours * 3600;
      const response = await governanceContract.scheduleTimeLockAddAdmin(address, role, delaySeconds);
      setIsLoading(FETCH_STATUS.WAIT_TX);
      setTx(response);
      await response.wait();
      setIsLoading(FETCH_STATUS.COMPLETED);
      await loadTimeLocks();
    } catch (error) {
      console.error('Failed to schedule time lock:', error);
      setIsLoading(FETCH_STATUS.ERROR);
    }
  };

  // Execute time lock
  const executeTimeLock = async (lockId: number) => {
    if (!governanceContract) return;

    try {
      setIsLoading(FETCH_STATUS.WAIT_WALLET);
      const response = await governanceContract.executeTimeLock(lockId);
      setIsLoading(FETCH_STATUS.WAIT_TX);
      setTx(response);
      await response.wait();
      setIsLoading(FETCH_STATUS.COMPLETED);
      await loadTimeLocks();
    } catch (error) {
      console.error('Failed to execute time lock:', error);
      setIsLoading(FETCH_STATUS.ERROR);
    }
  };

  // Cancel time lock
  const cancelTimeLock = async (lockId: number) => {
    if (!governanceContract) return;

    try {
      setIsLoading(FETCH_STATUS.WAIT_WALLET);
      const response = await governanceContract.cancelTimeLock(lockId);
      setIsLoading(FETCH_STATUS.WAIT_TX);
      setTx(response);
      await response.wait();
      setIsLoading(FETCH_STATUS.COMPLETED);
      await loadTimeLocks();
    } catch (error) {
      console.error('Failed to cancel time lock:', error);
      setIsLoading(FETCH_STATUS.ERROR);
    }
  };

  // Check if user has confirmed an action
  const hasConfirmed = async (actionId: number, address: string): Promise<boolean> => {
    if (!governanceContract) return false;

    try {
      return await governanceContract.actionConfirmations(actionId, address);
    } catch (error) {
      console.error('Failed to check confirmation:', error);
      return false;
    }
  };

  useEffect(() => {
    if (governanceContract) {
      loadPendingActions();
      loadTimeLocks();
      loadRequiredConfirmations();
    }
  }, [governanceContract, loadPendingActions, loadTimeLocks, loadRequiredConfirmations]);

  return {
    isLoading,
    tx,
    pendingActions,
    timeLocks,
    requiredConfirmations,
    proposeAddAdmin,
    proposeRemoveAdmin,
    proposeRoleChange,
    confirmAction,
    executeAction,
    cancelAction,
    scheduleTimeLockAddAdmin,
    executeTimeLock,
    cancelTimeLock,
    hasConfirmed,
    loadPendingActions,
    loadTimeLocks,
  };
}
