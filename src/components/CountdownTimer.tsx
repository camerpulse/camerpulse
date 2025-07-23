import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Clock, AlertTriangle, CheckCircle } from 'lucide-react';

interface CountdownTimerProps {
  deadline: string;
  title?: string;
  showDays?: boolean;
  showSeconds?: boolean;
  variant?: 'default' | 'compact' | 'large';
  onExpired?: () => void;
  className?: string;
}

interface TimeRemaining {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
  total: number;
  expired: boolean;
}

export default function CountdownTimer({
  deadline,
  title = "Time Remaining",
  showDays = true,
  showSeconds = true,
  variant = 'default',
  onExpired,
  className = ''
}: CountdownTimerProps) {
  const [timeRemaining, setTimeRemaining] = useState<TimeRemaining>({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0,
    total: 0,
    expired: false
  });

  const calculateTimeRemaining = (): TimeRemaining => {
    const now = new Date().getTime();
    const deadlineTime = new Date(deadline).getTime();
    const difference = deadlineTime - now;

    if (difference <= 0) {
      return {
        days: 0,
        hours: 0,
        minutes: 0,
        seconds: 0,
        total: 0,
        expired: true
      };
    }

    const days = Math.floor(difference / (1000 * 60 * 60 * 24));
    const hours = Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((difference % (1000 * 60)) / 1000);

    return {
      days,
      hours,
      minutes,
      seconds,
      total: difference,
      expired: false
    };
  };

  useEffect(() => {
    const timer = setInterval(() => {
      const newTimeRemaining = calculateTimeRemaining();
      setTimeRemaining(newTimeRemaining);

      if (newTimeRemaining.expired && onExpired) {
        onExpired();
      }
    }, 1000);

    // Set initial value
    setTimeRemaining(calculateTimeRemaining());

    return () => clearInterval(timer);
  }, [deadline, onExpired]);

  const getUrgencyLevel = (): 'normal' | 'warning' | 'urgent' | 'expired' => {
    if (timeRemaining.expired) return 'expired';
    if (timeRemaining.total <= 2 * 60 * 60 * 1000) return 'urgent'; // 2 hours
    if (timeRemaining.total <= 24 * 60 * 60 * 1000) return 'warning'; // 24 hours
    return 'normal';
  };

  const getUrgencyColor = () => {
    const level = getUrgencyLevel();
    switch (level) {
      case 'expired':
        return 'text-red-600 bg-red-50 border-red-200';
      case 'urgent':
        return 'text-red-600 bg-red-50 border-red-200';
      case 'warning':
        return 'text-orange-600 bg-orange-50 border-orange-200';
      default:
        return 'text-green-600 bg-green-50 border-green-200';
    }
  };

  const getUrgencyIcon = () => {
    const level = getUrgencyLevel();
    switch (level) {
      case 'expired':
        return <CheckCircle className="w-4 h-4" />;
      case 'urgent':
      case 'warning':
        return <AlertTriangle className="w-4 h-4" />;
      default:
        return <Clock className="w-4 h-4" />;
    }
  };

  const formatTimeUnit = (value: number, label: string) => {
    return (
      <div className="text-center">
        <div className="text-2xl font-bold text-foreground">
          {value.toString().padStart(2, '0')}
        </div>
        <div className="text-xs text-muted-foreground uppercase tracking-wider">
          {label}
        </div>
      </div>
    );
  };

  const formatCompactTime = () => {
    if (timeRemaining.expired) {
      return 'Expired';
    }

    const parts = [];
    if (showDays && timeRemaining.days > 0) {
      parts.push(`${timeRemaining.days}d`);
    }
    if (timeRemaining.hours > 0) {
      parts.push(`${timeRemaining.hours}h`);
    }
    if (timeRemaining.minutes > 0) {
      parts.push(`${timeRemaining.minutes}m`);
    }
    if (showSeconds && timeRemaining.seconds > 0 && timeRemaining.days === 0) {
      parts.push(`${timeRemaining.seconds}s`);
    }

    return parts.join(' ') || '0m';
  };

  if (variant === 'compact') {
    return (
      <Badge 
        variant="outline" 
        className={`${getUrgencyColor()} ${className} flex items-center space-x-1`}
      >
        {getUrgencyIcon()}
        <span>{formatCompactTime()}</span>
      </Badge>
    );
  }

  if (variant === 'large') {
    return (
      <Card className={`${getUrgencyColor()} ${className}`}>
        <CardHeader className="pb-2">
          <CardTitle className="flex items-center space-x-2 text-lg">
            {getUrgencyIcon()}
            <span>{title}</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {timeRemaining.expired ? (
            <div className="text-center">
              <div className="text-3xl font-bold text-red-600 mb-2">
                EXPIRED
              </div>
              <div className="text-sm text-muted-foreground">
                Deadline has passed
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-4 gap-4">
              {showDays && formatTimeUnit(timeRemaining.days, 'Days')}
              {formatTimeUnit(timeRemaining.hours, 'Hours')}
              {formatTimeUnit(timeRemaining.minutes, 'Minutes')}
              {showSeconds && formatTimeUnit(timeRemaining.seconds, 'Seconds')}
            </div>
          )}
        </CardContent>
      </Card>
    );
  }

  // Default variant
  return (
    <div className={`${getUrgencyColor()} rounded-lg p-3 border ${className}`}>
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          {getUrgencyIcon()}
          <span className="font-medium text-sm">{title}</span>
        </div>
        <div className="font-mono text-sm font-bold">
          {formatCompactTime()}
        </div>
      </div>
    </div>
  );
}

// Helper component for use in tender cards
export const TenderDeadlineTimer: React.FC<{
  deadline: string;
  tenderId: string;
}> = ({ deadline, tenderId }) => {
  return (
    <CountdownTimer
      deadline={deadline}
      title="Deadline"
      variant="compact"
      showDays={true}
      showSeconds={false}
      onExpired={() => {
        console.log(`Tender ${tenderId} deadline expired`);
        // Could trigger additional actions here
      }}
    />
  );
};

// Helper component for bid submission deadlines
export const BidDeadlineAlert: React.FC<{
  deadline: string;
  onExpired?: () => void;
}> = ({ deadline, onExpired }) => {
  return (
    <CountdownTimer
      deadline={deadline}
      title="Bid Submission Closes In"
      variant="large"
      showDays={true}
      showSeconds={true}
      onExpired={onExpired}
      className="sticky top-4 z-10"
    />
  );
};