import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { AlertCircle } from 'lucide-react';

interface BiddingInterfaceProps {
  tenderId: string;
  tenderTitle: string;
  submissionDeadline: string;
  isExpired: boolean;
}

export const BiddingInterface: React.FC<BiddingInterfaceProps> = ({ 
  tenderId, 
  tenderTitle 
}) => {
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <AlertCircle className="w-5 h-5 text-orange-500" />
            <span>Bidding System Setup Required</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <p className="text-muted-foreground mb-4">
              The bidding system database tables need to be created before this interface can function.
            </p>
            <p className="text-sm text-muted-foreground">
              Please ensure the database migration has been successfully executed.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};