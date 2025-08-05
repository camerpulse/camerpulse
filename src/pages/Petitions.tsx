import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import {
  PlusCircle,
  Search,
  Filter,
  Users,
  Calendar,
  MapPin,
  TrendingUp,
  MessageCircle,
  Share2,
  Heart,
  Target,
  Clock,
  CheckCircle,
  AlertCircle,
  Eye
} from 'lucide-react';

interface Petition {
  id: string;
  title: string;
  description: string;
  petition_text: string;
  target_recipients: string[];
  goal_signatures: number;
  current_signatures: number;
  creator_id: string;
  category: string;
  region: string;
  status: string;
  featured: boolean;
  verified: boolean;
  tags: string[];
  image_url?: string;
  deadline_date?: string;
  created_at: string;
  updated_at: string;
}

const categories = [
  'all',
  'infrastructure',
  'healthcare',
  'education',
  'environment',
  'governance',
  'social_justice',
  'economy',
  'security',
  'general'
];

const regions = [
  'all',
  'Adamawa',
  'Centre',
  'East',
  'Far North',
  'Littoral',
  'North',
  'Northwest',
  'South',
  'Southwest',
  'West'
];

export default function Petitions() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { toast } = useToast();

  const [petitions, setPetitions] = useState<Petition[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState(searchParams.get('search') || '');
  const [selectedCategory, setSelectedCategory] = useState(searchParams.get('category') || 'all');
  const [selectedRegion, setSelectedRegion] = useState(searchParams.get('region') || 'all');
  const [sortBy, setSortBy] = useState('trending');
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  
  // Create petition form state
  const [newPetition, setNewPetition] = useState({
    title: '',
    description: '',
    petition_text: '',
    target_recipients: [] as string[],
    goal_signatures: 1000,
    category: 'general',
    region: '',
    tags: [] as string[]
  });

  useEffect(() => {
    fetchPetitions();
  }, [selectedCategory, selectedRegion, sortBy, searchQuery]);

  const fetchPetitions = async () => {
    setLoading(true);
    try {
      let query = supabase
        .from('petitions')
        .select('*')
        .eq('status', 'active');

      if (selectedCategory !== 'all') {
        query = query.eq('category', selectedCategory);
      }

      if (selectedRegion !== 'all') {
        query = query.eq('region', selectedRegion);
      }

      if (searchQuery) {
        query = query.or(`title.ilike.%${searchQuery}%,description.ilike.%${searchQuery}%`);
      }

      // Apply sorting
      switch (sortBy) {
        case 'trending':
          query = query.order('current_signatures', { ascending: false });
          break;
        case 'recent':
          query = query.order('created_at', { ascending: false });
          break;
        case 'deadline':
          query = query.order('deadline_date', { ascending: true, nullsLast: true });
          break;
        case 'progress':
          query = query.order('current_signatures', { ascending: false });
          break;
      }

      const { data, error } = await query;

      if (error) throw error;
      setPetitions(data || []);
    } catch (error) {
      console.error('Error fetching petitions:', error);
      toast({
        title: "Error",
        description: "Failed to load petitions. Please try again.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const createPetition = async () => {
    if (!user) {
      toast({
        title: "Authentication Required",
        description: "Please sign in to create a petition.",
        variant: "destructive"
      });
      return;
    }

    if (!newPetition.title || !newPetition.description || !newPetition.petition_text) {
      toast({
        title: "Missing Information",
        description: "Please fill in all required fields.",
        variant: "destructive"
      });
      return;
    }

    try {
      const { error } = await supabase
        .from('petitions')
        .insert({
          ...newPetition,
          creator_id: user.id,
          target_recipients: newPetition.target_recipients.filter(r => r.trim())
        });

      if (error) throw error;

      toast({
        title: "Success!",
        description: "Your petition has been created and is now live."
      });

      setShowCreateDialog(false);
      setNewPetition({
        title: '',
        description: '',
        petition_text: '',
        target_recipients: [],
        goal_signatures: 1000,
        category: 'general',
        region: '',
        tags: []
      });
      fetchPetitions();
    } catch (error) {
      console.error('Error creating petition:', error);
      toast({
        title: "Error",
        description: "Failed to create petition. Please try again.",
        variant: "destructive"
      });
    }
  };

  const getProgressPercentage = (current: number, goal: number) => {
    return Math.min((current / goal) * 100, 100);
  };

  const formatTimeRemaining = (deadline?: string) => {
    if (!deadline) return 'No deadline';
    
    const now = new Date();
    const end = new Date(deadline);
    const diff = end.getTime() - now.getTime();
    
    if (diff <= 0) return 'Deadline passed';
    
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    if (days > 0) return `${days} day${days > 1 ? 's' : ''} left`;
    
    const hours = Math.floor(diff / (1000 * 60 * 60));
    return `${hours} hour${hours > 1 ? 's' : ''} left`;
  };

  const addTargetRecipient = () => {
    setNewPetition(prev => ({
      ...prev,
      target_recipients: [...prev.target_recipients, '']
    }));
  };

  const updateTargetRecipient = (index: number, value: string) => {
    setNewPetition(prev => ({
      ...prev,
      target_recipients: prev.target_recipients.map((recipient, i) => 
        i === index ? value : recipient
      )
    }));
  };

  const removeTargetRecipient = (index: number) => {
    setNewPetition(prev => ({
      ...prev,
      target_recipients: prev.target_recipients.filter((_, i) => i !== index)
    }));
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Header */}
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold">Petitions & Campaigns</h1>
            <p className="text-muted-foreground mt-1">
              Make your voice heard and drive positive change in Cameroon
            </p>
          </div>
          
          <div className="flex gap-3 mt-4 lg:mt-0">
            <Button 
              variant="outline" 
              onClick={() => navigate('/petitions/discover')}
            >
              <TrendingUp className="h-4 w-4 mr-2" />
              Discover
            </Button>
            
            <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
              <DialogTrigger asChild>
                <Button>
                  <PlusCircle className="h-4 w-4 mr-2" />
                  Start Petition
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>Create New Petition</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="title">Petition Title *</Label>
                    <Input
                      id="title"
                      value={newPetition.title}
                      onChange={(e) => setNewPetition(prev => ({ ...prev, title: e.target.value }))}
                      placeholder="e.g., Improve Road Infrastructure in Douala"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="description">Short Description *</Label>
                    <Textarea
                      id="description"
                      value={newPetition.description}
                      onChange={(e) => setNewPetition(prev => ({ ...prev, description: e.target.value }))}
                      placeholder="Brief summary of what this petition is about"
                      rows={2}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="petition_text">Full Petition Text *</Label>
                    <Textarea
                      id="petition_text"
                      value={newPetition.petition_text}
                      onChange={(e) => setNewPetition(prev => ({ ...prev, petition_text: e.target.value }))}
                      placeholder="Detailed explanation of the issue and what you're asking for..."
                      rows={5}
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Category</Label>
                      <Select 
                        value={newPetition.category} 
                        onValueChange={(value) => setNewPetition(prev => ({ ...prev, category: value }))}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {categories.filter(cat => cat !== 'all').map(category => (
                            <SelectItem key={category} value={category}>
                              {category.charAt(0).toUpperCase() + category.slice(1).replace('_', ' ')}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label>Region</Label>
                      <Select 
                        value={newPetition.region} 
                        onValueChange={(value) => setNewPetition(prev => ({ ...prev, region: value }))}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select region" />
                        </SelectTrigger>
                        <SelectContent>
                          {regions.filter(region => region !== 'all').map(region => (
                            <SelectItem key={region} value={region}>
                              {region}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label>Target Recipients</Label>
                    {newPetition.target_recipients.map((recipient, index) => (
                      <div key={index} className="flex gap-2">
                        <Input
                          value={recipient}
                          onChange={(e) => updateTargetRecipient(index, e.target.value)}
                          placeholder="e.g., Minister of Public Works"
                        />
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => removeTargetRecipient(index)}
                        >
                          Remove
                        </Button>
                      </div>
                    ))}
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={addTargetRecipient}
                    >
                      Add Recipient
                    </Button>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="goal">Signature Goal</Label>
                    <Input
                      id="goal"
                      type="number"
                      value={newPetition.goal_signatures}
                      onChange={(e) => setNewPetition(prev => ({ ...prev, goal_signatures: parseInt(e.target.value) || 1000 }))}
                      min="100"
                      step="100"
                    />
                  </div>

                  <div className="flex justify-end gap-2 pt-4">
                    <Button variant="outline" onClick={() => setShowCreateDialog(false)}>
                      Cancel
                    </Button>
                    <Button onClick={createPetition}>
                      Create Petition
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </div>

        {/* Filters and Search */}
        <Card className="mb-6">
          <CardContent className="p-4">
            <div className="flex flex-col lg:flex-row gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                <Input
                  placeholder="Search petitions..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
              
              <div className="flex gap-2">
                <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                  <SelectTrigger className="w-40">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map(category => (
                      <SelectItem key={category} value={category}>
                        {category === 'all' ? 'All Categories' : 
                         category.charAt(0).toUpperCase() + category.slice(1).replace('_', ' ')}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <Select value={selectedRegion} onValueChange={setSelectedRegion}>
                  <SelectTrigger className="w-40">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {regions.map(region => (
                      <SelectItem key={region} value={region}>
                        {region === 'all' ? 'All Regions' : region}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <Select value={sortBy} onValueChange={setSortBy}>
                  <SelectTrigger className="w-32">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="trending">Trending</SelectItem>
                    <SelectItem value="recent">Recent</SelectItem>
                    <SelectItem value="deadline">Deadline</SelectItem>
                    <SelectItem value="progress">Progress</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Petitions Grid */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <Card key={i} className="animate-pulse">
                <CardContent className="p-6">
                  <div className="h-4 bg-muted rounded w-3/4 mb-2"></div>
                  <div className="h-3 bg-muted rounded w-full mb-4"></div>
                  <div className="h-2 bg-muted rounded w-full mb-2"></div>
                  <div className="h-8 bg-muted rounded w-full"></div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : petitions.length === 0 ? (
          <Card>
            <CardContent className="p-12 text-center">
              <AlertCircle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">No Petitions Found</h3>
              <p className="text-muted-foreground mb-4">
                {searchQuery || selectedCategory !== 'all' || selectedRegion !== 'all'
                  ? 'Try adjusting your filters or search terms.'
                  : 'Be the first to create a petition and make a difference!'}
              </p>
              <Button onClick={() => setShowCreateDialog(true)}>
                Start First Petition
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {petitions.map((petition) => (
              <Card key={petition.id} className="hover:shadow-lg transition-shadow cursor-pointer">
                <CardHeader className="pb-3">
                  <div className="flex justify-between items-start mb-2">
                    <Badge variant={petition.featured ? "default" : "secondary"}>
                      {petition.category.replace('_', ' ')}
                    </Badge>
                    {petition.verified && (
                      <Badge variant="outline" className="text-green-600 border-green-600">
                        <CheckCircle className="h-3 w-3 mr-1" />
                        Verified
                      </Badge>
                    )}
                  </div>
                  <CardTitle className="text-lg line-clamp-2">{petition.title}</CardTitle>
                  <p className="text-sm text-muted-foreground line-clamp-2">
                    {petition.description}
                  </p>
                </CardHeader>
                
                <CardContent className="pt-0">
                  <div className="space-y-4">
                    {/* Progress */}
                    <div>
                      <div className="flex justify-between text-sm mb-2">
                        <span className="font-medium">
                          {petition.current_signatures.toLocaleString()} signed
                        </span>
                        <span className="text-muted-foreground">
                          Goal: {petition.goal_signatures.toLocaleString()}
                        </span>
                      </div>
                      <Progress 
                        value={getProgressPercentage(petition.current_signatures, petition.goal_signatures)} 
                        className="h-2" 
                      />
                    </div>

                    {/* Meta Information */}
                    <div className="flex items-center justify-between text-xs text-muted-foreground">
                      <div className="flex items-center gap-4">
                        {petition.region && (
                          <div className="flex items-center gap-1">
                            <MapPin className="h-3 w-3" />
                            <span>{petition.region}</span>
                          </div>
                        )}
                        {petition.deadline_date && (
                          <div className="flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            <span>{formatTimeRemaining(petition.deadline_date)}</span>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex gap-2 pt-2">
                      <Button 
                        size="sm" 
                        className="flex-1"
                        onClick={() => navigate(`/petitions/${petition.id}`)}
                      >
                        <Eye className="h-4 w-4 mr-2" />
                        View & Sign
                      </Button>
                      <Button 
                        size="sm" 
                        variant="outline"
                        onClick={(e) => {
                          e.stopPropagation();
                          // Share functionality
                        }}
                      >
                        <Share2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}