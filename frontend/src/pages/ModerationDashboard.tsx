import { AdminMigrationNotice } from '@/components/Admin/AdminMigrationNotice';

const ModerationDashboard = () => {
  return <AdminMigrationNotice legacyFeature="moderation" newModuleId="moderation" />;
};

export default ModerationDashboard;