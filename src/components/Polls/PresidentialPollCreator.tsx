import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { BallotPollStyle } from './PollStyles/BallotPollStyle';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { createPresidentialPoll, getRegionalBreakdown } from '@/utils/createPresidentialPoll';
import { 
  Shield, 
  Eye, 
  CheckCircle, 
  Users, 
  Clock,
  MapPin,
  BarChart3,
  Vote,
  AlertTriangle,
  UserCheck
} from 'lucide-react';

export const PresidentialPollCreator = () => {
  const { user, profile } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [pollCreated, setPollCreated] = useState(false);
  const [createdPollId, setCreatedPollId] = useState<string>('');
  const [showResults, setShowResults] = useState(false);
  const [regionalData, setRegionalData] = useState<any>({});

  // Sample poll data for preview
  const previewPoll = {
    title: "If presidential elections were held today, who would you vote for?",
    description: "This is an election simulation poll to gauge public sentiment regarding potential presidential candidates for the upcoming electoral cycle.",
    options: [
      "Incumbent President (CPDM)",
      "Maurice Kamto (CRM)", 
      "Cabral Libii (PCRN)",
      "None of the above"
    ],
    vote_results: showResults ? [145, 89, 67, 34] : undefined,
    votes_count: showResults ? 335 : 0,
    user_vote: showResults ? 0 : undefined,
    ends_at: new Date(Date.now() + (14 * 24 * 60 * 60 * 1000)).toISOString(),
    privacy_mode: 'public',
    tags: ['elections', '2025', 'presidential', 'simulation']
  };

  useEffect(() => {
    if (showResults && createdPollId) {
      getRegionalBreakdown(createdPollId).then(setRegionalData);
    }
  }, [showResults, createdPollId]);

  const handleCreatePoll = async () => {
    if (!user) {
      toast({
        title: "Authentication required",
        description: "Please log in to create this election poll",
        variant: "destructive"
      });
      return;
    }

    if (!profile?.verified) {
      toast({
        title: "Verification required",
        description: "This poll requires a verified account. Please complete account verification first.",
        variant: "destructive"
      });
      return;
    }

    try {
      setLoading(true);
      const createdPoll = await createPresidentialPoll(user.id);
      
      toast({
        title: "Presidential election poll created!",
        description: "Ballot-style poll is now live with verification required and admin moderation enabled! +50 points earned!"
      });
      
      setPollCreated(true);
      setCreatedPollId(createdPoll.id);
    } catch (error) {
      console.error('Error creating poll:', error);
      toast({
        title: "Failed to create poll",
        description: "There was an error creating the presidential poll. Please try again.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  if (pollCreated) {
    return (
      <Card className="max-w-4xl mx-auto">
        <CardContent className="pt-6 space-y-6">
          <div className="text-center space-y-4">
            <div className="flex items-center justify-center gap-2">
              <Shield className="w-16 h-16 text-cm-green" />
              <Vote className="w-12 h-12 text-cm-yellow" />
            </div>
            <h3 className="text-xl font-semibold text-cm-green">Presidential Election Poll Created!</h3>
            <p className="text-muted-foreground">
              Official ballot-style poll with verification requirements and admin moderation.
            </p>
          </div>

          {/* Poll Preview */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h4 className="font-medium flex items-center gap-2">
                <Vote className="w-5 h-5 text-cm-green" />
                Ballot Preview
              </h4>
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-muted-foreground" />
                <span className="text-sm text-muted-foreground">14 days remaining</span>
              </div>
            </div>
            
            <div className="bg-gradient-to-br from-cm-green/5 to-cm-yellow/5 p-4 rounded-lg border border-cm-green/20">
              <BallotPollStyle 
                poll={previewPoll}
                showResults={showResults}
                isActive={false}
                hasVoted={showResults}
                className="max-w-2xl mx-auto"
              />
              
              <div className="mt-4 text-center">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowResults(!showResults)}
                >
                  {showResults ? 'Hide Results' : 'Preview Results (After Expiry)'}
                </Button>
              </div>
            </div>
          </div>

          {/* Regional Breakdown */}
          {showResults && (
            <div className="space-y-3">
              <h4 className="font-medium flex items-center gap-2">
                <MapPin className="w-5 h-5 text-primary" />
                Regional Breakdown
              </h4>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3 text-sm">
                {['Centre', 'Littoral', 'West', 'Northwest', 'Southwest', 'North'].map((region) => (
                  <div key={region} className="bg-muted/30 p-3 rounded-lg">
                    <div className="font-medium text-center">{region}</div>
                    <div className="text-xs text-muted-foreground text-center mt-1">
                      {Math.floor(Math.random() * 100) + 50} votes
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Security Features */}
          <div className="bg-muted/30 p-4 rounded-lg space-y-3">
            <h4 className="font-medium text-sm flex items-center gap-2">
              <Shield className="w-4 h-4 text-cm-green" />
              Security & Moderation Features
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-cm-green">
                  <UserCheck className="w-4 h-4" />
                  <span>Verified accounts only</span>
                </div>
                <div className="flex items-center gap-2 text-cm-green">
                  <Shield className="w-4 h-4" />
                  <span>One vote per account</span>
                </div>
                <div className="flex items-center gap-2 text-cm-green">
                  <Eye className="w-4 h-4" />
                  <span>Results hidden until expiry</span>
                </div>
              </div>
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-primary">
                  <AlertTriangle className="w-4 h-4" />
                  <span>Admin comment moderation</span>
                </div>
                <div className="flex items-center gap-2 text-primary">
                  <MapPin className="w-4 h-4" />
                  <span>Regional analytics enabled</span>
                </div>
                <div className="flex items-center gap-2 text-primary">
                  <BarChart3 className="w-4 h-4" />
                  <span>Demographic insights</span>
                </div>
              </div>
            </div>
          </div>

          {/* Display Info */}
          <div className="bg-cm-green/5 p-4 rounded-lg border border-cm-green/20">
            <h4 className="font-medium text-sm text-cm-green mb-2">Poll Visibility</h4>
            <ul className="text-sm text-muted-foreground space-y-1">
              <li>• Featured on home civic dashboard</li>
              <li>• Available in `/polls` discovery page</li>
              <li>• Visible to verified users only</li>
              <li>• Results embargoed until 14-day expiry</li>
            </ul>
          </div>

          <div className="flex justify-center">
            <Button 
              onClick={() => window.location.href = '/polls'} 
              className="bg-cm-green hover:bg-cm-green/90"
            >
              View Polls Dashboard
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <Card className="bg-gradient-to-br from-cm-green/5 to-cm-red/5 border-cm-green/20">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="w-6 h-6 text-cm-green" />
            Create Presidential Election Poll - Ballot Style
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Warning for Verification */}
          {user && !profile?.verified && (
            <div className="bg-amber-50 border border-amber-200 p-4 rounded-lg">
              <div className="flex items-center gap-2 text-amber-800">
                <AlertTriangle className="w-5 h-5" />
                <span className="font-medium">Verification Required</span>
              </div>
              <p className="text-sm text-amber-700 mt-1">
                This poll requires account verification. Please complete your profile verification to create this election poll.
              </p>
            </div>
          )}

          {/* Poll Configuration */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 bg-muted/30 rounded-lg">
            <div className="space-y-2">
              <h4 className="font-medium text-sm flex items-center gap-2">
                <Vote className="w-4 h-4" />
                Ballot Style Features
              </h4>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>• Official ballot paper design</li>
                <li>• Radio button selection</li>
                <li>• Party logos next to candidates</li>
                <li>• Secure vote recording</li>
              </ul>
            </div>
            <div className="space-y-2">
              <h4 className="font-medium text-sm flex items-center gap-2">
                <Shield className="w-4 h-4" />
                Security Features
              </h4>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>• Verified accounts only</li>
                <li>• One vote per user</li>
                <li>• 14-day voting period</li>
                <li>• Results hidden until expiry</li>
              </ul>
            </div>
          </div>

          {/* Candidates */}
          <div className="space-y-2">
            <h4 className="font-medium text-sm">Presidential Candidates</h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {previewPoll.options.map((candidate, index) => (
                <div key={index} className="flex items-center gap-2 p-2 bg-muted/20 rounded-lg">
                  <div className="w-8 h-8 bg-muted rounded-full flex items-center justify-center">
                    <span className="text-xs font-medium">{candidate.split(' ')[0][0]}</span>
                  </div>
                  <span className="text-sm font-medium">{candidate}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Tags */}
          <div className="space-y-2">
            <h4 className="font-medium text-sm">Election Tags</h4>
            <div className="flex flex-wrap gap-2">
              {previewPoll.tags.map((tag) => (
                <span 
                  key={tag} 
                  className="px-2 py-1 bg-cm-green/10 text-cm-green text-xs rounded-full border border-cm-green/20"
                >
                  {tag}
                </span>
              ))}
            </div>
          </div>

          {/* Preview Section */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <Eye className="w-5 h-5 text-cm-green" />
              <h4 className="font-medium">Official Ballot Preview</h4>
            </div>
            
            <div className="border border-dashed border-cm-green/30 rounded-lg p-4 bg-cm-green/5">
              <BallotPollStyle 
                poll={previewPoll}
                showResults={false}
                isActive={true}
                hasVoted={false}
                className="max-w-2xl mx-auto"
              />
            </div>
          </div>

          {/* Create Poll Button */}
          <div className="flex justify-center pt-4">
            <Button 
              onClick={handleCreatePoll}
              disabled={loading || !user || !profile?.verified}
              size="lg"
              className="bg-cm-green hover:bg-cm-green/90 text-white px-8"
            >
              {loading ? 'Creating Election Poll...' : 'Create Official Ballot Poll'}
            </Button>
          </div>

          {!user && (
            <p className="text-center text-sm text-muted-foreground">
              Please log in with a verified account to create this election poll
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  );
};