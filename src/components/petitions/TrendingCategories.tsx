import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { TrendingUp, Users, Target, ArrowRight } from 'lucide-react';

interface CategoryStats {
  category: string;
  icon: string;
  label: string;
  petitionCount: number;
  totalSignatures: number;
  successRate: number;
  trending: boolean;
  description: string;
  color: string;
}

interface TrendingCategoriesProps {
  onCategorySelect?: (category: string) => void;
  className?: string;
}

const CATEGORY_STATS: CategoryStats[] = [
  {
    category: 'governance',
    icon: '🏛️',
    label: 'Governance',
    petitionCount: 45,
    totalSignatures: 125400,
    successRate: 28,
    trending: true,
    description: 'Government transparency and accountability',
    color: 'bg-blue-50 border-blue-200'
  },
  {
    category: 'health',
    icon: '🏥',
    label: 'Healthcare',
    petitionCount: 32,
    totalSignatures: 89200,
    successRate: 35,
    trending: true,
    description: 'Healthcare access and quality improvements',
    color: 'bg-green-50 border-green-200'
  },
  {
    category: 'education',
    icon: '📚',
    label: 'Education',
    petitionCount: 28,
    totalSignatures: 76800,
    successRate: 42,
    trending: false,
    description: 'Educational reforms and infrastructure',
    color: 'bg-purple-50 border-purple-200'
  },
  {
    category: 'environment',
    icon: '🌍',
    label: 'Environment',
    petitionCount: 24,
    totalSignatures: 65300,
    successRate: 38,
    trending: true,
    description: 'Environmental protection and sustainability',
    color: 'bg-emerald-50 border-emerald-200'
  },
  {
    category: 'justice',
    icon: '⚖️',
    label: 'Justice',
    petitionCount: 19,
    totalSignatures: 54200,
    successRate: 31,
    trending: false,
    description: 'Legal reforms and justice system improvements',
    color: 'bg-amber-50 border-amber-200'
  },
  {
    category: 'local_issues',
    icon: '🏘️',
    label: 'Local Issues',
    petitionCount: 38,
    totalSignatures: 92100,
    successRate: 45,
    trending: true,
    description: 'Community-specific concerns and improvements',
    color: 'bg-orange-50 border-orange-200'
  }
];

export const TrendingCategories: React.FC<TrendingCategoriesProps> = ({ 
  onCategorySelect,
  className 
}) => {
  return (
    <div className={className}>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold">Trending Categories</h2>
          <p className="text-muted-foreground">
            Explore petitions by category and impact
          </p>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {CATEGORY_STATS.map((category) => (
          <Card 
            key={category.category}
            className={`group hover:shadow-lg transition-all duration-200 cursor-pointer border-2 ${category.color}`}
            onClick={() => onCategorySelect?.(category.category)}
          >
            <CardContent className="p-6 space-y-4">
              {/* Header */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="text-2xl">{category.icon}</div>
                  <div>
                    <h3 className="font-semibold text-lg">{category.label}</h3>
                    {category.trending && (
                      <Badge variant="destructive" className="text-xs mt-1">
                        <TrendingUp className="w-3 h-3 mr-1" />
                        Trending
                      </Badge>
                    )}
                  </div>
                </div>
                <ArrowRight className="w-5 h-5 text-muted-foreground group-hover:text-primary transition-colors" />
              </div>

              {/* Description */}
              <p className="text-sm text-muted-foreground leading-relaxed">
                {category.description}
              </p>

              {/* Stats */}
              <div className="grid grid-cols-3 gap-4 pt-2">
                <div className="text-center">
                  <div className="text-2xl font-bold text-primary">
                    {category.petitionCount}
                  </div>
                  <div className="text-xs text-muted-foreground">
                    Petitions
                  </div>
                </div>
                
                <div className="text-center">
                  <div className="text-2xl font-bold text-primary">
                    {(category.totalSignatures / 1000).toFixed(0)}k
                  </div>
                  <div className="text-xs text-muted-foreground">
                    Signatures
                  </div>
                </div>
                
                <div className="text-center">
                  <div className="text-2xl font-bold text-primary">
                    {category.successRate}%
                  </div>
                  <div className="text-xs text-muted-foreground">
                    Success
                  </div>
                </div>
              </div>

              {/* Action */}
              <Button 
                variant="outline" 
                className="w-full group-hover:bg-primary group-hover:text-primary-foreground"
                onClick={(e) => {
                  e.stopPropagation();
                  onCategorySelect?.(category.category);
                }}
              >
                Explore {category.label}
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};