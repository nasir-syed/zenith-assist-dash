import React from 'react';
import { useAuth } from '@/contexts/AuthContext';
import DashboardSidebar from './DashboardSidebar';

interface DashboardLayoutProps {
  children: React.ReactNode;
}

const DashboardLayout: React.FC<DashboardLayoutProps> = ({ children }) => {
  const { user } = useAuth();

  if (!user) return null;

  return (
    <div className="flex min-h-screen w-full">
      <DashboardSidebar />
      <main className="flex-1 ml-64 p-6 bg-secondary/30">
        {children}
      </main>
    </div>
  );
};

export default DashboardLayout;