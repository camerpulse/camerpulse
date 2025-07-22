import { useState } from 'react';
import { AppLayout } from '@/components/Layout/AppLayout';
import { SenatorCard } from '@/components/Senators/SenatorCard';
import { useSenators, useImportSenators } from '@/hooks/useSenators';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Loader2, Search, Download, Users } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';

export default function SenatorsPage() {
  const { data: senators, isLoading } = useSenators();
  const { user } = useAuth();
  const importSenators = useImportSenators();
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('rating');

  const filteredSenators = senators?.filter(senator =>
    senator.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    senator.position.toLowerCase().includes(searchTerm.toLowerCase()) ||
    senator.region?.toLowerCase().includes(searchTerm.toLowerCase())
  ) || [];

  const sortedSenators = [...filteredSenators].sort((a, b) => {
    switch (sortBy) {
      case 'rating':
        return b.average_rating - a.average_rating;
      case 'name':
        return a.name.localeCompare(b.name);
      case 'position':
        return a.position.localeCompare(b.position);
      default:
        return 0;
    }
  });

  const isAdmin = user?.email === 'admin@camerpulse.com'; // Simple admin check

  return (
    <AppLayout>
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-4xl font-bold text-foreground mb-2">
                Cameroon Senate
              </h1>
              <p className="text-lg text-muted-foreground">
                Discover and rate senators representing Cameroon
              </p>
            </div>
            
            {isAdmin && (
              <Button
                onClick={() => importSenators.mutate()}
                disabled={importSenators.isPending}
                className="bg-primary hover:bg-primary/90"
              >
                {importSenators.isPending ? (
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                ) : (
                  <Download className="h-4 w-4 mr-2" />
                )}
                Import Senators
              </Button>
            )}
          </div>

          <div className="flex items-center space-x-2">
            <Badge variant="secondary" className="text-sm">
              <Users className="h-3 w-3 mr-1" />
              {senators?.length || 0} Senators
            </Badge>
          </div>
        </div>

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-4 mb-8">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
            <Input
              placeholder="Search senators by name, position, or region..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          
          <Select value={sortBy} onValueChange={setSortBy}>
            <SelectTrigger className="w-full sm:w-48">
              <SelectValue placeholder="Sort by" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="rating">Highest Rated</SelectItem>
              <SelectItem value="name">Name (A-Z)</SelectItem>
              <SelectItem value="position">Position</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Senators Grid */}
        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : sortedSenators.length === 0 ? (
          <div className="text-center py-12">
            <Users className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-medium text-foreground mb-2">
              {searchTerm ? 'No senators found' : 'No senators available'}
            </h3>
            <p className="text-muted-foreground">
              {searchTerm 
                ? 'Try adjusting your search criteria' 
                : 'Senators data will be imported soon'
              }
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {sortedSenators.map((senator) => (
              <SenatorCard key={senator.id} senator={senator} />
            ))}
          </div>
        )}
      </div>
    </AppLayout>
  );
}