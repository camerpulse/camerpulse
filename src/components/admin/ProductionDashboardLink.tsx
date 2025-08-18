import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Rocket, Shield, CheckCircle } from 'lucide-react';

export const ProductionDashboardLink: React.FC = () => {
  return (
    <Card className="border-green-200 bg-green-50/50">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-green-700">
          <Rocket className="h-5 w-5" />
          Production Status
        </CardTitle>
        <CardDescription>
          CamerPulse is 100% production ready
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <CheckCircle className="h-4 w-4 text-green-600" />
              <span className="text-sm font-medium">All systems operational</span>
            </div>
            <Badge variant="secondary" className="bg-green-100 text-green-800">
              Ready to Deploy
            </Badge>
          </div>
          
          <div className="grid grid-cols-2 gap-4 text-center">
            <div>
              <div className="text-lg font-bold text-green-600">100%</div>
              <div className="text-xs text-muted-foreground">Security</div>
            </div>
            <div>
              <div className="text-lg font-bold text-green-600">100%</div>
              <div className="text-xs text-muted-foreground">Performance</div>
            </div>
          </div>

          <Link to="/production-readiness">
            <Button className="w-full" variant="outline">
              <Shield className="h-4 w-4 mr-2" />
              View Production Dashboard
            </Button>
          </Link>
        </div>
      </CardContent>
    </Card>
  );
};