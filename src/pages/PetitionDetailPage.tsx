import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Separator } from '@/components/ui/separator';
import { SafeHtml } from '@/components/Security/SafeHtml';
import { PetitionSignForm } from '@/components/petitions/PetitionSignForm';
import { PetitionComments } from '@/components/petitions/PetitionComments';
import { PetitionUpdates } from '@/components/petitions/PetitionUpdates';
import { PetitionReactions } from '@/components/petitions/PetitionReactions';
import { PetitionSocialShare } from '@/components/petitions/PetitionSocialShare';
import { ReportPetitionDialog } from '@/components/petitions/ReportPetitionDialog';
import { PetitionAnalytics } from '@/components/petitions/PetitionAnalytics';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';
import { parseSlugForId } from '@/utils/slug';

interface Petition {
  id: string;
  title: string;
  description: string;
  goal_signatures: number;
  current_signatures: number;
  status: string;
  deadline?: string;
  created_by: string;
  slug?: string;
  created_at: string;
  updated_at: string;
}

const {
  Share2, 
  Heart, 
  MessageCircle, 
  Calendar, 
  MapPin, 
  Users, 
  Target,
  TrendingUp,
  Clock
} = require('lucide-react');

/**
 * Individual petition detail page with full information and interaction options
 */
const PetitionDetailPage: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const { user, isAuthenticated } = useAuth();
  const [petition, setPetition] = useState<Petition | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [hasSigned, setHasSigned] = useState(false);

