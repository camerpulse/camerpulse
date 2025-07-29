import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Bookmark, Search, Filter, Edit, Trash2, ExternalLink } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface CivicBookmark {
  id: string;
  user_id: string;
  content_type: string;
  content_id: string;
  notes?: string;
  created_at: string;
}

export const CivicBookmarks: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('');
  const [editingBookmark, setEditingBookmark] = useState<string | null>(null);
  const [editNotes, setEditNotes] = useState('');
  const { toast } = useToast();

  // Fetch user bookmarks
  const { data: bookmarks, isLoading, refetch } = useQuery({
    queryKey: ['user-bookmarks', searchTerm, filterType],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return [];

      let query = supabase
        .from('civic_user_bookmarks')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (filterType) {
        query = query.eq('content_type', filterType);
      }

      if (searchTerm) {
        query = query.ilike('notes', `%${searchTerm}%`);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data as CivicBookmark[];
    }
  });

  const contentTypes = [
    { id: 'constitution_article', name: 'Constitution Articles', icon: '📜' },
    { id: 'educational_content', name: 'Educational Modules', icon: '📚' },
    { id: 'quiz', name: 'Quizzes', icon: '🏆' },
    { id: 'question', name: 'Q&A Posts', icon: '💬' }
  ];

  const deleteBookmark = async (bookmarkId: string) => {
    const { error } = await supabase
      .from('civic_user_bookmarks')
      .delete()
      .eq('id', bookmarkId);

    if (error) {
      toast({
        title: "Error",
        description: "Failed to delete bookmark",
        variant: "destructive"
      });
      return;
    }

    toast({
      title: "Bookmark Deleted",
      description: "Bookmark has been removed"
    });

    refetch();
  };

  const updateBookmarkNotes = async (bookmarkId: string) => {
    const { error } = await supabase
      .from('civic_user_bookmarks')
      .update({ notes: editNotes })
      .eq('id', bookmarkId);

    if (error) {
      toast({
        title: "Error",
        description: "Failed to update notes",
        variant: "destructive"
      });
      return;
    }

    toast({
      title: "Notes Updated",
      description: "Your bookmark notes have been saved"
    });

    setEditingBookmark(null);
    setEditNotes('');
    refetch();
  };

  const startEditing = (bookmark: CivicBookmark) => {
    setEditingBookmark(bookmark.id);
    setEditNotes(bookmark.notes || '');
  };

  const getContentTypeInfo = (type: string) => {
    return contentTypes.find(ct => ct.id === type) || { id: type, name: type, icon: '📄' };
  };

  const getContentUrl = (bookmark: CivicBookmark) => {
    switch (bookmark.content_type) {
      case 'constitution_article':
        return `/civic-education?tab=constitution&article=${bookmark.content_id}`;
      case 'educational_content':
        return `/civic-education?tab=education&module=${bookmark.content_id}`;
      case 'quiz':
        return `/civic-education?tab=quizzes&quiz=${bookmark.content_id}`;
      case 'question':
        return `/civic-education?tab=questions&question=${bookmark.content_id}`;
      default:
        return '/civic-education';
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3].map(i => (
          <Card key={i} className="animate-pulse">
            <CardHeader>
              <div className="h-4 bg-gray-200 rounded w-3/4"></div>
              <div className="h-3 bg-gray-200 rounded w-1/2"></div>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="h-3 bg-gray-200 rounded"></div>
                <div className="h-3 bg-gray-200 rounded w-5/6"></div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-3xl font-bold mb-2">Your Bookmarks</h2>
        <p className="text-gray-600 dark:text-gray-300">
          Save and organize important Constitution articles, educational content, and discussions
        </p>
      </div>

      {/* Filters */}
      <div className="flex flex-col md:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
          <Input
            placeholder="Search your notes and bookmarks..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        <div className="relative">
          <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
            className="pl-10 pr-4 py-2 border border-gray-200 dark:border-gray-700 rounded-md bg-background"
          >
            <option value="">All Types</option>
            {contentTypes.map((type) => (
              <option key={type.id} value={type.id}>{type.name}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Bookmarks List */}
      <div className="space-y-4">
        {bookmarks && bookmarks.length > 0 ? (
          bookmarks.map((bookmark) => {
            const contentInfo = getContentTypeInfo(bookmark.content_type);
            const isEditing = editingBookmark === bookmark.id;
            
            return (
              <Card key={bookmark.id}>
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <div className="text-2xl">{contentInfo.icon}</div>
                      <div>
                        <CardTitle className="text-lg">
                          {contentInfo.name}
                        </CardTitle>
                        <CardDescription>
                          Bookmarked on {new Date(bookmark.created_at).toLocaleDateString()}
                        </CardDescription>
                      </div>
                    </div>
                    <Badge variant="outline">{bookmark.content_type}</Badge>
                  </div>
                </CardHeader>
                
                <CardContent>
                  <div className="space-y-4">
                    {/* Notes Section */}
                    <div>
                      <h4 className="font-semibold mb-2">Your Notes</h4>
                      {isEditing ? (
                        <div className="space-y-3">
                          <Textarea
                            value={editNotes}
                            onChange={(e) => setEditNotes(e.target.value)}
                            placeholder="Add your notes about this bookmark..."
                            rows={3}
                          />
                          <div className="flex gap-2">
                            <Button size="sm" onClick={() => updateBookmarkNotes(bookmark.id)}>
                              Save Notes
                            </Button>
                            <Button 
                              variant="outline" 
                              size="sm" 
                              onClick={() => {
                                setEditingBookmark(null);
                                setEditNotes('');
                              }}
                            >
                              Cancel
                            </Button>
                          </div>
                        </div>
                      ) : (
                        <div>
                          {bookmark.notes ? (
                            <p className="text-gray-700 dark:text-gray-300 whitespace-pre-wrap">
                              {bookmark.notes}
                            </p>
                          ) : (
                            <p className="text-gray-500 dark:text-gray-400 italic">
                              No notes added yet
                            </p>
                          )}
                        </div>
                      )}
                    </div>
                    
                    {/* Actions */}
                    <div className="flex items-center justify-between pt-4 border-t">
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => window.open(getContentUrl(bookmark), '_blank')}
                          className="flex items-center gap-1"
                        >
                          <ExternalLink className="w-3 h-3" />
                          View Content
                        </Button>
                        {!isEditing && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => startEditing(bookmark)}
                            className="flex items-center gap-1"
                          >
                            <Edit className="w-3 h-3" />
                            Edit Notes
                          </Button>
                        )}
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => deleteBookmark(bookmark.id)}
                        className="text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })
        ) : (
          <Card>
            <CardContent className="flex items-center justify-center h-96">
              <div className="text-center text-gray-500 dark:text-gray-400">
                <Bookmark className="w-16 h-16 mx-auto mb-4 text-gray-300" />
                <h3 className="text-xl font-semibold mb-2">No Bookmarks Yet</h3>
                <p className="mb-4">
                  Save Constitution articles, educational modules, and discussions for easy access
                </p>
                <Button onClick={() => window.location.href = '/civic-education'}>
                  Start Exploring Content
                </Button>
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Quick Stats */}
      {bookmarks && bookmarks.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Bookmark Statistics</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {contentTypes.map((type) => {
                const count = bookmarks.filter(b => b.content_type === type.id).length;
                return (
                  <div key={type.id} className="text-center">
                    <div className="text-2xl mb-1">{type.icon}</div>
                    <div className="font-semibold">{count}</div>
                    <div className="text-sm text-gray-600 dark:text-gray-300">{type.name}</div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};