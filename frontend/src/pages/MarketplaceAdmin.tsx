import { AdminMigrationNotice } from '@/components/Admin/AdminMigrationNotice';

const MarketplaceAdmin = () => {
  return <AdminMigrationNotice legacyFeature="marketplace" newModuleId="marketplace-admin" />;
};

export default MarketplaceAdmin;