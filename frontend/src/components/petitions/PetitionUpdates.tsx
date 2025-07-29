import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Calendar, FileText } from 'lucide-react';

interface Update {
  id: string;
  petition_id: string;
  created_by: string;
  title: string;
  content: string;
  attachments: string[];
  created_at: string;
}

interface PetitionUpdatesProps {
  petitionId: string;
}

export function PetitionUpdates({ petitionId }: PetitionUpdatesProps) {
  const [updates, setUpdates] = useState<Update[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchUpdates();
  }, [petitionId]);

  const fetchUpdates = async () => {
    try {
      // Mock updates data for now since the table might not be available in types
      const mockUpdates = [
        {
          id: '1',
          petition_id: petitionId,
          created_by: 'creator',
          title: 'Petition Update: Progress Report',
          content: 'Thank you to everyone who has signed this petition so far. We have made significant progress and are now working with local authorities to address the concerns raised.',
          attachments: [],
          created_at: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(), // 2 days ago
        },
        {
          id: '2',
          petition_id: petitionId,
          created_by: 'creator',
          title: 'Meeting Scheduled with Officials',
          content: 'Great news! We have secured a meeting with city officials next week to discuss the petition demands. Your continued support is making a difference.',
          attachments: [],
          created_at: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(), // 5 days ago
        },
      ];
      
      setUpdates(mockUpdates);
    } catch (error) {
      console.error('Error fetching updates:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Updates
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="animate-pulse space-y-4">
            {[1, 2].map((i) => (
              <div key={i} className="space-y-2">
                <div className="h-5 bg-muted rounded w-2/3"></div>
                <div className="h-4 bg-muted rounded w-full"></div>
                <div className="h-4 bg-muted rounded w-3/4"></div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <FileText className="h-5 w-5" />
          Updates ({updates.length})
        </CardTitle>
      </CardHeader>
      <CardContent>
        {updates.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <FileText className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>No updates yet. Check back later for progress reports.</p>
          </div>
        ) : (
          <div className="space-y-6">
            {updates.map((update, index) => (
              <div key={update.id} className="relative">
                {index !== updates.length - 1 && (
                  <div className="absolute left-4 top-8 bottom-0 w-px bg-border"></div>
                )}
                
                <div className="flex space-x-4">
                  <div className="flex-shrink-0">
                    <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center">
                      <FileText className="h-4 w-4 text-primary-foreground" />
                    </div>
                  </div>
                  
                  <div className="flex-1 min-w-0 space-y-2">
                    <div className="flex items-center gap-2">
                      <h4 className="font-semibold">{update.title}</h4>
                      <Badge variant="outline" className="text-xs">
                        Update
                      </Badge>
                    </div>
                    
                    <div className="flex items-center gap-1 text-xs text-muted-foreground">
                      <Calendar className="h-3 w-3" />
                      {new Date(update.created_at).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                      })}
                    </div>
                    
                    <p className="text-sm text-muted-foreground leading-relaxed">
                      {update.content}
                    </p>
                    
                    {update.attachments && update.attachments.length > 0 && (
                      <div className="text-xs text-muted-foreground">
                        {update.attachments.length} attachment(s)
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}