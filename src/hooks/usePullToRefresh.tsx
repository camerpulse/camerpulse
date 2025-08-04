import { useEffect, useRef, useState } from 'react';

interface UsePullToRefreshProps {
  onRefresh: () => Promise<void> | void;
  threshold?: number;
  triggerThreshold?: number;
}

export const usePullToRefresh = ({
  onRefresh,
  threshold = 80,
  triggerThreshold = 120,
}: UsePullToRefreshProps) => {
  const [isPulling, setIsPulling] = useState(false);
  const [pullDistance, setPullDistance] = useState(0);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const touchStartY = useRef<number>(0);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    let startY = 0;
    let currentY = 0;
    let isDragging = false;

    const handleTouchStart = (e: TouchEvent) => {
      // Only trigger on pull from top of page
      if (window.scrollY > 0) return;
      
      startY = e.touches[0].clientY;
      touchStartY.current = startY;
      isDragging = false;
    };

    const handleTouchMove = (e: TouchEvent) => {
      if (window.scrollY > 0) return;

      currentY = e.touches[0].clientY;
      const deltaY = currentY - startY;

      if (deltaY > 0 && !isDragging) {
        isDragging = true;
        setIsPulling(true);
      }

      if (isDragging && deltaY > 0) {
        // Prevent default scrolling when pulling down
        e.preventDefault();
        
        // Apply resistance to the pull (exponential decay)
        const resistance = Math.max(0, 1 - (deltaY / 300));
        const adjustedDistance = deltaY * resistance;
        
        setPullDistance(Math.min(adjustedDistance, triggerThreshold + 20));
      }
    };

    const handleTouchEnd = async () => {
      if (!isDragging) return;

      if (pullDistance >= triggerThreshold && !isRefreshing) {
        setIsRefreshing(true);
        try {
          await onRefresh();
        } catch (error) {
          console.error('Refresh failed:', error);
        } finally {
          setIsRefreshing(false);
        }
      }

      setIsPulling(false);
      setPullDistance(0);
      isDragging = false;
    };

    container.addEventListener('touchstart', handleTouchStart, { passive: false });
    container.addEventListener('touchmove', handleTouchMove, { passive: false });
    container.addEventListener('touchend', handleTouchEnd);

    return () => {
      container.removeEventListener('touchstart', handleTouchStart);
      container.removeEventListener('touchmove', handleTouchMove);
      container.removeEventListener('touchend', handleTouchEnd);
    };
  }, [onRefresh, triggerThreshold, pullDistance, isRefreshing]);

  const pullProgress = Math.min(pullDistance / threshold, 1);
  const canTrigger = pullDistance >= triggerThreshold;

  return {
    containerRef,
    isPulling,
    pullDistance,
    isRefreshing,
    pullProgress,
    canTrigger,
  };
};