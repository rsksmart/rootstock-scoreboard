'use client';
import { ReactNode, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import Navbar from '@/components/navigation/Navbar';
import Sidebar from './Sidebar';

interface DashboardLayoutProps {
  children: ReactNode;
}

export default function DashboardLayout({ children }: DashboardLayoutProps) {
  const router = useRouter();
  const { isAdmin, roleLoading } = useAuth();

  // Redirect non-admins to home page
  useEffect(() => {
    if (!roleLoading && !isAdmin) {
      router.push('/');
    }
  }, [isAdmin, roleLoading, router]);

  // Show loading state while checking permissions
  if (roleLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-black">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-custom-green mx-auto mb-4"></div>
          <p className="text-zinc-400">Checking permissions...</p>
        </div>
      </div>
    );
  }

  // Don't render if not admin (will redirect)
  if (!isAdmin) {
    return null;
  }

  return (
    <div className="min-h-screen flex flex-col bg-black">
      <Navbar />

      <div className="flex flex-1 relative">
        <Sidebar />

        <main className="flex-1 overflow-y-auto">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
