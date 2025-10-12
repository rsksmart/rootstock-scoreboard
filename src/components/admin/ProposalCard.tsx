'use client';
import React, { useState, useEffect } from 'react';
import Button from '../common/Button';
import { AdminAction, ActionType } from '@/hooks/useGovernance';
import { AdminRole } from '@/types/admin';

interface ProposalCardProps {
  action: AdminAction;
  userAddress: string;
  hasConfirmed: boolean;
  requiredConfirmations: number;
  onConfirm: (actionId: number) => void;
  onExecute: (actionId: number) => void;
  onCancel: (actionId: number) => void;
  canCancel: boolean;
}

export default function ProposalCard({
  action,
  userAddress,
  hasConfirmed,
  requiredConfirmations,
  onConfirm,
  onExecute,
  onCancel,
  canCancel,
}: ProposalCardProps) {
  const [timeRemaining, setTimeRemaining] = useState<string>('');

  useEffect(() => {
    const updateTime = () => {
      const now = Math.floor(Date.now() / 1000);
      const remaining = action.deadline - now;

      if (remaining <= 0) {
        setTimeRemaining('Expired');
        return;
      }

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
  }, [action.deadline]);

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
      case ActionType.REMOVE_ADMIN: return 'VOTE_ADMIN';
      case AdminRole.RECOVERY_ADMIN: return 'RECOVERY_ADMIN';
      case AdminRole.SUPER_ADMIN: return 'SUPER_ADMIN';
      default: return 'NONE';
    }
  };

  const getActionTypeColor = (type: ActionType): string => {
    switch (type) {
      case ActionType.ADD_ADMIN: return 'border-custom-green';
      case ActionType.REMOVE_ADMIN: return 'border-red-500';
      case ActionType.CHANGE_ROLE: return 'border-custom-orange';
      case ActionType.EMERGENCY_ACTION: return 'border-custom-pink';
      case ActionType.STAKE_SLASH: return 'border-red-600';
      default: return 'border-zinc-700';
    }
  };

  const canExecute = action.confirmations >= requiredConfirmations && !action.executed;
  const isProposer = action.proposer.toLowerCase() === userAddress.toLowerCase();

  return (
    <div className={`bg-black border-2 ${getActionTypeColor(action.actionType)} rounded-lg p-3 sm:p-4`}>
      {/* Header */}
      <div className="flex items-start justify-between mb-3">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1">
            <h3 className="font-bold text-sm sm:text-base text-white">
              #{action.id} {getActionTypeName(action.actionType)}
            </h3>
            {isProposer && (
              <span className="text-xs bg-custom-orange/20 text-custom-orange px-1.5 py-0.5 rounded">
                Your Proposal
              </span>
            )}
          </div>
          <p className="text-xs text-zinc-400">
            Proposed by {action.proposer.slice(0, 6)}...{action.proposer.slice(-4)}
          </p>
        </div>
        <div className="text-right">
          <div className="text-xs text-zinc-500">Expires in</div>
          <div className="text-sm font-semibold text-white">{timeRemaining}</div>
        </div>
      </div>

      {/* Details */}
      <div className="bg-zinc-900/50 rounded p-2 sm:p-3 mb-3 space-y-1.5">
        <div className="flex items-center gap-2">
          <span className="text-xs text-zinc-500 w-20">Target:</span>
          <span className="text-xs sm:text-sm font-mono text-white break-all">
            {action.target}
          </span>
        </div>

        {action.actionType === ActionType.ADD_ADMIN || action.actionType === ActionType.CHANGE_ROLE ? (
          <div className="flex items-center gap-2">
            <span className="text-xs text-zinc-500 w-20">Role:</span>
            <span className="text-xs sm:text-sm font-semibold text-custom-green">
              {getRoleName(action.newRole)}
            </span>
          </div>
        ) : null}

        {action.reason && (
          <div className="flex items-start gap-2">
            <span className="text-xs text-zinc-500 w-20">Reason:</span>
            <span className="text-xs sm:text-sm text-zinc-300 flex-1">
              {action.reason}
            </span>
          </div>
        )}
      </div>

      {/* Confirmation Progress */}
      <div className="mb-3">
        <div className="flex items-center justify-between mb-1">
          <span className="text-xs text-zinc-400">Confirmations</span>
          <span className="text-xs font-semibold text-white">
            {action.confirmations}/{requiredConfirmations}
          </span>
        </div>
        <div className="w-full bg-zinc-800 h-1.5 rounded-full overflow-hidden">
          <div
            className={`h-full transition-all ${
              canExecute ? 'bg-custom-green' : 'bg-custom-orange'
            }`}
            style={{ width: `${(action.confirmations / requiredConfirmations) * 100}%` }}
          />
        </div>
        {hasConfirmed && (
          <div className="mt-1 text-xs text-custom-green">✓ You confirmed this proposal</div>
        )}
      </div>

      {/* Actions */}
      <div className="flex flex-wrap gap-2">
        {!hasConfirmed && !action.executed && (
          <Button
            onClick={() => onConfirm(action.id)}
            className="bg-custom-orange hover:bg-custom-orange/80 text-xs sm:text-sm px-3 py-1.5 flex-1 sm:flex-none"
          >
            Confirm
          </Button>
        )}

        {canExecute && (
          <Button
            onClick={() => onExecute(action.id)}
            className="bg-custom-green hover:bg-custom-green/80 text-black text-xs sm:text-sm px-3 py-1.5 flex-1 sm:flex-none font-semibold"
          >
            Execute
          </Button>
        )}

        {canCancel && !action.executed && (
          <Button
            onClick={() => onCancel(action.id)}
            className="bg-red-600 hover:bg-red-700 text-xs sm:text-sm px-3 py-1.5"
          >
            Cancel
          </Button>
        )}
      </div>
    </div>
  );
}
