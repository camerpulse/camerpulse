import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Shield, Users, Store, Database, Settings, ArrowRight } from 'lucide-react';

interface UnifiedAdminWelcomeProps {
  onModuleSelect: (moduleId: string) => void;
  adminRole?: any;
}

export const UnifiedAdminWelcome: React.FC<UnifiedAdminWelcomeProps> = ({
  onModuleSelect,
  adminRole
}) => {
  const moduleCategories = [
    {
      title: 'Core Platform',
      description: 'Essential platform management',
      icon: Shield,
      color: 'text-cm-green',
      modules: [
        { id: 'users-roles', label: 'Users & Roles', description: 'Manage user accounts and permissions' },
        { id: 'moderation', label: 'Content Moderation', description: 'Monitor and moderate platform content' },
        { id: 'analytics-logs', label: 'Analytics & Logs', description: 'System analytics and monitoring' }
      ]
    },
    {
      title: 'Business & Commerce',
      description: 'Marketplace and financial management',
      icon: Store,
      color: 'text-green-600',
      modules: [
        { id: 'marketplace-admin', label: 'Marketplace Admin', description: 'Manage vendors and listings' },
        { id: 'company-directory', label: 'Company Directory', description: 'Business directory management' },
        { id: 'billionaire-tracker', label: 'Billionaire Tracker', description: 'Wealth tracking system' }
      ]
    },
    {
      title: 'Civic & Political',
      description: 'Democratic and civic tools',
      icon: Users,
      color: 'text-cm-red',
      modules: [
        { id: 'polls-system', label: 'Polls System', description: 'Polling and voting management' },
        { id: 'civic-officials', label: 'Civic Officials', description: 'Political figure management' },
        { id: 'political-parties', label: 'Political Parties', description: 'Party system management' }
      ]
    },
    {
      title: 'System Management',
      description: 'Advanced system controls',
      icon: Database,
      color: 'text-blue-600',
      modules: [
        { id: 'data-import', label: 'Data Import', description: 'Import and manage data' },
        { id: 'intelligence', label: 'Intelligence Panel', description: 'AI and intelligence tools' },
        { id: 'settings-sync', label: 'Settings & Sync', description: 'System configuration' }
      ]
    }
  ];

  return (
    <div className="space-y-6">
      <div className="text-center py-8">
        <Shield className="h-16 w-16 text-primary mx-auto mb-4" />
        <h1 className="text-3xl font-bold mb-2">Welcome to CamerPulse Admin Core</h1>
        <p className="text-muted-foreground text-lg">
          Unified administration for all platform features
        </p>
        <Badge variant="outline" className="mt-2">
          {adminRole?.role?.toUpperCase()} ACCESS
        </Badge>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {moduleCategories.map((category) => {
          const IconComponent = category.icon;
          return (
            <Card key={category.title} className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <CardTitle className="flex items-center gap-3">
                  <IconComponent className={`h-6 w-6 ${category.color}`} />
                  {category.title}
                </CardTitle>
                <CardDescription>{category.description}</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {category.modules.map((module) => (
                    <div
                      key={module.id}
                      className="flex items-center justify-between p-3 rounded-lg border hover:bg-muted/50 cursor-pointer transition-colors"
                      onClick={() => onModuleSelect(module.id)}
                    >
                      <div>
                        <div className="font-medium">{module.label}</div>
                        <div className="text-sm text-muted-foreground">{module.description}</div>
                      </div>
                      <ArrowRight className="h-4 w-4 text-muted-foreground" />
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <Card className="bg-muted/50">
        <CardContent className="p-6">
          <div className="text-center">
            <Settings className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
            <h3 className="text-lg font-semibold mb-2">Unified Admin Experience</h3>
            <p className="text-muted-foreground mb-4">
              All CamerPulse admin features have been consolidated into this single, 
              powerful dashboard. Navigate between modules using the sidebar or quick access above.
            </p>
            <Button onClick={() => onModuleSelect('dashboard')} variant="outline">
              Go to Dashboard Overview
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};