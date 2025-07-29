import React, { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Search, 
  Filter,
  Users,
  Building2,
  FileText,
  Activity,
  AlertTriangle,
  CheckCircle,
  Clock,
  TrendingUp
} from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

interface SearchResult {
  id: string;
  type: 'user' | 'company' | 'poll' | 'report' | 'activity';
  title: string;
  subtitle: string;
  module: string;
  status?: string;
  metadata?: Record<string, any>;
}

interface AdminGlobalSearchProps {
  onResultSelect: (result: SearchResult) => void;
  onModuleNavigate: (moduleId: string) => void;
}

export const AdminGlobalSearch: React.FC<AdminGlobalSearchProps> = ({
  onResultSelect,
  onModuleNavigate
}) => {
  const [query, setQuery] = useState('');
  const [selectedModule, setSelectedModule] = useState('all');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);

  // Mock search results - in real implementation, this would call Supabase
  const mockResults: SearchResult[] = [
    {
      id: '1',
      type: 'user',
      title: 'John Doe',
      subtitle: 'john.doe@example.com',
      module: 'users-roles',
      status: 'active'
    },
    {
      id: '2',
      type: 'company',
      title: 'Tech Solutions Ltd',
      subtitle: 'Verified company in Douala',
      module: 'company-directory',
      status: 'verified'
    },
    {
      id: '3',
      type: 'poll',
      title: 'Municipal Budget Allocation',
      subtitle: 'Active poll with 1,234 votes',
      module: 'polls-system',
      status: 'active'
    },
    {
      id: '4',
      type: 'report',
      title: 'Corruption Report - Village Water Project',
      subtitle: 'High severity, pending review',
      module: 'village-admin',
      status: 'pending'
    }
  ];

  const handleSearch = async (searchQuery: string) => {
    setQuery(searchQuery);
    
    if (searchQuery.length < 2) {
      setResults([]);
      return;
    }

    setIsSearching(true);
    
    // Simulate API call
    setTimeout(() => {
      const filtered = mockResults.filter(result =>
        (selectedModule === 'all' || result.module === selectedModule) &&
        (result.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
         result.subtitle.toLowerCase().includes(searchQuery.toLowerCase()))
      );
      setResults(filtered);
      setIsSearching(false);
    }, 300);
  };

  const getResultIcon = (type: string) => {
    switch (type) {
      case 'user': return Users;
      case 'company': return Building2;
      case 'poll': return FileText;
      case 'report': return AlertTriangle;
      case 'activity': return Activity;
      default: return FileText;
    }
  };

  const getStatusColor = (status?: string) => {
    switch (status) {
      case 'active': return 'text-success';
      case 'verified': return 'text-success';
      case 'pending': return 'text-warning';
      case 'flagged': return 'text-destructive';
      default: return 'text-muted-foreground';
    }
  };

  const modules = [
    { id: 'all', label: 'All Modules' },
    { id: 'users-roles', label: 'Users & Roles' },
    { id: 'company-directory', label: 'Companies' },
    { id: 'polls-system', label: 'Polls' },
    { id: 'village-admin', label: 'Villages' },
    { id: 'moderation', label: 'Moderation' }
  ];

  return (
    <Card className="w-full">
      <CardContent className="p-4">
        <div className="space-y-4">
          {/* Search Input */}
          <div className="flex gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search users, companies, polls, reports..."
                value={query}
                onChange={(e) => handleSearch(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={selectedModule} onValueChange={setSelectedModule}>
              <SelectTrigger className="w-40">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {modules.map((module) => (
                  <SelectItem key={module.id} value={module.id}>
                    {module.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Results */}
          {query.length >= 2 && (
            <div className="space-y-2">
              {isSearching ? (
                <div className="text-center py-4 text-muted-foreground">
                  Searching...
                </div>
              ) : results.length > 0 ? (
                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground">
                    Found {results.length} results
                  </p>
                  {results.map((result) => {
                    const Icon = getResultIcon(result.type);
                    return (
                      <div
                        key={result.id}
                        className="flex items-center justify-between p-3 rounded-lg border hover:bg-muted cursor-pointer"
                        onClick={() => onResultSelect(result)}
                      >
                        <div className="flex items-center gap-3">
                          <Icon className="h-4 w-4 text-muted-foreground" />
                          <div>
                            <p className="font-medium">{result.title}</p>
                            <p className="text-sm text-muted-foreground">
                              {result.subtitle}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          {result.status && (
                            <Badge 
                              variant="outline" 
                              className={getStatusColor(result.status)}
                            >
                              {result.status}
                            </Badge>
                          )}
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={(e) => {
                              e.stopPropagation();
                              onModuleNavigate(result.module);
                            }}
                          >
                            Go to Module
                          </Button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="text-center py-4 text-muted-foreground">
                  No results found for "{query}"
                </div>
              )}
            </div>
          )}

          {/* Quick Actions */}
          {query.length === 0 && (
            <div className="space-y-3">
              <p className="text-sm font-medium">Quick Actions</p>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                {[
                  { id: 'users-roles', label: 'Manage Users', icon: Users },
                  { id: 'polls-system', label: 'Create Poll', icon: FileText },
                  { id: 'analytics-logs', label: 'View Analytics', icon: TrendingUp },
                  { id: 'moderation', label: 'Review Reports', icon: AlertTriangle }
                ].map((action) => (
                  <Button
                    key={action.id}
                    variant="outline"
                    size="sm"
                    className="justify-start"
                    onClick={() => onModuleNavigate(action.id)}
                  >
                    <action.icon className="h-4 w-4 mr-2" />
                    {action.label}
                  </Button>
                ))}
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};