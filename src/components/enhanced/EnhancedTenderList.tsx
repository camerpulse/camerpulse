import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { BreadcrumbNavigation } from '@/components/ui/breadcrumb-navigation';
import { AdvancedPagination } from '@/components/ui/advanced-pagination';
import { ExportFunctionality } from '@/components/ui/export-functionality';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Search, Filter } from 'lucide-react';

interface Tender {
  id: string;
  title: string;
  description: string;
  budget: number;
  deadline: string;
  status: string;
  category: string;
  location: string;
  created_at: string;
}

export const EnhancedTenderList: React.FC = () => {
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [searchTerm, setSearchTerm] = useState('');

  // Fetch tenders with pagination
  const { data: tendersData, isLoading } = useQuery({
    queryKey: ['tenders_enhanced', currentPage, pageSize, searchTerm],
    queryFn: async () => {
      let query = supabase
        .from('tenders')
        .select('*', { count: 'exact' })
        .order('created_at', { ascending: false });

      if (searchTerm) {
        query = query.or(`title.ilike.%${searchTerm}%,description.ilike.%${searchTerm}%`);
      }

      const from = (currentPage - 1) * pageSize;
      const to = from + pageSize - 1;

      const { data, error, count } = await query.range(from, to);
      
      if (error) throw error;
      
      return {
        tenders: data || [],
        totalCount: count || 0,
        totalPages: Math.ceil((count || 0) / pageSize)
      };
    },
  });

  const tenders = tendersData?.tenders || [];
  const totalCount = tendersData?.totalCount || 0;
  const totalPages = tendersData?.totalPages || 1;

  const breadcrumbItems = [
    { label: 'Home', href: '/' },
    { label: 'Tenders', href: '/tenders' },
    { label: 'Enhanced List', current: true }
  ];

  const handleExport = async (format: string, data: any[]) => {
    // Custom export logic can be implemented here
    console.log(`Exporting ${data.length} tenders as ${format}`);
  };

  const getStatusBadge = (status: string) => {
    const variants = {
      open: 'default',
      closed: 'secondary',
      draft: 'outline',
      awarded: 'destructive'
    } as const;
    
    return (
      <Badge variant={variants[status as keyof typeof variants] || 'outline'}>
        {status}
      </Badge>
    );
  };

  return (
    <div className="space-y-6 p-6">
      {/* Breadcrumb Navigation */}
      <BreadcrumbNavigation items={breadcrumbItems} />

      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Enhanced Tender List</h1>
          <p className="text-muted-foreground">
            Demonstration of enhanced UX features: breadcrumbs, pagination, and export
          </p>
        </div>
      </div>

      {/* Search and Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                <Input
                  placeholder="Search tenders by title or description..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <Button variant="outline">
              <Filter className="h-4 w-4 mr-2" />
              Filters
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Export Functionality */}
      <ExportFunctionality
        data={tenders}
        filename="tenders"
        title="Export Tender Data"
        onExport={handleExport}
      />

      {/* Tender List */}
      <Card>
        <CardHeader>
          <CardTitle>Tenders ({totalCount})</CardTitle>
          <CardDescription>
            Browse and manage tender listings with advanced pagination
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
          ) : (
            <div className="space-y-4">
              {tenders.map((tender) => (
                <div key={tender.id} className="border rounded-lg p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <h3 className="font-semibold">{tender.title}</h3>
                        {getStatusBadge(tender.status)}
                      </div>
                      <p className="text-sm text-muted-foreground mb-2 line-clamp-2">
                        {tender.description}
                      </p>
                      <div className="flex items-center gap-4 text-sm">
                        <span className="text-green-600 font-medium">
                          ${tender.budget?.toLocaleString()}
                        </span>
                        <span className="text-muted-foreground">
                          Deadline: {new Date(tender.deadline).toLocaleDateString()}
                        </span>
                        <span className="text-muted-foreground">
                          {tender.category}
                        </span>
                        <span className="text-muted-foreground">
                          {tender.location}
                        </span>
                      </div>
                    </div>
                    <Button size="sm" variant="outline">
                      View Details
                    </Button>
                  </div>
                </div>
              ))}
              
              {tenders.length === 0 && (
                <div className="text-center py-8 text-muted-foreground">
                  No tenders found matching your criteria
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Advanced Pagination */}
      <AdvancedPagination
        currentPage={currentPage}
        totalPages={totalPages}
        pageSize={pageSize}
        totalItems={totalCount}
        onPageChange={setCurrentPage}
        onPageSizeChange={(newPageSize) => {
          setPageSize(newPageSize);
          setCurrentPage(1); // Reset to first page when changing page size
        }}
        onGoToPage={setCurrentPage}
        showPageSizeSelector={true}
        showGoToPage={true}
        showInfo={true}
      />
    </div>
  );
};