import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  Plus, 
  Search, 
  BarChart3, 
  MessageSquare, 
  Settings,
  Bell
} from 'lucide-react';

const quickActions = [
  {
    title: 'Search Politicians',
    href: '/politicians',
    icon: Search,
    description: 'Find political figures',
    color: 'bg-blue-500'
  },
  {
    title: 'Analytics',
    href: '/analytics',
    icon: BarChart3,
    description: 'View performance data',
    color: 'bg-green-500'
  },
  {
    title: 'Messages',
    href: '/messenger',
    icon: MessageSquare,
    description: 'Contact politicians',
    color: 'bg-purple-500'
  },
  {
    title: 'Admin Dashboard',
    href: '/admin/dashboard',
    icon: Settings,
    description: 'Manage content',
    color: 'bg-red-500'
  }
];

export const QuickActions: React.FC = () => {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Plus className="w-5 h-5" />
          Quick Actions
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {quickActions.map((action) => {
          const Icon = action.icon;
          
          return (
            <Link key={action.href} to={action.href}>
              <Button 
                variant="ghost" 
                className="w-full justify-start gap-3 h-auto p-3"
              >
                <div className={`w-8 h-8 rounded-md flex items-center justify-center text-white ${action.color}`}>
                  <Icon className="w-4 h-4" />
                </div>
                <div className="text-left">
                  <div className="font-medium">{action.title}</div>
                  <div className="text-xs text-muted-foreground">{action.description}</div>
                </div>
              </Button>
            </Link>
          );
        })}
      </CardContent>
    </Card>
  );
};