'use client';
import React, { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { AdminRole } from '@/types/admin';
import RoleGuard from '@/components/guards/RoleGuard';
import { ethers } from 'ethers';

interface AdminEvent {
  type: 'TeamAdded' | 'TeamRemoved' | 'VotingEnabled' | 'VotingDisabled' | 'SystemReset' | 'AdminAdded' | 'AdminRemoved' | 'AdminRoleChanged';
  timestamp: number;
  admin: string;
  details: string;
  txHash: string;
}

const AdminActivityLog: React.FC = () => {
  const { provider } = useAuth();
  const [events, setEvents] = useState<AdminEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<string>('all');

  useEffect(() => {
    loadAdminEvents();
  }, [provider]);

  const loadAdminEvents = async () => {
    if (!provider) return;

    try {
      setLoading(true);
      const contractAddress = process.env.NEXT_PUBLIC_TEAM_MANAGER_ADDRESS;

      // Get recent blocks (last 1000 blocks or from deployment)
      const currentBlock = await provider.getBlockNumber();
      const fromBlock = Math.max(0, currentBlock - 10000);

      const contract = new ethers.Contract(
        contractAddress!,
        [
          'event TeamAdded(string indexed teamName, address indexed memeToken, address indexed teamLeader)',
          'event TeamRemoved(string indexed teamName, address indexed teamLeader)',
          'event VotingEnabled(uint256 startTime, uint256 endTime)',
          'event VotingDisabled()',
          'event SystemReset(address indexed admin)',
          'event AdminAdded(address indexed admin, uint8 role)',
          'event AdminRemoved(address indexed admin, uint8 role)',
          'event AdminRoleChanged(address indexed admin, uint8 oldRole, uint8 newRole)',
        ],
        provider
      );

      const allEvents: AdminEvent[] = [];

      // Fetch all admin-related events
      const teamAddedEvents = await contract.queryFilter('TeamAdded', fromBlock, 'latest');
      const teamRemovedEvents = await contract.queryFilter('TeamRemoved', fromBlock, 'latest');
      const votingEnabledEvents = await contract.queryFilter('VotingEnabled', fromBlock, 'latest');
      const votingDisabledEvents = await contract.queryFilter('VotingDisabled', fromBlock, 'latest');
      const systemResetEvents = await contract.queryFilter('SystemReset', fromBlock, 'latest');

      // Process events
      for (const event of teamAddedEvents) {
        const block = await event.getBlock();
        allEvents.push({
          type: 'TeamAdded',
          timestamp: block.timestamp,
          admin: event.args?.teamLeader || 'Unknown',
          details: `Team "${event.args?.teamName}" added`,
          txHash: event.transactionHash,
        });
      }

      for (const event of teamRemovedEvents) {
        const block = await event.getBlock();
        allEvents.push({
          type: 'TeamRemoved',
          timestamp: block.timestamp,
          admin: event.args?.teamLeader || 'Unknown',
          details: `Team "${event.args?.teamName}" removed`,
          txHash: event.transactionHash,
        });
      }

      for (const event of votingEnabledEvents) {
        const block = await event.getBlock();
        const tx = await event.getTransaction();
        allEvents.push({
          type: 'VotingEnabled',
          timestamp: block.timestamp,
          admin: tx.from,
          details: `Voting enabled`,
          txHash: event.transactionHash,
        });
      }

      for (const event of votingDisabledEvents) {
        const block = await event.getBlock();
        const tx = await event.getTransaction();
        allEvents.push({
          type: 'VotingDisabled',
          timestamp: block.timestamp,
          admin: tx.from,
          details: `Voting disabled`,
          txHash: event.transactionHash,
        });
      }

      for (const event of systemResetEvents) {
        const block = await event.getBlock();
        allEvents.push({
          type: 'SystemReset',
          timestamp: block.timestamp,
          admin: event.args?.admin || 'Unknown',
          details: `System reset performed`,
          txHash: event.transactionHash,
        });
      }

      // Sort by timestamp descending
      allEvents.sort((a, b) => b.timestamp - a.timestamp);
      setEvents(allEvents);
    } catch (error) {
      console.error('Failed to load admin events:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatTimestamp = (timestamp: number) => {
    return new Date(timestamp * 1000).toLocaleString();
  };

  const formatAddress = (address: string) => {
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  const getEventColor = (type: string) => {
    switch (type) {
      case 'TeamAdded':
        return 'text-custom-green';
      case 'TeamRemoved':
        return 'text-red-400';
      case 'VotingEnabled':
        return 'text-custom-green';
      case 'VotingDisabled':
        return 'text-custom-orange';
      case 'SystemReset':
        return 'text-red-500';
      case 'AdminAdded':
        return 'text-custom-lime';
      case 'AdminRemoved':
        return 'text-red-400';
      case 'AdminRoleChanged':
        return 'text-custom-cyan';
      default:
        return 'text-zinc-400';
    }
  };

  const filteredEvents = filter === 'all'
    ? events
    : events.filter(e => e.type === filter);

  return (
    <RoleGuard requiredRole={AdminRole.TEAM_MANAGER}>
      <div className="bg-zinc-900 border border-zinc-800 rounded-lg">
        {/* Header */}
        <div className="p-4 sm:p-6 border-b border-zinc-800">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h2 className="text-xl sm:text-2xl font-bold text-white">Admin Activity Log</h2>
              <p className="text-sm text-zinc-400 mt-1">Transparent record of all administrative actions</p>
            </div>

            {/* Filter */}
            <select
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              className="px-3 py-2 bg-black border border-zinc-700 rounded-lg text-white text-sm focus:ring-2 focus:ring-custom-green focus:border-transparent"
            >
              <option value="all">All Events</option>
              <option value="TeamAdded">Teams Added</option>
              <option value="TeamRemoved">Teams Removed</option>
              <option value="VotingEnabled">Voting Started</option>
              <option value="VotingDisabled">Voting Stopped</option>
              <option value="SystemReset">System Resets</option>
            </select>
          </div>
        </div>

        {/* Events List */}
        <div className="p-4 sm:p-6">
          {loading ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-custom-green mx-auto mb-4"></div>
              <p className="text-zinc-400 text-sm">Loading events...</p>
            </div>
          ) : filteredEvents.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-zinc-500 text-sm">No admin events found</p>
            </div>
          ) : (
            <div className="space-y-3">
              {filteredEvents.slice(0, 50).map((event, index) => (
                <div
                  key={index}
                  className="bg-black border border-zinc-800 rounded-lg p-4 hover:border-zinc-700 transition-colors"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className={`font-semibold text-sm ${getEventColor(event.type)}`}>
                          {event.type}
                        </span>
                        <span className="text-xs text-zinc-600">•</span>
                        <span className="text-xs text-zinc-500">
                          {formatTimestamp(event.timestamp)}
                        </span>
                      </div>
                      <p className="text-sm text-zinc-300">{event.details}</p>
                      <div className="flex items-center gap-4 mt-2 text-xs text-zinc-500">
                        <span>Admin: {formatAddress(event.admin)}</span>
                        <a
                          href={`${process.env.NEXT_PUBLIC_EXPLORER}/tx/${event.txHash}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-custom-green hover:underline"
                        >
                          View Tx →
                        </a>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </RoleGuard>
  );
};

export default AdminActivityLog;
