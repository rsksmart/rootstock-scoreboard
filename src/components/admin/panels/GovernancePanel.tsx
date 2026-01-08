'use client';
import React, { useState, useEffect } from 'react';
import Button from '../../common/Button';
import Input from '../../common/Input';
import ProposalCard from '../ProposalCard';
import useGovernance, { ActionType } from '@/hooks/useGovernance';
import { AdminRole } from '@/types/admin';
import { ethers } from 'ethers';

interface GovernancePanelProps {
  governanceContract: ethers.Contract | null;
  userAddress: string;
  userRole: AdminRole;
}

export default function GovernancePanel({
  governanceContract,
  userAddress,
  userRole,
}: GovernancePanelProps) {
  const {
    pendingActions,
    requiredConfirmations,
    proposeAddAdmin,
    proposeRemoveAdmin,
    proposeRoleChange,
    confirmAction,
    executeAction,
    cancelAction,
    hasConfirmed,
    loadPendingActions,
  } = useGovernance(governanceContract);

  const [showProposalForm, setShowProposalForm] = useState(false);
  const [proposalType, setProposalType] = useState<ActionType>(ActionType.ADD_ADMIN);
  const [targetAddress, setTargetAddress] = useState('');
  const [selectedRole, setSelectedRole] = useState<AdminRole>(AdminRole.TEAM_MANAGER);
  const [reason, setReason] = useState('');
  const [confirmedActions, setConfirmedActions] = useState<Set<number>>(new Set());

  useEffect(() => {
    const checkConfirmations = async () => {
      if (!governanceContract || !userAddress || pendingActions.length === 0) return;

      const confirmed = new Set<number>();
      for (const action of pendingActions) {
        const hasUserConfirmed = await hasConfirmed(action.id, userAddress);
        if (hasUserConfirmed) {
          confirmed.add(action.id);
        }
      }
      setConfirmedActions(confirmed);
    };

    checkConfirmations();
  }, [pendingActions, governanceContract, userAddress, hasConfirmed]);

  const handleSubmitProposal = async () => {
    if (!ethers.isAddress(targetAddress) || !reason.trim()) {
      alert('Please provide a valid address and reason');
      return;
    }

    if (proposalType === ActionType.ADD_ADMIN) {
      await proposeAddAdmin(targetAddress, selectedRole, reason);
    } else if (proposalType === ActionType.REMOVE_ADMIN) {
      await proposeRemoveAdmin(targetAddress, reason);
    } else if (proposalType === ActionType.CHANGE_ROLE) {
      await proposeRoleChange(targetAddress, selectedRole, reason);
    }

    setShowProposalForm(false);
    setTargetAddress('');
    setReason('');
  };

  const canPropose = userRole === AdminRole.SUPER_ADMIN;
  const canCancel = userRole === AdminRole.SUPER_ADMIN;

  return (
    <div className="w-full">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="bg-custom-orange font-bold text-lg sm:text-xl text-black w-max px-1 mb-2">
            MULTI-SIG GOVERNANCE
          </h2>
          <p className="text-xs sm:text-sm text-zinc-400">
            Requires {requiredConfirmations} confirmations to execute
          </p>
        </div>
        {canPropose && (
          <Button
            onClick={() => setShowProposalForm(!showProposalForm)}
            className="bg-custom-green hover:bg-custom-green/80 text-black text-sm px-4 py-2 font-semibold whitespace-nowrap"
          >
            {showProposalForm ? 'Cancel' : '+ New Proposal'}
          </Button>
        )}
      </div>

      {/* Proposal Form */}
      {showProposalForm && canPropose && (
        <div className="bg-zinc-900 border border-zinc-700 rounded-lg p-3 sm:p-4 mb-4">
          <h3 className="font-semibold text-sm sm:text-base mb-3">Create New Proposal</h3>

          <div className="space-y-3">
            {/* Proposal Type */}
            <div>
              <label className="text-xs sm:text-sm text-zinc-400 mb-1 block">Proposal Type</label>
              <select
                value={proposalType}
                onChange={(e) => setProposalType(Number(e.target.value) as ActionType)}
                className="w-full px-3 py-2 bg-black border border-zinc-700 rounded-lg text-white text-xs sm:text-sm focus:outline-none focus:ring-1 focus:ring-custom-orange"
                style={{ height: '32px' }}
              >
                <option value={ActionType.ADD_ADMIN}>Add Admin</option>
                <option value={ActionType.REMOVE_ADMIN}>Remove Admin</option>
                <option value={ActionType.CHANGE_ROLE}>Change Role</option>
              </select>
            </div>

            {/* Target Address */}
            <div>
              <label className="text-xs sm:text-sm text-zinc-400 mb-1 block">Target Address</label>
              <Input
                value={targetAddress}
                onChange={(e) => setTargetAddress(e.target.value)}
                name="targetAddress"
                placeholder="0x..."
                height={32}
              />
            </div>

            {/* Role Selection (for ADD_ADMIN and CHANGE_ROLE) */}
            {(proposalType === ActionType.ADD_ADMIN || proposalType === ActionType.CHANGE_ROLE) && (
              <div>
                <label className="text-xs sm:text-sm text-zinc-400 mb-1 block">Admin Role</label>
                <select
                  value={selectedRole}
                  onChange={(e) => setSelectedRole(Number(e.target.value) as AdminRole)}
                  className="w-full px-3 py-2 bg-black border border-zinc-700 rounded-lg text-white text-xs sm:text-sm focus:outline-none focus:ring-1 focus:ring-custom-orange"
                  style={{ height: '32px' }}
                >
                  <option value={AdminRole.TEAM_MANAGER}>TEAM_MANAGER</option>
                  <option value={AdminRole.VOTE_ADMIN}>VOTE_ADMIN</option>
                  <option value={AdminRole.RECOVERY_ADMIN}>RECOVERY_ADMIN</option>
                  <option value={AdminRole.SUPER_ADMIN}>SUPER_ADMIN</option>
                </select>
              </div>
            )}

            {/* Reason */}
            <div>
              <label className="text-xs sm:text-sm text-zinc-400 mb-1 block">Reason</label>
              <textarea
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                placeholder="Explain the reason for this proposal..."
                className="w-full px-3 py-2 bg-black border border-zinc-700 rounded-lg text-white text-xs sm:text-sm focus:outline-none focus:ring-1 focus:ring-custom-orange resize-none"
                rows={3}
              />
            </div>

            <Button
              onClick={handleSubmitProposal}
              width={undefined}
              height={36}
              className="w-full bg-custom-orange hover:bg-custom-orange/80 text-sm font-semibold whitespace-nowrap"
            >
              Submit Proposal
            </Button>
          </div>
        </div>
      )}

      {/* Pending Proposals */}
      <div className="space-y-3">
        {pendingActions.length === 0 ? (
          <div className="bg-zinc-900/50 border border-zinc-800 rounded-lg p-6 text-center">
            <p className="text-zinc-500 text-sm">No pending proposals</p>
          </div>
        ) : (
          pendingActions.map((action) => (
            <ProposalCard
              key={action.id}
              action={action}
              userAddress={userAddress}
              hasConfirmed={confirmedActions.has(action.id)}
              requiredConfirmations={requiredConfirmations}
              onConfirm={confirmAction}
              onExecute={executeAction}
              onCancel={cancelAction}
              canCancel={canCancel}
            />
          ))
        )}
      </div>

      {/* Refresh Button */}
      {pendingActions.length > 0 && (
        <div className="mt-4 text-center">
          <Button
            onClick={loadPendingActions}
            outline
            className="text-xs sm:text-sm px-4 py-1.5"
          >
            Refresh Proposals
          </Button>
        </div>
      )}
    </div>
  );
}
