import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Users, Shield, Building, Crown, Vote } from 'lucide-react';

export function PoliticalNavigationMenu() {
  const location = useLocation();

  const navigationItems = [
    {
      title: 'All Politicians',
      href: '/politicians',
      icon: Users,
      description: 'Complete directory of all political figures'
    },
    {
      title: 'Ministers',
      href: '/ministers',
      icon: Shield,
      description: 'Government ministers and cabinet members'
    },
    {
      title: 'MPs',
      href: '/mps',
      icon: Building,
      description: 'Members of Parliament by constituency'
    },
    {
      title: 'Senators',
      href: '/senators',
      icon: Crown,
      description: 'Senate members by region'
    },
    {
      title: 'Political Parties',
      href: '/political-parties',
      icon: Vote,
      description: 'Political parties and their members'
    },
    {
      title: 'Political Directory',
      href: '/political-directory',
      icon: Users,
      description: 'Unified political directory with cross-links'
    }
  ];

  return (
    <Card className="mb-6">
      <CardContent className="p-4">
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-2">
          {navigationItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.href;
            
            return (
              <Button
                key={item.href}
                asChild
                variant={isActive ? "default" : "ghost"}
                size="sm"
                className="h-auto p-3 flex flex-col items-center gap-1"
              >
                <Link to={item.href}>
                  <Icon className="h-4 w-4" />
                  <span className="text-xs text-center leading-tight">
                    {item.title}
                  </span>
                </Link>
              </Button>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}