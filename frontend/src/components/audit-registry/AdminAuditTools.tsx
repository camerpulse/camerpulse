import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Clock, CheckCircle, XCircle } from 'lucide-react';

export const AdminAuditTools: React.FC = () => {
  const mockPendingAudits = [
    { id: '1', title: 'Ministry Audit Report', status: 'pending' },
    { id: '2', title: 'Hospital Investigation', status: 'pending' }
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Clock className="h-5 w-5" />
          Admin Panel - Pending Audits
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {mockPendingAudits.map((audit) => (
          <div key={audit.id} className="flex items-center justify-between p-4 border rounded">
            <span>{audit.title}</span>
            <div className="flex gap-2">
              <Button size="sm" variant="outline">
                <CheckCircle className="h-4 w-4 mr-1" />
                Approve
              </Button>
              <Button size="sm" variant="outline">
                <XCircle className="h-4 w-4 mr-1" />
                Reject
              </Button>
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
};