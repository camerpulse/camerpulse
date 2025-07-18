/**
 * PollCard Component
 * 
 * Unified poll display component for CamerPulse
 */

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { UserAvatar } from './UserAvatar';
import { CivicTag } from './CivicTag';
import { Vote, Clock, Users, Share2 } from 'lucide-react';
import { Poll } from './types';

interface PollCardProps {
  poll: Poll;
  onVote?: (pollId: string, optionId: string) => void;
  onShare?: (pollId: string) => void;
  className?: string;
}

export const PollCard: React.FC<PollCardProps> = ({
  poll,
  onVote,
  onShare,
  className = ''
}) => {
  const [selectedOption, setSelectedOption] = useState<string | null>(poll.userVote || null);
  const [hasVoted, setHasVoted] = useState(poll.isVoted || false);

  const handleVote = (optionId: string) => {
    if (hasVoted) return;
    
    setSelectedOption(optionId);
    setHasVoted(true);
    onVote?.(poll.id, optionId);
  };

  const handleShare = () => {
    onShare?.(poll.id);
  };

  const isExpired = poll.endDate ? new Date(poll.endDate) < new Date() : false;

  return (
    <Card className={`hover:shadow-elegant transition-all duration-300 ${className}`}>
      <CardHeader className="pb-4">
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-center gap-3 flex-1">
            <UserAvatar user={poll.creator} size="sm" />
            <div>
              <p className="text-sm font-medium text-foreground">{poll.creator.name}</p>
              <p className="text-xs text-muted-foreground">@{poll.creator.username}</p>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            {poll.category && (
              <CivicTag type="election" label={poll.category} size="sm" />
            )}
            {isExpired && (
              <Badge variant="secondary" className="text-xs">
                <Clock className="w-3 h-3 mr-1" />
                Terminé
              </Badge>
            )}
          </div>
        </div>
        
        <CardTitle className="text-lg font-semibold mt-4">
          {poll.question}
        </CardTitle>
        
        {poll.description && (
          <p className="text-sm text-muted-foreground mt-2">
            {poll.description}
          </p>
        )}
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Poll Options */}
        <div className="space-y-3">
          {poll.options.map((option) => {
            const isSelected = selectedOption === option.id;
            const percentage = poll.totalVotes > 0 ? (option.votes / poll.totalVotes) * 100 : 0;
            
            return (
              <div key={option.id} className="space-y-2">
                <Button
                  variant={isSelected ? "default" : "outline"}
                  className={`w-full justify-start p-4 h-auto ${
                    hasVoted || isExpired ? 'cursor-default' : 'hover:bg-primary/10'
                  }`}
                  onClick={() => handleVote(option.id)}
                  disabled={hasVoted || isExpired}
                >
                  <div className="flex items-center justify-between w-full">
                    <span className="text-left flex-1">{option.text}</span>
                    {hasVoted && (
                      <div className="flex items-center gap-2 text-sm">
                        <span className="font-medium">{percentage.toFixed(1)}%</span>
                        <span className="text-muted-foreground">({option.votes})</span>
                      </div>
                    )}
                  </div>
                </Button>
                
                {hasVoted && (
                  <Progress 
                    value={percentage} 
                    className="h-2"
                  />
                )}
              </div>
            );
          })}
        </div>

        {/* Poll Stats */}
        <div className="flex items-center justify-between pt-4 border-t border-border/50">
          <div className="flex items-center gap-4 text-sm text-muted-foreground">
            <div className="flex items-center gap-1">
              <Users className="w-4 h-4" />
              <span>{poll.totalVotes} votes</span>
            </div>
            {poll.endDate && !isExpired && (
              <div className="flex items-center gap-1">
                <Clock className="w-4 h-4" />
                <span>Se termine le {new Date(poll.endDate).toLocaleDateString()}</span>
              </div>
            )}
          </div>
          
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="sm" onClick={handleShare}>
              <Share2 className="w-4 h-4 mr-2" />
              Partager
            </Button>
            
            {!hasVoted && !isExpired && (
              <Badge variant="outline" className="bg-primary/10 text-primary border-primary/30">
                <Vote className="w-3 h-3 mr-1" />
                Votez!
              </Badge>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};