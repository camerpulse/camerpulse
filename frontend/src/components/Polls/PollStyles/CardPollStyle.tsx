import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, Users, Clock } from 'lucide-react';
import { useState } from 'react';

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
    custom_settings?: {
      showEmojiResults?: boolean;
      emojiMap?: Record<number, string>;
      resultStyle?: string;
    };
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
  const [touchedIndex, setTouchedIndex] = useState<number | null>(null);
  const [pressedIndex, setPressedIndex] = useState<number | null>(null);

  const getVotePercentage = (votes: number, total: number) => {
    return total > 0 ? Math.round((votes / total) * 100) : 0;
  };

  const handleTouchStart = (index: number) => {
    if (isActive && !hasVoted) {
      setTouchedIndex(index);
      setPressedIndex(index);
    }
  };

  const handleTouchEnd = () => {
    setTouchedIndex(null);
    setPressedIndex(null);
  };

  const handleVote = (index: number) => {
    if (isActive && !hasVoted && onVote) {
      onVote(index);
    }
  };

  return (
    <div className={`space-y-4 ${className}`}>
      <div className="space-y-3">
        {poll.options.map((option, index) => {
          const votes = poll.vote_results?.[index] || 0;
          const percentage = getVotePercentage(votes, poll.votes_count);
          const isSelected = poll.user_vote === index;
          const isTouched = touchedIndex === index;
          const isPressed = pressedIndex === index;
          
          return (
            <div key={index} className="space-y-2">
              <Button
                variant={isSelected ? "default" : "outline"}
                className={`w-full justify-start text-left h-auto p-3 sm:p-4 transition-all duration-300 touch-manipulation ${
                  isActive && !hasVoted ? 'hover:scale-[1.02] hover:shadow-elegant active:scale-95' : ''
                } ${isSelected ? 'bg-gradient-civic shadow-glow animate-patriotic-pulse' : ''} ${
                  isTouched ? 'bg-cm-green/10 border-cm-green' : ''
                } ${isPressed ? 'scale-95' : ''}`}
                onTouchStart={() => handleTouchStart(index)}
                onTouchEnd={handleTouchEnd}
                onTouchCancel={handleTouchEnd}
                onClick={() => handleVote(index)}
                disabled={!isActive || hasVoted}
              >
                <div className="flex items-center justify-between w-full gap-3">
                  <span className="flex-1 text-sm sm:text-base leading-relaxed font-medium">{option}</span>
                   {showResults && (
                     <div className="flex items-center gap-2 shrink-0">
                       {poll.custom_settings?.showEmojiResults && poll.custom_settings?.emojiMap?.[index] && (
                         <span className="text-lg mr-1">
                           {poll.custom_settings.emojiMap[index]}
                         </span>
                       )}
                       <span className="text-xs sm:text-sm whitespace-nowrap font-semibold">
                         {votes} ({percentage}%)
                       </span>
                       {isSelected && (
                         <CheckCircle className="w-4 h-4 text-cm-yellow animate-heartbeat" />
                       )}
                     </div>
                   )}
                </div>
              </Button>
              
               {showResults && (
                 <div className="px-1">
                   <div className="relative">
                     {poll.custom_settings?.resultStyle === "emoji_bars" ? (
                       <div className="flex items-center gap-2">
                         {poll.custom_settings?.emojiMap?.[index] && (
                           <span className="text-sm">{poll.custom_settings.emojiMap[index]}</span>
                         )}
                         <div className="flex-1 relative">
                           <Progress 
                             value={percentage} 
                             className="h-3 bg-muted/50 overflow-hidden" 
                           />
                           {isSelected && (
                             <div className="absolute inset-0 bg-gradient-civic opacity-20 animate-pulse" />
                           )}
                         </div>
                         <span className="text-xs font-medium min-w-[3rem] text-right">
                           {percentage}%
                         </span>
                       </div>
                     ) : (
                       <div className="relative">
                         <Progress 
                           value={percentage} 
                           className="h-3 bg-muted/50 overflow-hidden" 
                         />
                         {isSelected && (
                           <div className="absolute inset-0 bg-gradient-civic opacity-20 animate-pulse" />
                         )}
                       </div>
                     )}
                   </div>
                 </div>
               )}
            </div>
          );
        })}
      </div>
    </div>
  );
};