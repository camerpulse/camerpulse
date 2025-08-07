import React from 'react';
import { AppLayout } from "@/components/Layout/AppLayout";
import { EnhancedProductListing } from '@/components/Marketplace/EnhancedProductListing';
import { MarketplaceSidebar } from '@/components/Marketplace/MarketplaceSidebar';

/**
 * Enhanced marketplace products page with advanced filtering and search
 */
const MarketplaceProducts: React.FC = () => {
  return (
    <AppLayout>
      <div className="min-h-screen bg-background">
        <div className="container mx-auto px-4 py-6">
          <div className="flex gap-6">
            {/* Sidebar */}
            <div className="hidden lg:block w-64 flex-shrink-0">
              <MarketplaceSidebar />
            </div>

            {/* Main content */}
            <div className="flex-1">
              <EnhancedProductListing />
            </div>
          </div>
        </div>
      </div>
    </AppLayout>
  );
};

export default MarketplaceProducts;