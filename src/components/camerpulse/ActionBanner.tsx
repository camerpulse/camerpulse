import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { AlertTriangle, Info, CheckCircle } from 'lucide-react';

interface ActionBannerProps {
  type: 'info' | 'warning' | 'success';
  title: string;
  description: string;
  actionLabel?: string;
  onAction?: () => void;
}

export const ActionBanner: React.FC<ActionBannerProps> = ({
  type, title, description, actionLabel, onAction
}) => {
  const config = {
    info: { icon: Info, className: 'bg-primary/10 border-primary' },
    warning: { icon: AlertTriangle, className: 'bg-cm-yellow/10 border-cm-yellow' },
    success: { icon: CheckCircle, className: 'bg-cm-green/10 border-cm-green' }
  };

  const { icon: Icon, className } = config[type];

  return (
    <Card className={`${className} border-l-4`}>
      <CardContent className="p-4 flex items-center gap-4">
        <Icon className="w-6 h-6" />
        <div className="flex-1">
          <h4 className="font-medium">{title}</h4>
          <p className="text-sm text-muted-foreground">{description}</p>
        </div>
        {actionLabel && (
          <Button size="sm" onClick={onAction}>{actionLabel}</Button>
        )}
      </CardContent>
    </Card>
  );
};