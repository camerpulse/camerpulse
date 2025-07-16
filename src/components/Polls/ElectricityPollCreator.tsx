import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { CardPollStyle } from './PollStyles/CardPollStyle';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { createElectricityPoll } from '@/utils/createElectricityPoll';
import { Zap, Clock, MessageCircle, Users, Sparkles } from 'lucide-react';
import electricityMeme from '@/assets/electricity-meme.jpg';

export const ElectricityPollCreator = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [isCreating, setIsCreating] = useState(false);
  const [isCreated, setIsCreated] = useState(false);

  const mockPoll = {
    title: "If Cameroonian electricity had a nickname, what should it be?",
    description: "A humorous take on our beloved power situation - vote for the most fitting nickname!",
    options: [
      "Hide and Seek",
      "Nepa Junior", 
      "Flash & Go",
      "Dumsor Unlimited",
      "Powerless Authority"
    ],
    vote_results: [0, 0, 0, 0, 0],
    votes_count: 0,
    privacy_mode: 'anonymous' as const,
    ends_at: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString()
  };

  const handleCreatePoll = async () => {
    if (!user) {
      toast({
        title: "Authentication Required",
        description: "Please sign in to create polls",
        variant: "destructive"
      });
      return;
    }

    setIsCreating(true);
    try {
      await createElectricityPoll(user.id);
      setIsCreated(true);
      toast({
        title: "Poll Created! ⚡",
        description: "Your humorous electricity poll is now live in the trending civic humor section!"
      });
    } catch (error) {
      console.error('Error creating poll:', error);
      toast({
        title: "Creation Failed",
        description: "Failed to create the poll. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsCreating(false);
    }
  };

  return (
    <Card className="w-full max-w-3xl mx-auto bg-gradient-to-br from-background via-background to-muted/20 border-primary/20 shadow-elegant">
      <CardHeader className="text-center space-y-4">
        <div className="relative w-full h-40 rounded-lg overflow-hidden mb-4">
          <img 
            src={electricityMeme} 
            alt="Electricity Meme" 
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
          <div className="absolute bottom-2 left-2 right-2">
            <Badge variant="secondary" className="mb-2">
              <Sparkles className="w-3 h-3 mr-1" />
              Trending Civic Humor
            </Badge>
          </div>
        </div>
        
        <CardTitle className="text-2xl font-bold bg-gradient-civic bg-clip-text text-transparent">
          Humorous Social Commentary
        </CardTitle>
        
        <div className="flex flex-wrap justify-center gap-2">
          <Badge variant="outline" className="text-xs">
            <Zap className="w-3 h-3 mr-1" />
            humor
          </Badge>
          <Badge variant="outline" className="text-xs">power cuts</Badge>
          <Badge variant="outline" className="text-xs">daily life</Badge>
          <Badge variant="outline" className="text-xs">satire</Badge>
        </div>

        <div className="flex justify-center gap-4 text-sm text-muted-foreground">
          <div className="flex items-center gap-1">
            <Clock className="w-4 h-4" />
            3 days
          </div>
          <div className="flex items-center gap-1">
            <MessageCircle className="w-4 h-4" />
            Comments enabled
          </div>
          <div className="flex items-center gap-1">
            <Users className="w-4 h-4" />
            Anonymous voting
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-6">
        <div className="bg-muted/30 rounded-lg p-4">
          <h3 className="font-semibold mb-3 text-center">Poll Preview</h3>
          <CardPollStyle 
            poll={mockPoll}
            showResults={false}
            isActive={!isCreated}
            hasVoted={false}
            onVote={() => {}}
          />
        </div>

        <div className="text-center space-y-4">
          <div className="text-sm text-muted-foreground">
            <p>✨ Features emoji result bars (🔥 😂 ⚡ 😭 💀)</p>
            <p>🎨 Share as meme option after voting</p>
            <p>📍 Will appear in /polls trending civic humor section</p>
          </div>

          <Button 
            onClick={handleCreatePoll}
            disabled={isCreating || isCreated || !user}
            className="w-full sm:w-auto bg-gradient-civic hover:opacity-90 text-white shadow-glow"
          >
            {isCreating ? "Creating Poll..." : isCreated ? "Poll Created! ⚡" : "Create Electricity Poll"}
          </Button>

          {!user && (
            <p className="text-sm text-muted-foreground">
              Please sign in to create this poll
            </p>
          )}
        </div>
      </CardContent>
    </Card>
  );
};