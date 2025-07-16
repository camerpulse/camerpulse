import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { CheckCircle, BarChart3 } from 'lucide-react';

interface ChartPollStyleProps {
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

export const ChartPollStyle = ({ 
  poll, 
  showResults = false, 
  onVote, 
  isActive = true, 
  hasVoted = false,
  className = ""
}: ChartPollStyleProps) => {
  const getVotePercentage = (votes: number, total: number) => {
    return total > 0 ? Math.round((votes / total) * 100) : 0;
  };

  const maxVotes = Math.max(...(poll.vote_results || poll.options.map(() => 0)));

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Chart View */}
      {showResults && (
        <div className="space-y-3 mb-6">
          <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground mb-4">
            <BarChart3 className="w-4 h-4" />
            Results Chart
          </div>
          {poll.options.map((option, index) => {
            const votes = poll.vote_results?.[index] || 0;
            const percentage = getVotePercentage(votes, poll.votes_count);
            const isSelected = poll.user_vote === index;
            const barHeight = maxVotes > 0 ? (votes / maxVotes) * 100 : 0;
            
            return (
              <div key={index} className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className={`font-medium ${isSelected ? 'text-primary' : ''}`}>
                    {option}
                    {isSelected && <CheckCircle className="w-4 h-4 inline ml-2" />}
                  </span>
                  <span className="text-muted-foreground">
                    {votes} votes ({percentage}%)
                  </span>
                </div>
                <div className="relative">
                  <div className="h-8 bg-muted rounded-md overflow-hidden">
                    <div 
                      className={`h-full transition-all duration-500 ${
                        isSelected 
                          ? 'bg-gradient-to-r from-primary to-accent' 
                          : 'bg-primary/60'
                      }`}
                      style={{ width: `${percentage}%` }}
                    />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Voting Options */}
      {(!showResults || !hasVoted) && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {poll.options.map((option, index) => {
            const isSelected = poll.user_vote === index;
            
            return (
              <Button
                key={index}
                variant={isSelected ? "default" : "outline"}
                className={`h-auto p-4 text-left justify-start transition-all duration-200 ${
                  isActive && !hasVoted ? 'hover:scale-[1.02] hover:shadow-md' : ''
                } ${isSelected ? 'bg-gradient-to-r from-primary to-accent' : ''}`}
                onClick={() => isActive && !hasVoted && onVote ? onVote(index) : undefined}
                disabled={!isActive || hasVoted}
              >
                <div className="flex items-center gap-3 w-full">
                  <div className={`w-3 h-3 rounded-full border-2 ${
                    isSelected ? 'bg-white border-white' : 'border-current'
                  }`} />
                  <span className="flex-1 text-sm sm:text-base">{option}</span>
                  {isSelected && <CheckCircle className="w-4 h-4" />}
                </div>
              </Button>
            );
          })}
        </div>
      )}
    </div>
  );
};