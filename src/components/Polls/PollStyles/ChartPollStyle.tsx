import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { CheckCircle, BarChart3, TrendingUp } from 'lucide-react';
import { useState, useEffect } from 'react';

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
    custom_settings?: {
      chartType?: string;
      colorTheme?: string;
      colors?: {
        barColors?: Record<number, string>;
      };
    };
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
  const [animatedPercentages, setAnimatedPercentages] = useState<number[]>([]);
  const [touchedIndex, setTouchedIndex] = useState<number | null>(null);
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

  const getVotePercentage = (votes: number, total: number) => {
    return total > 0 ? Math.round((votes / total) * 100) : 0;
  };

  const maxVotes = Math.max(...(poll.vote_results || poll.options.map(() => 0)));

  // Animate chart bars on mount and data changes
  useEffect(() => {
    if (showResults) {
      const percentages = poll.options.map((_, index) => {
        const votes = poll.vote_results?.[index] || 0;
        return getVotePercentage(votes, poll.votes_count);
      });
      
      // Start from 0 and animate to actual values
      setAnimatedPercentages(Array(poll.options.length).fill(0));
      
      setTimeout(() => {
        setAnimatedPercentages(percentages);
      }, 100);
    }
  }, [showResults, poll.vote_results, poll.votes_count, poll.options.length]);

  const handleTouchStart = (index: number) => {
    if (isActive && !hasVoted) {
      setTouchedIndex(index);
    }
  };

  const handleTouchEnd = () => {
    setTouchedIndex(null);
  };

  const handleVote = (index: number) => {
    if (isActive && !hasVoted && onVote) {
      onVote(index);
    }
  };

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Chart View */}
      {showResults && (
        <div className="space-y-4 mb-6 bg-gradient-to-br from-cm-green/5 to-cm-yellow/5 p-4 rounded-lg border border-cm-green/20">
          <div className="flex items-center gap-2 text-sm font-semibold text-cm-green mb-4">
            <TrendingUp className="w-5 h-5 animate-pulse" />
            Live Results
          </div>
          {poll.options.map((option, index) => {
            const votes = poll.vote_results?.[index] || 0;
            const percentage = getVotePercentage(votes, poll.votes_count);
            const animatedPercentage = animatedPercentages[index] || 0;
            const isSelected = poll.user_vote === index;
            const isHovered = hoveredIndex === index;
            
            return (
              <div 
                key={index} 
                className="space-y-2 transition-all duration-200 hover:scale-[1.01]"
                onMouseEnter={() => setHoveredIndex(index)}
                onMouseLeave={() => setHoveredIndex(null)}
              >
                <div className="flex items-center justify-between text-sm">
                  <span className={`font-semibold transition-colors ${
                    isSelected ? 'text-cm-green' : isHovered ? 'text-cm-yellow' : 'text-foreground'
                  }`}>
                    {option}
                    {isSelected && <CheckCircle className="w-4 h-4 inline ml-2 text-cm-yellow animate-heartbeat" />}
                  </span>
                  <div className="flex items-center gap-2">
                    <span className="text-muted-foreground font-medium">
                      {votes} votes
                    </span>
                    <span className={`font-bold ${isSelected ? 'text-cm-green' : 'text-muted-foreground'}`}>
                      ({percentage}%)
                    </span>
                  </div>
                </div>
                <div className="relative group">
                  <div className="h-6 bg-muted/30 rounded-full overflow-hidden border border-border/50">
                    <div 
                      className={`h-full transition-all duration-1000 ease-out relative ${
                        poll.custom_settings?.colorTheme === 'cameroon_gradient' && poll.custom_settings?.colors?.barColors?.[index]
                          ? ''
                          : isSelected 
                          ? 'bg-gradient-civic shadow-glow' 
                          : isHovered
                          ? 'bg-gradient-to-r from-cm-yellow/70 to-cm-red/70'
                          : 'bg-gradient-to-r from-cm-green/60 to-cm-green/40'
                      }`}
                      style={{ 
                        width: `${animatedPercentage}%`,
                        backgroundColor: poll.custom_settings?.colorTheme === 'cameroon_gradient' && poll.custom_settings?.colors?.barColors?.[index]
                          ? poll.custom_settings.colors.barColors[index]
                          : undefined
                      }}
                    >
                      {isSelected && (
                        <div className="absolute inset-0 bg-white/20 animate-pulse" />
                      )}
                    </div>
                  </div>
                  {/* Hover tooltip */}
                  {isHovered && (
                    <div className="absolute -top-8 left-1/2 transform -translate-x-1/2 bg-popover text-popover-foreground px-2 py-1 rounded text-xs font-medium shadow-lg border animate-fade-in">
                      {percentage}% ({votes} votes)
                    </div>
                  )}
                </div>
              </div>
            );
          })}
          <div className="pt-2 border-t border-cm-green/20 text-center">
            <span className="text-xs text-muted-foreground font-medium">
              Total: {poll.votes_count} votes
            </span>
          </div>
        </div>
      )}

      {/* Voting Options */}
      {(!showResults || !hasVoted) && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {poll.options.map((option, index) => {
            const isSelected = poll.user_vote === index;
            const isTouched = touchedIndex === index;
            
            return (
              <Button
                key={index}
                variant={isSelected ? "default" : "outline"}
                className={`h-auto p-4 text-left justify-start transition-all duration-300 touch-manipulation ${
                  isActive && !hasVoted ? 'hover:scale-[1.03] hover:shadow-elegant active:scale-95' : ''
                } ${isSelected ? 'bg-gradient-civic shadow-glow animate-patriotic-pulse' : ''} ${
                  isTouched ? 'bg-cm-green/10 border-cm-green scale-95' : ''
                }`}
                onTouchStart={() => handleTouchStart(index)}
                onTouchEnd={handleTouchEnd}
                onTouchCancel={handleTouchEnd}
                onClick={() => handleVote(index)}
                disabled={!isActive || hasVoted}
              >
                <div className="flex items-center gap-3 w-full">
                  <div className={`w-4 h-4 rounded-full border-2 transition-all ${
                    isSelected ? 'bg-cm-yellow border-cm-yellow shadow-lg' : 'border-current'
                  }`} />
                  <span className="flex-1 text-sm sm:text-base font-medium">{option}</span>
                  {isSelected && <CheckCircle className="w-5 h-5 text-cm-yellow animate-heartbeat" />}
                </div>
              </Button>
            );
          })}
        </div>
      )}
    </div>
  );
};