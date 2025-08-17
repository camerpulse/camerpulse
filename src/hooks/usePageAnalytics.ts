import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

interface PageAnalyticsConfig {
  trackPageViews?: boolean;
  trackUserInteractions?: boolean;
  trackPerformance?: boolean;
}

export const usePageAnalytics = (config: PageAnalyticsConfig = {}) => {
  const location = useLocation();
  const {
    trackPageViews = true,
    trackUserInteractions = true,
    trackPerformance = true
  } = config;

  useEffect(() => {
    if (trackPageViews) {
      trackPageView(location.pathname, location.search);
    }
  }, [location, trackPageViews]);

  useEffect(() => {
    if (trackPerformance) {
      trackWebVitals();
    }
  }, [trackPerformance]);

  useEffect(() => {
    if (trackUserInteractions) {
      const handleClick = (event: MouseEvent) => {
        const target = event.target as HTMLElement;
        if (target.tagName === 'BUTTON' || target.tagName === 'A') {
          trackEvent('click', {
            element: target.tagName,
            text: target.textContent?.slice(0, 50) || '',
            href: target.getAttribute('href') || '',
            page: location.pathname
          });
        }
      };

      document.addEventListener('click', handleClick);
      return () => document.removeEventListener('click', handleClick);
    }
  }, [location, trackUserInteractions]);
};

const trackPageView = (pathname: string, search: string) => {
  try {
    // Track page view
    const pageData = {
      page: pathname,
      search,
      timestamp: Date.now(),
      referrer: document.referrer,
      userAgent: navigator.userAgent
    };

    console.log('Page view:', pageData);

    // In production, send to analytics service
    // gtag('config', 'GA_MEASUREMENT_ID', {
    //   page_path: pathname + search
    // });
    
    // Or send to custom analytics endpoint
    // fetch('/api/analytics/pageview', {
    //   method: 'POST',
    //   headers: { 'Content-Type': 'application/json' },
    //   body: JSON.stringify(pageData)
    // });
  } catch (error) {
    console.error('Failed to track page view:', error);
  }
};

const trackEvent = (eventName: string, eventData: Record<string, any>) => {
  try {
    const data = {
      event: eventName,
      ...eventData,
      timestamp: Date.now()
    };

    console.log('Event tracked:', data);

    // In production, send to analytics service
    // gtag('event', eventName, eventData);
    
    // Or send to custom analytics endpoint
    // fetch('/api/analytics/event', {
    //   method: 'POST',
    //   headers: { 'Content-Type': 'application/json' },
    //   body: JSON.stringify(data)
    // });
  } catch (error) {
    console.error('Failed to track event:', error);
  }
};

const trackWebVitals = () => {
  try {
    // Track Core Web Vitals
    if ('web-vital' in window) {
      // This would require importing web-vitals library
      // import { getCLS, getFID, getFCP, getLCP, getTTFB } from 'web-vitals';
      
      // getCLS(console.log);
      // getFID(console.log);
      // getFCP(console.log);
      // getLCP(console.log);
      // getTTFB(console.log);
    }

    // Track Performance API metrics
    if ('performance' in window && 'getEntriesByType' in performance) {
      const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
      
      if (navigation) {
        const metrics = {
          dns: navigation.domainLookupEnd - navigation.domainLookupStart,
          connection: navigation.connectEnd - navigation.connectStart,
          request: navigation.responseStart - navigation.requestStart,
          response: navigation.responseEnd - navigation.responseStart,
          dom: navigation.domContentLoadedEventEnd - navigation.responseEnd,
          load: navigation.loadEventEnd - navigation.loadEventStart,
          total: navigation.loadEventEnd - navigation.navigationStart
        };

        console.log('Performance metrics:', metrics);

        // In production, send to analytics service
        // fetch('/api/analytics/performance', {
        //   method: 'POST',
        //   headers: { 'Content-Type': 'application/json' },
        //   body: JSON.stringify(metrics)
        // });
      }
    }
  } catch (error) {
    console.error('Failed to track web vitals:', error);
  }
};

// Helper function to manually track custom events
export const trackCustomEvent = (eventName: string, properties: Record<string, any> = {}) => {
  trackEvent(eventName, properties);
};

// Helper function to track user interactions
export const trackUserAction = (action: string, target: string, properties: Record<string, any> = {}) => {
  trackEvent('user_action', {
    action,
    target,
    ...properties,
    page: window.location.pathname
  });
};