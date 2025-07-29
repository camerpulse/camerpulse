import React, { useState, useEffect } from 'react';
import { FileText, Users, TrendingUp, Clock, Target, AlertTriangle } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Link } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { formatDistanceToNow } from 'date-fns';

interface VillagePetition {
  id: string;
  title: string;
  description: string;
  village_id: string;
  village_name: string;
  signatures_count: number;
  target_signatures: number;
  status: string;
  category: string;
  created_at: string;
  urgency_level: string;
}

const VillagesPetitioned = () => {
  const [petitions, setPetitions] = useState<VillagePetition[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterCategory, setFilterCategory] = useState<string>('');

  useEffect(() => {
    fetchPetitions();
  }, []);

  const fetchPetitions = async () => {
    try {
      // Mock data for demonstration - replace with actual Supabase query
      const mockPetitions: VillagePetition[] = [
        {
          id: '1',
          title: 'Improve Road Access to Bafut Market',
          description: 'The main road to our village market is in terrible condition, affecting local trade and emergency access.',
          village_id: '1',
          village_name: 'Bafut',
          signatures_count: 1245,
          target_signatures: 2000,
          status: 'active',
          category: 'Infrastructure',
          created_at: '2024-01-10T00:00:00Z',
          urgency_level: 'high'
        },
        {
          id: '2',
          title: 'Stop Illegal Mining in Lebialem Forest',
          description: 'Illegal mining activities are destroying our sacred forest and water sources.',
          village_id: '2',
          village_name: 'Lebialem',
          signatures_count: 2890,
          target_signatures: 3000,
          status: 'active',
          category: 'Environment',
          created_at: '2024-01-05T00:00:00Z',
          urgency_level: 'critical'
        },
        {
          id: '3',
          title: 'Establish Government Hospital in Mamfe',
          description: 'Our community needs a government hospital to serve the growing population.',
          village_id: '3',
          village_name: 'Mamfe',
          signatures_count: 3245,
          target_signatures: 5000,
          status: 'active',
          category: 'Healthcare',
          created_at: '2023-12-20T00:00:00Z',
          urgency_level: 'medium'
        },
        {
          id: '4',
          title: 'Improve Water Supply in Kumbo',
          description: 'Clean water access is limited in our community, especially during dry season.',
          village_id: '4',
          village_name: 'Kumbo',
          signatures_count: 1567,
          target_signatures: 2500,
          status: 'active',
          category: 'Infrastructure',
          created_at: '2024-01-15T00:00:00Z',
          urgency_level: 'high'
        },
        {
          id: '5',
          title: 'Build Secondary School in Wum',
          description: 'Our youth have to travel far for secondary education. We need a local school.',
          village_id: '5',
          village_name: 'Wum',
          signatures_count: 967,
          target_signatures: 1500,
          status: 'active',
          category: 'Education',
          created_at: '2024-01-08T00:00:00Z',
          urgency_level: 'medium'
        }
      ];

      setPetitions(mockPetitions);
    } catch (error) {
      console.error('Error fetching petitions:', error);
    } finally {
      setLoading(false);
    }
  };

  const getUrgencyColor = (urgency: string) => {
    switch (urgency) {
      case 'critical': return 'destructive';
      case 'high': return 'default';
      case 'medium': return 'secondary';
      case 'low': return 'outline';
      default: return 'outline';
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'Infrastructure': return 'bg-blue-100 text-blue-800';
      case 'Healthcare': return 'bg-red-100 text-red-800';
      case 'Education': return 'bg-green-100 text-green-800';
      case 'Environment': return 'bg-emerald-100 text-emerald-800';
      case 'Governance': return 'bg-purple-100 text-purple-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const PetitionCard = ({ petition }: { petition: VillagePetition }) => {
    const progressPercentage = (petition.signatures_count / petition.target_signatures) * 100;
    
    return (
      <Card className="hover:shadow-lg transition-all duration-300">
        <CardHeader>
          <div className="flex items-start justify-between mb-2">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-2">
                <Badge variant={getUrgencyColor(petition.urgency_level)}>
                  <AlertTriangle className="h-3 w-3 mr-1" />
                  {petition.urgency_level.toUpperCase()}
                </Badge>
                <Badge variant="outline" className={getCategoryColor(petition.category)}>
                  {petition.category}
                </Badge>
              </div>
              <CardTitle className="text-xl font-bold text-foreground hover:text-primary transition-colors">
                {petition.title}
              </CardTitle>
              <p className="text-sm text-muted-foreground mt-1">
                {petition.village_name} • {formatDistanceToNow(new Date(petition.created_at))} ago
              </p>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground mb-4 line-clamp-2">
            {petition.description}
          </p>

          <div className="space-y-3 mb-4">
            <div className="flex items-center justify-between text-sm">
              <span className="font-medium">Progress</span>
              <span className="text-muted-foreground">
                {petition.signatures_count.toLocaleString()} / {petition.target_signatures.toLocaleString()} signatures
              </span>
            </div>
            <Progress value={progressPercentage} className="h-2" />
            <div className="text-xs text-muted-foreground text-center">
              {(100 - progressPercentage).toFixed(1)}% more needed
            </div>
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4 text-sm text-muted-foreground">
              <div className="flex items-center">
                <Users className="h-4 w-4 mr-1" />
                {petition.signatures_count.toLocaleString()} signed
              </div>
              <div className="flex items-center">
                <Clock className="h-4 w-4 mr-1" />
                {formatDistanceToNow(new Date(petition.created_at))} ago
              </div>
            </div>
            <div className="flex gap-2">
              <Link to={`/petition/${petition.id}`}>
                <Button size="sm" variant="outline">
                  View Details
                </Button>
              </Link>
              <Button size="sm" className="bg-primary hover:bg-primary/90">
                Sign Petition
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="bg-gradient-to-r from-primary to-primary/80 text-primary-foreground">
        <div className="container mx-auto px-4 py-8">
          <div className="flex items-center gap-3 mb-4">
            <FileText className="h-8 w-8" />
            <h1 className="text-4xl font-bold">Village Petitions</h1>
          </div>
          <p className="text-primary-foreground/80 text-lg">
            Community-driven initiatives for positive change across Cameroonian villages
          </p>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardContent className="p-6 text-center">
              <div className="text-3xl font-bold text-primary mb-2">
                {petitions.length}
              </div>
              <div className="text-sm text-muted-foreground">Active Petitions</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6 text-center">
              <div className="text-3xl font-bold text-secondary mb-2">
                {petitions.reduce((sum, p) => sum + p.signatures_count, 0).toLocaleString()}
              </div>
              <div className="text-sm text-muted-foreground">Total Signatures</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6 text-center">
              <div className="text-3xl font-bold text-accent mb-2">
                {petitions.filter(p => p.urgency_level === 'critical' || p.urgency_level === 'high').length}
              </div>
              <div className="text-sm text-muted-foreground">Urgent Issues</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6 text-center">
              <div className="text-3xl font-bold text-success mb-2">
                {petitions.filter(p => (p.signatures_count / p.target_signatures) >= 0.8).length}
              </div>
              <div className="text-sm text-muted-foreground">Near Target</div>
            </CardContent>
          </Card>
        </div>

        {/* Petitions List */}
        <div className="mb-6">
          <h2 className="text-2xl font-bold mb-2">Active Petitions</h2>
          <p className="text-muted-foreground">
            Support community initiatives that matter most to villages across Cameroon
          </p>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {Array.from({ length: 4 }).map((_, i) => (
              <Card key={i} className="animate-pulse">
                <CardHeader>
                  <div className="h-6 bg-muted rounded w-3/4"></div>
                  <div className="h-4 bg-muted rounded w-1/2"></div>
                </CardHeader>
                <CardContent>
                  <div className="h-20 bg-muted rounded mb-4"></div>
                  <div className="h-4 bg-muted rounded"></div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {petitions.map((petition) => (
              <PetitionCard key={petition.id} petition={petition} />
            ))}
          </div>
        )}

        <div className="mt-8 text-center">
          <div className="space-y-4">
            <p className="text-muted-foreground">
              Want to start a petition for your village?
            </p>
            <div className="flex gap-4 justify-center">
              <Link to="/petitions/create">
                <Button size="lg" className="bg-primary hover:bg-primary/90">
                  Create Petition
                </Button>
              </Link>
              <Link to="/villages">
                <Button variant="outline" size="lg">
                  Back to Villages
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VillagesPetitioned;