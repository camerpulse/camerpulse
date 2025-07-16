import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, Users, Clock } from 'lucide-react';

interface CardPollStyleProps {
  poll: {
    title: string;
    description?: string;
    options: string[];
    vote_results?: number[];
    votes_count: number;
    user_vote?: number;
    ends_at?: string;
    privacy_mode: string;
  };
  showResults?: boolean;
  onVote?: (optionIndex: number) => void;
  isActive?: boolean;
  hasVoted?: boolean;
  className?: string;
}

export const CardPollStyle = ({ 
  poll, 
  showResults = false, 
  onVote, 
  isActive = true, 
  hasVoted = false,
  className = ""
}: CardPollStyleProps) => {
  const getVotePercentage = (votes: number, total: number) => {
    return total > 0 ? Math.round((votes / total) * 100) : 0;
  };

  return (
    <div className={`space-y-4 ${className}`}>
      <div className="space-y-3">
        {poll.options.map((option, index) => {
          const votes = poll.vote_results?.[index] || 0;
          const percentage = getVotePercentage(votes, poll.votes_count);
          const isSelected = poll.user_vote === index;
          
          return (
            <div key={index} className="space-y-2">
              <Button
                variant={isSelected ? "default" : "outline"}
                className={`w-full justify-start text-left h-auto p-3 sm:p-4 transition-all duration-200 ${
                  isActive && !hasVoted ? 'hover:scale-[1.02] hover:shadow-md' : ''
                } ${isSelected ? 'bg-gradient-to-r from-primary to-accent' : ''}`}
                onClick={() => isActive && !hasVoted && onVote ? onVote(index) : undefined}
                disabled={!isActive || hasVoted}
              >
                <div className="flex items-center justify-between w-full gap-3">
                  <span className="flex-1 text-sm sm:text-base leading-relaxed">{option}</span>
                  {showResults && (
                    <div className="flex items-center gap-2 shrink-0">
                      <span className="text-xs sm:text-sm whitespace-nowrap">
                        {votes} ({percentage}%)
                      </span>
                      {isSelected && (
                        <CheckCircle className="w-4 h-4" />
                      )}
                    </div>
                  )}
                </div>
              </Button>
              
              {showResults && (
                <div className="px-1">
                  <Progress value={percentage} className="h-2" />
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};