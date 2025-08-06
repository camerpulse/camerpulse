import React, { useState, useEffect } from 'react';
import { FileText, TrendingUp, Clock, Users, ThumbsUp, MessageCircle, Plus } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { Link } from 'react-router-dom';

interface VillagePetitionsProps {
  villageId: string;
}

interface Petition {
  id: string;
  title: string;
  description: string;
  target_signatures: number;
  current_signatures: number;
  status: string;
  created_at: string;
  deadline?: string;
  category: string;
  creator: {
    username: string;
    display_name: string;
  };
}

export const VillagePetitions: React.FC<VillagePetitionsProps> = ({ villageId }) => {
  const [petitions, setPetitions] = useState<Petition[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPetitions();
  }, [villageId]);

  const fetchPetitions = async () => {
    try {
      const { data, error } = await supabase
        .from('petitions')
        .select(`
          *,
          profiles:creator_id(username, display_name)
        `)
        .eq('village_id', villageId)
        .eq('status', 'active')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setPetitions(data || []);
    } catch (error) {
      console.error('Error fetching petitions:', error);
      toast.error('Failed to load petitions');
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active':
        return <Badge variant="default" className="bg-green-100 text-green-800">Active</Badge>;
      case 'successful':
        return <Badge variant="default" className="bg-blue-100 text-blue-800">Successful</Badge>;
      case 'closed':
        return <Badge variant="secondary">Closed</Badge>;
      default:
        return <Badge variant="outline">Draft</Badge>;
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'infrastructure':
        return 'text-blue-600';
      case 'education':
        return 'text-green-600';
      case 'health':
        return 'text-red-600';
      case 'environment':
        return 'text-emerald-600';
      case 'governance':
        return 'text-purple-600';
      default:
        return 'text-gray-600';
    }
  };

  const getProgressPercentage = (current: number, target: number) => {
    return Math.min((current / target) * 100, 100);
  };

  const isDeadlineApproaching = (deadline?: string) => {
    if (!deadline) return false;
    const deadlineDate = new Date(deadline);
    const now = new Date();
    const daysLeft = Math.ceil((deadlineDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
    return daysLeft <= 7 && daysLeft > 0;
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {Array.from({ length: 4 }).map((_, i) => (
            <Card key={i} className="p-6">
              <div className="animate-pulse space-y-4">
                <div className="h-6 bg-muted rounded w-3/4" />
                <div className="h-4 bg-muted rounded w-1/2" />
                <div className="h-20 bg-muted rounded" />
                <div className="h-4 bg-muted rounded" />
              </div>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold flex items-center">
            <FileText className="h-6 w-6 mr-2" />
            Village Petitions
          </h2>
          <p className="text-muted-foreground">
            Active community initiatives and petitions for change
          </p>
        </div>
        <Button>
          <Plus className="h-4 w-4 mr-2" />
          Start Petition
        </Button>
      </div>

      {/* Petitions Grid */}
      {petitions.length === 0 ? (
        <Card className="text-center p-12">
          <FileText className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
          <h3 className="text-lg font-semibold mb-2">No active petitions</h3>
          <p className="text-muted-foreground mb-4">
            Be the first to start a petition for positive change in your village!
          </p>
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            Start First Petition
          </Button>
        </Card>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {petitions.map((petition) => (
            <Card key={petition.id} className="hover:shadow-md transition-shadow">
              <CardHeader className="pb-4">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      {getStatusBadge(petition.status)}
                      <Badge variant="outline" className={getCategoryColor(petition.category)}>
                        {petition.category}
                      </Badge>
                      {isDeadlineApproaching(petition.deadline) && (
                        <Badge variant="destructive" className="animate-pulse">
                          <Clock className="h-3 w-3 mr-1" />
                          Urgent
                        </Badge>
                      )}
                    </div>
                    <CardTitle className="text-lg leading-tight">
                      <Link 
                        to={`/petitions/${petition.id}`}
                        className="hover:text-primary transition-colors"
                      >
                        {petition.title}
                      </Link>
                    </CardTitle>
                  </div>
                </div>
              </CardHeader>
              
              <CardContent className="space-y-4">
                <p className="text-muted-foreground line-clamp-3">
                  {petition.description}
                </p>

                {/* Progress */}
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="font-medium">
                      {petition.current_signatures.toLocaleString()} signatures
                    </span>
                    <span className="text-muted-foreground">
                      Goal: {petition.target_signatures.toLocaleString()}
                    </span>
                  </div>
                  <Progress 
                    value={getProgressPercentage(petition.current_signatures, petition.target_signatures)}
                    className="h-2"
                  />
                  <div className="text-xs text-muted-foreground">
                    {getProgressPercentage(petition.current_signatures, petition.target_signatures).toFixed(1)}% complete
                  </div>
                </div>

                {/* Meta Information */}
                <div className="flex items-center justify-between text-sm text-muted-foreground">
                  <div className="flex items-center">
                    <Users className="h-4 w-4 mr-1" />
                    By {petition.creator?.display_name || petition.creator?.username}
                  </div>
                  <div className="flex items-center">
                    <Clock className="h-4 w-4 mr-1" />
                    {new Date(petition.created_at).toLocaleDateString()}
                  </div>
                </div>

                {petition.deadline && (
                  <div className="text-sm text-muted-foreground">
                    Deadline: {new Date(petition.deadline).toLocaleDateString()}
                  </div>
                )}

                {/* Actions */}
                <div className="flex gap-2 pt-2">
                  <Button size="sm" className="flex-1">
                    <ThumbsUp className="h-4 w-4 mr-2" />
                    Sign Petition
                  </Button>
                  <Button size="sm" variant="outline">
                    <MessageCircle className="h-4 w-4 mr-2" />
                    Comment
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="text-center p-4">
          <div className="text-2xl font-bold text-primary">{petitions.length}</div>
          <div className="text-sm text-muted-foreground">Active Petitions</div>
        </Card>
        <Card className="text-center p-4">
          <div className="text-2xl font-bold text-green-600">
            {petitions.reduce((sum, p) => sum + p.current_signatures, 0)}
          </div>
          <div className="text-sm text-muted-foreground">Total Signatures</div>
        </Card>
        <Card className="text-center p-4">
          <div className="text-2xl font-bold text-blue-600">
            {petitions.filter(p => 
              getProgressPercentage(p.current_signatures, p.target_signatures) >= 100
            ).length}
          </div>
          <div className="text-sm text-muted-foreground">Goals Reached</div>
        </Card>
        <Card className="text-center p-4">
          <div className="text-2xl font-bold text-orange-600">
            {petitions.filter(p => isDeadlineApproaching(p.deadline)).length}
          </div>
          <div className="text-sm text-muted-foreground">Urgent</div>
        </Card>
      </div>
    </div>
  );
};