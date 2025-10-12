'use client';
import React, { useState } from 'react';
import Button from '../../common/Button';
import Input from '../../common/Input';
import TimelockCard from '../TimelockCard';
import useGovernance from '@/hooks/useGovernance';
import { AdminRole } from '@/types/admin';
import { ethers } from 'ethers';

interface TimelockPanelProps {
  governanceContract: ethers.Contract | null;
  userRole: AdminRole;
}

export default function TimelockPanel({
  governanceContract,
  userRole,
}: TimelockPanelProps) {
  const {
    timeLocks,
    scheduleTimeLockAddAdmin,
    executeTimeLock,
    cancelTimeLock,
    loadTimeLocks,
  } = useGovernance(governanceContract);

  const [showScheduleForm, setShowScheduleForm] = useState(false);
  const [targetAddress, setTargetAddress] = useState('');
  const [selectedRole, setSelectedRole] = useState<AdminRole>(AdminRole.TEAM_MANAGER);
  const [delayHours, setDelayHours] = useState('24');

  const handleSchedule = async () => {
    if (!ethers.isAddress(targetAddress)) {
      alert('Please provide a valid address');
      return;
    }

    const hours = parseInt(delayHours);
    if (isNaN(hours) || hours < 1) {
      alert('Delay must be at least 1 hour');
      return;
    }

    await scheduleTimeLockAddAdmin(targetAddress, selectedRole, hours);
    setShowScheduleForm(false);
    setTargetAddress('');
    setDelayHours('24');
  };

  const canSchedule = userRole === AdminRole.SUPER_ADMIN;
  const canCancel = userRole === AdminRole.SUPER_ADMIN;

  return (
    <div className="w-full">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="bg-custom-orange font-bold text-lg sm:text-xl text-black w-max px-1 mb-2">
            TIME-LOCKED ACTIONS
          </h2>
          <p className="text-xs sm:text-sm text-zinc-400">
            Schedule delayed admin actions for enhanced security
          </p>
        </div>
        {canSchedule && (
          <Button
            onClick={() => setShowScheduleForm(!showScheduleForm)}
            className="bg-custom-green hover:bg-custom-green/80 text-black text-sm px-4 py-2 font-semibold whitespace-nowrap"
          >
            {showScheduleForm ? 'Cancel' : '+ Schedule Action'}
          </Button>
        )}
      </div>

      {/* Schedule Form */}
      {showScheduleForm && canSchedule && (
        <div className="bg-zinc-900 border border-zinc-700 rounded-lg p-3 sm:p-4 mb-4">
          <h3 className="font-semibold text-sm sm:text-base mb-3">Schedule Time-Locked Admin Addition</h3>

          <div className="space-y-3">
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

            {/* Role Selection */}
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

            {/* Delay */}
            <div>
              <label className="text-xs sm:text-sm text-zinc-400 mb-1 block">Delay (hours)</label>
              <Input
                value={delayHours}
                onChange={(e) => setDelayHours(e.target.value)}
                name="delayHours"
                placeholder="24"
                type="number"
                height={32}
              />
              <p className="text-xs text-zinc-500 mt-1">Minimum: 1 hour</p>
            </div>

            <Button
              onClick={handleSchedule}
              width={200}
              height={36}
              className="bg-custom-orange hover:bg-custom-orange/80 text-sm font-semibold whitespace-nowrap"
            >
              Schedule Time Lock
            </Button>
          </div>
        </div>
      )}

      {/* Info Box */}
      <div className="bg-custom-orange/10 border border-custom-orange/30 rounded-lg p-3 mb-4">
        <div className="flex items-start gap-2">
          <span className="text-lg">ℹ️</span>
          <div className="flex-1">
            <h4 className="text-xs sm:text-sm font-semibold text-custom-orange mb-1">
              Time-Lock Security
            </h4>
            <p className="text-xs text-zinc-400">
              Time-locked actions add a mandatory delay before execution, providing a security window
              to detect and prevent malicious actions. Super admins can cancel scheduled actions before execution.
            </p>
          </div>
        </div>
      </div>

      {/* Time-Locked Actions */}
      <div className="space-y-3">
        {timeLocks.length === 0 ? (
          <div className="bg-zinc-900/50 border border-zinc-800 rounded-lg p-6 text-center">
            <p className="text-zinc-500 text-sm">No scheduled time-locked actions</p>
          </div>
        ) : (
          timeLocks.map((timeLock) => (
            <TimelockCard
              key={timeLock.id}
              timeLock={timeLock}
              onExecute={executeTimeLock}
              onCancel={cancelTimeLock}
              canCancel={canCancel}
            />
          ))
        )}
      </div>

      {/* Refresh Button */}
      {timeLocks.length > 0 && (
        <div className="mt-4 text-center">
          <Button
            onClick={loadTimeLocks}
            outline
            className="text-xs sm:text-sm px-4 py-1.5"
          >
            Refresh Time Locks
          </Button>
        </div>
      )}
    </div>
  );
}
