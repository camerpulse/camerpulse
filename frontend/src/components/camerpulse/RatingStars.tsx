import { useState } from 'react';
import { Star } from 'lucide-react';
import { cn } from '@/lib/utils';

interface RatingStarsProps {
  rating: number;
  maxRating?: number;
  size?: 'sm' | 'md' | 'lg';
  showLabel?: boolean;
  onRatingChange?: (rating: number) => void;
  disabled?: boolean;
  className?: string;
}

export function RatingStars({
  rating,
  maxRating = 5,
  size = 'md',
  showLabel = false,
  onRatingChange,
  disabled = false,
  className
}: RatingStarsProps) {
  const [hoverRating, setHoverRating] = useState(0);
  
  const isInteractive = !!onRatingChange && !disabled;
  
  const sizeClasses = {
    sm: 'h-4 w-4',
    md: 'h-5 w-5',
    lg: 'h-6 w-6'
  };

  const getRatingLabel = (value: number) => {
    const labels = ['Poor', 'Fair', 'Good', 'Very Good', 'Excellent'];
    return labels[value - 1] || 'Not Rated';
  };

  const handleClick = (value: number) => {
    if (isInteractive) {
      onRatingChange(value);
    }
  };

  const handleMouseEnter = (value: number) => {
    if (isInteractive) {
      setHoverRating(value);
    }
  };

  const handleMouseLeave = () => {
    if (isInteractive) {
      setHoverRating(0);
    }
  };

  const displayRating = hoverRating || rating;

  return (
    <div className={cn('flex items-center gap-2', className)}>
      <div className="flex items-center">
        {Array.from({ length: maxRating }, (_, index) => {
          const starValue = index + 1;
          const isFilled = starValue <= displayRating;
          const isHalfFilled = starValue === Math.ceil(displayRating) && displayRating % 1 !== 0;
          
          return (
            <button
              key={index}
              type="button"
              disabled={disabled}
              className={cn(
                sizeClasses[size],
                'text-muted-foreground transition-colors',
                isInteractive && 'hover:text-yellow-400 cursor-pointer',
                isFilled && 'text-yellow-400 fill-yellow-400',
                disabled && 'cursor-not-allowed opacity-50'
              )}
              onClick={() => handleClick(starValue)}
              onMouseEnter={() => handleMouseEnter(starValue)}
              onMouseLeave={handleMouseLeave}
            >
              <Star 
                className={cn(
                  'transition-all duration-200',
                  isFilled && 'fill-current',
                  isHalfFilled && 'fill-current opacity-50'
                )}
              />
            </button>
          );
        })}
      </div>
      
      {showLabel && (
        <span className="text-sm text-muted-foreground">
          {rating > 0 ? `${rating}/5 - ${getRatingLabel(Math.round(rating))}` : 'Not Rated'}
        </span>
      )}
    </div>
  );
}