import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { supabase } from '@/integrations/supabase/client';
import { useNavigate } from 'react-router-dom';
import { Search, Calendar, MapPin, Building } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

interface Tender {
  id: string;
  title: string;
  description: string;
  reference_number: string;
  organization_name: string;
  estimated_value_fcfa?: number;
  region?: string;
  submission_deadline: string;
  status: string;
  created_at: string;
  bids_count: number;
  tender_categories?: {
    name: string;
  };
}

interface TenderDiscoveryProps {
  limit?: number;
  showCreateButton?: boolean;
}

export const TenderDiscovery: React.FC<TenderDiscoveryProps> = ({ 
  limit = 10, 
  showCreateButton = true 
}) => {
  const [tenders, setTenders] = useState<Tender[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [categories, setCategories] = useState<Array<{ id: string; name: string }>>([]);
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const navigate = useNavigate();

  useEffect(() => {
    fetchTenders();
    fetchCategories();
  }, [searchTerm, statusFilter, categoryFilter, limit]);

  const fetchCategories = async () => {
    const { data } = await supabase
      .from('tender_categories')
      .select('id, name')
      .eq('is_active', true);
    
    if (data) {
      setCategories(data);
    }
  };

  const fetchTenders = async () => {
    setLoading(true);
    
    let query = supabase
      .from('tenders')
      .select(`
        *,
        tender_categories (
          name
        )
      `)
      .order('created_at', { ascending: false })
      .limit(limit);

    if (searchTerm) {
      query = query.or(`title.ilike.%${searchTerm}%,description.ilike.%${searchTerm}%,organization_name.ilike.%${searchTerm}%`);
    }

    if (statusFilter !== 'all') {
      query = query.eq('status', statusFilter);
    }

    if (categoryFilter !== 'all') {
      query = query.eq('category_id', categoryFilter);
    }

    const { data, error } = await query;

    if (error) {
      console.error('Error fetching tenders:', error);
    } else {
      setTenders(data || []);
    }
    
    setLoading(false);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'published':
        return 'bg-green-100 text-green-800';
      case 'draft':
        return 'bg-yellow-100 text-yellow-800';
      case 'closed':
        return 'bg-red-100 text-red-800';
      case 'awarded':
        return 'bg-blue-100 text-blue-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const formatCurrency = (amount?: number) => {
    if (!amount) return 'N/A';
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'XAF',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const isDeadlineApproaching = (deadline: string) => {
    const deadlineDate = new Date(deadline);
    const now = new Date();
    const timeDiff = deadlineDate.getTime() - now.getTime();
    const daysDiff = timeDiff / (1000 * 3600 * 24);
    return daysDiff <= 7 && daysDiff > 0;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold">Tender Opportunities</h2>
          <p className="text-muted-foreground">
            Discover and apply for government and private sector tenders
          </p>
        </div>
        {showCreateButton && (
          <Button onClick={() => navigate('/tenders/create')}>
            Create Tender
          </Button>
        )}
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
          <Input
            placeholder="Search tenders..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-full sm:w-40">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="published">Published</SelectItem>
            <SelectItem value="draft">Draft</SelectItem>
            <SelectItem value="closed">Closed</SelectItem>
            <SelectItem value="awarded">Awarded</SelectItem>
          </SelectContent>
        </Select>

        <Select value={categoryFilter} onValueChange={setCategoryFilter}>
          <SelectTrigger className="w-full sm:w-48">
            <SelectValue placeholder="Category" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Categories</SelectItem>
            {categories.map((category) => (
              <SelectItem key={category.id} value={category.id}>
                {category.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Tender List */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(6)].map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardHeader>
                <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                <div className="h-3 bg-gray-200 rounded w-1/2"></div>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="h-3 bg-gray-200 rounded"></div>
                  <div className="h-3 bg-gray-200 rounded w-2/3"></div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {tenders.map((tender) => (
            <Card 
              key={tender.id} 
              className="hover:shadow-lg transition-shadow cursor-pointer"
              onClick={() => navigate(`/tenders/${tender.id}`)}
            >
              <CardHeader>
                <div className="flex justify-between items-start">
                  <CardTitle className="text-lg line-clamp-2">
                    {tender.title}
                  </CardTitle>
                  <Badge className={getStatusColor(tender.status)}>
                    {tender.status}
                  </Badge>
                </div>
                <CardDescription className="line-clamp-2">
                  {tender.description}
                </CardDescription>
              </CardHeader>
              
              <CardContent className="space-y-4">
                <div className="flex items-center text-sm text-muted-foreground">
                  <Building className="h-4 w-4 mr-2" />
                  {tender.organization_name}
                </div>

                {tender.region && (
                  <div className="flex items-center text-sm text-muted-foreground">
                    <MapPin className="h-4 w-4 mr-2" />
                    {tender.region}
                  </div>
                )}

                <div className="flex items-center text-sm">
                  <Calendar className="h-4 w-4 mr-2" />
                  <span className={isDeadlineApproaching(tender.submission_deadline) ? 'text-red-600 font-medium' : ''}>
                    Deadline: {formatDistanceToNow(new Date(tender.submission_deadline), { addSuffix: true })}
                  </span>
                </div>

                <div className="flex justify-between items-center text-sm">
                  <span className="font-medium">
                    {formatCurrency(tender.estimated_value_fcfa)}
                  </span>
                  <span className="text-muted-foreground">
                    {tender.bids_count} bid{tender.bids_count !== 1 ? 's' : ''}
                  </span>
                </div>

                {tender.tender_categories && (
                  <Badge variant="outline">
                    {tender.tender_categories.name}
                  </Badge>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {!loading && tenders.length === 0 && (
        <Card>
          <CardContent className="text-center py-8">
            <p className="text-muted-foreground mb-4">
              No tenders found matching your criteria
            </p>
            <Button onClick={() => {
              setSearchTerm('');
              setStatusFilter('all');
              setCategoryFilter('all');
            }}>
              Clear Filters
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
};