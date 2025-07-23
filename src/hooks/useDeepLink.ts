import { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

interface DeepLinkData {
  tenderId?: string;
  bidId?: string;
  searchQuery?: string;
  filters?: Record<string, any>;
  section?: string;
  tab?: string;
}

export const useDeepLink = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [linkData, setLinkData] = useState<DeepLinkData>({});

  useEffect(() => {
    parseCurrentUrl();
  }, [location]);

  const parseCurrentUrl = () => {
    const params = new URLSearchParams(location.search);
    const pathParts = location.pathname.split('/').filter(Boolean);
    
    const data: DeepLinkData = {};
    
    // Extract data from URL path
    if (pathParts[0] === 'tenders' && pathParts[1] && pathParts[1] !== 'create') {
      data.tenderId = pathParts[1];
      if (pathParts[2]) {
        data.section = pathParts[2]; // analytics, bids, etc.
      }
    }
    
    if (pathParts[0] === 'bids' && pathParts[1]) {
      data.bidId = pathParts[1];
    }
    
    // Extract data from query parameters
    if (params.get('q')) {
      data.searchQuery = params.get('q') || undefined;
    }
    
    if (params.get('tab')) {
      data.tab = params.get('tab') || undefined;
    }
    
    // Parse filters from query string
    const filterParams = ['category', 'region', 'budget_min', 'budget_max', 'status', 'deadline'];
    const filters: Record<string, any> = {};
    filterParams.forEach(param => {
      const value = params.get(param);
      if (value) {
        filters[param] = value;
      }
    });
    
    if (Object.keys(filters).length > 0) {
      data.filters = filters;
    }
    
    setLinkData(data);
  };

  const generateTenderLink = (tenderId: string, section?: string, params?: Record<string, string>) => {
    let path = `/tenders/${tenderId}`;
    if (section) {
      path += `/${section}`;
    }
    
    if (params && Object.keys(params).length > 0) {
      const searchParams = new URLSearchParams(params);
      path += `?${searchParams.toString()}`;
    }
    
    return path;
  };

  const generateSearchLink = (query?: string, filters?: Record<string, any>) => {
    let path = '/search';
    const params = new URLSearchParams();
    
    if (query) {
      params.set('q', query);
    }
    
    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== null && value !== undefined && value !== '') {
          params.set(key, value.toString());
        }
      });
    }
    
    if (params.toString()) {
      path += `?${params.toString()}`;
    }
    
    return path;
  };

  const generateBidLink = (bidId: string, tab?: string) => {
    let path = `/my-bids`;
    const params = new URLSearchParams();
    
    if (bidId) {
      params.set('bid', bidId);
    }
    
    if (tab) {
      params.set('tab', tab);
    }
    
    if (params.toString()) {
      path += `?${params.toString()}`;
    }
    
    return path;
  };

  const navigateToTender = (tenderId: string, section?: string, params?: Record<string, string>) => {
    const path = generateTenderLink(tenderId, section, params);
    navigate(path);
  };

  const navigateToSearch = (query?: string, filters?: Record<string, any>) => {
    const path = generateSearchLink(query, filters);
    navigate(path);
  };

  const navigateToBid = (bidId: string, tab?: string) => {
    const path = generateBidLink(bidId, tab);
    navigate(path);
  };

  const shareCurrentPage = async (title?: string) => {
    const url = window.location.href;
    const shareTitle = title || document.title;
    
    if (navigator.share) {
      try {
        await navigator.share({
          title: shareTitle,
          url: url
        });
        return true;
      } catch (error) {
        console.error('Error sharing:', error);
      }
    }
    
    // Fallback to clipboard
    try {
      await navigator.clipboard.writeText(url);
      return true;
    } catch (error) {
      console.error('Error copying to clipboard:', error);
      return false;
    }
  };

  const updateUrlParams = (newParams: Record<string, string | null>) => {
    const searchParams = new URLSearchParams(location.search);
    
    Object.entries(newParams).forEach(([key, value]) => {
      if (value === null) {
        searchParams.delete(key);
      } else {
        searchParams.set(key, value);
      }
    });
    
    const newSearch = searchParams.toString();
    const newUrl = `${location.pathname}${newSearch ? `?${newSearch}` : ''}`;
    
    navigate(newUrl, { replace: true });
  };

  return {
    linkData,
    generateTenderLink,
    generateSearchLink,
    generateBidLink,
    navigateToTender,
    navigateToSearch,
    navigateToBid,
    shareCurrentPage,
    updateUrlParams
  };
};

// URL Pattern utilities
export const UrlPatterns = {
  tender: /^\/tenders\/([^\/]+)(?:\/(.+))?$/,
  tenderAnalytics: /^\/tenders\/([^\/]+)\/analytics$/,
  search: /^\/search/,
  bid: /^\/my-bids/,
  dashboard: /^\/dashboard/,
  
  isTenderPage: (path: string) => UrlPatterns.tender.test(path),
  isAnalyticsPage: (path: string) => UrlPatterns.tenderAnalytics.test(path),
  isSearchPage: (path: string) => UrlPatterns.search.test(path),
  
  extractTenderId: (path: string) => {
    const match = path.match(UrlPatterns.tender);
    return match ? match[1] : null;
  },
  
  extractSection: (path: string) => {
    const match = path.match(UrlPatterns.tender);
    return match ? match[2] : null;
  }
};

// Deep link generators for common scenarios
export const DeepLinks = {
  tenderDetail: (tenderId: string) => `/tenders/${tenderId}`,
  tenderBids: (tenderId: string) => `/tenders/${tenderId}/bids`,
  tenderAnalytics: (tenderId: string) => `/tenders/${tenderId}/analytics`,
  
  search: (query: string, filters?: Record<string, any>) => {
    const params = new URLSearchParams();
    params.set('q', query);
    
    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (value) params.set(key, value.toString());
      });
    }
    
    return `/search?${params.toString()}`;
  },
  
  bidDetail: (bidId: string) => `/my-bids?bid=${bidId}`,
  
  createTender: (category?: string) => 
    category ? `/tenders/create?category=${category}` : '/tenders/create'
};