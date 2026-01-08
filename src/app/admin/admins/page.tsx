import DashboardLayout from '@/components/admin/layout/DashboardLayout';
import AdminManagement from '@/components/admin/panels/AdminManagement';

export default function AdminManagementPage() {
  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Page Title */}
        <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-4 sm:p-6">
          <h1 className="text-2xl sm:text-3xl font-bold text-white">
            👥 Administrator Management
          </h1>
          <p className="text-zinc-400 mt-2 text-sm sm:text-base">
            View and manage system administrators. Add new admins, change roles, or remove access.
          </p>
        </div>

        {/* Admin Management Panel */}
        <AdminManagement />
      </div>
    </DashboardLayout>
  );
}
