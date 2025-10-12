'use client';
import React, { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { AdminRole } from '@/types/admin';
import RoleGuard from '@/components/guards/RoleGuard';
import Button from '@/components/common/Button';
import useEmergency from '@/hooks/useEmergency';
import useAdmin from '@/hooks/useAdmin';
import { FETCH_STATUS } from '@/constants';
import AdminActionConfirm from '@/components/dialog/AdminActionConfirm';
import AddAdminDialog from '@/components/dialog/AddAdminDialog';

const EmergencyControls: React.FC = () => {
  const { userRole, address: currentUserAddress } = useAuth();
  const { emergencyStatus, isLoading, triggerEmergency, resolveEmergency, emergencyAddAdmin } = useEmergency();
  const { admins } = useAdmin();

  const [triggerDialog, setTriggerDialog] = useState(false);
  const [resolveDialog, setResolveDialog] = useState(false);
  const [addAdminDialog, setAddAdminDialog] = useState(false);

  const formatAddress = (address: string) => {
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  const formatDate = (timestamp: number) => {
    if (timestamp === 0) return 'N/A';
    return new Date(timestamp * 1000).toLocaleString();
  };

  const getTimeSinceTrigger = () => {
    if (!emergencyStatus.emergencyMode || emergencyStatus.emergencyStartTime === 0) return 'N/A';
    const seconds = Math.floor(Date.now() / 1000) - emergencyStatus.emergencyStartTime;
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    return `${hours}h ${minutes}m ago`;
  };

  const handleTriggerEmergency = async () => {
    await triggerEmergency();
    setTriggerDialog(false);
  };

  const handleResolveEmergency = async () => {
    await resolveEmergency();
    setResolveDialog(false);
  };

  return (
    <RoleGuard requiredRole={AdminRole.RECOVERY_ADMIN}>
      <div className="space-y-6">
        {/* Emergency Status Panel */}
        <div className={`border rounded-lg ${
          emergencyStatus.emergencyMode
            ? 'bg-red-500/10 border-red-500/50'
            : 'bg-zinc-900 border-zinc-800'
        }`}>
          <div className="p-4 sm:p-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
              <div>
                <h2 className="text-xl sm:text-2xl font-bold text-white flex items-center gap-3">
                  Emergency Status
                  {emergencyStatus.emergencyMode && (
                    <span className="text-sm px-3 py-1 bg-red-500 text-white rounded-full animate-pulse">
                      ACTIVE
                    </span>
                  )}
                </h2>
                <p className="text-sm text-zinc-400 mt-1">
                  {emergencyStatus.emergencyMode
                    ? 'System is in emergency mode - normal operations restricted'
                    : 'System operating normally'}
                </p>
              </div>
            </div>

            {/* Status Details */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
              <div className="bg-black/50 border border-zinc-800 rounded-lg p-4">
                <p className="text-xs text-zinc-500 mb-1">Status</p>
                <p className={`text-lg font-bold ${
                  emergencyStatus.emergencyMode ? 'text-red-400' : 'text-custom-green'
                }`}>
                  {emergencyStatus.emergencyMode ? 'Emergency Active' : 'Normal'}
                </p>
              </div>

              <div className="bg-black/50 border border-zinc-800 rounded-lg p-4">
                <p className="text-xs text-zinc-500 mb-1">Triggered By</p>
                <p className="text-sm font-mono text-white">
                  {emergencyStatus.emergencyTriggeredBy !== '0x0000000000000000000000000000000000000000'
                    ? formatAddress(emergencyStatus.emergencyTriggeredBy)
                    : 'N/A'}
                </p>
              </div>

              <div className="bg-black/50 border border-zinc-800 rounded-lg p-4">
                <p className="text-xs text-zinc-500 mb-1">Duration</p>
                <p className="text-sm text-white">
                  {getTimeSinceTrigger()}
                </p>
              </div>
            </div>

            {/* Info Panel */}
            <div className={`rounded-lg p-4 mb-6 ${
              emergencyStatus.emergencyMode
                ? 'bg-red-500/10 border border-red-500/30'
                : 'bg-zinc-800/50 border border-zinc-700'
            }`}>
              <h3 className="font-semibold mb-2 text-sm sm:text-base flex items-center gap-2">
                <span>{emergencyStatus.emergencyMode ? '🚨' : 'ℹ️'}</span>
                <span>{emergencyStatus.emergencyMode ? 'Emergency Mode Effects' : 'About Emergency Mode'}</span>
              </h3>
              <ul className="text-xs sm:text-sm text-zinc-300 space-y-1 ml-6">
                {emergencyStatus.emergencyMode ? (
                  <>
                    <li>• Normal admin operations are disabled</li>
                    <li>• Only SUPER_ADMIN can resolve emergency</li>
                    <li>• RECOVERY_ADMIN+ can add emergency admins</li>
                    <li>• All emergency actions are logged on-chain</li>
                  </>
                ) : (
                  <>
                    <li>• Use when system integrity is compromised</li>
                    <li>• RECOVERY_ADMIN+ can trigger emergency mode</li>
                    <li>• Disables normal admin operations</li>
                    <li>• Only SUPER_ADMIN can resolve emergency</li>
                  </>
                )}
              </ul>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-3">
              {!emergencyStatus.emergencyMode ? (
                <Button
                  onClick={() => setTriggerDialog(true)}
                  className="w-full sm:w-auto bg-red-600 hover:bg-red-700"
                  width={0}
                  disabled={isLoading !== FETCH_STATUS.INIT || userRole < AdminRole.RECOVERY_ADMIN}
                >
                  🚨 Trigger Emergency Mode
                </Button>
              ) : (
                <>
                  <Button
                    onClick={() => setResolveDialog(true)}
                    className="w-full sm:flex-1 bg-custom-green hover:bg-custom-green/80"
                    width={0}
                    disabled={isLoading !== FETCH_STATUS.INIT || userRole !== AdminRole.SUPER_ADMIN}
                  >
                    Resolve Emergency
                  </Button>
                  <Button
                    onClick={() => setAddAdminDialog(true)}
                    className="w-full sm:flex-1 bg-custom-orange hover:bg-custom-orange/80"
                    width={0}
                    disabled={isLoading !== FETCH_STATUS.INIT || userRole < AdminRole.RECOVERY_ADMIN}
                  >
                    Emergency Add Admin
                  </Button>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Current Admins Display */}
        {emergencyStatus.emergencyMode && (
          <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-4 sm:p-6">
            <h3 className="text-lg font-bold text-white mb-4">Current Administrators ({admins.length})</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {admins.map((admin, index) => (
                <div key={index} className="bg-black/50 border border-zinc-800 rounded-lg p-3">
                  <p className="text-xs text-zinc-500 mb-1">Address</p>
                  <p className="text-sm font-mono text-white mb-2">{formatAddress(admin.address)}</p>
                  <p className="text-xs text-zinc-500 mb-1">Role</p>
                  <p className="text-sm text-custom-green font-semibold">
                    {admin.role === AdminRole.SUPER_ADMIN && 'SUPER_ADMIN'}
                    {admin.role === AdminRole.RECOVERY_ADMIN && 'RECOVERY_ADMIN'}
                    {admin.role === AdminRole.VOTE_ADMIN && 'VOTE_ADMIN'}
                    {admin.role === AdminRole.TEAM_MANAGER && 'TEAM_MANAGER'}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Trigger Emergency Confirmation */}
      <AdminActionConfirm
        open={triggerDialog}
        title="Trigger Emergency Mode"
        action="Activate emergency mode and disable normal admin operations"
        consequences={[
          'All normal admin operations will be disabled',
          'Only SUPER_ADMIN can resolve the emergency',
          'RECOVERY_ADMIN+ can add emergency admins',
          'Trigger time and admin are recorded on-chain',
          'Use only when system integrity is compromised',
        ]}
        requiresRole="RECOVERY_ADMIN or higher"
        isReversible={true}
        onConfirm={handleTriggerEmergency}
        onCancel={() => setTriggerDialog(false)}
      />

      {/* Resolve Emergency Confirmation */}
      <AdminActionConfirm
        open={resolveDialog}
        title="Resolve Emergency Mode"
        action="Deactivate emergency mode and restore normal operations"
        consequences={[
          'Emergency mode will be deactivated',
          'Normal admin operations will be restored',
          'Emergency admins added during emergency remain active',
          'Resolution time and admin are recorded on-chain',
        ]}
        requiresRole="SUPER_ADMIN only"
        isReversible={false}
        onConfirm={handleResolveEmergency}
        onCancel={() => setResolveDialog(false)}
      />

      {/* Emergency Add Admin Dialog */}
      <AddAdminDialog
        open={addAdminDialog}
        onClose={() => setAddAdminDialog(false)}
        onAdd={async (address: string, role: AdminRole) => {
          await emergencyAddAdmin(address, role);
          if (isLoading === FETCH_STATUS.COMPLETED) {
            setAddAdminDialog(false);
          }
        }}
        isLoading={isLoading}
      />
    </RoleGuard>
  );
};

export default EmergencyControls;
