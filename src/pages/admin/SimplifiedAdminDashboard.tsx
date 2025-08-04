import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { BarChart3, Users, Bell, Settings, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function SimplifiedAdminDashboard() {
  const adminModules = [
    {
      title: 'User Management',
      description: 'Manage users, profiles, and permissions',
      icon: Users,
      path: '/admin/users',
      color: 'text-blue-500'
    },
    {
      title: 'Notifications',
      description: 'Unified notification center',
      icon: Bell,
      path: '/admin/notifications',
      color: 'text-green-500'
    },
    {
      title: 'Analytics',
      description: 'Platform insights and metrics',
      icon: BarChart3,
      path: '/admin/analytics',
      color: 'text-purple-500'
    },
    {
      title: 'System Settings',
      description: 'Configure platform settings',
      icon: Settings,
      path: '/admin/settings',
      color: 'text-orange-500'
    }
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Admin Dashboard</h1>
        <p className="text-muted-foreground">
          Manage and monitor the CamerPulse platform
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-2">
        {adminModules.map((module) => (
          <Card key={module.path} className="hover:shadow-md transition-shadow">
            <CardHeader className="pb-3">
              <div className="flex items-center gap-3">
                <module.icon className={`h-8 w-8 ${module.color}`} />
                <div>
                  <CardTitle className="text-lg">{module.title}</CardTitle>
                  <p className="text-sm text-muted-foreground">
                    {module.description}
                  </p>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <Button asChild className="w-full">
                <Link to={module.path} className="flex items-center gap-2">
                  Access Module
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 md:grid-cols-3">
            <Button variant="outline" asChild>
              <Link to="/">← Back to Platform</Link>
            </Button>
            <Button variant="outline" asChild>
              <Link to="/admin/notifications">View Notifications</Link>
            </Button>
            <Button variant="outline" asChild>
              <Link to="/admin/settings">System Settings</Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}