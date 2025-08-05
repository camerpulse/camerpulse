import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  FileText, 
  Users, 
  TrendingUp, 
  Search, 
  Plus,
  Clock,
  CheckCircle,
  AlertTriangle
} from 'lucide-react';
import { LoadingSpinner, CardSkeleton } from '@/components/LoadingSpinner';
import { ResponsiveContainer, ResponsiveGrid } from '@/components/layout/ResponsiveComponents';

interface Petition {
  id: string;
  title: string;
  description: string;
  target_signatures: number;
  current_signatures: number;
  status: 'active' | 'closed' | 'successful';
  category: string;
  created_at: string;
  deadline?: string;
  creator_name: string;
  region?: string;
}

// Mock data - in real app this would come from API
const mockPetitions: Petition[] = [
  {
    id: '1',
    title: 'Improve Healthcare Access in Rural Areas',
    description: 'Petition to establish more healthcare centers in rural villages across Cameroon',
    target_signatures: 5000,
    current_signatures: 3247,
    status: 'active',
    category: 'Healthcare',
    created_at: '2024-01-15',
    deadline: '2024-03-15',
    creator_name: 'Dr. Marie Nkomo',
    region: 'Centre'
  },
  {
    id: '2',
    title: 'Better Road Infrastructure for Economic Development',
    description: 'Demand better road networks to connect rural markets to urban centers',
    target_signatures: 10000,
    current_signatures: 8765,
    status: 'active',
    category: 'Infrastructure',
    created_at: '2024-01-10',
    deadline: '2024-04-10',
    creator_name: 'Emmanuel Biya',
    region: 'Littoral'
  },
  {
    id: '3',
    title: 'Education Reform for Digital Literacy',
    description: 'Integrate computer science and digital skills into primary education curriculum',
    target_signatures: 7500,
    current_signatures: 7500,
    status: 'successful',
    category: 'Education',
    created_at: '2023-11-20',
    deadline: '2024-02-20',
    creator_name: 'Prof. Antoinette Fouda',
    region: 'Ouest'
  }
];

