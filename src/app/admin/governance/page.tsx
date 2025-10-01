'use client';
import React from 'react';
import DashboardLayout from '@/components/admin/layout/DashboardLayout';
import GovernancePanel from '@/components/admin/panels/GovernancePanel';
import { useAdminRole } from '@/hooks/useAdminRole';
import useGovernanceContract from '@/hooks/useGovernanceContract';
import { AdminRole } from '@/types/admin';

export default function GovernancePage() {
  const { userRole, userAddress } = useAdminRole();
  const governanceContract = useGovernanceContract();

  // Only accessible to admins
  if (userRole === AdminRole.NONE) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-full">
          <div className="text-center">
            <h2 className="text-xl font-bold mb-2">Access Denied</h2>
            <p className="text-zinc-400">Admin access required</p>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <GovernancePanel
        governanceContract={governanceContract}
        userAddress={userAddress}
        userRole={userRole}
      />
    </DashboardLayout>
  );
}
