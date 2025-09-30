/**
 * VotingStatusBanner Component
 * Displays current voting status with countdown timer
 * Fully responsive design for all screen sizes
 */

'use client';
import React, { useEffect, useState } from 'react';
import useAdminRole from '@/hooks/useAdminRole';

const VotingStatusBanner: React.FC = () => {
  const { votingStatus, votingStatusLoading, fetchVotingStatus } = useAdminRole();
  const [timeRemaining, setTimeRemaining] = useState<string>('');

  // Update countdown timer
  useEffect(() => {
    if (!votingStatus || !votingStatus.isActive || votingStatus.endTime === 0) {
      setTimeRemaining('');
      return;
    }

    const updateTimer = () => {
      const now = Math.floor(Date.now() / 1000);
      const remaining = votingStatus.endTime - now;

      if (remaining <= 0) {
        setTimeRemaining('Ended');
        // Refresh status when voting period ends
        fetchVotingStatus();
        return;
      }

      const days = Math.floor(remaining / 86400);
      const hours = Math.floor((remaining % 86400) / 3600);
      const minutes = Math.floor((remaining % 3600) / 60);

      if (days > 0) {
        setTimeRemaining(`${days}d ${hours}h remaining`);
      } else if (hours > 0) {
        setTimeRemaining(`${hours}h ${minutes}m remaining`);
      } else {
        setTimeRemaining(`${minutes}m remaining`);
      }
    };

    updateTimer();
    const interval = setInterval(updateTimer, 60000); // Update every minute

    return () => clearInterval(interval);
  }, [votingStatus, fetchVotingStatus]);

  // Show loading state
  if (votingStatusLoading) {
    return (
      <div className="w-full bg-zinc-900 border-b border-zinc-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
          <div className="flex items-center justify-center gap-2">
            <div className="w-4 h-4 border-2 border-gray-500 border-t-transparent rounded-full animate-spin" />
            <span className="text-sm text-gray-400">Loading voting status...</span>
          </div>
        </div>
      </div>
    );
  }

  // Don't show banner if no voting status
  if (!votingStatus) return null;

  return (
    <div
      className={`
        w-full border-b transition-colors duration-300
        ${votingStatus.isActive
          ? 'bg-custom-green/10 border-custom-green/30'
          : 'bg-zinc-900 border-zinc-700'}
      `}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
        {votingStatus.isActive ? (
          // Active voting status
          <div className="flex flex-col sm:flex-row items-center justify-center gap-2 sm:gap-4 text-center sm:text-left">
            <div className="flex items-center gap-2">
              <span className="inline-block w-2 h-2 bg-custom-green rounded-full animate-pulse flex-shrink-0" />
              <span className="text-custom-green font-semibold text-sm sm:text-base">
                🗳️ Voting Active
              </span>
            </div>

            <div className="flex flex-wrap items-center justify-center gap-2 sm:gap-4 text-xs sm:text-sm text-gray-300">
              {timeRemaining && (
                <>
                  <span className="hidden sm:inline text-gray-600">•</span>
                  <div className="flex items-center gap-1">
                    <span className="text-gray-400">Time:</span>
                    <span className="font-mono font-semibold text-custom-green">
                      {timeRemaining}
                    </span>
                  </div>
                </>
              )}

              <span className="hidden sm:inline text-gray-600">•</span>
              <div className="flex items-center gap-1">
                <span className="text-gray-400">Total Votes:</span>
                <span className="font-mono font-semibold text-custom-green">
                  {votingStatus.totalVotes.toLocaleString()}
                </span>
              </div>
            </div>
          </div>
        ) : (
          // Inactive voting status
          <div className="flex flex-col sm:flex-row items-center justify-center gap-2 text-center">
            <div className="flex items-center gap-2">
              <span className="inline-block w-2 h-2 bg-gray-500 rounded-full flex-shrink-0" />
              <span className="text-gray-400 text-sm sm:text-base">
                Voting Inactive
              </span>
            </div>
            <span className="hidden sm:inline text-gray-700">•</span>
            <span className="text-xs sm:text-sm text-gray-500">
              Waiting for admin to start voting period
            </span>
          </div>
        )}
      </div>
    </div>
  );
};

export default VotingStatusBanner;