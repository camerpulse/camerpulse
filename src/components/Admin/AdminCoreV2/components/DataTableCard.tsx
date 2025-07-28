import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { 
  Calendar,
  User,
  MapPin,
  Tag,
  ExternalLink,
  Edit,
  Trash2,
  Eye,
  MoreHorizontal
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

interface DataTableCardProps {
  title: string;
  subtitle?: string;
  status?: {
    label: string;
    variant: 'default' | 'secondary' | 'destructive' | 'outline';
  };
  metadata?: {
    icon: React.ComponentType<{ className?: string }>;
    label: string;
    value: string;
  }[];
  tags?: string[];
  actions?: {
    label: string;
    icon: React.ComponentType<{ className?: string }>;
    onClick: () => void;
    variant?: 'default' | 'destructive' | 'outline';
  }[];
  children?: React.ReactNode;
  className?: string;
}

export const DataTableCard: React.FC<DataTableCardProps> = ({
  title,
  subtitle,
  status,
  metadata,
  tags,
  actions,
  children,
  className = ''
}) => {
  return (
    <Card className={`hover:shadow-md transition-shadow ${className}`}>
      <CardHeader>
        <div className="flex items-start justify-between">
          <div className="space-y-1 flex-1">
            <CardTitle className="text-lg">{title}</CardTitle>
            {subtitle && (
              <CardDescription>{subtitle}</CardDescription>
            )}
            
            {/* Status and Tags */}
            <div className="flex items-center gap-2 flex-wrap">
              {status && (
                <Badge variant={status.variant}>
                  {status.label}
                </Badge>
              )}
              {tags?.map((tag, index) => (
                <Badge key={index} variant="outline" className="text-xs">
                  <Tag className="h-3 w-3 mr-1" />
                  {tag}
                </Badge>
              ))}
            </div>
          </div>

          {/* Actions */}
          {actions && actions.length > 0 && (
            <div className="flex items-center gap-1">
              {actions.length <= 2 ? (
                actions.map((action, index) => (
                  <Button
                    key={index}
                    variant={action.variant || 'outline'}
                    size="sm"
                    onClick={action.onClick}
                  >
                    <action.icon className="h-4 w-4 mr-1" />
                    {action.label}
                  </Button>
                ))
              ) : (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline" size="sm">
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    {actions.map((action, index) => (
                      <React.Fragment key={index}>
                        <DropdownMenuItem onClick={action.onClick}>
                          <action.icon className="h-4 w-4 mr-2" />
                          {action.label}
                        </DropdownMenuItem>
                        {index < actions.length - 1 && action.variant === 'destructive' && (
                          <DropdownMenuSeparator />
                        )}
                      </React.Fragment>
                    ))}
                  </DropdownMenuContent>
                </DropdownMenu>
              )}
            </div>
          )}
        </div>
      </CardHeader>

      {/* Metadata */}
      {metadata && metadata.length > 0 && (
        <>
          <Separator />
          <CardContent className="py-3">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {metadata.map((item, index) => (
                <div key={index} className="flex items-center gap-2 text-sm">
                  <item.icon className="h-4 w-4 text-muted-foreground" />
                  <span className="text-muted-foreground">{item.label}:</span>
                  <span className="font-medium">{item.value}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </>
      )}

      {/* Custom Content */}
      {children && (
        <>
          <Separator />
          <CardContent>
            {children}
          </CardContent>
        </>
      )}
    </Card>
  );
};