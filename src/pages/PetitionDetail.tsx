import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { ArrowLeft, Users, MapPin, Calendar, Share2, Flag } from 'lucide-react';
import { PetitionSignForm } from '@/components/petitions/PetitionSignForm';
import { PetitionComments } from '@/components/petitions/PetitionComments';
import { PetitionReactions } from '@/components/petitions/PetitionReactions';
import { PetitionUpdates } from '@/components/petitions/PetitionUpdates';
import { useToast } from '@/hooks/use-toast';

interface Petition {
  id: string;
  title: string;
  description: string;
  category: string;
  status: string;
  target_institution: string;
  goal_signatures: number;
  current_signatures: number;
  location: string;
  created_at: string;
  deadline: string;
  creator_id: string;
  updated_at: string;
}

export default function PetitionDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [petition, setPetition] = useState<Petition | null>(null);
  const [loading, setLoading] = useState(true);
  const [hasSigned, setHasSigned] = useState(false);
  const [user, setUser] = useState(null);

  useEffect(() => {
    // Check auth state
    supabase.auth.getUser().then(({ data: { user } }) => {
      setUser(user);
    });

    if (id) {
      fetchPetition();
      checkIfSigned();
    }
  }, [id]);

  const fetchPetition = async () => {
    try {
      const { data, error } = await supabase
        .from('petitions')
        .select('*')
        .eq('id', id)
        .single();

      if (error) throw error;
      setPetition(data);
    } catch (error) {
      console.error('Error fetching petition:', error);
      toast({
        title: "Error",
        description: "Failed to load petition details",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const checkIfSigned = async () => {
    if (!user) return;
    
    try {
      const { data } = await supabase
        .from('petition_signatures')
        .select('id')
        .eq('petition_id', id)
        .eq('user_id', user.id)
        .single();
      
      setHasSigned(!!data);
    } catch (error) {
      // No signature found, which is fine
    }
  };

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: petition?.title,
          text: petition?.description,
          url: window.location.href,
        });
      } catch (error) {
        // Fallback to clipboard
        await navigator.clipboard.writeText(window.location.href);
        toast({
          title: "Link copied!",
          description: "Petition link copied to clipboard",
        });
      }
    } else {
      await navigator.clipboard.writeText(window.location.href);
      toast({
        title: "Link copied!",
        description: "Petition link copied to clipboard",
      });
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background py-8">
        <div className="container mx-auto px-4">
          <div className="animate-pulse">
            <div className="h-8 bg-muted rounded w-1/4 mb-6"></div>
            <div className="h-64 bg-muted rounded mb-6"></div>
            <div className="h-4 bg-muted rounded w-3/4 mb-4"></div>
            <div className="h-4 bg-muted rounded w-1/2"></div>
          </div>
        </div>
      </div>
    );
  }

  if (!petition) {
    return (
      <div className="min-h-screen bg-background py-8">
        <div className="container mx-auto px-4">
          <Button
            variant="ghost"
            onClick={() => navigate('/petitions')}
            className="mb-6"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Petitions
          </Button>
          <Card>
            <CardContent className="py-8 text-center">
              <h2 className="text-xl font-semibold mb-2">Petition not found</h2>
              <p className="text-muted-foreground">The petition you're looking for doesn't exist or has been removed.</p>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  const progressPercentage = Math.min((petition.current_signatures / petition.goal_signatures) * 100, 100);
  const isExpired = new Date(petition.deadline) < new Date();

  return (
    <div className="min-h-screen bg-background py-8">
      <div className="container mx-auto px-4 max-w-4xl">
        <Button
          variant="ghost"
          onClick={() => navigate('/petitions')}
          className="mb-6"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Petitions
        </Button>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Header */}
            <Card>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="space-y-4 flex-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <Badge variant={petition.status === 'active' ? 'default' : 'secondary'}>
                        {petition.status.replace('_', ' ')}
                      </Badge>
                      <Badge variant="outline">{petition.category}</Badge>
                    </div>
                    
                    <CardTitle className="text-2xl lg:text-3xl font-bold leading-tight">
                      {petition.title}
                    </CardTitle>
                    
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <MapPin className="h-4 w-4" />
                        {petition.location}
                      </div>
                      <div className="flex items-center gap-1">
                        <Calendar className="h-4 w-4" />
                        {new Date(petition.created_at).toLocaleDateString()}
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm" onClick={handleShare}>
                      <Share2 className="h-4 w-4" />
                    </Button>
                    <Button variant="outline" size="sm">
                      <Flag className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold">About this petition</h3>
                  <p className="text-muted-foreground leading-relaxed whitespace-pre-wrap">
                    {petition.description}
                  </p>
                </div>
                
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold">Target</h3>
                  <div className="flex items-center gap-3">
                    <Avatar>
                      <AvatarFallback>
                        {petition.target_institution?.charAt(0) || 'T'}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="font-medium">{petition.target_institution}</p>
                      <p className="text-sm text-muted-foreground">Government Institution</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

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
                <CardTitle className="flex items-center gap-2">
                  <Users className="h-5 w-5" />
                  Signatures
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="text-center">
                  <div className="text-2xl font-bold">{petition.current_signatures.toLocaleString()}</div>
                  <div className="text-sm text-muted-foreground">
                    of {petition.goal_signatures.toLocaleString()} signatures
                  </div>
                </div>
                
                <Progress value={progressPercentage} className="w-full" />
                
                <div className="text-xs text-muted-foreground text-center">
                  {progressPercentage.toFixed(1)}% complete
                </div>
                
                {isExpired ? (
                  <Badge variant="destructive" className="w-full justify-center">
                    Expired
                  </Badge>
                ) : petition.deadline ? (
                  <div className="text-xs text-muted-foreground text-center">
                    Deadline: {new Date(petition.deadline).toLocaleDateString()}
                  </div>
                ) : null}
              </CardContent>
            </Card>

            {/* Sign Petition */}
            {!isExpired && petition.status === 'active' && (
              <PetitionSignForm 
                petitionId={petition.id} 
                hasSigned={hasSigned}
                onSignatureAdded={() => {
                  setHasSigned(true);
                  setPetition(prev => prev ? {
                    ...prev,
                    current_signatures: prev.current_signatures + 1
                  } : null);
                }}
              />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}