import React from 'react';
import { Calendar } from 'lucide-react';

interface CalendarViewProps {
  events: any[];
  villageId: string;
}

export const CalendarView: React.FC<CalendarViewProps> = () => {
  return (
    <div className="h-64 flex items-center justify-center border-2 border-dashed border-muted rounded-lg">
      <div className="text-center">
        <Calendar className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
        <h3 className="font-semibold mb-2">Calendar View</h3>
        <p className="text-sm text-muted-foreground">
          Interactive calendar view coming soon
        </p>
      </div>
    </div>
  );
};