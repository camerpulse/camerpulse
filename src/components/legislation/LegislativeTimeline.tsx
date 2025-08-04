import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Calendar, ArrowRight, Clock } from 'lucide-react';
import { format } from 'date-fns';

interface LegislativeTimelineProps {
  bills: Array<{
    id: string;
    bill_title: string;
    status: string;
    date_introduced: string;
    law_type: string;
    originator_name?: string;
  }>;
}

export const LegislativeTimeline: React.FC<LegislativeTimelineProps> = ({ bills }) => {
  // Sort bills by date for timeline view
  const sortedBills = [...bills].sort((a, b) => 
    new Date(b.date_introduced).getTime() - new Date(a.date_introduced).getTime()
  );

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'passed':
        return 'bg-green-500';
      case 'rejected':
        return 'bg-red-500';
      case 'in_committee':
        return 'bg-blue-500';
      case 'voted':
        return 'bg-purple-500';
      default:
        return 'bg-gray-500';
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Clock className="h-5 w-5" />
          Legislative Timeline
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="relative">
          {/* Timeline line */}
          <div className="absolute left-6 top-0 bottom-0 w-0.5 bg-muted" />
          
          <div className="space-y-6">
            {sortedBills.map((bill, index) => (
              <div key={bill.id} className="relative flex items-start gap-4">
                {/* Timeline dot */}
                <div className={`relative z-10 w-3 h-3 rounded-full ${getStatusColor(bill.status)} ring-4 ring-background`} />
                
                {/* Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="font-medium line-clamp-1">{bill.bill_title}</h3>
                    <Badge variant="outline" className="text-xs">
                      {bill.law_type}
                    </Badge>
                  </div>
                  
                  <div className="flex items-center gap-3 text-sm text-muted-foreground mb-2">
                    <span className="flex items-center gap-1">
                      <Calendar className="h-3 w-3" />
                      {format(new Date(bill.date_introduced), 'MMM d, yyyy')}
                    </span>
                    {bill.originator_name && (
                      <>
                        <ArrowRight className="h-3 w-3" />
                        <span>{bill.originator_name}</span>
                      </>
                    )}
                  </div>
                  
                  <Badge variant={
                    bill.status === 'passed' ? 'default' :
                    bill.status === 'rejected' ? 'destructive' : 'secondary'
                  }>
                    {bill.status.replace('_', ' ')}
                  </Badge>
                </div>
              </div>
            ))}
          </div>
          
          {sortedBills.length === 0 && (
            <div className="text-center py-8 text-muted-foreground">
              <Clock className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>No legislation found</p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};