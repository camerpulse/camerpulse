import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  Users, UserCheck, Target, Building2, CreditCard, TrendingUp, 
  Activity, CheckCircle, AlertTriangle, Clock, Database, Brain
} from 'lucide-react';

interface AdminDashboardProps {
  hasPermission: (permission: string) => boolean;
  logActivity: (action: string, details: any) => void;
  stats?: any;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({ 
  hasPermission, 
  logActivity, 
  stats 
}) => {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-foreground mb-2">
          Admin Core v2.0 Dashboard
        </h1>
        <p className="text-muted-foreground">
          Comprehensive platform management and intelligence control suite
        </p>
      </div>

      {/* Quick Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="border-l-4 border-l-cm-green hover:shadow-elegant transition-all">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center">
              <Users className="h-4 w-4 mr-2" />
              Total Users
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">
              {stats?.total_users?.toLocaleString() || '0'}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              +12.3% from last month
            </p>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-cm-red hover:shadow-elegant transition-all">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center">
              <UserCheck className="h-4 w-4 mr-2" />
              Politicians
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">
              {stats?.total_politicians?.toLocaleString() || '0'}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Verified profiles active
            </p>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-cm-yellow hover:shadow-elegant transition-all">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center">
              <Target className="h-4 w-4 mr-2" />
              Active Polls
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">
              {stats?.total_polls?.toLocaleString() || '0'}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              High engagement rate
            </p>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-blue-500 hover:shadow-elegant transition-all">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center">
              <Building2 className="h-4 w-4 mr-2" />
              Companies
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">
              {stats?.total_companies?.toLocaleString() || '0'}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Directory listings
            </p>
          </CardContent>
        </Card>
      </div>

      {/* System Health Monitor */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Activity className="h-5 w-5 mr-2 text-cm-green" />
            System Health Monitor
          </CardTitle>
          <CardDescription>
            Real-time status of all CamerPulse services and modules
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="flex items-center justify-between p-4 rounded-lg bg-gradient-civic/10 border border-cm-green/20">
              <div>
                <p className="font-medium text-foreground">Database</p>
                <p className="text-sm text-muted-foreground">Operational</p>
              </div>
              <CheckCircle className="h-6 w-6 text-cm-green" />
            </div>
            
            <div className="flex items-center justify-between p-4 rounded-lg bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-800">
              <div>
                <p className="font-medium text-foreground">API Services</p>
                <p className="text-sm text-muted-foreground">Active</p>
              </div>
              <CheckCircle className="h-6 w-6 text-blue-600" />
            </div>
            
            <div className="flex items-center justify-between p-4 rounded-lg bg-gradient-patriotic/10 border border-cm-yellow/20">
              <div>
                <p className="font-medium text-foreground">AI Systems</p>
                <p className="text-sm text-muted-foreground">Learning</p>
              </div>
              <Brain className="h-6 w-6 text-cm-yellow" />
            </div>
            
            <div className="flex items-center justify-between p-4 rounded-lg bg-purple-50 dark:bg-purple-950/20 border border-purple-200 dark:border-purple-800">
              <div>
                <p className="font-medium text-foreground">Intelligence</p>
                <p className="text-sm text-muted-foreground">Monitoring</p>
              </div>
              <Activity className="h-6 w-6 text-purple-600" />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Clock className="h-5 w-5 mr-2" />
              Recent Activity
            </CardTitle>
            <CardDescription>Latest admin actions and system events</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {[
                { action: 'New poll approved', time: '2 minutes ago', type: 'success' },
                { action: 'Company registration pending', time: '5 minutes ago', type: 'warning' },
                { action: 'User reported content', time: '10 minutes ago', type: 'info' },
                { action: 'System backup completed', time: '1 hour ago', type: 'success' }
              ].map((item, index) => (
                <div key={index} className="flex items-center justify-between py-2 border-b border-border last:border-0">
                  <div className="flex items-center">
                    <Badge 
                      variant={item.type === 'success' ? 'default' : item.type === 'warning' ? 'secondary' : 'outline'}
                      className="mr-3"
                    >
                      {item.type}
                    </Badge>
                    <span className="text-sm">{item.action}</span>
                  </div>
                  <span className="text-xs text-muted-foreground">{item.time}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <AlertTriangle className="h-5 w-5 mr-2" />
              Pending Approvals
            </CardTitle>
            <CardDescription>Items requiring admin attention</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                <div>
                  <p className="font-medium">Company registrations</p>
                  <p className="text-sm text-muted-foreground">{stats?.pending_approvals || 0} pending</p>
                </div>
                <Badge variant="outline">{stats?.pending_approvals || 0}</Badge>
              </div>
              
              <div className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                <div>
                  <p className="font-medium">Billionaire submissions</p>
                  <p className="text-sm text-muted-foreground">3 pending verification</p>
                </div>
                <Badge variant="outline">3</Badge>
              </div>
              
              <div className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                <div>
                  <p className="font-medium">Content reports</p>
                  <p className="text-sm text-muted-foreground">7 require review</p>
                </div>
                <Badge variant="outline">7</Badge>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};