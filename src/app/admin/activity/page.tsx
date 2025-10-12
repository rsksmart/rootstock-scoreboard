'use client';
import DashboardLayout from '@/components/admin/layout/DashboardLayout';
import AdminActivityLog from '@/components/admin/panels/AdminActivityLog';

export default function AdminActivityPage() {
  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Page Header */}
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-white">
            Activity Log
          </h1>
          <p className="text-sm sm:text-base text-zinc-400 mt-1">
            Transparent record of all administrative actions on-chain
          </p>
        </div>

        {/* Activity Log */}
        <AdminActivityLog />

        {/* Information Panel */}
        <div className="bg-custom-green/10 border border-custom-green/30 rounded-lg p-4">
          <h3 className="text-sm font-semibold text-custom-green mb-2">ℹ️ Transparency & Accountability</h3>
          <ul className="text-xs text-zinc-400 space-y-1">
            <li>• All admin actions are permanently recorded on the Rootstock blockchain</li>
            <li>• Events cannot be modified or deleted by anyone</li>
            <li>• Anyone can verify actions by checking transaction hashes</li>
            <li>• This log promotes transparency and prevents abuse of admin powers</li>
          </ul>
        </div>
      </div>
    </DashboardLayout>
  );
}
