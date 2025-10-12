'use client';
import React, { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import useManager from '@/hooks/useManager';
import { AdminRole } from '@/types/admin';
import RoleGuard from '@/components/guards/RoleGuard';
import { FETCH_STATUS } from '@/constants';
import Button from '@/components/common/Button';
import TypedConfirmDialog from '@/components/dialog/TypedConfirmDialog';

const VotingControlPanel: React.FC = () => {
  const { votingStatus, fetchVotingStatus, userRole } = useAuth();
  const { enableVoting, disableVoting, setVotingLimits, resetSystem, isLoading } = useManager();

  // Voting period state
  const [duration, setDuration] = useState<string>('');
  const [durationType, setDurationType] = useState<'hours' | 'days'>('days');

  // Limits state
  const [minAmount, setMinAmount] = useState<string>('1');
  const [maxAmount, setMaxAmount] = useState<string>('10000');

  // UI state
  const [showLimitsForm, setShowLimitsForm] = useState(false);
  const [showStartForm, setShowStartForm] = useState(false);
  const [showResetDialog, setShowResetDialog] = useState(false);

  const handleEnableVoting = async () => {
    if (!duration) {
      alert('Please enter a duration');
      return;
    }

    const durationSeconds =
      durationType === 'days'
        ? parseInt(duration) * 86400
        : parseInt(duration) * 3600;

    await enableVoting(durationSeconds);
    setShowStartForm(false);
    setDuration('');
    await fetchVotingStatus();
  };

  const handleDisableVoting = async () => {
    if (!confirm('Are you sure you want to disable voting?')) return;
    await disableVoting();
    await fetchVotingStatus();
  };

  const handleResetSystem = async () => {
    await resetSystem();
    setShowResetDialog(false);
    await fetchVotingStatus();
  };

  const handleSetLimits = async () => {
    if (!minAmount || !maxAmount) {
      alert('Please enter both minimum and maximum amounts');
      return;
    }

    if (parseFloat(minAmount) >= parseFloat(maxAmount)) {
      alert('Maximum amount must be greater than minimum');
      return;
    }

    await setVotingLimits(minAmount, maxAmount);
    setShowLimitsForm(false);
    await fetchVotingStatus();
  };

  return (
    <RoleGuard requiredRole={AdminRole.VOTE_ADMIN}>
      <div className="bg-zinc-900 border border-zinc-800 rounded-lg space-y-6">
        {/* Header */}
        <div className="p-4 sm:p-6 border-b border-zinc-800">
          <div className="flex items-center gap-3 mb-2">
            <span className="text-2xl">🗳️</span>
            <h2 className="text-xl sm:text-2xl font-bold text-white">
              Voting Control Panel
            </h2>
          </div>
          <p className="text-sm text-zinc-400">
            Manage voting periods and configuration
          </p>
        </div>

        <div className="p-4 sm:p-6 space-y-6">
          {/* Current Status Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
            <div className="bg-black border border-zinc-800 rounded-lg p-4">
              <div className="text-xs sm:text-sm text-zinc-500 mb-2">Status</div>
              <div
                className={`text-lg sm:text-xl font-bold ${
                  votingStatus?.isActive ? 'text-custom-green' : 'text-zinc-600'
                }`}
              >
                {votingStatus?.isActive ? '● Active' : '○ Inactive'}
              </div>
            </div>

            <div className="bg-black border border-zinc-800 rounded-lg p-4">
              <div className="text-xs sm:text-sm text-zinc-500 mb-2">Total Votes</div>
              <div className="text-lg sm:text-xl font-bold text-white">
                {votingStatus?.totalVotes.toLocaleString() || '0'}
              </div>
            </div>

            <div className="bg-black border border-zinc-800 rounded-lg p-4 sm:col-span-2 lg:col-span-1">
              <div className="text-xs sm:text-sm text-zinc-500 mb-2">Voting Token</div>
              <div className="text-xs font-mono text-zinc-400 truncate">
                {votingStatus?.votingToken
                  ? `${votingStatus.votingToken.slice(0, 10)}...${votingStatus.votingToken.slice(-8)}`
                  : 'Not set'}
              </div>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="space-y-3">
            <h3 className="font-semibold text-sm text-zinc-300 uppercase tracking-wider">
              Quick Actions
            </h3>

            <div className="flex flex-col sm:flex-row gap-3">
              {!votingStatus?.isActive ? (
                <Button width={0}
                  onClick={() => setShowStartForm(!showStartForm)} width={0}
                  variant="secondary"
                  outline
                  className={`w-full sm:flex-1 ${showStartForm ? 'bg-custom-green/10 border-custom-green' : ''}`}
                >
                  {showStartForm ? 'Hide Form' : 'Start Voting'}
                </Button>
              ) : (
                <Button width={0}
                  onClick={handleDisableVoting}
                  variant="secondary"
                  outline
                  className="w-full sm:flex-1 border-red-500 text-red-500 hover:bg-red-500/10"
                >
                  Stop Voting
                </Button>
              )}

              <Button width={0}
                onClick={() => setShowLimitsForm(!showLimitsForm)}
                outline
                className={`w-full sm:flex-1 ${showLimitsForm ? 'bg-custom-green/10 border-custom-green' : ''}`}
              >
                {showLimitsForm ? 'Hide Limits' : 'Configure Limits'}
              </Button>
            </div>
          </div>

          {/* Start Voting Form */}
          {showStartForm && (
            <div className="border-t border-zinc-800 pt-6 space-y-4">
              <h4 className="font-semibold text-white text-base sm:text-lg">
                Start Voting Period
              </h4>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-zinc-400 mb-2">
                    Duration
                  </label>
                  <input
                    type="number"
                    value={duration}
                    onChange={(e) => setDuration(e.target.value)}
                    placeholder="Enter duration"
                    className="w-full px-3 py-2 bg-black border border-zinc-700 rounded-lg focus:ring-2 focus:ring-custom-green focus:border-transparent text-white placeholder-zinc-600"
                    min="1"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-zinc-400 mb-2">
                    Unit
                  </label>
                  <select
                    value={durationType}
                    onChange={(e) =>
                      setDurationType(e.target.value as 'hours' | 'days')
                    }
                    className="w-full px-3 py-2 bg-black border border-zinc-700 rounded-lg focus:ring-2 focus:ring-custom-green focus:border-transparent text-white"
                  >
                    <option value="hours">Hours</option>
                    <option value="days">Days</option>
                  </select>
                </div>
              </div>

              <div className="bg-custom-green/10 border border-custom-green/20 rounded-lg p-3 text-sm text-zinc-300">
                ℹ️ Set duration to 0 for unlimited voting period
              </div>

              <div className="flex flex-col sm:flex-row gap-3">
                <Button width={0}
                  onClick={handleEnableVoting}
                  variant="secondary"
                  outline
                  className="w-full sm:flex-1"
                >
                  {isLoading !== FETCH_STATUS.INIT
                    ? 'Processing...'
                    : 'Confirm & Start'}
                </Button>
                <Button width={0}
                  onClick={() => setShowStartForm(false)}
                  outline
                  className="w-full sm:flex-1"
                >
                  Cancel
                </Button>
              </div>
            </div>
          )}

          {/* Configure Limits Form */}
          {showLimitsForm && (
            <div className="border-t border-zinc-800 pt-6 space-y-4">
              <h4 className="font-semibold text-white text-base sm:text-lg">
                Configure Voting Limits
              </h4>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-zinc-400 mb-2">
                    Minimum Vote Amount (tokens)
                  </label>
                  <input
                    type="number"
                    value={minAmount}
                    onChange={(e) => setMinAmount(e.target.value)}
                    placeholder="1"
                    className="w-full px-3 py-2 bg-black border border-zinc-700 rounded-lg focus:ring-2 focus:ring-custom-green focus:border-transparent text-white placeholder-zinc-600"
                    min="0"
                    step="0.01"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-zinc-400 mb-2">
                    Maximum Vote Amount (tokens)
                  </label>
                  <input
                    type="number"
                    value={maxAmount}
                    onChange={(e) => setMaxAmount(e.target.value)}
                    placeholder="10000"
                    className="w-full px-3 py-2 bg-black border border-zinc-700 rounded-lg focus:ring-2 focus:ring-custom-green focus:border-transparent text-white placeholder-zinc-600"
                    min="0"
                    step="0.01"
                  />
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-3">
                <Button width={0}
                  onClick={handleSetLimits}
                  variant="secondary"
                  outline
                  className="w-full sm:flex-1"
                >
                  {isLoading !== FETCH_STATUS.INIT
                    ? 'Processing...'
                    : 'Update Limits'}
                </Button>
                <Button width={0}
                  onClick={() => setShowLimitsForm(false)}
                  outline
                  className="w-full sm:flex-1"
                >
                  Cancel
                </Button>
              </div>
            </div>
          )}

          {/* Transaction Status */}
          {isLoading !== FETCH_STATUS.INIT && (
            <div
              className={`p-4 rounded-lg border ${
                isLoading === FETCH_STATUS.COMPLETED
                  ? 'bg-custom-green/10 border-custom-green/20 text-custom-green'
                  : isLoading === FETCH_STATUS.ERROR
                  ? 'bg-red-500/10 border-red-500/20 text-red-400'
                  : 'bg-custom-orange/10 border-custom-orange/20 text-custom-orange'
              }`}
            >
              {isLoading === FETCH_STATUS.WAIT_WALLET &&
                '⏳ Waiting for wallet confirmation...'}
              {isLoading === FETCH_STATUS.WAIT_TX && '⏳ Transaction pending...'}
              {isLoading === FETCH_STATUS.COMPLETED &&
                '✅ Transaction completed successfully!'}
              {isLoading === FETCH_STATUS.ERROR &&
                '❌ Transaction failed. Please try again.'}
            </div>
          )}

          {/* Danger Zone - System Reset */}
          {userRole === AdminRole.SUPER_ADMIN && (
            <div className="border-t border-red-500/20 pt-4 mt-4">
              <div className="bg-red-500/5 border border-red-500/30 rounded-lg p-3 sm:p-4">
                <div className="flex items-center justify-between gap-3">
                  <div className="flex items-center gap-2 flex-1">
                    <span className="text-lg">⚠️</span>
                    <div>
                      <h3 className="font-bold text-red-400 text-sm">
                        System Reset
                      </h3>
                      <p className="text-xs text-zinc-400">
                        Delete all teams/votes - <span className="font-semibold text-red-400">Cannot be undone</span>
                      </p>
                    </div>
                  </div>

                  <Button
                    onClick={() => setShowResetDialog(true)}
                    className="bg-red-600 hover:bg-red-700 border-red-600 text-xs sm:text-sm px-3 py-1.5"
                    width={0}
                    disabled={isLoading !== FETCH_STATUS.INIT}
                  >
                    Reset System
                  </Button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Reset System Confirmation Dialog */}
      <TypedConfirmDialog
        open={showResetDialog}
        title="⚠️ SYSTEM RESET"
        action="Permanently delete all teams, votes, and reset the entire voting system"
        consequences={[
          'ALL TEAMS will be permanently deleted',
          'ALL VOTES will be permanently deleted',
          'Voting will be disabled',
          'All team leaders will be unassigned',
          'Vote statistics will be reset to zero',
          'This action is IRREVERSIBLE',
        ]}
        confirmText="RESET SYSTEM"
        onConfirm={handleResetSystem}
        onCancel={() => setShowResetDialog(false)}
      />
    </RoleGuard>
  );
};

export default VotingControlPanel;
