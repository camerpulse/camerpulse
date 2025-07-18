import React from 'react';
import { Button } from '@/components/ui/button';
import { Loader2, ChevronDown } from 'lucide-react';

interface LoadMoreButtonProps {
  onLoadMore: () => void;
  loading?: boolean;
  hasMore?: boolean;
  className?: string;
}

export const LoadMoreButton: React.FC<LoadMoreButtonProps> = ({
  onLoadMore, loading = false, hasMore = true, className
}) => {
  if (!hasMore) return null;
  
  return (
    <Button variant="outline" onClick={onLoadMore} disabled={loading} className={`w-full ${className}`}>
      {loading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <ChevronDown className="w-4 h-4 mr-2" />}
      {loading ? 'Chargement...' : 'Charger plus'}
    </Button>
  );
};