import React, { useState, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Search, X, MessageSquare } from 'lucide-react';
import { useDebounce } from '@/hooks/useDebounce';

interface MessageSearchProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  onMessageSelect?: (messageId: string, conversationId: string) => void;
}

interface SearchResult {
  message_id: string;
  conversation_id: string;
  sender_id: string;
  content_preview: string;
  created_at: string;
  rank: number;
}

export const MessageSearch: React.FC<MessageSearchProps> = ({
  isOpen,
  onOpenChange,
  onMessageSelect
}) => {
  const { toast } = useToast();
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [selectedConversation, setSelectedConversation] = useState<string>('');
  
  const debouncedSearchQuery = useDebounce(searchQuery, 300);

  const performSearch = useCallback(async (query: string) => {
    if (!query.trim()) {
      setSearchResults([]);
      return;
    }

    setIsSearching(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase.rpc('search_messages', {
        p_user_id: user.id,
        p_search_query: query,
        p_conversation_id: selectedConversation || null,
        p_limit: 50,
        p_offset: 0
      });

      if (error) throw error;
      setSearchResults(data || []);
    } catch (error) {
      console.error('Error searching messages:', error);
      toast({
        title: "Error",
        description: "Failed to search messages",
        variant: "destructive"
      });
    } finally {
      setIsSearching(false);
    }
  }, [selectedConversation, toast]);

  useEffect(() => {
    if (debouncedSearchQuery) {
      performSearch(debouncedSearchQuery);
    } else {
      setSearchResults([]);
    }
  }, [debouncedSearchQuery, performSearch]);

  const handleMessageClick = (result: SearchResult) => {
    onMessageSelect?.(result.message_id, result.conversation_id);
    onOpenChange(false);
  };

  const clearSearch = () => {
    setSearchQuery('');
    setSearchResults([]);
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInDays = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24));

    if (diffInDays === 0) {
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } else if (diffInDays === 1) {
      return 'Yesterday';
    } else if (diffInDays < 7) {
      return date.toLocaleDateString([], { weekday: 'short' });
    } else {
      return date.toLocaleDateString([], { month: 'short', day: 'numeric' });
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl h-[600px] flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Search className="h-5 w-5" />
            Search Messages
          </DialogTitle>
        </DialogHeader>

        <div className="flex-1 flex flex-col space-y-4">
          {/* Search input */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search for messages..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 pr-10"
              autoFocus
            />
            {searchQuery && (
              <Button
                variant="ghost"
                size="sm"
                className="absolute right-2 top-1/2 transform -translate-y-1/2 h-6 w-6 p-0"
                onClick={clearSearch}
              >
                <X className="h-3 w-3" />
              </Button>
            )}
          </div>

          {/* Search status */}
          {isSearching && (
            <div className="text-center text-muted-foreground py-4">
              Searching...
            </div>
          )}

          {/* Search results */}
          <ScrollArea className="flex-1">
            <div className="space-y-2">
              {searchResults.length === 0 && debouncedSearchQuery && !isSearching && (
                <div className="text-center text-muted-foreground py-8">
                  <MessageSquare className="h-12 w-12 mx-auto mb-4 opacity-20" />
                  <p>No messages found for "{debouncedSearchQuery}"</p>
                  <p className="text-sm mt-1">Try different keywords or check your spelling</p>
                </div>
              )}

              {searchResults.map((result) => (
                <div
                  key={result.message_id}
                  className="p-3 rounded-lg border hover:bg-muted cursor-pointer transition-colors"
                  onClick={() => handleMessageClick(result)}
                >
                  <div className="flex justify-between items-start mb-2">
                    <div className="text-sm font-medium text-primary">
                      Conversation #{result.conversation_id.slice(-8)}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {formatDate(result.created_at)}
                    </div>
                  </div>
                  
                  <p className="text-sm text-foreground line-clamp-2">
                    {result.content_preview}
                  </p>
                  
                  <div className="flex justify-between items-center mt-2">
                    <div className="text-xs text-muted-foreground">
                      Relevance: {Math.round(result.rank * 100)}%
                    </div>
                    <Button variant="ghost" size="sm" className="h-6 px-2 text-xs">
                      Jump to message
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </ScrollArea>

          {/* Search tips */}
          {!searchQuery && (
            <div className="text-center text-muted-foreground py-8 space-y-2">
              <Search className="h-12 w-12 mx-auto mb-4 opacity-20" />
              <p className="font-medium">Search your message history</p>
              <div className="text-sm space-y-1">
                <p>• Type keywords to find messages</p>
                <p>• Search works across all your conversations</p>
                <p>• Results are ranked by relevance</p>
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};