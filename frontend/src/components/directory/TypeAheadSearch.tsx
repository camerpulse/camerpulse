import { useState, useEffect, useRef } from 'react';
import { Search, MapPin, Clock, TrendingUp } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';
import type { Institution } from '@/types/directory';

interface TypeAheadSearchProps {
  onSelect?: (institution: Institution) => void;
  onSearch?: (query: string) => void;
  placeholder?: string;
  className?: string;
}

interface SearchSuggestion {
  type: 'institution' | 'category' | 'location' | 'recent';
  data: any;
  label: string;
  subtitle?: string;
  icon: string;
}

export const TypeAheadSearch = ({ 
  onSelect, 
  onSearch, 
  placeholder = "Search institutions...",
  className = ""
}: TypeAheadSearchProps) => {
  const [query, setQuery] = useState('');
  const [suggestions, setSuggestions] = useState<SearchSuggestion[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const [recentSearches, setRecentSearches] = useState<string[]>([]);
  const inputRef = useRef<HTMLInputElement>(null);
  const suggestionsRef = useRef<HTMLDivElement>(null);

  // Load recent searches
  useEffect(() => {
    const saved = localStorage.getItem('camerpulse-typeahead-recent');
    if (saved) {
      setRecentSearches(JSON.parse(saved));
    }
  }, []);

  // Fetch suggestions based on query
  useEffect(() => {
    const fetchSuggestions = async () => {
      if (query.length < 2) {
        // Show recent searches and popular categories when no query
        const suggestions: SearchSuggestion[] = [];
        
        // Add recent searches
        recentSearches.slice(0, 3).forEach(search => {
          suggestions.push({
            type: 'recent',
            data: search,
            label: search,
            icon: '🕒'
          });
        });

        // Add popular categories
        const categories = [
          { name: 'Schools', icon: '🏫', count: '1,243' },
          { name: 'Hospitals', icon: '🏥', count: '456' },
          { name: 'Pharmacies', icon: '💊', count: '789' },
          { name: 'Villages', icon: '🏘️', count: '359' }
        ];

        categories.forEach(category => {
          suggestions.push({
            type: 'category',
            data: category.name.toLowerCase(),
            label: category.name,
            subtitle: `${category.count} listings`,
            icon: category.icon
          });
        });

        setSuggestions(suggestions);
        return;
      }

      try {
        // Search institutions
        const { data: institutions, error } = await supabase
          .from('institutions' as any)
          .select('id, name, institution_type, address, city, is_verified')
          .or(`name.ilike.%${query}%,address.ilike.%${query}%,city.ilike.%${query}%`)
          .limit(5);

        if (error) throw error;

        const newSuggestions: SearchSuggestion[] = [];

        // Add institution suggestions
        (institutions as unknown as Institution[] || []).forEach(institution => {
          const getIcon = (type: string) => {
            switch (type) {
              case 'school': return '🏫';
              case 'hospital': return '🏥';
              case 'pharmacy': return '💊';
              case 'village': return '🏘️';
              default: return '📍';
            }
          };

          newSuggestions.push({
            type: 'institution',
            data: institution,
            label: institution.name,
            subtitle: `${institution.address}, ${institution.city}`,
            icon: getIcon(institution.institution_type)
          });
        });

        // Add location suggestions
        if (query.length >= 3) {
          const commonLocations = [
            'Yaoundé', 'Douala', 'Bamenda', 'Bafoussam', 'Garoua', 'Maroua', 'Ngaoundéré', 'Bertoua', 'Ebolowa', 'Kumba', 'Limbe', 'Buea'
          ];

          commonLocations
            .filter(location => location.toLowerCase().includes(query.toLowerCase()))
            .slice(0, 3)
            .forEach(location => {
              newSuggestions.push({
                type: 'location',
                data: location,
                label: `Search in ${location}`,
                subtitle: 'Filter by location',
                icon: '📍'
              });
            });
        }

        setSuggestions(newSuggestions);
      } catch (error) {
        console.error('Error fetching suggestions:', error);
      }
    };

    const timeoutId = setTimeout(fetchSuggestions, 200);
    return () => clearTimeout(timeoutId);
  }, [query, recentSearches]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setQuery(e.target.value);
    setSelectedIndex(-1);
    setShowSuggestions(true);
  };

  const handleInputFocus = () => {
    setShowSuggestions(true);
  };

  const handleInputBlur = () => {
    // Delay hiding to allow clicking on suggestions
    setTimeout(() => setShowSuggestions(false), 200);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!showSuggestions || suggestions.length === 0) return;

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setSelectedIndex(prev => 
          prev < suggestions.length - 1 ? prev + 1 : prev
        );
        break;
      case 'ArrowUp':
        e.preventDefault();
        setSelectedIndex(prev => prev > 0 ? prev - 1 : -1);
        break;
      case 'Enter':
        e.preventDefault();
        if (selectedIndex >= 0) {
          handleSuggestionSelect(suggestions[selectedIndex]);
        } else if (query.trim()) {
          handleSearch(query);
        }
        break;
      case 'Escape':
        setShowSuggestions(false);
        setSelectedIndex(-1);
        break;
    }
  };

  const handleSuggestionSelect = (suggestion: SearchSuggestion) => {
    if (suggestion.type === 'institution') {
      onSelect?.(suggestion.data);
      setQuery(suggestion.label);
    } else if (suggestion.type === 'category') {
      setQuery(suggestion.label);
      onSearch?.(suggestion.label);
    } else if (suggestion.type === 'location') {
      setQuery(suggestion.data);
      onSearch?.(suggestion.data);
    } else if (suggestion.type === 'recent') {
      setQuery(suggestion.data);
      onSearch?.(suggestion.data);
    }

    saveToRecent(suggestion.label);
    setShowSuggestions(false);
    setSelectedIndex(-1);
  };

  const handleSearch = (searchQuery: string) => {
    if (!searchQuery.trim()) return;
    
    saveToRecent(searchQuery);
    onSearch?.(searchQuery);
    setShowSuggestions(false);
  };

  const saveToRecent = (searchTerm: string) => {
    const updated = [searchTerm, ...recentSearches.filter(s => s !== searchTerm)].slice(0, 5);
    setRecentSearches(updated);
    localStorage.setItem('camerpulse-typeahead-recent', JSON.stringify(updated));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    handleSearch(query);
  };

  return (
    <div className={`relative ${className}`}>
      <form onSubmit={handleSubmit}>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
          <Input
            ref={inputRef}
            value={query}
            onChange={handleInputChange}
            onFocus={handleInputFocus}
            onBlur={handleInputBlur}
            onKeyDown={handleKeyDown}
            placeholder={placeholder}
            className="pl-10 pr-4"
            autoComplete="off"
          />
        </div>
      </form>

      {/* Suggestions Dropdown */}
      {showSuggestions && suggestions.length > 0 && (
        <Card className="absolute top-full left-0 right-0 mt-1 z-50 max-h-96 overflow-y-auto shadow-lg">
          <CardContent className="p-0">
            {suggestions.map((suggestion, index) => (
              <div
                key={`${suggestion.type}-${index}`}
                className={`flex items-center gap-3 p-3 cursor-pointer border-b last:border-b-0 hover:bg-muted ${
                  selectedIndex === index ? 'bg-muted' : ''
                }`}
                onClick={() => handleSuggestionSelect(suggestion)}
              >
                <span className="text-lg flex-shrink-0">{suggestion.icon}</span>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="font-medium text-sm truncate">{suggestion.label}</span>
                    {suggestion.type === 'institution' && suggestion.data.is_verified && (
                      <Badge className="badge-verified text-xs">Verified</Badge>
                    )}
                    {suggestion.type === 'recent' && (
                      <Badge variant="outline" className="text-xs">Recent</Badge>
                    )}
                    {suggestion.type === 'category' && (
                      <Badge variant="secondary" className="text-xs">Category</Badge>
                    )}
                  </div>
                  {suggestion.subtitle && (
                    <p className="text-xs text-muted-foreground truncate mt-0.5">
                      {suggestion.subtitle}
                    </p>
                  )}
                </div>
                {suggestion.type === 'institution' && (
                  <MapPin className="h-3 w-3 text-muted-foreground flex-shrink-0" />
                )}
                {suggestion.type === 'recent' && (
                  <Clock className="h-3 w-3 text-muted-foreground flex-shrink-0" />
                )}
                {suggestion.type === 'category' && (
                  <TrendingUp className="h-3 w-3 text-muted-foreground flex-shrink-0" />
                )}
              </div>
            ))}
          </CardContent>
        </Card>
      )}
    </div>
  );
};