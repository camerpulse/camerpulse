import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  MapPin, 
  DollarSign, 
  Clock, 
  Eye, 
  Users, 
  Bookmark,
  AlertTriangle,
  CheckCircle
} from 'lucide-react';

interface TenderCardProps {
  tender: {
    id: string;
    title: string;
    description: string;
    category: string;
    type: 'public' | 'private' | 'ngo' | 'international';
    budget: { min: number; max: number; currency: string };
    deadline: string;
    region: string;
    issuer: string;
    status: string;
    bidsCount: number;
    viewsCount: number;
    isFeatured: boolean;
  };
  onClick?: () => void;
  onBookmark?: () => void;
  variant?: 'default' | 'compact' | 'featured';
}

export const TenderCard: React.FC<TenderCardProps> = ({ 
  tender, 
  onClick, 
  onBookmark,
  variant = 'default' 
}) => {
  const formatBudget = (budget: TenderCardProps['tender']['budget']) => {
    const formatAmount = (amount: number) => {
      if (amount >= 1000000000) return `${(amount / 1000000000).toFixed(1)}B`;
      if (amount >= 1000000) return `${(amount / 1000000).toFixed(1)}M`;
      if (amount >= 1000) return `${(amount / 1000).toFixed(1)}K`;
      return amount.toString();
    };

    if (budget.min && budget.max) {
      return `${formatAmount(budget.min)} - ${formatAmount(budget.max)} ${budget.currency}`;
    }
    return `${formatAmount(budget.max)} ${budget.currency}`;
  };

  const daysLeft = Math.ceil((new Date(tender.deadline).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));
  const isUrgent = daysLeft <= 7;

  const cardClasses = `
    hover:shadow-lg transition-all duration-200 cursor-pointer
    ${variant === 'featured' ? 'border-2 border-yellow-300 bg-gradient-to-br from-yellow-50 to-white' : ''}
    ${variant === 'compact' ? 'h-auto' : ''}
  `;

  return (
    <Card className={cardClasses} onClick={onClick}>
      <CardHeader className={variant === 'compact' ? 'pb-2' : 'pb-4'}>
        <div className="flex items-start justify-between gap-2">
          <div className="flex-1">
            <CardTitle className={`leading-tight mb-2 ${variant === 'compact' ? 'text-base' : 'text-lg'}`}>
              {tender.title}
            </CardTitle>
            <div className="flex flex-wrap gap-2 mb-3">
              <Badge variant="outline" className="text-xs">{tender.category}</Badge>
              <Badge 
                variant={tender.type === 'public' ? 'default' : 'secondary'}
                className="text-xs"
              >
                {tender.type.toUpperCase()}
              </Badge>
              {tender.isFeatured && (
                <Badge className="bg-yellow-100 text-yellow-800 text-xs">
                  Featured
                </Badge>
              )}
              {isUrgent && (
                <Badge className="bg-red-100 text-red-800 text-xs">
                  <AlertTriangle className="h-3 w-3 mr-1" />
                  Urgent
                </Badge>
              )}
            </div>
          </div>
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={(e) => {
              e.stopPropagation();
              onBookmark?.();
            }}
          >
            <Bookmark className="h-4 w-4" />
          </Button>
        </div>
      </CardHeader>
      
      <CardContent className={variant === 'compact' ? 'pt-0' : ''}>
        {variant !== 'compact' && (
          <CardDescription className="mb-4 line-clamp-2">
            {tender.description}
          </CardDescription>
        )}
        
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-sm">
            <MapPin className="h-4 w-4 text-muted-foreground flex-shrink-0" />
            <span>{tender.region} Region</span>
          </div>
          
          <div className="flex items-center gap-2 text-sm">
            <DollarSign className="h-4 w-4 text-muted-foreground flex-shrink-0" />
            <span>{formatBudget(tender.budget)}</span>
          </div>
          
          <div className="flex items-center gap-2 text-sm">
            <Clock className="h-4 w-4 text-muted-foreground flex-shrink-0" />
            <span className={isUrgent ? 'text-red-600 font-medium' : ''}>
              {daysLeft > 0 ? `${daysLeft} days left` : 'Deadline passed'}
            </span>
          </div>
          
          <div className="flex items-center justify-between text-sm text-muted-foreground pt-2">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-1">
                <Eye className="h-4 w-4" />
                <span>{tender.viewsCount}</span>
              </div>
              <div className="flex items-center gap-1">
                <Users className="h-4 w-4" />
                <span>{tender.bidsCount} bids</span>
              </div>
            </div>
            {tender.status === 'open' ? (
              <CheckCircle className="h-4 w-4 text-green-500" />
            ) : (
              <Badge variant="secondary" className="text-xs">{tender.status}</Badge>
            )}
          </div>
        </div>
        
        {variant !== 'compact' && (
          <Button className="w-full mt-4">
            View Details
          </Button>
        )}
      </CardContent>
    </Card>
  );
};