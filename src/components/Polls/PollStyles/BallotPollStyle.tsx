import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { CheckCircle, Vote } from 'lucide-react';

interface BallotPollStyleProps {
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

export const BallotPollStyle = ({ 
  poll, 
  showResults = false, 
  onVote, 
  isActive = true, 
  hasVoted = false,
  className = ""
}: BallotPollStyleProps) => {
  const getVotePercentage = (votes: number, total: number) => {
    return total > 0 ? Math.round((votes / total) * 100) : 0;
  };

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Ballot Header */}
      <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground mb-4 pb-2 border-b border-dashed">
        <Vote className="w-4 h-4" />
        Official Ballot
      </div>

      {/* Ballot Options */}
      <div className="space-y-2">
        {poll.options.map((option, index) => {
          const votes = poll.vote_results?.[index] || 0;
          const percentage = getVotePercentage(votes, poll.votes_count);
          const isSelected = poll.user_vote === index;
          
          return (
            <div key={index} className="space-y-2">
              <div 
                className={`border rounded-lg p-4 transition-all duration-200 cursor-pointer ${
                  isSelected 
                    ? 'border-primary bg-primary/5 shadow-md' 
                    : 'border-border hover:border-primary/50 hover:bg-muted/50'
                } ${!isActive || hasVoted ? 'opacity-60 cursor-not-allowed' : ''}`}
                onClick={() => isActive && !hasVoted && onVote ? onVote(index) : undefined}
              >
                <div className="flex items-center gap-3">
                  {/* Radio Button Style */}
                  <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all ${
                    isSelected 
                      ? 'border-primary bg-primary' 
                      : 'border-muted-foreground'
                  }`}>
                    {isSelected && (
                      <div className="w-2 h-2 rounded-full bg-white" />
                    )}
                  </div>
                  
                  {/* Option Text */}
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <span className="text-sm sm:text-base font-medium">{option}</span>
                      {isSelected && (
                        <CheckCircle className="w-4 h-4 text-primary" />
                      )}
                    </div>
                    
                    {/* Results */}
                    {showResults && (
                      <div className="mt-2 space-y-1">
                        <div className="flex items-center justify-between text-xs text-muted-foreground">
                          <span>{votes} votes</span>
                          <span>{percentage}%</span>
                        </div>
                        <Progress value={percentage} className="h-1.5" />
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Ballot Footer */}
      {hasVoted && (
        <div className="mt-4 pt-4 border-t border-dashed text-center">
          <div className="flex items-center justify-center gap-2 text-sm text-primary font-medium">
            <CheckCircle className="w-4 h-4" />
            Your vote has been recorded
          </div>
        </div>
      )}
    </div>
  );
};