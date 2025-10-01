import DashboardLayout from '@/components/admin/layout/DashboardLayout';
import EmergencyControls from '@/components/admin/panels/EmergencyControls';

export default function EmergencyPage() {
  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Page Title */}
        <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-4 sm:p-6">
          <h1 className="text-2xl sm:text-3xl font-bold text-white">
            🚨 Emergency Controls
          </h1>
          <p className="text-zinc-400 mt-2 text-sm sm:text-base">
            Trigger or resolve emergency mode. Add emergency admins when system integrity is compromised.
          </p>
        </div>

        {/* Emergency Controls Panel */}
        <EmergencyControls />
      </div>
    </DashboardLayout>
  );
}
