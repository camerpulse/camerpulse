import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { useToast } from "@/hooks/use-toast";
import { 
  Users, 
  MessageSquare, 
  Lightbulb, 
  Calendar, 
  Vote, 
  TrendingUp,
  MapPin,
  Clock,
  DollarSign,
  Heart,
  Send,
  Plus,
  Filter
} from "lucide-react";
import { CamerPlayHeader } from "@/components/Layout/CamerPlayHeader";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

interface CivicInitiative {
  id: string;
  title: string;
  description: string;
  category: string;
  region: string;
  status: string;
  goal_amount: number;
  current_amount: number;
  participant_count: number;
  created_at: string;
}

interface CitizenProposal {
  id: string;
  title: string;
  description: string;
  category: string;
  region: string;
  priority_level: string;
  status: string;
  vote_count: number;
  comment_count: number;
  created_at: string;
}

interface CommunityForum {
  id: string;
  title: string;
  description: string;
  category: string;
  region: string;
  post_count: number;
  member_count: number;
  created_at: string;
}

const CivicParticipationHub: React.FC = () => {
  const { toast } = useToast();
  const { user } = useAuth();
  const [initiatives, setInitiatives] = useState<CivicInitiative[]>([]);
  const [proposals, setProposals] = useState<CitizenProposal[]>([]);
  const [forums, setForums] = useState<CommunityForum[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [activeTab, setActiveTab] = useState('initiatives');

  useEffect(() => {
    fetchCivicData();
  }, []);

  const fetchCivicData = async () => {
    try {
      // Fetch civic initiatives
      const { data: initiativesData, error: initiativesError } = await supabase
        .from('civic_initiatives')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(10);

      if (initiativesError) throw initiativesError;
      setInitiatives(initiativesData || []);

      // Fetch citizen proposals
      const { data: proposalsData, error: proposalsError } = await supabase
        .from('citizen_proposals')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(10);

      if (proposalsError) throw proposalsError;
      setProposals(proposalsData || []);

      // Fetch community forums
      const { data: forumsData, error: forumsError } = await supabase
        .from('community_forums')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(10);

      if (forumsError) throw forumsError;
      setForums(forumsData || []);

    } catch (error) {
      toast({
        title: "Error loading data",
        description: "Could not load civic participation data.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const createInitiative = async (data: any) => {
    if (!user) return;

    try {
      const { error } = await supabase
        .from('civic_initiatives')
        .insert({
          ...data,
          created_by: user.id,
          current_amount: 0,
          participant_count: 1
        });

      if (error) throw error;

      toast({
        title: "Initiative created",
        description: "Your civic initiative has been created successfully.",
      });

      setShowCreateForm(false);
      fetchCivicData();
    } catch (error) {
      toast({
        title: "Error creating initiative",
        description: "Could not create civic initiative.",
        variant: "destructive",
      });
    }
  };

  const createProposal = async (data: any) => {
    if (!user) return;

    try {
      const { error } = await supabase
        .from('citizen_proposals')
        .insert({
          ...data,
          proposed_by: user.id,
          vote_count: 0,
          comment_count: 0
        });

      if (error) throw error;

      toast({
        title: "Proposal submitted",
        description: "Your citizen proposal has been submitted successfully.",
      });

      setShowCreateForm(false);
      fetchCivicData();
    } catch (error) {
      toast({
        title: "Error submitting proposal",
        description: "Could not submit citizen proposal.",
        variant: "destructive",
      });
    }
  };

  const getBadgeColor = (status: string) => {
    switch (status) {
      case 'active': return 'default';
      case 'completed': return 'secondary';
      case 'pending': return 'outline';
      case 'approved': return 'secondary';
      default: return 'outline';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'destructive';
      case 'medium': return 'secondary';
      case 'low': return 'outline';
      default: return 'outline';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <CamerPlayHeader />
        <div className="container mx-auto px-4 py-8">
          <div className="text-center">Loading civic participation data...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <CamerPlayHeader />
      
      <div className="container mx-auto px-4 py-8">
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold">Civic Participation Hub</h1>
              <p className="text-muted-foreground">Engage with your community and drive positive change</p>
            </div>
            <Button onClick={() => setShowCreateForm(true)}>
              <Plus className="mr-2 h-4 w-4" />
              Create Initiative
            </Button>
          </div>

          {/* Stats Overview */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center">
                  <Users className="h-8 w-8 text-primary" />
                  <div className="ml-4">
                    <p className="text-2xl font-bold">{initiatives.length}</p>
                    <p className="text-xs text-muted-foreground">Active Initiatives</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center">
                  <Lightbulb className="h-8 w-8 text-primary" />
                  <div className="ml-4">
                    <p className="text-2xl font-bold">{proposals.length}</p>
                    <p className="text-xs text-muted-foreground">Citizen Proposals</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center">
                  <MessageSquare className="h-8 w-8 text-primary" />
                  <div className="ml-4">
                    <p className="text-2xl font-bold">{forums.length}</p>
                    <p className="text-xs text-muted-foreground">Community Forums</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center">
                  <TrendingUp className="h-8 w-8 text-primary" />
                  <div className="ml-4">
                    <p className="text-2xl font-bold">89%</p>
                    <p className="text-xs text-muted-foreground">Engagement Rate</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="initiatives" className="flex items-center gap-2">
                <Heart className="h-4 w-4" />
                Initiatives
              </TabsTrigger>
              <TabsTrigger value="proposals" className="flex items-center gap-2">
                <Lightbulb className="h-4 w-4" />
                Proposals
              </TabsTrigger>
              <TabsTrigger value="forums" className="flex items-center gap-2">
                <MessageSquare className="h-4 w-4" />
                Forums
              </TabsTrigger>
            </TabsList>

            <TabsContent value="initiatives" className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {initiatives.map((initiative) => (
                  <Card key={initiative.id}>
                    <CardHeader>
                      <div className="flex justify-between items-start">
                        <div>
                          <CardTitle className="text-lg">{initiative.title}</CardTitle>
                          <CardDescription className="flex items-center gap-2 mt-1">
                            <MapPin className="h-4 w-4" />
                            {initiative.region}
                          </CardDescription>
                        </div>
                        <Badge variant={getBadgeColor(initiative.status)}>
                          {initiative.status}
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm text-muted-foreground mb-4">
                        {initiative.description}
                      </p>
                      
                      {initiative.goal_amount > 0 && (
                        <div className="mb-4">
                          <div className="flex justify-between text-sm mb-2">
                            <span>Progress</span>
                            <span>{Math.round((initiative.current_amount / initiative.goal_amount) * 100)}%</span>
                          </div>
                          <Progress 
                            value={(initiative.current_amount / initiative.goal_amount) * 100} 
                            className="h-2"
                          />
                          <div className="flex justify-between text-xs text-muted-foreground mt-1">
                            <span>${initiative.current_amount.toLocaleString()}</span>
                            <span>${initiative.goal_amount.toLocaleString()}</span>
                          </div>
                        </div>
                      )}

                      <div className="flex justify-between items-center">
                        <div className="flex items-center gap-4 text-sm text-muted-foreground">
                          <span className="flex items-center gap-1">
                            <Users className="h-4 w-4" />
                            {initiative.participant_count}
                          </span>
                          <span className="flex items-center gap-1">
                            <Clock className="h-4 w-4" />
                            {new Date(initiative.created_at).toLocaleDateString()}
                          </span>
                        </div>
                        <Button size="sm">
                          Join Initiative
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>

            <TabsContent value="proposals" className="space-y-6">
              <div className="space-y-4">
                {proposals.map((proposal) => (
                  <Card key={proposal.id}>
                    <CardContent className="pt-6">
                      <div className="flex justify-between items-start mb-4">
                        <div className="flex-1">
                          <h3 className="font-semibold text-lg mb-2">{proposal.title}</h3>
                          <p className="text-sm text-muted-foreground mb-4">
                            {proposal.description}
                          </p>
                          <div className="flex items-center gap-4">
                            <Badge variant={getPriorityColor(proposal.priority_level)}>
                              {proposal.priority_level} priority
                            </Badge>
                            <Badge variant={getBadgeColor(proposal.status)}>
                              {proposal.status}
                            </Badge>
                            <span className="text-sm text-muted-foreground flex items-center gap-1">
                              <MapPin className="h-4 w-4" />
                              {proposal.region}
                            </span>
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex justify-between items-center">
                        <div className="flex items-center gap-4 text-sm text-muted-foreground">
                          <span className="flex items-center gap-1">
                            <Vote className="h-4 w-4" />
                            {proposal.vote_count} votes
                          </span>
                          <span className="flex items-center gap-1">
                            <MessageSquare className="h-4 w-4" />
                            {proposal.comment_count} comments
                          </span>
                          <span className="flex items-center gap-1">
                            <Clock className="h-4 w-4" />
                            {new Date(proposal.created_at).toLocaleDateString()}
                          </span>
                        </div>
                        <div className="flex gap-2">
                          <Button size="sm" variant="outline">
                            Comment
                          </Button>
                          <Button size="sm">
                            Vote
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>

            <TabsContent value="forums" className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {forums.map((forum) => (
                  <Card key={forum.id}>
                    <CardHeader>
                      <CardTitle className="text-lg">{forum.title}</CardTitle>
                      <CardDescription>
                        {forum.description}
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="flex justify-between items-center">
                        <div className="flex items-center gap-4 text-sm text-muted-foreground">
                          <span className="flex items-center gap-1">
                            <MessageSquare className="h-4 w-4" />
                            {forum.post_count} posts
                          </span>
                          <span className="flex items-center gap-1">
                            <Users className="h-4 w-4" />
                            {forum.member_count} members
                          </span>
                          <span className="flex items-center gap-1">
                            <MapPin className="h-4 w-4" />
                            {forum.region}
                          </span>
                        </div>
                        <Button size="sm">
                          Join Forum
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
};

export default CivicParticipationHub;