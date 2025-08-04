import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { MessageSearch } from './MessageSearch';
import { Search, Phone, Video, MoreVertical } from 'lucide-react';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';

interface MessengerHeaderProps {
  conversationName?: string;
  isGroup?: boolean;
  participantCount?: number;
  onMessageSelect?: (messageId: string, conversationId: string) => void;
}

export const MessengerHeader: React.FC<MessengerHeaderProps> = ({
  conversationName = "Select a conversation",
  isGroup = false,
  participantCount = 0,
  onMessageSelect
}) => {
  const [showSearch, setShowSearch] = useState(false);

  return (
    <>
      <div className="flex items-center justify-between p-4 border-b border-border">
        {/* Conversation info */}
        <div className="flex-1">
          <h2 className="font-semibold text-lg">{conversationName}</h2>
          {isGroup && participantCount > 0 && (
            <p className="text-sm text-muted-foreground">
              {participantCount} members
            </p>
          )}
        </div>

        {/* Action buttons */}
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowSearch(true)}
          >
            <Search className="h-4 w-4" />
          </Button>

          <Button variant="ghost" size="sm">
            <Phone className="h-4 w-4" />
          </Button>

          <Button variant="ghost" size="sm">
            <Video className="h-4 w-4" />
          </Button>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm">
                <MoreVertical className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem>
                View conversation info
              </DropdownMenuItem>
              <DropdownMenuItem>
                Mute notifications
              </DropdownMenuItem>
              <DropdownMenuItem>
                Export conversation
              </DropdownMenuItem>
              <DropdownMenuItem className="text-destructive">
                Delete conversation
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      <MessageSearch
        isOpen={showSearch}
        onOpenChange={setShowSearch}
        onMessageSelect={onMessageSelect}
      />
    </>
  );
};