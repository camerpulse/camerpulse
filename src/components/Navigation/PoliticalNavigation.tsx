import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { URLBuilder } from '@/utils/slug';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Users, Crown, Building, Scale } from 'lucide-react';
import { cn } from '@/lib/utils';

const politicalSections = [
  {
    title: 'Politicians',
    href: URLBuilder.politicians.list(),
    icon: Users,
    description: 'All political figures',
    color: 'bg-blue-500'
  },
  {
    title: 'Senators',
    href: URLBuilder.senators.list(),
    icon: Crown,
    description: 'Upper house members',
    color: 'bg-purple-500'
  },
  {
    title: 'MPs',
    href: URLBuilder.mps.list(),
    icon: Building,
    description: 'National Assembly members',
    color: 'bg-green-500'
  },
  {
    title: 'Ministers',
    href: URLBuilder.ministers.list(),
    icon: Scale,
    description: 'Cabinet ministers',
    color: 'bg-red-500'
  }
];

export const PoliticalNavigation: React.FC = () => {
  const location = useLocation();

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
      {politicalSections.map((section) => {
        const isActive = location.pathname === section.href;
        const Icon = section.icon;
        
        return (
          <Link key={section.href} to={section.href}>
            <Card className={cn(
              "transition-all duration-300 hover:shadow-lg cursor-pointer",
              isActive && "ring-2 ring-primary shadow-lg"
            )}>
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className={cn(
                    "w-10 h-10 rounded-lg flex items-center justify-center text-white",
                    section.color
                  )}>
                    <Icon className="w-5 h-5" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-sm">{section.title}</h3>
                    <p className="text-xs text-muted-foreground">{section.description}</p>
                  </div>
                  {isActive && (
                    <Badge variant="secondary" className="ml-auto">
                      Active
                    </Badge>
                  )}
                </div>
              </CardContent>
            </Card>
          </Link>
        );
      })}
    </div>
  );
};