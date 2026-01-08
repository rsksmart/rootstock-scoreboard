'use client';
import React, { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { ethers } from 'ethers';
import Navbar from '@/components/navigation/Navbar';
import Footer from '@/components/footer/Footer';

interface AdminEvent {
  type: 'TeamAdded' | 'TeamRemoved' | 'VotingEnabled' | 'VotingDisabled' | 'SystemReset';
  timestamp: number;
  admin: string;
  details: string;
  txHash: string;
}

export default function TransparencyPage() {
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
        ],
        provider
      );

      const allEvents: AdminEvent[] = [];

      const teamAddedEvents = await contract.queryFilter('TeamAdded', fromBlock, 'latest');
      const teamRemovedEvents = await contract.queryFilter('TeamRemoved', fromBlock, 'latest');
      const votingEnabledEvents = await contract.queryFilter('VotingEnabled', fromBlock, 'latest');
      const votingDisabledEvents = await contract.queryFilter('VotingDisabled', fromBlock, 'latest');
      const systemResetEvents = await contract.queryFilter('SystemReset', fromBlock, 'latest');

      for (const event of teamAddedEvents) {
        const block = await event.getBlock();
        const tx = await event.getTransaction();

        let teamName = 'Unknown';
        try {
          const iface = new ethers.Interface([
            'function addTeam(string teamName, address memeTokenAddress)'
          ]);
          const decoded = iface.parseTransaction({ data: tx.data });
          teamName = decoded?.args[0] || 'Unknown';
        } catch (e) {
          console.error('Failed to parse team name:', e);
        }

        allEvents.push({
          type: 'TeamAdded',
          timestamp: block.timestamp,
          admin: event.args?.teamLeader || 'Unknown',
          details: `Team "${teamName}" added`,
          txHash: event.transactionHash,
        });
      }

      for (const event of teamRemovedEvents) {
        const block = await event.getBlock();
        const tx = await event.getTransaction();

        let teamName = 'Unknown';
        try {
          const iface = new ethers.Interface([
            'function removeTeam(string teamName)'
          ]);
          const decoded = iface.parseTransaction({ data: tx.data });
          teamName = decoded?.args[0] || 'Unknown';
        } catch (e) {
          console.error('Failed to parse team name:', e);
        }

        allEvents.push({
          type: 'TeamRemoved',
          timestamp: block.timestamp,
          admin: event.args?.teamLeader || 'Unknown',
          details: `Team "${teamName}" removed`,
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
      default:
        return 'text-zinc-400';
    }
  };

  const filteredEvents = filter === 'all'
    ? events
    : events.filter(e => e.type === filter);

  return (
    <div className="min-h-screen bg-black text-white flex flex-col">
      <Navbar />

      <main className="flex-1 container mx-auto px-4 py-8 max-w-6xl">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl sm:text-4xl font-bold text-white mb-3">
            🔍 Transparency Dashboard
          </h1>
          <p className="text-zinc-400 text-sm sm:text-base max-w-3xl">
            All administrative actions are permanently recorded on the Rootstock blockchain.
            This page provides real-time visibility into system management activities, ensuring
            complete transparency and accountability.
          </p>
        </div>

        {/* Info Panel */}
        <div className="bg-custom-green/10 border border-custom-green/30 rounded-lg p-4 mb-6">
          <h3 className="text-custom-green font-semibold mb-2 flex items-center gap-2">
            <span>✓</span>
            <span>Blockchain-Verified Actions</span>
          </h3>
          <ul className="text-sm text-zinc-300 space-y-1 ml-6">
            <li>• All events are fetched directly from the blockchain</li>
            <li>• Events cannot be deleted or modified</li>
            <li>• Click "View Tx" to verify any action on the block explorer</li>
            <li>• Admin addresses and timestamps are cryptographically verified</li>
          </ul>
        </div>

        {/* Main Content */}
        <div className="bg-zinc-900 border border-zinc-800 rounded-lg">
          {/* Filter Header */}
          <div className="p-4 sm:p-6 border-b border-zinc-800">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div>
                <h2 className="text-xl sm:text-2xl font-bold text-white">Administrative Actions</h2>
                <p className="text-sm text-zinc-400 mt-1">
                  {events.length} total events recorded
                </p>
              </div>

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
              <div className="text-center py-12">
                <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-custom-green mx-auto mb-4"></div>
                <p className="text-zinc-400 text-sm">Loading blockchain events...</p>
              </div>
            ) : filteredEvents.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-zinc-500 text-sm">No events found</p>
              </div>
            ) : (
              <div className="space-y-3">
                {filteredEvents.map((event, index) => (
                  <div
                    key={index}
                    className="bg-black border border-zinc-800 rounded-lg p-4 hover:border-zinc-700 transition-colors"
                  >
                    <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-2">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1 flex-wrap">
                          <span className={`font-semibold text-sm ${getEventColor(event.type)}`}>
                            {event.type}
                          </span>
                          <span className="text-xs text-zinc-600">•</span>
                          <span className="text-xs text-zinc-500">
                            {formatTimestamp(event.timestamp)}
                          </span>
                        </div>
                        <p className="text-sm sm:text-base text-zinc-200 mb-2">{event.details}</p>
                        <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 text-xs text-zinc-500">
                          <span className="font-mono">Admin: {formatAddress(event.admin)}</span>
                          <a
                            href={`${process.env.NEXT_PUBLIC_EXPLORER}/tx/${event.txHash}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-custom-green hover:underline inline-flex items-center gap-1"
                          >
                            View Transaction →
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
      </main>

      <Footer />
    </div>
  );
}
