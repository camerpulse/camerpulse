import { Star } from 'lucide-react';

interface ReviewStarsProps {
  rating: number;
  size?: 'sm' | 'md' | 'lg';
  showRating?: boolean;
}

export const ReviewStars = ({ rating, size = 'md', showRating = true }: ReviewStarsProps) => {
  const sizeClasses = {
    sm: 'w-3 h-3',
    md: 'w-4 h-4',
    lg: 'w-5 h-5',
  };

  const iconSize = sizeClasses[size];

  return (
    <div className="flex items-center space-x-1">
      <div className="flex items-center">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            className={`${iconSize} ${
              star <= rating
                ? 'fill-yellow-400 text-yellow-400'
                : 'text-gray-300'
            }`}
          />
        ))}
      </div>
      {showRating && (
        <span className="text-sm text-muted-foreground ml-2">
          ({rating}/5)
        </span>
      )}
    </div>
  );
};