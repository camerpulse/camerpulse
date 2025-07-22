/**
 * CompanyCard Component
 * 
 * Unified card for displaying companies and organizations
 */

import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { RatingStars } from './RatingStars';
import { CivicTag, VerifiedTag } from './CivicTag';
import { 
  Building, 
  MapPin, 
  Users, 
  Calendar,
  DollarSign,
  ExternalLink,
  Mail,
  Globe
} from 'lucide-react';
import { Company } from './types';

interface CompanyCardProps {
  company: Company;
  onViewProfile?: (companyId: string) => void;
  onContact?: (companyId: string) => void;
  onRate?: (companyId: string, rating: number) => void;
  showActions?: boolean;
  className?: string;
}

export const CompanyCard: React.FC<CompanyCardProps> = ({
  company,
  onViewProfile,
  onContact,
  onRate,
  showActions = true,
  className = ''
}) => {
  const getInitials = () => {
    return company.name
      .split(' ')
      .map(word => word[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const formatEmployeeCount = (count?: number) => {
    if (!count) return 'Non spécifié';
    if (count < 10) return '1-10';
    if (count < 50) return '11-50';
    if (count < 200) return '51-200';
    if (count < 1000) return '201-1000';
    return '1000+';
  };

  return (
    <Card className={`hover:shadow-elegant transition-all duration-300 hover:-translate-y-1 ${className}`}>
      <CardContent className="p-6">
        {/* Header */}
        <div className="flex items-start gap-4 mb-4">
          <Avatar className="w-16 h-16 border-2 border-primary/20">
            <AvatarImage src={company.logo} alt={company.name} />
            <AvatarFallback className="bg-primary text-primary-foreground text-lg">
              {getInitials()}
            </AvatarFallback>
          </Avatar>
          
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <h3 className="text-lg font-bold text-foreground">{company.name}</h3>
              {company.verified && <VerifiedTag />}
            </div>
            
            <CivicTag type="ministry" label={company.businessType} size="sm" className="mb-2" />
            
            <div className="flex items-center gap-1 text-sm text-muted-foreground">
              <MapPin className="w-3 h-3" />
              <span>{company.location}</span>
            </div>
          </div>
          
          <div className="text-right">
            <div className="mb-2">
              <RatingStars rating={company.rating} size="sm" disabled showLabel />
            </div>
            <p className="text-xs text-muted-foreground">
              {company.totalReviews} avis
            </p>
          </div>
        </div>

        {/* Company Stats */}
        <div className="grid grid-cols-2 gap-4 mb-4">
          {company.employees && (
            <div className="text-center p-3 bg-muted/50 rounded-lg">
              <Users className="w-5 h-5 text-primary mx-auto mb-1" />
              <div className="text-sm font-medium text-foreground">
                {formatEmployeeCount(company.employees)}
              </div>
              <div className="text-xs text-muted-foreground">Employés</div>
            </div>
          )}
          
          {company.revenue && (
            <div className="text-center p-3 bg-muted/50 rounded-lg">
              <DollarSign className="w-5 h-5 text-cm-green mx-auto mb-1" />
              <div className="text-sm font-medium text-foreground">{company.revenue}</div>
              <div className="text-xs text-muted-foreground">Chiffre d'affaires</div>
            </div>
          )}
          
          {company.founded && (
            <div className="text-center p-3 bg-muted/50 rounded-lg">
              <Calendar className="w-5 h-5 text-accent mx-auto mb-1" />
              <div className="text-sm font-medium text-foreground">{company.founded}</div>
              <div className="text-xs text-muted-foreground">Fondée</div>
            </div>
          )}
          
          <div className="text-center p-3 bg-muted/50 rounded-lg">
            <Building className="w-5 h-5 text-secondary mx-auto mb-1" />
            <div className="text-sm font-medium text-foreground">{company.rating}</div>
            <div className="text-xs text-muted-foreground">Note moyenne</div>
          </div>
        </div>

        {/* Rating Section */}
        <div className="mb-4 p-3 bg-muted/30 rounded-lg">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-foreground">Évaluer cette entreprise</span>
            <RatingStars 
              rating={0} 
              size="sm" 
              onRatingChange={(rating) => onRate?.(company.id, rating)}
            />
          </div>
        </div>

        {/* Badges */}
        <div className="flex flex-wrap gap-2 mb-4">
          {company.verified && (
            <Badge className="bg-cm-green text-white">
              <Building className="w-3 h-3 mr-1" />
              Entreprise vérifiée
            </Badge>
          )}
          
          <Badge variant="outline" className="border-primary/30">
            <Globe className="w-3 h-3 mr-1" />
            {company.businessType}
          </Badge>
        </div>

        {/* Actions */}
        {showActions && (
          <div className="flex gap-2">
            <Button 
              variant="outline" 
              size="sm" 
              className="flex-1"
              onClick={() => onContact?.(company.id)}
            >
              <Mail className="w-4 h-4 mr-2" />
              Contacter
            </Button>
            
            <Button 
              variant="default" 
              size="sm" 
              className="flex-1"
              onClick={() => onViewProfile?.(company.id)}
            >
              <ExternalLink className="w-4 h-4 mr-2" />
              Voir profil
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
};