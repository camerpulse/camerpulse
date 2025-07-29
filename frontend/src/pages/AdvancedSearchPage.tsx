import React, { useState } from 'react';
import { EnhancedSearch } from '@/components/search/EnhancedSearch';
import { SearchResults } from '@/components/search/SearchResults';
import { useEnhancedSearch } from '@/hooks/useEnhancedSearch';

interface SearchFilters {
  region?: string;
  tags?: string[];
  minRating?: number;
  sortBy?: string;
}

export const AdvancedSearchPage = () => {
  const { trackResultClick } = useEnhancedSearch();
  const [results, setResults] = useState<any[]>([]);
  const [filters, setFilters] = useState<SearchFilters>({});
  const [query, setQuery] = useState('');

  const handleResultsChange = (newResults: any[]) => {
    setResults(newResults);
  };

  const handleFiltersChange = (newFilters: SearchFilters) => {
    setFilters(newFilters);
  };

  const handleResultClick = (result: any) => {
    trackResultClick(result.id, 'village');
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <div className="relative bg-gradient-civic py-16 text-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold mb-4">Advanced Village Search</h1>
            <p className="text-xl opacity-90">
              Discover villages across Cameroon with powerful search and filtering
            </p>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        {/* Enhanced Search Component */}
        <div className="mb-8">
          <EnhancedSearch
            onResultsChange={handleResultsChange}
            onFiltersChange={handleFiltersChange}
          />
        </div>

        {/* Search Results */}
        <SearchResults
          results={results}
          loading={false}
          query={query}
          onResultClick={handleResultClick}
        />
      </div>
    </div>
  );
};