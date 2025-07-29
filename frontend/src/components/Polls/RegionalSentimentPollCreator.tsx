import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ChartPollStyle } from './PollStyles/ChartPollStyle';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { createRegionalSentimentPoll } from '@/utils/createRegionalSentimentPoll';
import { 
  MapPin, 
  Clock, 
  MessageCircle, 
  Users, 
  BarChart3,
  Download,
  Globe,
  Tag
} from 'lucide-react';

export const RegionalSentimentPollCreator = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [isCreating, setIsCreating] = useState(false);
  const [isCreated, setIsCreated] = useState(false);

  const mockPoll = {
    title: "Which Cameroonian region do you believe deserves more development focus right now?",
    description: "Help shape our understanding of regional development priorities across Cameroon",
    options: [
      "Far North",
      "North West", 
      "South West",
      "East",
      "Adamawa",
      "All regions deserve equal focus"
    ],
    vote_results: [0, 0, 0, 0, 0, 0],
    votes_count: 0,
    privacy_mode: 'public' as const,
    ends_at: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000).toISOString(),
    custom_settings: {
      chartType: "horizontal_bar",
      colorTheme: "cameroon_gradient",
      colors: {
        barColors: {
          0: "#D21034", // Far North - Red
          1: "#FCDD09", // North West - Yellow  
          2: "#007A37", // South West - Green
          3: "#D21034", // East - Red
          4: "#FCDD09", // Adamawa - Yellow
          5: "#007A37"  // All regions - Green
        }
      }
    }
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
      await createRegionalSentimentPoll(user.id);
      setIsCreated(true);
      toast({
        title: "Regional Poll Created! 🗺️",
        description: "Your regional sentiment poll is now live with interactive mapping features!"
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
    <Card className="w-full max-w-4xl mx-auto bg-gradient-to-br from-background via-background to-muted/20 border-primary/20 shadow-elegant">
      <CardHeader className="text-center space-y-4">
        <div className="flex justify-center mb-4">
          <div className="relative">
            <div className="w-16 h-16 rounded-full bg-gradient-to-r from-[#D21034] via-[#FCDD09] to-[#007A37] flex items-center justify-center shadow-lg">
              <MapPin className="w-8 h-8 text-white drop-shadow-md" />
            </div>
            <div className="absolute -top-1 -right-1 w-6 h-6 bg-accent rounded-full flex items-center justify-center">
              <BarChart3 className="w-3 h-3 text-accent-foreground" />
            </div>
          </div>
        </div>
        
        <CardTitle className="text-2xl font-bold bg-gradient-to-r from-[#D21034] via-[#FCDD09] to-[#007A37] bg-clip-text text-transparent">
          Regional Sentiment Analysis
        </CardTitle>
        
        <div className="flex flex-wrap justify-center gap-2">
          <Badge variant="outline" className="text-xs">
            <MapPin className="w-3 h-3 mr-1" />
            development
          </Badge>
          <Badge variant="outline" className="text-xs">regions</Badge>
          <Badge variant="outline" className="text-xs">governance</Badge>
          <Badge variant="outline" className="text-xs">infrastructure</Badge>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm text-muted-foreground">
          <div className="flex items-center gap-1">
            <Clock className="w-4 h-4" />
            <span>10 days</span>
          </div>
          <div className="flex items-center gap-1">
            <BarChart3 className="w-4 h-4" />
            <span>Chart Style</span>
          </div>
          <div className="flex items-center gap-1">
            <Globe className="w-4 h-4" />
            <span>Geo-mapping</span>
          </div>
          <div className="flex items-center gap-1">
            <Download className="w-4 h-4" />
            <span>PDF Export</span>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-6">
        <div className="bg-muted/30 rounded-lg p-6">
          <h3 className="font-semibold mb-4 text-center flex items-center justify-center gap-2">
            <BarChart3 className="w-5 h-5" />
            Horizontal Bar Chart Preview
          </h3>
          <ChartPollStyle 
            poll={mockPoll}
            showResults={false}
            isActive={!isCreated}
            hasVoted={false}
            onVote={() => {}}
          />
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          <div className="space-y-3">
            <h4 className="font-semibold text-sm text-muted-foreground uppercase tracking-wide">Features</h4>
            <div className="space-y-2 text-sm">
              <div className="flex items-center gap-2">
                <MapPin className="w-4 h-4 text-green-600" />
                <span>Regional voter mapping</span>
              </div>
              <div className="flex items-center gap-2">
                <BarChart3 className="w-4 h-4 text-blue-600" />
                <span>Horizontal bar graph display</span>
              </div>
              <div className="flex items-center gap-2">
                <Globe className="w-4 h-4 text-orange-600" />
                <span>Optional geo-locking to Cameroon</span>
              </div>
              <div className="flex items-center gap-2">
                <Download className="w-4 h-4 text-purple-600" />
                <span>Civic report PDF export</span>
              </div>
            </div>
          </div>

          <div className="space-y-3">
            <h4 className="font-semibold text-sm text-muted-foreground uppercase tracking-wide">Comment Features</h4>
            <div className="space-y-2 text-sm">
              <div className="flex items-center gap-2">
                <MessageCircle className="w-4 h-4 text-blue-600" />
                <span>Comments enabled</span>
              </div>
              <div className="flex items-center gap-2">
                <Tag className="w-4 h-4 text-indigo-600" />
                <span>Ministry tagging (e.g., @MINEPAT)</span>
              </div>
              <div className="flex items-center gap-2">
                <Users className="w-4 h-4 text-green-600" />
                <span>Public voting with transparency</span>
              </div>
            </div>
          </div>
        </div>

        <div className="text-center space-y-4">
          <div className="text-sm text-muted-foreground bg-muted/50 rounded-lg p-3">
            <div className="font-medium mb-1">Color Theme: Cameroon Flag Gradient</div>
            <div className="flex justify-center gap-1 mb-2">
              <div className="w-6 h-3 bg-[#007A37] rounded-l"></div>
              <div className="w-6 h-3 bg-[#FCDD09]"></div>
              <div className="w-6 h-3 bg-[#D21034] rounded-r"></div>
            </div>
            <p>📊 Displays as horizontal bars with regional color coding</p>
            <p>🗺️ Auto-matches voter regions for geographic insights</p>
          </div>

          <Button 
            onClick={handleCreatePoll}
            disabled={isCreating || isCreated || !user}
            className="w-full sm:w-auto bg-gradient-to-r from-[#007A37] via-[#FCDD09] to-[#D21034] hover:opacity-90 text-white shadow-lg"
          >
            {isCreating ? "Creating Regional Poll..." : isCreated ? "Regional Poll Created! 🗺️" : "Create Regional Sentiment Poll"}
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