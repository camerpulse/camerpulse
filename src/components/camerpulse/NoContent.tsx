import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

interface NoContentProps {
  title?: string;
  description?: string;
  actionLabel?: string;
  onAction?: () => void;
  icon?: React.ReactNode;
}

export const NoContent: React.FC<NoContentProps> = ({
  title = 'No content', description = 'There is nothing here for now.',
  actionLabel, onAction, icon
}) => (
  <Card>
    <CardContent className="p-8 text-center">
      {icon && <div className="mb-4">{icon}</div>}
      <h3 className="text-lg font-medium mb-2">{title}</h3>
      <p className="text-muted-foreground mb-4">{description}</p>
      {actionLabel && <Button onClick={onAction}>{actionLabel}</Button>}
    </CardContent>
  </Card>
);