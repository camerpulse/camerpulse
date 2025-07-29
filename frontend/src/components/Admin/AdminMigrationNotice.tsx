import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ArrowRight, Shield, Zap, Users } from 'lucide-react';
import { Link } from 'react-router-dom';

interface AdminMigrationNoticeProps {
  legacyFeature: string;
  newModuleId: string;
}

export const AdminMigrationNotice: React.FC<AdminMigrationNoticeProps> = ({
  legacyFeature,
  newModuleId
}) => {
  const getFeatureInfo = (feature: string) => {
    const featureMap = {
      'moderation': {
        title: 'Content Moderation',
        description: 'Monitor and moderate platform content',
        icon: Shield,
        color: 'text-orange-600'
      },
      'marketplace': {
        title: 'Marketplace Administration',
        description: 'Manage vendors, listings, and transactions',
        icon: Users,
        color: 'text-green-600'
      },
      'data-import': {
        title: 'Data Import & Management',
        description: 'Import and manage system data',
        icon: Zap,
        color: 'text-blue-600'
      },
      'village': {
        title: 'Village & Community',
        description: 'Manage village reputation and community features',
        icon: Users,
        color: 'text-green-600'
      }
    };
    
    return featureMap[feature as keyof typeof featureMap] || {
      title: 'Admin Feature',
      description: 'Administrative functionality',
      icon: Shield,
      color: 'text-primary'
    };
  };

  const info = getFeatureInfo(legacyFeature);
  const IconComponent = info.icon;

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <Card className="w-full max-w-2xl">
        <CardHeader className="text-center">
          <div className="flex items-center justify-center mb-4">
            <IconComponent className={`h-16 w-16 ${info.color}`} />
          </div>
          <CardTitle className="text-2xl font-bold">
            {info.title} Has Been Upgraded
          </CardTitle>
          <CardDescription className="text-lg">
            This feature is now part of our unified CamerPulse Admin Core
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="text-center">
            <Badge variant="outline" className="mb-4">
              Enhanced Experience Available
            </Badge>
            <p className="text-muted-foreground">
              {info.description} is now integrated into our powerful, unified admin dashboard 
              with improved functionality and better user experience.
            </p>
          </div>

          <div className="bg-muted/50 rounded-lg p-4">
            <h3 className="font-semibold mb-2 flex items-center gap-2">
              <Zap className="h-4 w-4 text-cm-green" />
              What's New in Admin Core:
            </h3>
            <ul className="text-sm text-muted-foreground space-y-1">
              <li>• Unified interface for all admin functions</li>
              <li>• Real-time analytics and monitoring</li>
              <li>• Enhanced role-based access control</li>
              <li>• Cross-module workflows and automation</li>
              <li>• Improved mobile responsiveness</li>
            </ul>
          </div>

          <div className="flex flex-col sm:flex-row gap-3">
            <Button asChild className="flex-1" variant="patriotic">
              <Link to="/admin/core" className="flex items-center gap-2">
                <ArrowRight className="h-4 w-4" />
                Go to Admin Core
              </Link>
            </Button>
            <Button asChild variant="outline" className="flex-1">
              <Link to="/admin">
                Return to Main Admin
              </Link>
            </Button>
          </div>

          <div className="text-center text-sm text-muted-foreground">
            <p>
              All your existing functionality is preserved and enhanced in the new unified interface.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};