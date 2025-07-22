import React from 'react';
import { Link } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  Calendar, 
  MapPin, 
  Building2, 
  DollarSign, 
  Clock,
  Users
} from "lucide-react";

interface TenderCardProps {
  tender: {
    id: string;
    title: string;
    category: string;
    region: string;
    tender_type: string;
    budget_min: number;
    budget_max: number;
    submission_deadline: string;
    status: string;
    published_by: string;
    bids_count: number;
    created_at: string;
  };
  variant?: 'grid' | 'list';
}

export const TenderCard: React.FC<TenderCardProps> = ({ tender, variant = 'grid' }) => {
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'XAF',
      minimumFractionDigits: 0,
      notation: 'compact'
    }).format(amount);
  };

  const calculateDaysRemaining = (deadline: string) => {
    const today = new Date();
    const deadlineDate = new Date(deadline);
    const diffTime = deadlineDate.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'active': return 'bg-green-500';
      case 'closed': return 'bg-red-500';
      case 'draft': return 'bg-yellow-500';
      case 'awarded': return 'bg-blue-500';
      default: return 'bg-gray-500';
    }
  };

  const daysRemaining = calculateDaysRemaining(tender.submission_deadline);
  const isExpiring = daysRemaining <= 3 && daysRemaining > 0;
  const isExpired = daysRemaining <= 0;

  if (variant === 'list') {
    return (
      <Card className="hover:shadow-lg transition-shadow duration-200">
        <CardContent className="p-6">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-2">
                <Badge className={`${getStatusColor(tender.status)} text-white text-xs`}>
                  {tender.status.toUpperCase()}
                </Badge>
                <Badge variant="outline" className="text-xs">{tender.category}</Badge>
              </div>
              
              <Link to={`/tenders/${tender.id}`}>
                <h3 className="font-semibold text-lg hover:text-primary transition-colors mb-2 line-clamp-2">
                  {tender.title}
                </h3>
              </Link>
              
              <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground mb-3">
                <div className="flex items-center gap-1">
                  <Building2 className="h-3 w-3" />
                  <span className="truncate">{tender.published_by}</span>
                </div>
                <div className="flex items-center gap-1">
                  <MapPin className="h-3 w-3" />
                  <span>{tender.region}</span>
                </div>
                <div className="flex items-center gap-1">
                  <Users className="h-3 w-3" />
                  <span>{tender.bids_count} bids</span>
                </div>
              </div>
              
              <div className="flex items-center gap-1 text-sm">
                <DollarSign className="h-3 w-3 text-muted-foreground" />
                <span className="font-medium">
                  {formatCurrency(tender.budget_min)} - {formatCurrency(tender.budget_max)}
                </span>
              </div>
            </div>
            
            <div className="flex flex-col items-end gap-3 lg:min-w-[200px]">
              <div className="flex items-center gap-1 text-sm">
                <Clock className={`h-4 w-4 ${isExpiring ? 'text-orange-500' : isExpired ? 'text-red-500' : 'text-muted-foreground'}`} />
                <span className={`${isExpiring ? 'text-orange-500 font-medium' : isExpired ? 'text-red-500 font-medium' : 'text-muted-foreground'}`}>
                  {isExpired ? 'Expired' : `${daysRemaining} days left`}
                </span>
              </div>
              
              <Link to={`/tenders/${tender.id}`}>
                <Button size="sm" disabled={isExpired}>
                  {isExpired ? 'View Details' : 'Apply Now'}
                </Button>
              </Link>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="hover:shadow-lg transition-shadow duration-200 h-full">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-2 mb-2">
          <div className="flex flex-wrap gap-1">
            <Badge className={`${getStatusColor(tender.status)} text-white text-xs`}>
              {tender.status.toUpperCase()}
            </Badge>
            <Badge variant="outline" className="text-xs">{tender.category}</Badge>
          </div>
          
          <div className="flex items-center gap-1 text-xs text-muted-foreground">
            <Clock className={`h-3 w-3 ${isExpiring ? 'text-orange-500' : isExpired ? 'text-red-500' : ''}`} />
            <span className={`${isExpiring ? 'text-orange-500 font-medium' : isExpired ? 'text-red-500 font-medium' : ''}`}>
              {isExpired ? 'Expired' : `${daysRemaining}d`}
            </span>
          </div>
        </div>
        
        <Link to={`/tenders/${tender.id}`}>
          <CardTitle className="text-base hover:text-primary transition-colors line-clamp-3">
            {tender.title}
          </CardTitle>
        </Link>
      </CardHeader>
      
      <CardContent className="pt-0">
        <div className="space-y-3">
          <div className="space-y-2 text-sm text-muted-foreground">
            <div className="flex items-center gap-1">
              <Building2 className="h-3 w-3 flex-shrink-0" />
              <span className="truncate">{tender.published_by}</span>
            </div>
            <div className="flex items-center gap-1">
              <MapPin className="h-3 w-3 flex-shrink-0" />
              <span>{tender.region}</span>
            </div>
            <div className="flex items-center gap-1">
              <Users className="h-3 w-3 flex-shrink-0" />
              <span>{tender.bids_count} bids</span>
            </div>
          </div>
          
          <div className="flex items-center gap-1 text-sm">
            <DollarSign className="h-3 w-3 text-muted-foreground flex-shrink-0" />
            <span className="font-medium text-xs">
              {formatCurrency(tender.budget_min)} - {formatCurrency(tender.budget_max)}
            </span>
          </div>
          
          <div className="flex items-center justify-between pt-2">
            <div className="flex items-center gap-1 text-xs text-muted-foreground">
              <Calendar className="h-3 w-3" />
              <span>{new Date(tender.submission_deadline).toLocaleDateString()}</span>
            </div>
            
            <Link to={`/tenders/${tender.id}`}>
              <Button size="sm" disabled={isExpired}>
                {isExpired ? 'View' : 'Apply'}
              </Button>
            </Link>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};