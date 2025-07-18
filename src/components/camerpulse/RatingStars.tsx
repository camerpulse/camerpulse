/**
 * RatingStars Component
 * 
 * Interactive rating component for civic evaluations and feedback
 */

import React, { useState } from 'react';
import { Star } from 'lucide-react';
import { ComponentSize } from './types';

interface RatingStarsProps {
  rating: number;
  maxRating?: number;
  size?: 'sm' | 'default' | 'lg';
  readOnly?: boolean;
  showLabel?: boolean;
  className?: string;
  onRatingChange?: (rating: number) => void;
}

const sizeClasses = {
  sm: 'w-4 h-4',
  default: 'w-5 h-5',
  lg: 'w-6 h-6'
};

export const RatingStars: React.FC<RatingStarsProps> = ({
  rating,
  maxRating = 5,
  size = 'default',
  readOnly = false,
  showLabel = false,
  className = '',
  onRatingChange
}) => {
  const [hoverRating, setHoverRating] = useState(0);
  const [isHovering, setIsHovering] = useState(false);

  const displayRating = isHovering ? hoverRating : rating;

  const handleStarClick = (selectedRating: number) => {
    if (readOnly) return;
    onRatingChange?.(selectedRating);
  };

  const handleStarHover = (selectedRating: number) => {
    if (readOnly) return;
    setHoverRating(selectedRating);
    setIsHovering(true);
  };

  const handleMouseLeave = () => {
    if (readOnly) return;
    setIsHovering(false);
    setHoverRating(0);
  };

  const getRatingColor = (rating: number) => {
    if (rating >= 4) return 'text-cm-green';
    if (rating >= 2.5) return 'text-cm-yellow';
    return 'text-cm-red';
  };

  const stars = Array.from({ length: maxRating }, (_, index) => {
    const starValue = index + 1;
    const isFilled = starValue <= displayRating;
    const isPartiallyFilled = !isFilled && starValue - 0.5 <= displayRating;

    return (
      <button
        key={index}
        type="button"
        className={`${readOnly ? 'cursor-default' : 'cursor-pointer hover:scale-110'} 
                   transition-all duration-200 ${sizeClasses[size]} relative`}
        onClick={() => handleStarClick(starValue)}
        onMouseEnter={() => handleStarHover(starValue)}
        disabled={readOnly}
      >
        <Star
          className={`${sizeClasses[size]} transition-colors duration-200 ${
            isFilled 
              ? `${getRatingColor(displayRating)} fill-current` 
              : isPartiallyFilled
                ? `${getRatingColor(displayRating)} fill-current opacity-50`
                : 'text-muted-foreground'
          }`}
        />
      </button>
    );
  });

  return (
    <div 
      className={`flex items-center gap-1 ${className}`}
      onMouseLeave={handleMouseLeave}
    >
      <div className="flex items-center gap-1">
        {stars}
      </div>
      
      {showLabel && (
        <span className={`ml-2 text-sm font-medium ${getRatingColor(displayRating)}`}>
          {displayRating.toFixed(1)}
        </span>
      )}
      
      {!readOnly && isHovering && (
        <span className="ml-2 text-xs text-muted-foreground">
          Cliquez pour noter
        </span>
      )}
    </div>
  );
};