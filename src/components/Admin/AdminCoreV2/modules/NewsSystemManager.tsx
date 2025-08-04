import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Newspaper, Eye, Clock, AlertTriangle } from 'lucide-react';

interface NewsSystemManagerProps {
  hasPermission: (permission: string) => boolean;
  logActivity: (action: string, details: any) => void;
  stats?: any;
}

export const NewsSystemManager: React.FC<NewsSystemManagerProps> = ({
  hasPermission,
  logActivity,
  stats
}) => {
  // Mock data for news articles
  const newsArticles = [
    {
      id: '1',
      title: 'National Assembly Budget Session Begins',
      source: 'CRTV',
      status: 'published',
      views: 1250,
      created_at: '2024-01-15T10:00:00Z'
    },
    {
      id: '2',
      title: 'Minister Announces Infrastructure Development Plan',
      source: 'Cameroon Tribune',
      status: 'pending',
      views: 0,
      created_at: '2024-01-15T08:30:00Z'
    }
  ];

  const handleModerateArticle = (articleId: string, action: 'approve' | 'reject') => {
    logActivity('news_moderated', { article_id: articleId, action });
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold flex items-center">
          <Newspaper className="h-6 w-6 mr-2 text-blue-600" />
          News System Management
        </h2>
        <p className="text-muted-foreground">Monitor and moderate news content across the platform</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-2">
              <Newspaper className="h-5 w-5 text-blue-600" />
              <div>
                <p className="text-2xl font-bold">{newsArticles.length}</p>
                <p className="text-sm text-muted-foreground">Total Articles</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-2">
              <Eye className="h-5 w-5 text-green-600" />
              <div>
                <p className="text-2xl font-bold">
                  {newsArticles.filter(a => a.status === 'published').length}
                </p>
                <p className="text-sm text-muted-foreground">Published</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-2">
              <Clock className="h-5 w-5 text-orange-600" />
              <div>
                <p className="text-2xl font-bold">
                  {newsArticles.filter(a => a.status === 'pending').length}
                </p>
                <p className="text-sm text-muted-foreground">Pending Review</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-2">
              <AlertTriangle className="h-5 w-5 text-red-600" />
              <div>
                <p className="text-2xl font-bold">0</p>
                <p className="text-sm text-muted-foreground">Flagged</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>News Articles Management</CardTitle>
          <CardDescription>Review and moderate news content</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {newsArticles.map((article) => (
              <div key={article.id} className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex items-center space-x-4">
                  <div>
                    <h3 className="font-semibold">{article.title}</h3>
                    <p className="text-sm text-muted-foreground">
                      {article.source} • {article.views} views
                    </p>
                  </div>
                  <Badge variant={article.status === 'published' ? 'default' : 'secondary'}>
                    {article.status}
                  </Badge>
                </div>
                <div className="flex items-center space-x-2">
                  {article.status === 'pending' && (
                    <>
                      <Button
                        size="sm"
                        onClick={() => handleModerateArticle(article.id, 'approve')}
                      >
                        Approve
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleModerateArticle(article.id, 'reject')}
                      >
                        Reject
                      </Button>
                    </>
                  )}
                  <Button variant="outline" size="sm">
                    Edit
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};