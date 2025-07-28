import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Search, Filter, RefreshCw } from 'lucide-react';

interface AdminModuleHeaderProps {
  title: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
  iconColor: string;
  badge?: {
    text: string;
    variant?: 'default' | 'secondary' | 'destructive' | 'outline';
  };
  actions?: React.ReactNode;
  searchPlaceholder?: string;
  onSearch?: (query: string) => void;
  onRefresh?: () => void;
  loading?: boolean;
}

export const AdminModuleHeader: React.FC<AdminModuleHeaderProps> = ({
  title,
  description,
  icon: Icon,
  iconColor,
  badge,
  actions,
  searchPlaceholder,
  onSearch,
  onRefresh,
  loading = false
}) => {
  return (
    <div className="space-y-6">
      {/* Main Header */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div className="space-y-2">
          <div className="flex items-center gap-3">
            <Icon className={`h-6 w-6 ${iconColor}`} />
            <h1 className="text-2xl font-bold text-foreground">{title}</h1>
            {badge && (
              <Badge variant={badge.variant || 'secondary'}>
                {badge.text}
              </Badge>
            )}
          </div>
          <p className="text-muted-foreground">{description}</p>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-3">
          {onRefresh && (
            <Button
              variant="outline"
              size="sm"
              onClick={onRefresh}
              disabled={loading}
            >
              <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
          )}
          {actions}
        </div>
      </div>

      {/* Search and Filters */}
      {(onSearch || searchPlaceholder) && (
        <Card>
          <CardContent className="p-4">
            <div className="flex flex-col sm:flex-row gap-3">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder={searchPlaceholder || 'Search...'}
                  className="pl-10"
                  onChange={(e) => onSearch?.(e.target.value)}
                />
              </div>
              <Button variant="outline" size="sm">
                <Filter className="h-4 w-4 mr-2" />
                Filters
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};