// Fetch petition data
useEffect(() => {
  async function fetchPetition() {
    if (!slug) return;
    try {
      // Try by ID parsed from slug first for robustness
      const id = parseSlugForId(slug);
      let data: any = null;
      let error: any = null;

      if (id) {
        const res = await supabase.from('petitions').select('*').eq('id', id).maybeSingle();
        data = res.data; error = res.error;
      }

      if (!data) {
        const res2 = await supabase.from('petitions').select('*').eq('slug', slug).maybeSingle();
        data = res2.data; error = res2.error;
      }

      if (error || !data) {
        setError('Petition not found');
        return;
      }

      setPetition(data);
    } catch (err) {
      setError('Failed to load petition');
    } finally {
      setLoading(false);
    }
  }
  fetchPetition();
}, [slug]);

  // Check if user has signed
  useEffect(() => {
    async function checkSignature() {
      if (!user || !petition) return;

      const { data } = await supabase
        .from('petition_signatures')
        .select('id')
        .eq('petition_id', petition.id)
        .eq('user_id', user.id)
        .single();

      setHasSigned(!!data);
    }

    checkSignature();
  }, [user, petition]);

  // Subscribe to realtime updates
  useEffect(() => {
    if (!petition) return;

    const channel = supabase
      .channel('petition-updates')
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'petitions',
          filter: `id=eq.${petition.id}`
        },
        (payload) => {
          setPetition(prev => prev ? { ...prev, ...payload.new } : null);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [petition]);

  const handleSignatureAdded = () => {
    setHasSigned(true);
    if (petition) {
      setPetition(prev => prev ? {
        ...prev,
        current_signatures: prev.current_signatures + 1
      } : null);
    }
  };

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: petition?.title,
          url: window.location.href
        });
      } catch (error) {
        // User cancelled sharing
      }
    } else {
      await navigator.clipboard.writeText(window.location.href);
      toast.success('Link copied to clipboard!');
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-6">
        <div className="animate-pulse space-y-6">
          <div className="h-8 bg-gray-200 rounded w-3/4"></div>
          <div className="h-4 bg-gray-200 rounded w-1/2"></div>
          <div className="h-32 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-6">
        <Card>
          <CardContent className="text-center py-12">
            <p className="text-lg font-medium">Petition not found</p>
            <p className="text-muted-foreground">The petition you're looking for doesn't exist or has been removed.</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!petition) return null;
  
  const progressPercentage = (petition.current_signatures / petition.goal_signatures) * 100;
  const daysLeft = petition.deadline ? Math.max(0, Math.ceil(
    (new Date(petition.deadline).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)
  )) : null;

  return (
    <div className="container mx-auto px-4 py-6 space-y-6">
      {/* Header */}
      <div className="space-y-4">
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <span>Petitions</span>
          <span>/</span>
          <Badge variant="outline">Civic</Badge>
        </div>
        
        <div>
          <h1 className="text-3xl font-bold mb-2">{petition.title}</h1>
          <div className="flex items-center gap-4 text-sm text-muted-foreground">
            <div className="flex items-center gap-1">
              <Calendar className="w-4 h-4" />
              Started {new Date(petition.created_at).toLocaleDateString()}
            </div>
            <div className="flex items-center gap-1">
              <MapPin className="w-4 h-4" />
              National
            </div>
            <Badge variant={petition.status === 'active' ? 'default' : 'secondary'}>
              {petition.status}
            </Badge>
          </div>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Petition Content */}
          <Card>
            <CardHeader>
              <CardTitle>Petition Details</CardTitle>
            </CardHeader>
            <CardContent className="prose max-w-none">
              <p className="text-lg mb-4">{petition.description}</p>
            </CardContent>
          </Card>

          {/* Creator Info */}
          <Card>
            <CardHeader>
              <CardTitle>Started by</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-3">
                <Avatar>
                  <AvatarFallback>AC</AvatarFallback>
                </Avatar>
                <div>
                  <p className="font-medium flex items-center gap-2">
                    Anonymous Citizen
                    <Badge variant="secondary" className="text-xs">Verified</Badge>
                  </p>
                  <p className="text-sm text-muted-foreground">Petition Creator</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Analytics (only visible to creator and admins) */}
{user && (user.id === (petition as any).creator_id) && (
  <PetitionAnalytics petitionId={petition.id} />
)}

          {/* Reactions */}
          <PetitionReactions petitionId={petition.id} />

          {/* Updates */}
          <PetitionUpdates petitionId={petition.id} />

          {/* Comments */}
          <PetitionComments petitionId={petition.id} />
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Signature Progress */}
          <Card>
            <CardHeader>
              <CardTitle>Signatures</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="text-center">
                <div className="text-3xl font-bold">{petition.current_signatures.toLocaleString()}</div>
                <div className="text-sm text-muted-foreground">of {petition.goal_signatures.toLocaleString()} goal</div>
              </div>
              
              <Progress value={progressPercentage} className="w-full" />
              
              <div className="flex items-center justify-between text-sm">
                <span>{Math.round(progressPercentage)}% complete</span>
                {daysLeft !== null && (
                  <div className="flex items-center gap-1 text-muted-foreground">
                    <Clock className="w-4 h-4" />
                    {daysLeft} days left
                  </div>
                )}
              </div>

              {isAuthenticated ? (
                <PetitionSignForm 
                  petitionId={petition.id}
                  hasSigned={hasSigned}
                  onSignatureAdded={handleSignatureAdded}
                />
              ) : (
                <Button className="w-full" size="lg" asChild>
                  <a href="/auth">Log in to Sign</a>
                </Button>
              )}

              <div className="flex gap-2">
                <PetitionSocialShare 
                  petition={{
                    id: petition.id,
                    title: petition.title,
                    description: petition.description,
                    current_signatures: petition.current_signatures,
                    goal_signatures: petition.goal_signatures,
                    slug: petition.slug
                  }}
                  currentUrl={window.location.href}
                />
                <Button variant="outline" size="sm" className="flex-1">
                  <Heart className="w-4 h-4 mr-2" />
                  Support
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Recent Signatures */}
          <Card>
            <CardHeader>
              <CardTitle>Recent Signatures</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="text-center text-muted-foreground">
                <p className="text-sm">
                  {petition.current_signatures} people have signed this petition
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Stats */}
          <Card>
            <CardHeader>
              <CardTitle>Impact</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Target className="w-4 h-4 text-muted-foreground" />
                  <span className="text-sm">Goal</span>
                </div>
                <span className="font-medium">{petition.goal_signatures.toLocaleString()}</span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Users className="w-4 h-4 text-muted-foreground" />
                  <span className="text-sm">Signatures</span>
                </div>
                <span className="font-medium">{petition.current_signatures.toLocaleString()}</span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <TrendingUp className="w-4 h-4 text-muted-foreground" />
                  <span className="text-sm">Progress</span>
                </div>
                <span className="font-medium">{Math.round(progressPercentage)}%</span>
              </div>
            </CardContent>
          </Card>

          {/* Report Feature */}
          <Card>
            <CardContent className="p-4">
              <div className="text-center">
                <ReportPetitionDialog 
                  petitionId={petition.id}
                  petitionTitle={petition.title}
                />
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default PetitionDetailPage;