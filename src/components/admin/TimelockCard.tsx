'use client';
import React, { useState, useEffect } from 'react';
import Button from '../common/Button';
import { TimeLock, ActionType } from '@/hooks/useGovernance';
import { AdminRole } from '@/types/admin';

interface TimelockCardProps {
  timeLock: TimeLock;
  onExecute: (lockId: number) => void;
  onCancel: (lockId: number) => void;
  canCancel: boolean;
}

export default function TimelockCard({
  timeLock,
  onExecute,
  onCancel,
  canCancel,
}: TimelockCardProps) {
  const [timeRemaining, setTimeRemaining] = useState<string>('');
  const [isUnlocked, setIsUnlocked] = useState(false);

  useEffect(() => {
    const updateTime = () => {
      const now = Math.floor(Date.now() / 1000);
      const remaining = timeLock.unlockTime - now;

      if (remaining <= 0) {
        setTimeRemaining('Ready to execute');
        setIsUnlocked(true);
        return;
      }

      setIsUnlocked(false);
      const days = Math.floor(remaining / 86400);
      const hours = Math.floor((remaining % 86400) / 3600);
      const minutes = Math.floor((remaining % 3600) / 60);

      if (days > 0) {
        setTimeRemaining(`${days}d ${hours}h`);
      } else if (hours > 0) {
        setTimeRemaining(`${hours}h ${minutes}m`);
      } else {
        setTimeRemaining(`${minutes}m`);
      }
    };

    updateTime();
    const interval = setInterval(updateTime, 60000);
    return () => clearInterval(interval);
  }, [timeLock.unlockTime]);

  const getActionTypeName = (type: ActionType): string => {
    switch (type) {
      case ActionType.ADD_ADMIN: return 'Add Admin';
      case ActionType.REMOVE_ADMIN: return 'Remove Admin';
      case ActionType.CHANGE_ROLE: return 'Change Role';
      case ActionType.EMERGENCY_ACTION: return 'Emergency Action';
      case ActionType.STAKE_SLASH: return 'Slash Stake';
      default: return 'Unknown';
    }
  };

  const getRoleName = (role: AdminRole): string => {
    switch (role) {
      case AdminRole.TEAM_MANAGER: return 'TEAM_MANAGER';
      case AdminRole.VOTE_ADMIN: return 'VOTE_ADMIN';
      case AdminRole.RECOVERY_ADMIN: return 'RECOVERY_ADMIN';
      case AdminRole.SUPER_ADMIN: return 'SUPER_ADMIN';
      default: return 'NONE';
    }
  };

  const unlockDate = new Date(timeLock.unlockTime * 1000);

  return (
    <div className={`bg-black border-2 ${isUnlocked ? 'border-custom-green' : 'border-custom-orange'} rounded-lg p-3 sm:p-4`}>
      {/* Header */}
      <div className="flex items-start justify-between mb-3">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1">
            <span className="text-lg">🕐</span>
            <h3 className="font-bold text-sm sm:text-base text-white">
              #{timeLock.id} {getActionTypeName(timeLock.action.actionType)}
            </h3>
          </div>
          <p className="text-xs text-zinc-400">
            Proposed by {timeLock.action.proposer.slice(0, 6)}...{timeLock.action.proposer.slice(-4)}
          </p>
        </div>
        <div className="text-right">
          <div className={`text-xs font-semibold ${isUnlocked ? 'text-custom-green' : 'text-custom-orange'}`}>
            {timeRemaining}
          </div>
          <div className="text-xs text-zinc-500 mt-0.5">
            {unlockDate.toLocaleDateString()}
          </div>
        </div>
      </div>

      {/* Details */}
      <div className="bg-zinc-900/50 rounded p-2 sm:p-3 mb-3 space-y-1.5">
        <div className="flex items-center gap-2">
          <span className="text-xs text-zinc-500 w-20">Target:</span>
          <span className="text-xs sm:text-sm font-mono text-white break-all">
            {timeLock.action.target}
          </span>
        </div>

        {timeLock.action.actionType === ActionType.ADD_ADMIN && (
          <div className="flex items-center gap-2">
            <span className="text-xs text-zinc-500 w-20">Role:</span>
            <span className="text-xs sm:text-sm font-semibold text-custom-green">
              {getRoleName(timeLock.action.newRole)}
            </span>
          </div>
        )}

        {timeLock.action.reason && (
          <div className="flex items-start gap-2">
            <span className="text-xs text-zinc-500 w-20">Reason:</span>
            <span className="text-xs sm:text-sm text-zinc-300 flex-1">
              {timeLock.action.reason}
            </span>
          </div>
        )}
      </div>

      {/* Status Indicator */}
      {isUnlocked ? (
        <div className="bg-custom-green/10 border border-custom-green/30 rounded p-2 mb-3">
          <p className="text-xs text-custom-green font-semibold">
            ✓ Time lock expired - Ready to execute
          </p>
        </div>
      ) : (
        <div className="bg-custom-orange/10 border border-custom-orange/30 rounded p-2 mb-3">
          <p className="text-xs text-custom-orange">
            ⏳ Locked until {unlockDate.toLocaleString()}
          </p>
        </div>
      )}

      {/* Actions */}
      <div className="flex flex-wrap gap-2">
        {isUnlocked && (
          <Button
            onClick={() => onExecute(timeLock.id)}
            className="bg-custom-green hover:bg-custom-green/80 text-black text-xs sm:text-sm px-3 py-1.5 flex-1 sm:flex-none font-semibold"
          >
            Execute
          </Button>
        )}

        {canCancel && (
          <Button
            onClick={() => onCancel(timeLock.id)}
            className="bg-red-600 hover:bg-red-700 text-xs sm:text-sm px-3 py-1.5"
          >
            Cancel
          </Button>
        )}
      </div>
    </div>
  );
}
