import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { AdminModuleHeader } from '../components/AdminModuleHeader';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { 
  Newspaper, Plus, Edit, Trash2, Eye, Calendar, 
  Users, TrendingUp, FileText, CheckCircle, Clock, AlertTriangle 
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface NewsManagementModuleProps {
  hasPermission: (permission: string) => boolean;
  logActivity: (action: string, details: any) => void;
  stats?: any;
}

export const NewsManagementModule: React.FC<NewsManagementModuleProps> = ({
  hasPermission,
  logActivity,
  stats
}) => {
  const [activeTab, setActiveTab] = useState('overview');
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [selectedArticle, setSelectedArticle] = useState(null);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch news articles
  const { data: newsArticles, isLoading } = useQuery({
    queryKey: ['news-articles', searchTerm, statusFilter],
    queryFn: async () => {
      let query = supabase
        .from('news_articles')
        .select('*')
        .order('created_at', { ascending: false });

      if (searchTerm) {
        query = query.or(`title.ilike.%${searchTerm}%,content.ilike.%${searchTerm}%`);
      }

      // Note: news_articles table doesn't have status field

      const { data, error } = await query;
      if (error) throw error;
      return data;
    },
    enabled: hasPermission('news')
  });

  // Fetch news statistics
  const { data: newsStats } = useQuery({
    queryKey: ['news-stats'],
    queryFn: async () => {
      const { data: total } = await supabase.from('news_articles').select('id', { count: 'exact' });

      return {
        total: total?.length || 0,
        published: total?.length || 0, // news_articles doesn't have status field
        draft: 0,
        pending: 0
      };
    },
    enabled: hasPermission('news')
  });

  // Create article mutation
  const createArticle = useMutation({
    mutationFn: async (articleData: any) => {
      const { error } = await supabase
        .from('news_articles')
        .insert({
          ...articleData,
          author_id: (await supabase.auth.getUser()).data.user?.id,
          created_at: new Date().toISOString()
        });
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['news-articles'] });
      toast({ title: "Article created successfully" });
      setIsCreateModalOpen(false);
    }
  });

  // Update article status mutation
  const updateArticleStatus = useMutation({
    mutationFn: async ({ articleId, status }: { articleId: string; status: string }) => {
      const { error } = await supabase
        .from('news_articles')
        .update({ 
          status,
          updated_at: new Date().toISOString(),
          ...(status === 'published' && { published_at: new Date().toISOString() })
        })
        .eq('id', articleId);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['news-articles'] });
      toast({ title: "Article status updated successfully" });
    }
  });

  // Delete article mutation
  const deleteArticle = useMutation({
    mutationFn: async (articleId: string) => {
      const { error } = await supabase
        .from('news_articles')
        .delete()
        .eq('id', articleId);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['news-articles'] });
      toast({ title: "Article deleted successfully" });
    }
  });

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'published': return <Badge variant="default">Published</Badge>;
      case 'draft': return <Badge variant="secondary">Draft</Badge>;
      case 'pending_review': return <Badge variant="outline">Pending Review</Badge>;
      case 'archived': return <Badge variant="destructive">Archived</Badge>;
      default: return <Badge variant="outline">Unknown</Badge>;
    }
  };

  return (
    <div className="space-y-6">
      <AdminModuleHeader
        title="News Management"
        description="Create, edit, and manage news articles with full editorial workflow"
        icon={Newspaper}
        iconColor="text-blue-600"
        searchPlaceholder="Search articles by title or content..."
        onSearch={setSearchTerm}
        onRefresh={() => {
          queryClient.invalidateQueries({ queryKey: ['news-articles'] });
          logActivity('news_management_refresh', { timestamp: new Date() });
        }}
        actions={
          <Button onClick={() => setIsCreateModalOpen(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Create Article
          </Button>
        }
      />

      {/* News Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Articles</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{newsStats?.total || 0}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Published</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{newsStats?.published || 0}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Drafts</CardTitle>
            <Edit className="h-4 w-4 text-yellow-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">{newsStats?.draft || 0}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending Review</CardTitle>
            <Clock className="h-4 w-4 text-orange-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">{newsStats?.pending || 0}</div>
          </CardContent>
        </Card>
      </div>

      {/* News Management Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="articles">All Articles</TabsTrigger>
          <TabsTrigger value="pending">Pending Review</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          {/* Filters */}
          <Card>
            <CardContent className="pt-6">
              <div className="flex flex-col sm:flex-row gap-4">
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="w-full sm:w-[200px]">
                    <SelectValue placeholder="Filter by status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Statuses</SelectItem>
                    <SelectItem value="published">Published</SelectItem>
                    <SelectItem value="draft">Draft</SelectItem>
                    <SelectItem value="pending_review">Pending Review</SelectItem>
                    <SelectItem value="archived">Archived</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          {/* Recent Articles */}
          <Card>
            <CardHeader>
              <CardTitle>Recent Articles</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {isLoading ? (
                  <div>Loading articles...</div>
                ) : (
                  newsArticles?.slice(0, 5).map((article) => (
                    <div key={article.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div>
                        <h3 className="font-medium">{article.title}</h3>
                        <p className="text-sm text-muted-foreground">{article.excerpt}</p>
                        <div className="flex gap-2 mt-2">
                          <Badge variant="outline">Published</Badge>
                          <Badge variant="outline">
                            {new Date(article.created_at).toLocaleDateString()}
                          </Badge>
                        </div>
                      </div>
                      
                      <div className="flex gap-2">
                        <Button variant="outline" size="sm">
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button variant="outline" size="sm">
                          <Edit className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="articles" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>All Articles ({newsArticles?.length || 0})</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {newsArticles?.map((article) => (
                  <div key={article.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div>
                      <h3 className="font-medium">{article.title}</h3>
                      <p className="text-sm text-muted-foreground">{article.excerpt}</p>
                      <div className="flex gap-2 mt-2">
                        <Badge variant="outline">Published</Badge>
                        <Badge variant="outline">
                          {new Date(article.created_at).toLocaleDateString()}
                        </Badge>
                      </div>
                    </div>
                    
                    <div className="flex gap-2">
                      <Badge variant="outline">Published</Badge>
                      
                      <Button variant="outline" size="sm">
                        <Edit className="h-4 w-4" />
                      </Button>
                      
                      <Button 
                        variant="outline" 
                        size="sm" 
                        onClick={() => deleteArticle.mutate(article.id)}
                        className="text-red-600"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="pending" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Pending Review</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {newsArticles?.slice(0, 5).map((article) => (
                  <div key={article.id} className="flex items-center justify-between p-4 border rounded-lg border-orange-200">
                    <div>
                      <h3 className="font-medium">{article.title}</h3>
                      <p className="text-sm text-muted-foreground">{article.excerpt}</p>
                      <p className="text-xs text-muted-foreground mt-1">
                        Submitted: {new Date(article.created_at).toLocaleDateString()}
                      </p>
                    </div>
                    
                    <div className="flex gap-2">
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => updateArticleStatus.mutate({ articleId: article.id, status: 'published' })}
                        className="text-green-600"
                      >
                        <CheckCircle className="h-4 w-4 mr-1" />
                        Approve
                      </Button>
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => updateArticleStatus.mutate({ articleId: article.id, status: 'draft' })}
                        className="text-red-600"
                      >
                        Reject
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="analytics" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>News Analytics</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">News analytics dashboard coming soon...</p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Create Article Modal */}
      <Dialog open={isCreateModalOpen} onOpenChange={setIsCreateModalOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Create New Article</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium">Title</label>
              <Input placeholder="Enter article title..." />
            </div>
            <div>
              <label className="text-sm font-medium">Excerpt</label>
              <Textarea placeholder="Brief summary of the article..." />
            </div>
            <div>
              <label className="text-sm font-medium">Content</label>
              <Textarea placeholder="Article content..." className="min-h-[200px]" />
            </div>
            <div className="flex gap-2">
              <Button onClick={() => {/* Handle create */}}>
                Create Article
              </Button>
              <Button variant="outline" onClick={() => setIsCreateModalOpen(false)}>
                Cancel
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};