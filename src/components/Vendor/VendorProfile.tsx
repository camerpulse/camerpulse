import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Package } from 'lucide-react';

export const VendorProfile: React.FC = () => {
  return (
    <Card>
      <CardContent className="p-6 text-center">
        <Package className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
        <p className="text-muted-foreground">Vendor profile management coming soon...</p>
      </CardContent>
    </Card>
  );
};