import React, { useState, useEffect } from 'react';
import { Calendar, Eye, Share2, Newspaper } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';

interface Update {
  id: string;
  title: string;
  content: string;
  update_type: string;
  image_url?: string;
  views_count: number;
  created_at: string;
}

interface CompanyUpdatesProps {
  companyId: string;
}

export default function CompanyUpdates({ companyId }: CompanyUpdatesProps) {
  const [updates, setUpdates] = useState<Update[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    fetchUpdates();
  }, [companyId]);

  const fetchUpdates = async () => {
    try {
      const { data, error } = await supabase
        .from('company_updates')
        .select('*')
        .eq('company_id', companyId)
        .eq('is_published', true)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setUpdates(data || []);
    } catch (error) {
      console.error('Error fetching updates:', error);
    } finally {
      setLoading(false);
    }
  };

  const incrementViews = async (updateId: string) => {
    try {
      const update = updates.find(u => u.id === updateId);
      if (update) {
        await supabase
          .from('company_updates')
          .update({ views_count: update.views_count + 1 })
          .eq('id', updateId);

        setUpdates(prev => prev.map(u => 
          u.id === updateId ? { ...u, views_count: u.views_count + 1 } : u
        ));
      }
    } catch (error) {
      console.error('Error incrementing views:', error);
    }
  };

  const shareUpdate = (update: Update) => {
    const url = `${window.location.origin}/companies/${companyId}?update=${update.id}`;
    const text = `Check out this update from CamerPulse: ${update.title}`;
    
    if (navigator.share) {
      navigator.share({
        title: update.title,
        text: text,
        url: url,
      });
    } else {
      navigator.clipboard.writeText(`${text} - ${url}`);
      toast({
        title: "Link Copied",
        description: "Update link copied to clipboard",
      });
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const getUpdateTypeColor = (type: string) => {
    switch (type) {
      case 'announcement':
        return 'bg-blue-100 text-blue-800';
      case 'achievement':
        return 'bg-green-100 text-green-800';
      case 'product':
        return 'bg-purple-100 text-purple-800';
      case 'press_release':
        return 'bg-orange-100 text-orange-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getUpdateTypeLabel = (type: string) => {
    switch (type) {
      case 'announcement':
        return 'Announcement';
      case 'achievement':
        return 'Achievement';
      case 'product':
        return 'Product Update';
      case 'press_release':
        return 'Press Release';
      default:
        return 'General';
    }
  };

  if (loading) {
    return (
      <div className="space-y-4">
        {Array.from({ length: 3 }).map((_, i) => (
          <Card key={i} className="animate-pulse">
            <CardHeader>
              <div className="h-6 bg-muted rounded w-3/4"></div>
              <div className="h-4 bg-muted rounded w-1/2"></div>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="h-4 bg-muted rounded"></div>
                <div className="h-4 bg-muted rounded w-2/3"></div>
                <div className="h-32 bg-muted rounded"></div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (updates.length === 0) {
    return (
      <Card>
        <CardContent className="p-8 text-center">
          <Newspaper className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
          <h4 className="text-lg font-semibold mb-2">No Updates</h4>
          <p className="text-muted-foreground">
            This company hasn't published any updates yet.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">Company Updates ({updates.length})</h3>
      </div>

      <div className="space-y-6">
        {updates.map((update) => (
          <Card key={update.id} className="transition-shadow hover:shadow-lg">
            <CardHeader>
              <div className="flex items-start justify-between mb-2">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <Badge className={getUpdateTypeColor(update.update_type)}>
                      {getUpdateTypeLabel(update.update_type)}
                    </Badge>
                    <div className="flex items-center gap-1 text-sm text-muted-foreground">
                      <Calendar className="w-4 h-4" />
                      {formatDate(update.created_at)}
                    </div>
                  </div>
                  <CardTitle className="text-xl">{update.title}</CardTitle>
                </div>
                
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => shareUpdate(update)}
                >
                  <Share2 className="w-4 h-4" />
                </Button>
              </div>
            </CardHeader>

            <CardContent className="space-y-4">
              {update.image_url && (
                <div className="rounded-lg overflow-hidden">
                  <img
                    src={update.image_url}
                    alt={update.title}
                    className="w-full h-64 object-cover"
                    onClick={() => incrementViews(update.id)}
                  />
                </div>
              )}

              <div 
                className="prose prose-sm max-w-none text-muted-foreground leading-relaxed"
                onClick={() => incrementViews(update.id)}
              >
                <p className="whitespace-pre-wrap">{update.content}</p>
              </div>

              <div className="flex items-center justify-between pt-4 border-t">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Eye className="w-4 h-4" />
                  <span>{update.views_count} views</span>
                </div>

                <div className="flex gap-2">
                  <Button variant="outline" size="sm">
                    Read More
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}