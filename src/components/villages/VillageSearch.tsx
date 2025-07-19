import React, { useState, useEffect } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Search, MapPin, Star, Filter, X } from 'lucide-react';
import { useSearchVillages } from '@/hooks/useVillages';
import { Village } from '@/hooks/useVillages';

interface VillageSearchProps {
  onVillageSelect?: (village: Village) => void;
  placeholder?: string;
  showFilters?: boolean;
}

export const VillageSearch: React.FC<VillageSearchProps> = ({
  onVillageSelect,
  placeholder = "Search villages, regions, or divisions...",
  showFilters = true
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedRegion, setSelectedRegion] = useState<string>('');
  const [isOpen, setIsOpen] = useState(false);
  const [debouncedSearch, setDebouncedSearch] = useState('');

  // Debounce search term
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchTerm);
    }, 300);

    return () => clearTimeout(timer);
  }, [searchTerm]);

  const { data: searchResults, isLoading } = useSearchVillages(debouncedSearch);

  const regions = [
    'Adamawa', 'Centre', 'East', 'Far North', 'Littoral', 
    'North', 'Northwest', 'South', 'Southwest', 'West'
  ];

  // Filter results by region if selected
  const filteredResults = selectedRegion 
    ? searchResults?.filter(village => village.region === selectedRegion)
    : searchResults;

  const handleVillageSelect = (village: Village) => {
    setSearchTerm(village.village_name);
    setIsOpen(false);
    onVillageSelect?.(village);
  };

  const clearFilters = () => {
    setSelectedRegion('');
    setSearchTerm('');
    setIsOpen(false);
  };

  return (
    <div className="relative w-full max-w-2xl mx-auto">
      {/* Search Input */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
        <Input
          type="text"
          placeholder={placeholder}
          value={searchTerm}
          onChange={(e) => {
            setSearchTerm(e.target.value);
            setIsOpen(true);
          }}
          onFocus={() => setIsOpen(true)}
          className="pl-12 pr-4 py-3 text-lg border-2 border-gray-200 focus:border-primary"
        />
        {(searchTerm || selectedRegion) && (
          <Button
            size="sm"
            variant="ghost"
            onClick={clearFilters}
            className="absolute right-2 top-1/2 transform -translate-y-1/2"
          >
            <X className="w-4 h-4" />
          </Button>
        )}
      </div>

      {/* Filters */}
      {showFilters && (
        <div className="flex flex-wrap gap-2 mt-3">
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-gray-500" />
            <span className="text-sm text-gray-600">Filter by region:</span>
          </div>
          {regions.map((region) => (
            <Button
              key={region}
              size="sm"
              variant={selectedRegion === region ? "default" : "outline"}
              onClick={() => {
                setSelectedRegion(selectedRegion === region ? '' : region);
                setIsOpen(true);
              }}
              className="text-xs"
            >
              {region}
            </Button>
          ))}
        </div>
      )}

      {/* Search Results Dropdown */}
      {isOpen && (searchTerm || selectedRegion) && (
        <Card className="absolute top-full left-0 right-0 mt-2 p-4 z-50 max-h-96 overflow-y-auto shadow-lg border-2">
          <div className="space-y-2">
            {isLoading ? (
              <div className="text-center py-4">
                <div className="animate-spin w-6 h-6 border-2 border-primary border-t-transparent rounded-full mx-auto"></div>
                <p className="text-sm text-gray-600 mt-2">Searching villages...</p>
              </div>
            ) : filteredResults && filteredResults.length > 0 ? (
              <>
                <div className="text-sm text-gray-600 mb-3">
                  Found {filteredResults.length} villages
                  {selectedRegion && ` in ${selectedRegion}`}
                </div>
                {filteredResults.map((village) => (
                  <div
                    key={village.id}
                    onClick={() => handleVillageSelect(village)}
                    className="p-3 hover:bg-gray-50 rounded-lg cursor-pointer border border-transparent hover:border-gray-200 transition-all"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <h4 className="font-semibold">{village.village_name}</h4>
                          {village.is_verified && (
                            <Badge variant="secondary" className="bg-green-100 text-green-800 text-xs">
                              ✓ Verified
                            </Badge>
                          )}
                        </div>
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                          <MapPin className="w-3 h-3" />
                          <span>{village.division}, {village.region}</span>
                          {village.population_estimate && (
                            <>
                              <span>•</span>
                              <span>{village.population_estimate.toLocaleString()} people</span>
                            </>
                          )}
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="flex items-center gap-1">
                          <Star className="w-4 h-4 text-yellow-500" />
                          <span className="font-medium">{village.overall_rating.toFixed(1)}</span>
                        </div>
                        <div className="text-xs text-gray-500">
                          {village.total_ratings_count} ratings
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </>
            ) : debouncedSearch ? (
              <div className="text-center py-8">
                <div className="text-gray-400 mb-2">
                  <Search className="w-8 h-8 mx-auto" />
                </div>
                <p className="text-gray-600">No villages found for "{debouncedSearch}"</p>
                <p className="text-sm text-gray-500 mt-1">
                  Try adjusting your search or browse by region
                </p>
              </div>
            ) : (
              <div className="text-center py-4">
                <p className="text-gray-600">Start typing to search villages...</p>
              </div>
            )}
          </div>
        </Card>
      )}

      {/* Click outside to close */}
      {isOpen && (
        <div 
          className="fixed inset-0 z-40" 
          onClick={() => setIsOpen(false)}
        />
      )}
    </div>
  );
};