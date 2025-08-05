import { AppLayout } from '@/components/Layout/AppLayout';
import { DataImportDashboard } from '@/components/Admin/DataImportDashboard';
import { Shield } from 'lucide-react';

const AdminDataImport = () => {
  return (
    <AppLayout>
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-4">
            <Shield className="h-8 w-8 text-primary" />
            <h1 className="text-3xl font-bold">Admin Data Import</h1>
          </div>
          <p className="text-muted-foreground">
            Import and manage data for the Legislative Directory system
          </p>
        </div>

        <DataImportDashboard />
      </div>
    </AppLayout>
  );
};

export default AdminDataImport;