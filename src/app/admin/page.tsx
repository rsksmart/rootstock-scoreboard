'use client';
import DashboardLayout from '@/components/admin/layout/DashboardLayout';
import VotingControlPanel from '@/components/admin/panels/VotingControlPanel';

export default function AdminDashboard() {
  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Page Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-white">
              Voting Control
            </h1>
            <p className="text-sm sm:text-base text-zinc-400 mt-1">
              Manage voting periods, limits, and configurations
            </p>
          </div>
        </div>

        {/* Main Content */}
        <VotingControlPanel />
      </div>
    </DashboardLayout>
  );
}
