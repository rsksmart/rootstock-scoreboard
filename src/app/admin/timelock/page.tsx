'use client';
import React from 'react';
import DashboardLayout from '@/components/admin/layout/DashboardLayout';
import TimelockPanel from '@/components/admin/panels/TimelockPanel';
import { useAdminRole } from '@/hooks/useAdminRole';
import useGovernanceContract from '@/hooks/useGovernanceContract';
import { AdminRole } from '@/types/admin';

export default function TimelockPage() {
  const { userRole } = useAdminRole();
  const governanceContract = useGovernanceContract();

  // Only accessible to super admins
  if (userRole < AdminRole.SUPER_ADMIN) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-full">
          <div className="text-center">
            <h2 className="text-xl font-bold mb-2">Access Denied</h2>
            <p className="text-zinc-400">Super Admin access required</p>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <TimelockPanel
        governanceContract={governanceContract}
        userRole={userRole}
      />
    </DashboardLayout>
  );
}
