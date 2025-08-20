import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { Heart, ThumbsUp, Flame, Users, Brain } from 'lucide-react';

interface Reaction {
  id: string;
  petition_id: string;
  user_id: string;
  reaction_type: string;
  created_at: string;
}

interface ReactionCount {
  reaction_type: string;
  count: number;
}

interface PetitionReactionsProps {
  petitionId: string;
}

const reactionIcons = {
  support: ThumbsUp,
  heart: Heart,
  fire: Flame,
  clap: Users,
  thinking: Brain,
};

const reactionLabels = {
  support: 'Support',
  heart: 'Love',
  fire: 'Urgent',
  clap: 'Applaud',
  thinking: 'Consider',
};

export function PetitionReactions({ petitionId }: PetitionReactionsProps) {
  const [reactions, setReactions] = useState<ReactionCount[]>([]);
  const [userReactions, setUserReactions] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);
  const { toast } = useToast();

  useEffect(() => {
    // Check auth state
    supabase.auth.getUser().then(({ data: { user } }) => {
      setUser(user);
    });

    fetchReactions();
    fetchUserReactions();
  }, [petitionId]);

  const fetchReactions = async () => {
    try {
      const { data, error } = await supabase
        .from('petition_reactions')
        .select('reaction_type, user_id')
        .eq('petition_id', petitionId);

      if (error) throw error;

      // Count reactions by type
      const reactionCounts = data?.reduce((acc, reaction) => {
        acc[reaction.reaction_type] = (acc[reaction.reaction_type] || 0) + 1;
        return acc;
      }, {} as Record<string, number>) || {};

      const reactionTypes = ['support', 'heart', 'fire', 'clap', 'thinking'];
      const formattedReactions = reactionTypes.map(type => ({
        reaction_type: type,
        count: reactionCounts[type] || 0
      }));
      
      setReactions(formattedReactions);
    } catch (error) {
      console.error('Error fetching reactions:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchUserReactions = async () => {
    if (!user) return;
    
    try {
      const { data, error } = await supabase
        .from('petition_reactions')
        .select('reaction_type')
        .eq('petition_id', petitionId)
        .eq('user_id', user.id);

      if (error) throw error;

      const userReactionTypes = data?.map(r => r.reaction_type) || [];
      setUserReactions(userReactionTypes);
    } catch (error) {
      console.error('Error fetching user reactions:', error);
    }
  };

  const handleReaction = async (reactionType: string) => {
    if (!user) {
      toast({
        title: "Authentication required",
        description: "Please log in to react to this petition",
        variant: "destructive",
      });
      return;
    }

    try {
      const hasReacted = userReactions.includes(reactionType);
      
      if (hasReacted) {
        // Remove reaction
        const { error } = await supabase
          .from('petition_reactions')
          .delete()
          .eq('petition_id', petitionId)
          .eq('user_id', user.id)
          .eq('reaction_type', reactionType);

        if (error) throw error;

        setUserReactions(prev => prev.filter(r => r !== reactionType));
        setReactions(prev => prev.map(r => 
          r.reaction_type === reactionType 
            ? { ...r, count: Math.max(0, r.count - 1) }
            : r
        ));
        
        toast({
          title: "Reaction removed",
          description: `Removed your ${reactionLabels[reactionType]} reaction`,
        });
      } else {
        // Add reaction
        const { error } = await supabase
          .from('petition_reactions')
          .insert({
            petition_id: petitionId,
            user_id: user.id,
            reaction_type: reactionType
          });

        if (error) throw error;

        setUserReactions(prev => [...prev, reactionType]);
        setReactions(prev => prev.map(r => 
          r.reaction_type === reactionType 
            ? { ...r, count: r.count + 1 }
            : r
        ));
        
        toast({
          title: "Reaction added",
          description: `Added ${reactionLabels[reactionType]} reaction`,
        });
      }
    } catch (error) {
      console.error('Error updating reaction:', error);
      toast({
        title: "Error",
        description: "Failed to update reaction. Please try again.",
        variant: "destructive",
      });
    }
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Reactions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="animate-pulse">
            <div className="flex space-x-2">
              {[1, 2, 3, 4, 5].map((i) => (
                <div key={i} className="h-10 w-16 bg-muted rounded"></div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>How do you feel about this petition?</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex flex-wrap gap-2">
          {reactions.map((reaction) => {
            const Icon = reactionIcons[reaction.reaction_type];
            const isActive = userReactions.includes(reaction.reaction_type);
            
            return (
              <Button
                key={reaction.reaction_type}
                variant={isActive ? "default" : "outline"}
                size="sm"
                onClick={() => handleReaction(reaction.reaction_type)}
                className="flex items-center gap-2"
              >
                <Icon className="h-4 w-4" />
                <span className="text-xs">{reaction.count}</span>
              </Button>
            );
          })}
        </div>
        
        <p className="text-xs text-muted-foreground mt-3">
          React to show your support and engagement with this petition
        </p>
      </CardContent>
    </Card>
  );
}