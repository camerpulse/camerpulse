import React, { useState, useCallback, useMemo } from "react";
import { Search, User, Users } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { usePoliticalSearch, SearchResult } from "@/hooks/usePoliticalSearch";
import { useNavigate } from "react-router-dom";
import { URLBuilder } from "@/utils/slug";
import { PoliticalErrorBoundary } from "./ErrorBoundary";
import { SearchResultsSkeleton } from "./LoadingStates";
import { sanitizeSearchQuery } from "./PoliticalValidation";

export function PoliticalSearch() {
  const [query, setQuery] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const { data: results = [], isLoading, error } = usePoliticalSearch(query);
  const navigate = useNavigate();

  const handleInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const sanitizedQuery = sanitizeSearchQuery(e.target.value);
    setQuery(sanitizedQuery);
    setIsOpen(sanitizedQuery.length >= 2);
  }, []);

  const handleResultClick = useCallback((result: SearchResult) => {
    if (result.type === "politician") {
      navigate(URLBuilder.politicians.detail({ 
        name: result.name, 
        id: result.id, 
        slug: result.slug 
      }));
    } else if (result.type === "party") {
      // For now, navigate to politicians list until we have party routes
      navigate(`/political-parties/${result.slug || result.id}`);
    }
    setQuery("");
    setIsOpen(false);
  }, [navigate]);

  const getResultIcon = useCallback((type: string) => {
    return type === "politician" ? User : Users;
  }, []);

  const getPerformanceColor = useCallback((score?: number) => {
    if (!score) return "bg-muted";
    if (score >= 8) return "bg-success";
    if (score >= 6) return "bg-warning";
    return "bg-destructive";
  }, []);

  const debouncedResults = useMemo(() => {
    if (!query.trim() || query.length < 2) return [];
    return results;
  }, [query, results]);

  if (error) {
    return (
      <div className="w-full max-w-md">
        <Input
          placeholder="Search politicians, parties..."
          disabled
          className="pl-10"
        />
        <p className="text-xs text-destructive mt-1">Search unavailable</p>
      </div>
    );
  }

  return (
    <PoliticalErrorBoundary>
      <div className="relative w-full max-w-md">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
          <Input
            placeholder="Search politicians, parties..."
            value={query}
            onChange={handleInputChange}
            onFocus={() => setIsOpen(query.length >= 2)}
            onBlur={() => setTimeout(() => setIsOpen(false), 200)}
            className="pl-10"
            maxLength={100}
          />
        </div>

        {isOpen && (
          <Card className="absolute top-full mt-1 w-full max-h-96 overflow-y-auto z-50 bg-background border shadow-lg">
            {isLoading ? (
              <SearchResultsSkeleton />
            ) : debouncedResults.length === 0 ? (
              <div className="p-4 text-center text-muted-foreground">
                {query.length < 2 ? 'Type at least 2 characters' : 'No results found'}
              </div>
            ) : (
              <div className="p-2">
                {debouncedResults.slice(0, 10).map((result) => {
                const Icon = getResultIcon(result.type);
                return (
                  <div
                    key={`${result.type}-${result.id}`}
                    onClick={() => handleResultClick(result)}
                    className="flex items-center gap-3 p-3 rounded-lg hover:bg-accent cursor-pointer transition-colors"
                  >
                    <Avatar className="w-10 h-10">
                      <AvatarImage 
                        src={result.profile_image_url || result.logo_url} 
                        alt={result.name}
                      />
                      <AvatarFallback>
                        <Icon className="w-5 h-5" />
                      </AvatarFallback>
                    </Avatar>
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <p className="font-medium truncate">{result.name}</p>
                        <Badge variant="outline" className="text-xs">
                          {result.type}
                        </Badge>
                      </div>
                      
                      <div className="flex items-center gap-2 mt-1">
                        {result.role && (
                          <span className="text-sm text-muted-foreground">
                            {result.role}
                          </span>
                        )}
                        {result.region && (
                          <span className="text-sm text-muted-foreground">
                            • {result.region}
                          </span>
                        )}
                        {result.performance_score && (
                          <div className="flex items-center gap-1">
                            <div className={`w-2 h-2 rounded-full ${getPerformanceColor(result.performance_score)}`} />
                            <span className="text-xs text-muted-foreground">
                              {result.performance_score}/10
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                );
                })}
              </div>
            )}
          </Card>
        )}
      </div>
    </PoliticalErrorBoundary>
  );
}