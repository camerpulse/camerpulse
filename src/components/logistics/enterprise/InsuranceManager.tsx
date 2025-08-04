import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Shield } from 'lucide-react';

export const InsuranceManager = () => {
  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold flex items-center gap-2 mb-4">
        <Shield className="h-6 w-6" />
        Insurance & Claims Management
      </h2>
      <Card>
        <CardHeader>
          <CardTitle>Insurance Dashboard</CardTitle>
        </CardHeader>
        <CardContent>
          <p>Insurance and claims management features coming soon...</p>
        </CardContent>
      </Card>
    </div>
  );
};