/**
 * CamerPulse Custom Hooks
 * Centralized collection of reusable React hooks
 */

export { default as useAuth } from './useAuth';
export { default as useLocalStorage } from './useLocalStorage';
export { default as useDebounce } from './useDebounce';
export { default as useThrottle } from './useThrottle';
export { default as useOnClickOutside } from './useOnClickOutside';
export { default as useKeyboardShortcut } from './useKeyboardShortcut';
export { default as useIntersectionObserver } from './useIntersectionObserver';
export { default as useMediaQuery } from './useMediaQuery';
export { default as usePrevious } from './usePrevious';
export { default as useToggle } from './useToggle';
export { default as useCounter } from './useCounter';
export { default as useCopyToClipboard } from './useCopyToClipboard';
export { default as useOnlineStatus } from './useOnlineStatus';
export { default as useWindowSize } from './useWindowSize';
export { default as useScrollPosition } from './useScrollPosition';
export { default as useIsMobile } from './useIsMobile';
export { default as useAsync } from './useAsync';
export { default as usePagination } from './usePagination';
export { default as useSearch } from './useSearch';
export { default as useForm } from './useForm';
export { default as useNotifications } from './useNotifications';
export { default as useRealtime } from './useRealtime';

// Re-export toast hook with proper path
export { useToast } from './use-toast';