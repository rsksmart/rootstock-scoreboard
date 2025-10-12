'use client';
import React, { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { AdminRole } from '@/types/admin';
import RoleGuard from '@/components/guards/RoleGuard';
import RoleBadge from '@/components/admin/RoleBadge';
import Button from '@/components/common/Button';
import useAdmin, { AdminInfo } from '@/hooks/useAdmin';
import { FETCH_STATUS } from '@/constants';
import AdminActionConfirm from '@/components/dialog/AdminActionConfirm';
import AddAdminDialog from '@/components/dialog/AddAdminDialog';

const AdminManagement: React.FC = () => {
  const { userRole, address: currentUserAddress } = useAuth();
  const { admins, isLoading, addAdmin, removeAdmin, changeAdminRole } = useAdmin();

  const [addDialog, setAddDialog] = useState(false);
  const [confirmDialog, setConfirmDialog] = useState(false);
  const [changeRoleDialog, setChangeRoleDialog] = useState(false);
  const [selectedAdmin, setSelectedAdmin] = useState<AdminInfo | null>(null);
  const [newRole, setNewRole] = useState<AdminRole>(AdminRole.TEAM_MANAGER);

  const formatAddress = (address: string) => {
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  const formatDate = (timestamp: number) => {
    return new Date(timestamp * 1000).toLocaleDateString();
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

  // Remove Admin Handlers
  const handleRemoveClick = (admin: AdminInfo) => {
    setSelectedAdmin(admin);
    setConfirmDialog(true);
  };

  const handleConfirmRemove = async () => {
    if (selectedAdmin) {
      await removeAdmin(selectedAdmin.address);
      setConfirmDialog(false);
      setSelectedAdmin(null);
    }
  };

  const handleCancelRemove = () => {
    setConfirmDialog(false);
    setSelectedAdmin(null);
  };

  // Change Role Handlers
  const handleChangeRoleClick = (admin: AdminInfo) => {
    setSelectedAdmin(admin);
    setNewRole(admin.role);
    setChangeRoleDialog(true);
  };

  const handleConfirmChangeRole = async () => {
    if (selectedAdmin && newRole !== selectedAdmin.role) {
      await changeAdminRole(selectedAdmin.address, newRole);
      setChangeRoleDialog(false);
      setSelectedAdmin(null);
    }
  };

  const handleCancelChangeRole = () => {
    setChangeRoleDialog(false);
    setSelectedAdmin(null);
  };

  return (
    <RoleGuard requiredRole={AdminRole.SUPER_ADMIN}>
      <div className="bg-zinc-900 border border-zinc-800 rounded-lg">
        {/* Header */}
        <div className="p-4 sm:p-6 border-b border-zinc-800">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h2 className="text-xl sm:text-2xl font-bold text-white">Admin Management</h2>
              <p className="text-sm text-zinc-400 mt-1">
                Manage system administrators and their roles ({admins.length} active)
              </p>
            </div>
            <Button
              onClick={() => setAddDialog(true)}
              className="w-full sm:w-auto bg-custom-green hover:bg-custom-green/80"
              width={0}
              disabled={isLoading !== FETCH_STATUS.INIT}
            >
              + Add Admin
            </Button>
          </div>
        </div>

        {/* Info Panel */}
        <div className="p-4 sm:p-6 border-b border-zinc-800">
          <div className="bg-custom-orange/10 border border-custom-orange/30 rounded-lg p-4">
            <h3 className="text-custom-orange font-semibold mb-2 flex items-center gap-2">
              <span>⚠️</span>
              <span>SUPER_ADMIN Permissions Required</span>
            </h3>
            <ul className="text-sm text-zinc-300 space-y-1 ml-6">
              <li>• Only SUPER_ADMINs can manage other administrators</li>
              <li>• Removing admins requires at least 1 admin to remain</li>
              <li>• All admin actions are recorded on-chain</li>
              <li>• Changes take effect immediately</li>
            </ul>
          </div>
        </div>

        {/* Admins List */}
        <div className="p-4 sm:p-6">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-zinc-800 text-left">
                  <th className="pb-3 text-sm font-semibold text-zinc-400">Address</th>
                  <th className="pb-3 text-sm font-semibold text-zinc-400">Role</th>
                  <th className="pb-3 text-sm font-semibold text-zinc-400">Joined</th>
                  <th className="pb-3 text-sm font-semibold text-zinc-400">Status</th>
                  {userRole === AdminRole.SUPER_ADMIN && (
                    <th className="pb-3 text-sm font-semibold text-zinc-400">Actions</th>
                  )}
                </tr>
              </thead>
              <tbody>
                {admins.map((admin, index) => (
                  <tr key={index} className="border-b border-zinc-800/50">
                    <td className="py-4">
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-sm text-white">
                          {formatAddress(admin.address)}
                        </span>
                        {admin.address.toLowerCase() === currentUserAddress?.toLowerCase() && (
                          <span className="text-xs bg-custom-green/20 text-custom-green px-2 py-0.5 rounded">
                            You
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="py-4">
                      <RoleBadge role={admin.role} size="sm" />
                    </td>
                    <td className="py-4">
                      <span className="text-sm text-zinc-400">
                        {formatDate(admin.joinTimestamp)}
                      </span>
                    </td>
                    <td className="py-4">
                      <span className={`text-xs px-2 py-1 rounded ${
                        admin.isActive
                          ? 'bg-custom-green/20 text-custom-green'
                          : 'bg-red-500/20 text-red-400'
                      }`}>
                        {admin.isActive ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    {userRole === AdminRole.SUPER_ADMIN && (
                      <td className="py-4">
                        <div className="flex gap-2">
                          <Button
                            onClick={() => handleChangeRoleClick(admin)}
                            className="bg-custom-orange hover:bg-custom-orange/80 text-xs sm:text-sm px-2 py-1"
                            width={0}
                            disabled={
                              isLoading !== FETCH_STATUS.INIT ||
                              admin.address.toLowerCase() === currentUserAddress?.toLowerCase()
                            }
                          >
                            Change Role
                          </Button>
                          <Button
                            onClick={() => handleRemoveClick(admin)}
                            className="bg-red-600 hover:bg-red-700 text-xs sm:text-sm px-2 py-1"
                            width={0}
                            disabled={
                              isLoading !== FETCH_STATUS.INIT ||
                              admin.address.toLowerCase() === currentUserAddress?.toLowerCase() ||
                              admins.length <= 1
                            }
                          >
                            Remove
                          </Button>
                        </div>
                      </td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>

            {admins.length === 0 && (
              <div className="text-center py-8 text-zinc-500">
                No administrators found
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Add Admin Dialog */}
      <AddAdminDialog
        open={addDialog}
        onClose={() => setAddDialog(false)}
        onAdd={async (address: string, role: AdminRole) => {
          await addAdmin(address, role);
          if (isLoading === FETCH_STATUS.COMPLETED) {
            setAddDialog(false);
          }
        }}
        isLoading={isLoading}
      />

      {/* Remove Admin Confirmation Dialog */}
      <AdminActionConfirm
        open={confirmDialog}
        title="Remove Administrator"
        action={`Permanently remove admin ${selectedAdmin?.address ? formatAddress(selectedAdmin.address) : ''} (${selectedAdmin ? getRoleName(selectedAdmin.role) : ''})`}
        consequences={[
          'Admin will immediately lose all privileges',
          'Admin cannot perform any administrative actions',
          'This action is recorded on-chain',
          'Action cannot be reversed (must re-add admin)',
          'Requires at least 1 admin to remain in system',
        ]}
        requiresRole="SUPER_ADMIN"
        isReversible={false}
        onConfirm={handleConfirmRemove}
        onCancel={handleCancelRemove}
      />

      {/* Change Role Confirmation Dialog */}
      {changeRoleDialog && selectedAdmin && (
        <AdminActionConfirm
          open={changeRoleDialog}
          title="Change Admin Role"
          action={`Change role for ${formatAddress(selectedAdmin.address)} from ${getRoleName(selectedAdmin.role)} to ${getRoleName(newRole)}`}
          consequences={[
            'Admin permissions will change immediately',
            newRole > selectedAdmin.role ? 'Admin will gain additional privileges' : 'Admin will lose some privileges',
            'Action is recorded on-chain',
            'Can be changed again if needed',
          ]}
          requiresRole="SUPER_ADMIN"
          isReversible={true}
          onConfirm={handleConfirmChangeRole}
          onCancel={handleCancelChangeRole}
        >
          <div className="w-full mb-4 px-1 py-2 sm:p-2">
            <label htmlFor="newRole" className="font-bold text-sm sm:text-base ml-1 sm:ml-3 mb-1 block">
              New Role
            </label>
            <select
              value={newRole}
              onChange={(e) => setNewRole(Number(e.target.value) as AdminRole)}
              className="w-full px-3 py-2 bg-black border border-zinc-700 rounded-lg text-white ml-1 sm:ml-3 text-sm sm:text-base"
            >
              <option value={AdminRole.TEAM_MANAGER}>TEAM_MANAGER</option>
              <option value={AdminRole.VOTE_ADMIN}>VOTE_ADMIN</option>
              <option value={AdminRole.RECOVERY_ADMIN}>RECOVERY_ADMIN</option>
              <option value={AdminRole.SUPER_ADMIN}>SUPER_ADMIN</option>
            </select>
            <div className="ml-1 sm:ml-3 mt-1 text-xs sm:text-sm text-custom-green font-semibold">
              {getRoleName(newRole)}
            </div>
          </div>
        </AdminActionConfirm>
      )}
    </RoleGuard>
  );
};

export default AdminManagement;
