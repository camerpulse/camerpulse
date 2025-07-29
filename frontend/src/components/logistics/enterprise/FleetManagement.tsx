import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Truck } from 'lucide-react';

export const FleetManagement = () => {
  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold flex items-center gap-2 mb-4">
        <Truck className="h-6 w-6" />
        Fleet Management
      </h2>
      <Card>
        <CardHeader>
          <CardTitle>Fleet Dashboard</CardTitle>
        </CardHeader>
        <CardContent>
          <p>Fleet tracking and management features coming soon...</p>
        </CardContent>
      </Card>
    </div>
  );
};