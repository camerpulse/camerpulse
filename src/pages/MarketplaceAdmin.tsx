import { AppLayout } from '@/components/Layout/AppLayout';
import { MarketplaceAdmin as MarketplaceAdminComponent } from '@/components/Admin/MarketplaceAdmin';

const MarketplaceAdmin = () => {
  return (
    <AppLayout showMobileNav={false}>
      <MarketplaceAdminComponent />
    </AppLayout>
  );
};

export default MarketplaceAdmin;