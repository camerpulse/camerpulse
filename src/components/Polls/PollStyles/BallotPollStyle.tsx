import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { CheckCircle, Vote, Shield } from 'lucide-react';
import { useState } from 'react';

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
    party_logos?: Record<string, string | null>;
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
  const [touchedIndex, setTouchedIndex] = useState<number | null>(null);
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

  const getVotePercentage = (votes: number, total: number) => {
    return total > 0 ? Math.round((votes / total) * 100) : 0;
  };

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
      {/* Ballot Header */}
      <div className="flex items-center gap-2 text-sm font-semibold text-cm-green mb-4 pb-3 border-b-2 border-gradient-civic bg-gradient-to-r from-cm-green/5 to-cm-yellow/5 p-3 rounded-t-lg">
        <Shield className="w-5 h-5 animate-pulse" />
        Official Civic Ballot
        <div className="ml-auto text-xs text-muted-foreground">
          Secure • Verified
        </div>
      </div>

      {/* Ballot Options */}
      <div className="space-y-3">
        {poll.options.map((option, index) => {
          const votes = poll.vote_results?.[index] || 0;
          const percentage = getVotePercentage(votes, poll.votes_count);
          const isSelected = poll.user_vote === index;
          const isTouched = touchedIndex === index;
          const isHovered = hoveredIndex === index;
          
          return (
            <div key={index} className="space-y-2">
              <div 
                className={`border-2 rounded-xl p-4 transition-all duration-300 cursor-pointer touch-manipulation ${
                  isSelected 
                    ? 'border-cm-green bg-gradient-civic/10 shadow-elegant animate-patriotic-pulse' 
                    : isHovered
                    ? 'border-cm-yellow bg-cm-yellow/5 shadow-md'
                    : isTouched
                    ? 'border-cm-green bg-cm-green/5 scale-98'
                    : 'border-border hover:border-cm-green/50 hover:bg-muted/30'
                } ${!isActive || hasVoted ? 'opacity-60 cursor-not-allowed' : 'hover:scale-[1.01] active:scale-[0.98]'}`}
                onTouchStart={() => handleTouchStart(index)}
                onTouchEnd={handleTouchEnd}
                onTouchCancel={handleTouchEnd}
                onMouseEnter={() => setHoveredIndex(index)}
                onMouseLeave={() => setHoveredIndex(null)}
                onClick={() => handleVote(index)}
              >
                <div className="flex items-center gap-4">
                  {/* Radio Button Style */}
                  <div className={`w-6 h-6 rounded-full border-3 flex items-center justify-center transition-all duration-200 ${
                    isSelected 
                      ? 'border-cm-green bg-cm-green shadow-lg' 
                      : isHovered
                      ? 'border-cm-yellow bg-cm-yellow/20'
                      : 'border-muted-foreground hover:border-cm-green'
                  }`}>
                    {isSelected && (
                      <div className="w-3 h-3 rounded-full bg-cm-yellow animate-pulse" />
                    )}
                  </div>
                  
                  {/* Party Logo */}
                  {poll.party_logos && poll.party_logos[option] && (
                    <div className="w-12 h-12 rounded-full bg-muted/20 border border-border flex items-center justify-center overflow-hidden">
                      <img 
                        src={poll.party_logos[option] || "/api/placeholder/48/48"} 
                        alt={`${option} logo`}
                        className="w-10 h-10 object-contain"
                        onError={(e) => {
                          e.currentTarget.src = "/api/placeholder/48/48";
                        }}
                      />
                    </div>
                  )}
                  
                  {/* Option Text */}
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <span className={`text-sm sm:text-base font-semibold transition-colors ${
                        isSelected ? 'text-cm-green' : isHovered ? 'text-cm-yellow' : 'text-foreground'
                      }`}>
                        {option}
                      </span>
                      {isSelected && (
                        <CheckCircle className="w-5 h-5 text-cm-yellow animate-heartbeat" />
                      )}
                    </div>
                    
                    {/* Results */}
                    {showResults && (
                      <div className="mt-3 space-y-2">
                        <div className="flex items-center justify-between text-xs">
                          <span className="text-muted-foreground font-medium">{votes} votes</span>
                          <span className={`font-bold ${isSelected ? 'text-cm-green' : 'text-muted-foreground'}`}>
                            {percentage}%
                          </span>
                        </div>
                        <div className="relative">
                          <Progress 
                            value={percentage} 
                            className="h-2 bg-muted/30 overflow-hidden" 
                          />
                          {isSelected && (
                            <div className="absolute inset-0 bg-gradient-civic/20 animate-pulse rounded-full" />
                          )}
                        </div>
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
        <div className="mt-6 pt-4 border-t-2 border-gradient-civic text-center bg-gradient-to-r from-cm-green/5 to-cm-yellow/5 p-4 rounded-b-lg">
          <div className="flex items-center justify-center gap-2 text-sm text-cm-green font-semibold">
            <CheckCircle className="w-5 h-5 animate-heartbeat" />
            Your vote has been securely recorded
          </div>
          <p className="text-xs text-muted-foreground mt-1">
            Thank you for participating in civic democracy
          </p>
        </div>
      )}
    </div>
  );
};