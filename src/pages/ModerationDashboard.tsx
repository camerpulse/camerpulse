import { AppLayout } from '@/components/Layout/AppLayout';
import { ModerationDashboard as Dashboard } from '@/components/moderation/ModerationDashboard';

const ModerationDashboard = () => {
  return (
    <AppLayout showMobileNav={false}>
      <Dashboard />
    </AppLayout>
  );
};

export default ModerationDashboard;