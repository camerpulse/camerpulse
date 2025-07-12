import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Header } from "@/components/Layout/Header";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Search, Users, MapPin, Calendar, Award, TrendingUp, AlertCircle } from "lucide-react";
import { Link } from "react-router-dom";

interface PoliticalParty {
  id: string;
  name: string;
  acronym: string | null;
  logo_url: string | null;
  founding_date: string | null;
  headquarters_city: string | null;
  headquarters_region: string | null;
  party_president: string | null;
  ideology: string | null;
  political_leaning: string | null;
  mission: string | null;
  mps_count: number;
  senators_count: number;
  mayors_count: number;
  approval_rating: number;
  total_ratings: number;
  is_active: boolean;
}

const PoliticalParties = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [ideologyFilter, setIdeologyFilter] = useState("all");
  const [regionFilter, setRegionFilter] = useState("all");
  const [sortBy, setSortBy] = useState("approval_rating");

  const { data: parties, isLoading, error, isError } = useQuery({
    queryKey: ["political-parties"],
    queryFn: async () => {
      console.log("Fetching political parties...");
      const { data, error } = await supabase
        .from("political_parties")
        .select(`
          id,
          name,
          acronym,
          logo_url,
          founding_date,
          headquarters_city,
          headquarters_region,
          party_president,
          ideology,
          political_leaning,
          mission,
          mps_count,
          senators_count,
          mayors_count,
          approval_rating,
          total_ratings,
          is_active
        `)
        .eq("is_active", true)
        .order("name", { ascending: true });

      if (error) {
        console.error("Error fetching parties:", error);
        throw error;
      }
      
      console.log("Fetched parties:", data);
      return data as PoliticalParty[];
    },
    retry: 3,
    retryDelay: 1000,
  });

  // Filter and sort parties
  const filteredParties = parties?.filter((party) => {
    if (!party) return false;
    
    const matchesSearch = searchTerm === "" || 
      party.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      party.acronym?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      party.party_president?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesIdeology = ideologyFilter === "all" || party.political_leaning === ideologyFilter;
    const matchesRegion = regionFilter === "all" || party.headquarters_region === regionFilter;
    
    return matchesSearch && matchesIdeology && matchesRegion;
  }) || [];

  const sortedParties = [...filteredParties].sort((a, b) => {
    switch (sortBy) {
      case "name":
        return a.name.localeCompare(b.name);
      case "founding_date":
        const dateA = a.founding_date ? new Date(a.founding_date) : new Date(0);
        const dateB = b.founding_date ? new Date(b.founding_date) : new Date(0);
        return dateB.getTime() - dateA.getTime();
      case "mps_count":
        return (b.mps_count || 0) - (a.mps_count || 0);
      default:
        return (b.approval_rating || 0) - (a.approval_rating || 0);
    }
  });

  // Get unique values for filters
  const regions = Array.from(new Set(parties?.map(p => p.headquarters_region).filter(Boolean))) || [];
  const ideologies = Array.from(new Set(parties?.map(p => p.political_leaning).filter(Boolean))) || [];

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <div className="container mx-auto px-4 py-8">
        {/* Page Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-primary mb-4">
            Political Parties of Cameroon
          </h1>
          <p className="text-muted-foreground text-lg max-w-3xl mx-auto">
            Comprehensive directory of all registered political parties in Cameroon. 
            Explore their leadership, ideology, performance, and citizen ratings.
          </p>
          {parties && (
            <div className="mt-4 text-sm text-muted-foreground">
              Total Registered Parties: <span className="font-semibold">{parties.length}</span>
            </div>
          )}
        </div>

        {/* Error State */}
        {isError && (
          <Alert variant="destructive" className="mb-8">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              {error?.message || "Failed to load political parties. Please try again."}
            </AlertDescription>
          </Alert>
        )}

        {/* Loading State */}
        {isLoading && (
          <div className="space-y-6">
            <div className="bg-card rounded-lg p-6 border">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {Array.from({ length: 4 }).map((_, i) => (
                  <Skeleton key={i} className="h-10 w-full" />
                ))}
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {Array.from({ length: 6 }).map((_, i) => (
                <Card key={i}>
                  <CardHeader>
                    <Skeleton className="h-6 w-3/4" />
                    <Skeleton className="h-4 w-1/2" />
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <Skeleton className="h-4 w-full" />
                      <Skeleton className="h-4 w-2/3" />
                      <div className="flex gap-2">
                        <Skeleton className="h-6 w-16" />
                        <Skeleton className="h-6 w-16" />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}

        {/* Main Content */}
        {!isLoading && !isError && parties && (
          <>
            {/* Search and Filters */}
            <div className="bg-card rounded-lg p-6 mb-8 shadow-sm border">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="relative">
                  <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search parties, leaders..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
                
                <Select value={ideologyFilter} onValueChange={setIdeologyFilter}>
                  <SelectTrigger>
                    <SelectValue placeholder="Filter by ideology" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Ideologies</SelectItem>
                    {ideologies.map((ideology) => (
                      <SelectItem key={ideology} value={ideology}>{ideology}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <Select value={regionFilter} onValueChange={setRegionFilter}>
                  <SelectTrigger>
                    <SelectValue placeholder="Filter by region" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Regions</SelectItem>
                    {regions.map((region) => (
                      <SelectItem key={region} value={region}>{region}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <Select value={sortBy} onValueChange={setSortBy}>
                  <SelectTrigger>
                    <SelectValue placeholder="Sort by" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="approval_rating">Approval Rating</SelectItem>
                    <SelectItem value="name">Name (A-Z)</SelectItem>
                    <SelectItem value="founding_date">Newest First</SelectItem>
                    <SelectItem value="mps_count">MPs Count</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Parties Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {sortedParties.map((party) => (
                <Link key={party.id} to={`/political-parties/${party.id}`}>
                  <Card className="hover:shadow-lg transition-shadow cursor-pointer border-l-4 border-l-primary h-full">
                    <CardHeader className="pb-3">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <CardTitle className="text-lg font-bold text-primary">
                            {party.acronym || party.name}
                          </CardTitle>
                          <p className="text-sm text-muted-foreground font-medium">
                            {party.name}
                          </p>
                        </div>
                        {party.logo_url && (
                          <img 
                            src={party.logo_url} 
                            alt={`${party.name} logo`}
                            className="w-12 h-12 rounded-lg object-cover"
                          />
                        )}
                      </div>
                    </CardHeader>
                    
                    <CardContent className="space-y-3">
                      {/* Leadership */}
                      {party.party_president && (
                        <div className="flex items-center gap-2 text-sm">
                          <Users className="h-4 w-4 text-primary" />
                          <span className="font-medium">President:</span>
                          <span className="truncate">{party.party_president}</span>
                        </div>
                      )}

                      {/* Location */}
                      {(party.headquarters_city || party.headquarters_region) && (
                        <div className="flex items-center gap-2 text-sm">
                          <MapPin className="h-4 w-4 text-primary" />
                          <span className="truncate">
                            {[party.headquarters_city, party.headquarters_region].filter(Boolean).join(", ")}
                          </span>
                        </div>
                      )}

                      {/* Founding Date */}
                      {party.founding_date && (
                        <div className="flex items-center gap-2 text-sm">
                          <Calendar className="h-4 w-4 text-primary" />
                          <span>Founded: {new Date(party.founding_date).getFullYear()}</span>
                        </div>
                      )}

                      {/* Political Stats */}
                      <div className="flex gap-2 flex-wrap">
                        <Badge variant="secondary" className="text-xs">
                          {party.mps_count || 0} MPs
                        </Badge>
                        <Badge variant="secondary" className="text-xs">
                          {party.senators_count || 0} Senators
                        </Badge>
                        <Badge variant="secondary" className="text-xs">
                          {party.mayors_count || 0} Mayors
                        </Badge>
                      </div>

                      {/* Ideology Badge */}
                      {party.political_leaning && (
                        <Badge variant="outline" className="w-fit">
                          {party.political_leaning}
                        </Badge>
                      )}

                      {/* Approval Rating */}
                      <div className="flex items-center justify-between pt-2">
                        <div className="flex items-center gap-2">
                          <TrendingUp className="h-4 w-4 text-primary" />
                          <span className="text-sm font-medium">
                            Approval: {(party.approval_rating || 0).toFixed(1)}/5
                          </span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Award className="h-4 w-4 text-muted-foreground" />
                          <span className="text-xs text-muted-foreground">
                            {party.total_ratings || 0} ratings
                          </span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>

            {/* No Results */}
            {sortedParties.length === 0 && (
              <div className="text-center py-12">
                <p className="text-muted-foreground">No political parties found matching your criteria.</p>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default PoliticalParties;