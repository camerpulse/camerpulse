import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { ReputationWidget } from './ReputationWidget';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Shield, User, FileText, AlertTriangle, ExternalLink } from 'lucide-react';
import { ScoreTransparency } from './ScoreTransparency';

interface EntityReputationProps {
  entityId: string;
  entityType: 'politician' | 'ministry' | 'government_agency' | 'village' | 'project';
  entityName: string;
  showFullProfile?: boolean;
  className?: string;
}

interface ReputationData {
  total_score: number;
  reputation_badge: 'excellent' | 'trusted' | 'under_watch' | 'flagged';
  transparency_score: number;
  performance_score: number;
  citizen_rating_score: number;
  last_calculated_at: string;
}

interface RelatedActivity {
  id: string;
  type: 'petition' | 'tender' | 'project' | 'complaint';
  title: string;
  status: string;
  created_at: string;
  relevance_score: number;
}

export function EntityReputationProfile({ 
  entityId, 
  entityType, 
  entityName, 
  showFullProfile = false,
  className 
}: EntityReputationProps) {
  const [reputationData, setReputationData] = useState<ReputationData | null>(null);
  const [relatedActivities, setRelatedActivities] = useState<RelatedActivity[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchReputationData();
    if (showFullProfile) {
      fetchRelatedActivities();
    }
  }, [entityId, entityType]);

  const fetchReputationData = async () => {
    try {
      setLoading(true);
      
      // Mock reputation data for demonstration
      const mockReputation: ReputationData = {
        total_score: Math.floor(Math.random() * 40) + 60, // 60-100 range
        reputation_badge: ['excellent', 'trusted', 'under_watch'][Math.floor(Math.random() * 3)] as any,
        transparency_score: Math.floor(Math.random() * 30) + 70,
        performance_score: Math.floor(Math.random() * 35) + 65,
        citizen_rating_score: Math.floor(Math.random() * 40) + 60,
        last_calculated_at: new Date().toISOString()
      };

      setReputationData(mockReputation);
    } catch (error) {
      console.error('Failed to fetch reputation data:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchRelatedActivities = async () => {
    try {
      // Mock related activities
      const mockActivities: RelatedActivity[] = [
        {
          id: '1',
          type: 'petition',
          title: 'Improve Healthcare Infrastructure in Region',
          status: 'active',
          created_at: new Date(Date.now() - 604800000).toISOString(),
          relevance_score: 85
        },
        {
          id: '2',
          type: 'tender',
          title: 'Road Construction Project - North Route',
          status: 'awarded',
          created_at: new Date(Date.now() - 1209600000).toISOString(),
          relevance_score: 92
        },
        {
          id: '3',
          type: 'complaint',
          title: 'Delayed Response to Infrastructure Concerns',
          status: 'resolved',
          created_at: new Date(Date.now() - 1814400000).toISOString(),
          relevance_score: 78
        }
      ];

      setRelatedActivities(mockActivities);
    } catch (error) {
      console.error('Failed to fetch related activities:', error);
    }
  };

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'petition': return <FileText className="h-4 w-4" />;
      case 'tender': return <Shield className="h-4 w-4" />;
      case 'project': return <Shield className="h-4 w-4" />;
      case 'complaint': return <AlertTriangle className="h-4 w-4" />;
      default: return <FileText className="h-4 w-4" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800';
      case 'awarded': return 'bg-blue-100 text-blue-800';
      case 'resolved': return 'bg-gray-100 text-gray-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading || !reputationData) {
    return (
      <div className={`animate-pulse space-y-4 ${className}`}>
        <div className="h-32 bg-muted rounded-lg"></div>
        {showFullProfile && <div className="h-48 bg-muted rounded-lg"></div>}
      </div>
    );
  }

  if (!showFullProfile) {
    // Compact widget for embedding in other pages
    return (
      <div className={`space-y-2 ${className}`}>
        <ReputationWidget
          score={reputationData.total_score}
          level={reputationData.reputation_badge === 'excellent' ? 'excellent' : 
                 reputationData.reputation_badge === 'trusted' ? 'good' :
                 reputationData.reputation_badge === 'under_watch' ? 'average' : 'poor'}
          trend="stable"
          entityName={entityName}
          entityType={entityType}
          showDetails={true}
        />
        <ScoreTransparency
          entityId={entityId}
          entityName={entityName}
          currentScore={reputationData.total_score}
          compact={true}
        />
      </div>
    );
  }

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Main Reputation Card */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-4">
            <Avatar className="h-16 w-16">
              <AvatarImage src={`https://api.dicebear.com/7.x/initials/svg?seed=${entityName}`} />
              <AvatarFallback>
                <User className="h-8 w-8" />
              </AvatarFallback>
            </Avatar>
            <div className="flex-1">
              <CardTitle className="text-2xl">{entityName}</CardTitle>
              <p className="text-muted-foreground capitalize">{entityType.replace('_', ' ')}</p>
            </div>
            <div className="text-right">
              <ReputationWidget
                score={reputationData.total_score}
                level={reputationData.reputation_badge === 'excellent' ? 'excellent' : 
                       reputationData.reputation_badge === 'trusted' ? 'good' :
                       reputationData.reputation_badge === 'under_watch' ? 'average' : 'poor'}
                trend="stable"
                entityName={entityName}
                entityType={entityType}
                compact={false}
              />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-3 gap-4">
            <div className="text-center p-4 bg-muted/50 rounded-lg">
              <div className="text-2xl font-bold text-blue-600">
                {Math.round(reputationData.transparency_score)}
              </div>
              <div className="text-sm text-muted-foreground">Transparency</div>
            </div>
            <div className="text-center p-4 bg-muted/50 rounded-lg">
              <div className="text-2xl font-bold text-green-600">
                {Math.round(reputationData.performance_score)}
              </div>
              <div className="text-sm text-muted-foreground">Performance</div>
            </div>
            <div className="text-center p-4 bg-muted/50 rounded-lg">
              <div className="text-2xl font-bold text-purple-600">
                {Math.round(reputationData.citizen_rating_score)}
              </div>
              <div className="text-sm text-muted-foreground">Citizen Rating</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Score Transparency */}
      <ScoreTransparency
        entityId={entityId}
        entityName={entityName}
        currentScore={reputationData.total_score}
        compact={false}
      />

      {/* Related Activities */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Related Civic Activities
          </CardTitle>
        </CardHeader>
        <CardContent>
          {relatedActivities.length === 0 ? (
            <p className="text-center text-muted-foreground py-8">
              No related activities found
            </p>
          ) : (
            <div className="space-y-3">
              {relatedActivities.map((activity) => (
                <div key={activity.id} className="flex items-center justify-between p-3 border rounded-lg hover:bg-muted/50 transition-colors">
                  <div className="flex items-center gap-3">
                    {getActivityIcon(activity.type)}
                    <div className="space-y-1">
                      <h4 className="font-medium">{activity.title}</h4>
                      <div className="flex items-center gap-2">
                        <Badge 
                          variant="outline" 
                          className={getStatusColor(activity.status)}
                        >
                          {activity.status}
                        </Badge>
                        <span className="text-xs text-muted-foreground capitalize">
                          {activity.type}
                        </span>
                        <span className="text-xs text-muted-foreground">
                          {new Date(activity.created_at).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-sm font-medium">
                      {activity.relevance_score}% relevance
                    </div>
                    <Button variant="ghost" size="sm">
                      <ExternalLink className="h-3 w-3" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-wrap gap-2">
          <Button variant="outline" size="sm">
            View Full Profile
          </Button>
          <Button variant="outline" size="sm">
            Compare with Others
          </Button>
          <Button variant="outline" size="sm">
            Export Report
          </Button>
          <Button variant="outline" size="sm">
            Flag for Review
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}