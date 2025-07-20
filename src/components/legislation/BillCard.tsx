import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Calendar, Users, ThumbsUp, ThumbsDown, Heart, MessageSquare, FileText, TrendingUp } from 'lucide-react';
import { format } from 'date-fns';

interface BillCardProps {
  bill: {
    id: string;
    bill_title: string;
    bill_number?: string;
    law_type: string;
    status: string;
    originator_name?: string;
    legislative_summary?: string;
    date_introduced: string;
    citizen_upvotes: number;
    citizen_downvotes: number;
    followers_count: number;
    total_comments: number;
    affected_sectors?: string[];
    tags?: string[];
    transparency_score: number;
    corruption_risk_level: string;
  };
  onVote: (billId: string, position: 'yes' | 'no') => void;
  onFollow: () => void;
}

export const BillCard: React.FC<BillCardProps> = ({
  bill,
  onVote,
  onFollow,
}) => {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'passed':
        return 'default';
      case 'rejected':
        return 'destructive';
      case 'draft':
        return 'secondary';
      case 'in_committee':
      case 'first_reading':
      case 'second_reading':
      case 'third_reading':
        return 'outline';
      default:
        return 'secondary';
    }
  };

  const getRiskColor = (risk: string) => {
    switch (risk) {
      case 'high':
        return 'destructive';
      case 'medium':
        return 'outline';
      case 'low':
        return 'secondary';
      default:
        return 'secondary';
    }
  };

  const supportPercentage = bill.citizen_upvotes + bill.citizen_downvotes > 0 
    ? (bill.citizen_upvotes / (bill.citizen_upvotes + bill.citizen_downvotes)) * 100 
    : 0;

  return (
    <Card className="h-full flex flex-col">
      <CardHeader>
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <CardTitle className="text-lg line-clamp-2 mb-2">
              {bill.bill_title}
            </CardTitle>
            {bill.bill_number && (
              <p className="text-sm text-muted-foreground mb-2">
                Bill #{bill.bill_number}
              </p>
            )}
          </div>
          <FileText className="h-5 w-5 text-muted-foreground flex-shrink-0" />
        </div>
        
        <div className="flex flex-wrap gap-2">
          <Badge variant={getStatusColor(bill.status)}>
            {bill.status.replace('_', ' ')}
          </Badge>
          <Badge variant="outline">
            {bill.law_type}
          </Badge>
          <Badge variant={getRiskColor(bill.corruption_risk_level)}>
            {bill.corruption_risk_level} risk
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="flex-1 flex flex-col">
        {bill.legislative_summary && (
          <p className="text-sm text-muted-foreground mb-4 line-clamp-3">
            {bill.legislative_summary}
          </p>
        )}

        <div className="space-y-2 mb-4 text-sm">
          <div className="flex items-center gap-2">
            <Calendar className="h-4 w-4 text-muted-foreground" />
            <span>Introduced: {format(new Date(bill.date_introduced), 'MMM d, yyyy')}</span>
          </div>
          {bill.originator_name && (
            <div className="flex items-center gap-2">
              <Users className="h-4 w-4 text-muted-foreground" />
              <span>By: {bill.originator_name}</span>
            </div>
          )}
        </div>

        {/* Citizen Support Indicator */}
        <div className="mb-4">
          <div className="flex items-center justify-between text-sm mb-1">
            <span>Citizen Support</span>
            <span>{supportPercentage.toFixed(1)}%</span>
          </div>
          <div className="w-full bg-muted rounded-full h-2">
            <div 
              className="bg-primary h-2 rounded-full transition-all"
              style={{ width: `${supportPercentage}%` }}
            />
          </div>
        </div>

        <div className="flex items-center justify-between text-sm text-muted-foreground mb-4">
          <span className="flex items-center gap-1">
            <ThumbsUp className="h-4 w-4" />
            {bill.citizen_upvotes}
          </span>
          <span className="flex items-center gap-1">
            <ThumbsDown className="h-4 w-4" />
            {bill.citizen_downvotes}
          </span>
          <span className="flex items-center gap-1">
            <Heart className="h-4 w-4" />
            {bill.followers_count}
          </span>
          <span className="flex items-center gap-1">
            <MessageSquare className="h-4 w-4" />
            {bill.total_comments}
          </span>
        </div>

        {bill.affected_sectors && bill.affected_sectors.length > 0 && (
          <div className="mb-4">
            <p className="text-xs text-muted-foreground mb-2">Affected Sectors:</p>
            <div className="flex flex-wrap gap-1">
              {bill.affected_sectors.slice(0, 3).map((sector, index) => (
                <Badge key={index} variant="outline" className="text-xs">
                  {sector}
                </Badge>
              ))}
              {bill.affected_sectors.length > 3 && (
                <Badge variant="outline" className="text-xs">
                  +{bill.affected_sectors.length - 3} more
                </Badge>
              )}
            </div>
          </div>
        )}

        <div className="mt-auto">
          <div className="flex items-center justify-between mb-3 text-xs">
            <div className="flex items-center gap-1">
              <TrendingUp className="h-3 w-3" />
              <span>Transparency: {(bill.transparency_score * 10).toFixed(1)}/10</span>
            </div>
          </div>
          
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => onVote(bill.id, 'yes')}
              className="flex-1"
            >
              <ThumbsUp className="h-4 w-4 mr-1" />
              Support
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => onVote(bill.id, 'no')}
              className="flex-1"
            >
              <ThumbsDown className="h-4 w-4 mr-1" />
              Oppose
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={onFollow}
            >
              <Heart className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};