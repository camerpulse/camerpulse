import React, { useState, useEffect, useMemo } from 'react';
import { AppLayout } from '@/components/Layout/AppLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Search, Filter, SortAsc, SortDesc, Users, MessageCircle, FileText, Loader2 } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface SearchResult {
  id: string;
  type: 'user' | 'message' | 'pulse';
  title: string;
  content: string;
  avatar?: string;
  timestamp?: string;
  relevance: number;
}

export default function SearchPage() {
  const { user } = useAuth();
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('all');
  const [sortOrder, setSortOrder] = useState<'relevance' | 'date'>('relevance');

  const searchUsers = async (searchQuery: string): Promise<SearchResult[]> => {
    const { data, error } = await supabase
      .from('profiles')
      .select('id, display_name, username, avatar_url')
      .or(`display_name.ilike.%${searchQuery}%,username.ilike.%${searchQuery}%`)
      .limit(10);

    if (error) return [];

    return data.map(profile => ({
      id: profile.id,
      type: 'user' as const,
      title: profile.display_name || profile.username || 'Unknown User',
      content: `@${profile.username}`,
      avatar: profile.avatar_url,
      relevance: calculateRelevance(searchQuery, profile.display_name + ' ' + profile.username)
    }));
  };

  const searchMessages = async (searchQuery: string): Promise<SearchResult[]> => {
    // Note: This would need proper message search implementation
    // For now, returning empty array as messages table structure would need to be defined
    return [];
  };

  const searchPulses = async (searchQuery: string): Promise<SearchResult[]> => {
    // Note: This would need proper pulse/posts search implementation
    // For now, returning empty array as pulses table structure would need to be defined
    return [];
  };

  const calculateRelevance = (query: string, text: string): number => {
    const lowerQuery = query.toLowerCase();
    const lowerText = text.toLowerCase();
    
    if (lowerText.includes(lowerQuery)) {
      const position = lowerText.indexOf(lowerQuery);
      return 1 - (position / text.length);
    }
    
    return 0;
  };

  const performSearch = async () => {
    if (!query.trim()) {
      setResults([]);
      return;
    }

    setLoading(true);
    try {
      const [users, messages, pulses] = await Promise.all([
        searchUsers(query),
        searchMessages(query),
        searchPulses(query)
      ]);

      const allResults = [...users, ...messages, ...pulses];
      setResults(allResults);
    } catch (error) {
      console.error('Search error:', error);
      toast.error('Search failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const filteredResults = useMemo(() => {
    let filtered = results;
    
    if (activeTab !== 'all') {
      filtered = results.filter(result => result.type === activeTab);
    }

    return filtered.sort((a, b) => {
      if (sortOrder === 'relevance') {
        return b.relevance - a.relevance;
      }
      if (a.timestamp && b.timestamp) {
        return new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime();
      }
      return 0;
    });
  }, [results, activeTab, sortOrder]);

  useEffect(() => {
    const delayedSearch = setTimeout(() => {
      if (query.length > 2) {
        performSearch();
      } else {
        setResults([]);
      }
    }, 300);

    return () => clearTimeout(delayedSearch);
  }, [query]);

  const getResultIcon = (type: string) => {
    switch (type) {
      case 'user': return Users;
      case 'message': return MessageCircle;
      case 'pulse': return FileText;
      default: return FileText;
    }
  };

  return (
    <AppLayout>
      <div className="container mx-auto px-4 py-6 max-w-4xl">
        <div className="space-y-6">
          {/* Search Header */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 font-sans text-xl font-semibold">
                <Search className="w-5 h-5" />
                Search CamerPulse
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  placeholder="Search users, messages, or posts..."
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  className="pl-10 font-sans text-base"
                />
              </div>
              
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setSortOrder(sortOrder === 'relevance' ? 'date' : 'relevance')}
                    className="font-sans text-sm"
                  >
                    {sortOrder === 'relevance' ? <SortDesc className="w-4 h-4 mr-1" /> : <SortAsc className="w-4 h-4 mr-1" />}
                    Sort by {sortOrder}
                  </Button>
                </div>
                {query && (
                  <Badge variant="secondary" className="font-sans">
                    {filteredResults.length} results
                  </Badge>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Search Results */}
          {query && (
            <Card>
              <CardContent className="p-0">
                <Tabs value={activeTab} onValueChange={setActiveTab}>
                  <div className="border-b p-4">
                    <TabsList className="grid w-full grid-cols-4">
                      <TabsTrigger value="all" className="font-sans">All</TabsTrigger>
                      <TabsTrigger value="user" className="font-sans">Users</TabsTrigger>
                      <TabsTrigger value="message" className="font-sans">Messages</TabsTrigger>
                      <TabsTrigger value="pulse" className="font-sans">Posts</TabsTrigger>
                    </TabsList>
                  </div>

                  <div className="p-4">
                    {loading ? (
                      <div className="flex items-center justify-center py-8">
                        <Loader2 className="w-6 h-6 animate-spin mr-2" />
                        <span className="font-sans text-muted-foreground">Searching...</span>
                      </div>
                    ) : filteredResults.length > 0 ? (
                      <div className="space-y-3">
                        {filteredResults.map((result) => {
                          const Icon = getResultIcon(result.type);
                          return (
                            <div
                              key={`${result.type}-${result.id}`}
                              className="flex items-start gap-3 p-3 rounded-lg border hover:bg-accent/50 transition-colors cursor-pointer"
                            >
                              {result.avatar ? (
                                <Avatar className="w-10 h-10">
                                  <AvatarImage src={result.avatar} />
                                  <AvatarFallback className="font-sans text-sm">
                                    {result.title.charAt(0).toUpperCase()}
                                  </AvatarFallback>
                                </Avatar>
                              ) : (
                                <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                                  <Icon className="w-5 h-5 text-primary" />
                                </div>
                              )}
                              
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2 mb-1">
                                  <h3 className="font-sans font-medium text-sm truncate">
                                    {result.title}
                                  </h3>
                                  <Badge variant="outline" className="font-sans text-xs">
                                    {result.type}
                                  </Badge>
                                </div>
                                <p className="font-sans text-sm text-muted-foreground line-clamp-2">
                                  {result.content}
                                </p>
                                {result.timestamp && (
                                  <p className="font-sans text-xs text-muted-foreground mt-1">
                                    {new Date(result.timestamp).toLocaleDateString()}
                                  </p>
                                )}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    ) : query.length > 2 ? (
                      <div className="text-center py-8">
                        <Search className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                        <h3 className="font-sans font-medium text-lg mb-2">No results found</h3>
                        <p className="font-sans text-muted-foreground">
                          Try adjusting your search terms or browse different categories.
                        </p>
                      </div>
                    ) : (
                      <div className="text-center py-8">
                        <Search className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                        <h3 className="font-sans font-medium text-lg mb-2">Start searching</h3>
                        <p className="font-sans text-muted-foreground">
                          Type at least 3 characters to begin searching.
                        </p>
                      </div>
                    )}
                  </div>
                </Tabs>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </AppLayout>
  );
}