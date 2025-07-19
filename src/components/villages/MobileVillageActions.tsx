import React from 'react';
import { Button } from '@/components/ui/button';
import { Plus, Search, Map, Filter } from 'lucide-react';

export const MobileVillageActions: React.FC = () => {
  const [isVisible, setIsVisible] = React.useState(true);
  const [lastScrollY, setLastScrollY] = React.useState(0);

  React.useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      
      // Hide when scrolling down, show when scrolling up
      if (currentScrollY > lastScrollY && currentScrollY > 100) {
        setIsVisible(false);
      } else {
        setIsVisible(true);
      }
      
      setLastScrollY(currentScrollY);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [lastScrollY]);

  const quickActions = [
    {
      icon: Plus,
      label: 'Add Village',
      color: 'bg-amber-600 hover:bg-amber-700',
      action: () => {
        // Scroll to add village widget
        const addWidget = document.querySelector('[data-component="add-village-widget"]');
        addWidget?.scrollIntoView({ behavior: 'smooth' });
      }
    },
    {
      icon: Search,
      label: 'Search',
      color: 'bg-blue-600 hover:bg-blue-700',
      action: () => {
        // Focus search input
        const searchInput = document.querySelector('input[placeholder*="Search"]') as HTMLInputElement;
        searchInput?.focus();
      }
    },
    {
      icon: Map,
      label: 'Map View',
      color: 'bg-green-600 hover:bg-green-700',
      action: () => {
        // Scroll to map
        const mapSection = document.querySelector('[data-component="interactive-map"]');
        mapSection?.scrollIntoView({ behavior: 'smooth' });
      }
    },
    {
      icon: Filter,
      label: 'Filter',
      color: 'bg-purple-600 hover:bg-purple-700',
      action: () => {
        // Scroll to categories
        const categories = document.querySelector('[data-component="civic-categories"]');
        categories?.scrollIntoView({ behavior: 'smooth' });
      }
    }
  ];

  return (
    <>
      {/* Mobile Bottom Action Bar */}
      <div 
        className={`fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 p-3 z-50 transition-transform duration-300 md:hidden ${
          isVisible ? 'translate-y-0' : 'translate-y-full'
        }`}
        style={{ 
          paddingBottom: 'calc(0.75rem + env(safe-area-inset-bottom))',
          boxShadow: '0 -4px 6px -1px rgba(0, 0, 0, 0.1)'
        }}
      >
        <div className="grid grid-cols-4 gap-2">
          {quickActions.map((action, index) => (
            <Button
              key={index}
              onClick={action.action}
              className={`flex flex-col items-center gap-1 h-auto py-2 px-1 ${action.color} text-white`}
              size="sm"
            >
              <action.icon className="w-4 h-4" />
              <span className="text-xs">{action.label}</span>
            </Button>
          ))}
        </div>
      </div>

      {/* Floating Add Button (Alternative) */}
      <div className="fixed bottom-20 right-4 z-40 md:hidden">
        <Button
          size="lg"
          className="rounded-full w-14 h-14 bg-primary hover:bg-primary/90 shadow-lg"
          onClick={() => {
            const addWidget = document.querySelector('[data-component="add-village-widget"]');
            addWidget?.scrollIntoView({ behavior: 'smooth' });
          }}
        >
          <Plus className="w-6 h-6" />
        </Button>
      </div>

      {/* Swipe Indicator for Cards */}
      <style jsx global>{`
        @media (max-width: 768px) {
          .swipeable-cards {
            display: flex;
            overflow-x-auto;
            scroll-snap-type: x mandatory;
            -webkit-overflow-scrolling: touch;
          }
          
          .swipeable-cards > * {
            flex: 0 0 85%;
            scroll-snap-align: start;
            margin-right: 1rem;
          }
          
          .swipeable-cards::-webkit-scrollbar {
            display: none;
          }
          
          .mobile-card {
            transform: scale(1);
            transition: transform 0.2s ease;
          }
          
          .mobile-card:active {
            transform: scale(0.98);
          }
        }
      `}</style>
    </>
  );
};