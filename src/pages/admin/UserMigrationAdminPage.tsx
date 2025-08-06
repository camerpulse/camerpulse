import React from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { AppLayout } from '@/components/Layout/AppLayout';
import { UserDataMigrationManager } from '@/components/Admin/UserDataMigrationManager';

/**
 * Admin page for managing comprehensive user data migration
 */
const UserMigrationAdminPage: React.FC = () => {
  return (
    <AppLayout>
      <div className="container mx-auto px-4 py-8">
        <UserDataMigrationManager />
      </div>
    </AppLayout>
  );
};

export default UserMigrationAdminPage;