export const PetitionSystem: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [selectedStatus, setSelectedStatus] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);

  // Filter petitions
  const filteredPetitions = React.useMemo(() => {
    return mockPetitions.filter(petition => {
      const matchesSearch = !searchTerm || 
        petition.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        petition.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        petition.category.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesCategory = !selectedCategory || petition.category === selectedCategory;
      const matchesStatus = !selectedStatus || petition.status === selectedStatus;
      
      return matchesSearch && matchesCategory && matchesStatus;
    });
  }, [searchTerm, selectedCategory, selectedStatus]);

  // Get categories and statuses for filters
  const categories = [...new Set(mockPetitions.map(p => p.category))].sort();
  const statuses = [...new Set(mockPetitions.map(p => p.status))].sort();

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'active':
        return <Clock className="h-4 w-4" />;
      case 'successful':
        return <CheckCircle className="h-4 w-4" />;
      case 'closed':
        return <AlertTriangle className="h-4 w-4" />;
      default:
        return <FileText className="h-4 w-4" />;
    }
  };

  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case 'active':
        return 'default';
      case 'successful':
        return 'default';
      case 'closed':
        return 'secondary';
      default:
        return 'outline';
    }
  };

  const calculateProgress = (current: number, target: number) => {
    return Math.min((current / target) * 100, 100);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const getDaysRemaining = (deadline?: string) => {
    if (!deadline) return null;
    const now = new Date();
    const end = new Date(deadline);
    const diffTime = end.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays > 0 ? diffDays : 0;
  };

  return (
    <ResponsiveContainer>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Petition System</h1>
            <p className="text-muted-foreground">
              Create and support petitions for positive change
            </p>
          </div>
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            Create Petition
          </Button>
        </div>

        {/* Stats Overview */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Petitions</CardTitle>
              <FileText className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{mockPetitions.length}</div>
              <p className="text-xs text-muted-foreground">
                +2 this week
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Active Petitions</CardTitle>
              <Clock className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {mockPetitions.filter(p => p.status === 'active').length}
              </div>
              <p className="text-xs text-muted-foreground">
                Currently accepting signatures
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Signatures</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {mockPetitions.reduce((sum, p) => sum + p.current_signatures, 0).toLocaleString()}
              </div>
              <p className="text-xs text-muted-foreground">
                Across all petitions
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Success Rate</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {Math.round((mockPetitions.filter(p => p.status === 'successful').length / mockPetitions.length) * 100)}%
              </div>
              <p className="text-xs text-muted-foreground">
                Petitions reaching target
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Search and Filters */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Search className="h-5 w-5 mr-2" />
              Search & Filter Petitions
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col gap-4 md:flex-row md:items-center">
              <div className="flex-1">
                <Input
                  placeholder="Search petitions by title, description, or category..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full"
                />
              </div>
              
              <div className="flex gap-2">
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="px-3 py-2 border border-input rounded-md bg-background text-sm"
                >
                  <option value="">All Categories</option>
                  {categories.map(category => (
                    <option key={category} value={category}>{category}</option>
                  ))}
                </select>

                <select
                  value={selectedStatus}
                  onChange={(e) => setSelectedStatus(e.target.value)}
                  className="px-3 py-2 border border-input rounded-md bg-background text-sm"
                >
                  <option value="">All Statuses</option>
                  {statuses.map(status => (
                    <option key={status} value={status}>
                      {status.charAt(0).toUpperCase() + status.slice(1)}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Petitions List */}
        {isLoading ? (
          <ResponsiveGrid cols={{ default: 1, lg: 2 }}>
            {Array.from({ length: 4 }).map((_, i) => (
              <CardSkeleton key={i} />
            ))}
          </ResponsiveGrid>
        ) : (
          <ResponsiveGrid cols={{ default: 1, lg: 2 }}>
            {filteredPetitions.map((petition) => {
              const progress = calculateProgress(petition.current_signatures, petition.target_signatures);
              const daysRemaining = getDaysRemaining(petition.deadline);
              
              return (
                <Card key={petition.id} className="hover:shadow-md transition-shadow">
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <CardTitle className="text-lg leading-tight">
                          {petition.title}
                        </CardTitle>
                        <CardDescription className="mt-1">
                          by {petition.creator_name} • {formatDate(petition.created_at)}
                        </CardDescription>
                      </div>
                      <div className="flex flex-col items-end gap-1">
                        <Badge variant={getStatusBadgeVariant(petition.status)} className="flex items-center gap-1">
                          {getStatusIcon(petition.status)}
                          {petition.status.charAt(0).toUpperCase() + petition.status.slice(1)}
                        </Badge>
                        <Badge variant="outline" className="text-xs">
                          {petition.category}
                        </Badge>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <p className="text-sm text-muted-foreground line-clamp-2">
                        {petition.description}
                      </p>
                      
                      {/* Progress Bar */}
                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span className="font-medium">
                            {petition.current_signatures.toLocaleString()} signatures
                          </span>
                          <span className="text-muted-foreground">
                            {petition.target_signatures.toLocaleString()} goal
                          </span>
                        </div>
                        <div className="w-full bg-secondary rounded-full h-2">
                          <div 
                            className="bg-primary h-2 rounded-full transition-all" 
                            style={{ width: `${progress}%` }}
                          />
                        </div>
                        <div className="flex justify-between text-xs text-muted-foreground">
                          <span>{progress.toFixed(1)}% complete</span>
                          {daysRemaining !== null && petition.status === 'active' && (
                            <span>
                              {daysRemaining > 0 ? `${daysRemaining} days left` : 'Expired'}
                            </span>
                          )}
                        </div>
                      </div>

                      <div className="flex gap-2">
                        <Button className="flex-1" disabled={petition.status !== 'active'}>
                          Sign Petition
                        </Button>
                        <Button variant="outline">
                          View Details
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </ResponsiveGrid>
        )}

        {/* No Results */}
        {!isLoading && filteredPetitions.length === 0 && (
          <Card>
            <CardContent className="pt-6">
              <div className="text-center">
                <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">No petitions found</h3>
                <p className="text-muted-foreground">
                  Try adjusting your search criteria or create a new petition.
                </p>
                <Button className="mt-4">
                  <Plus className="h-4 w-4 mr-2" />
                  Create New Petition
                </Button>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </ResponsiveContainer>
  );
};