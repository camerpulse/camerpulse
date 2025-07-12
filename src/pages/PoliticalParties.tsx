import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Header } from "@/components/Layout/Header";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Search, Users, MapPin, Calendar, Award, TrendingUp } from "lucide-react";
import { Link } from "react-router-dom";

interface PoliticalParty {
  id: string;
  name: string;
  acronym: string;
  logo_url?: string;
  founding_date?: string;
  headquarters_city?: string;
  headquarters_region?: string;
  party_president?: string;
  ideology?: string;
  political_leaning?: string;
  mission?: string;
  mps_count: number;
  senators_count: number;
  mayors_count: number;
  approval_rating: number;
  total_ratings: number;
}

const PoliticalParties = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [ideologyFilter, setIdeologyFilter] = useState("all");
  const [regionFilter, setRegionFilter] = useState("all");
  const [sortBy, setSortBy] = useState("approval_rating");

  const { data: parties, isLoading, error } = useQuery({
    queryKey: ["political-parties"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("political_parties")
        .select("*")
        .eq("is_active", true)
        .order("approval_rating", { ascending: false });

      if (error) throw error;
      return data as PoliticalParty[];
    },
  });

  const filteredParties = parties?.filter((party) => {
    const matchesSearch = 
      party.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      party.acronym?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      party.party_president?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesIdeology = ideologyFilter === "all" || party.political_leaning === ideologyFilter;
    const matchesRegion = regionFilter === "all" || party.headquarters_region === regionFilter;
    
    return matchesSearch && matchesIdeology && matchesRegion;
  });

  const sortedParties = filteredParties?.sort((a, b) => {
    switch (sortBy) {
      case "name":
        return a.name.localeCompare(b.name);
      case "founding_date":
        return new Date(b.founding_date || 0).getTime() - new Date(a.founding_date || 0).getTime();
      case "mps_count":
        return b.mps_count - a.mps_count;
      default:
        return b.approval_rating - a.approval_rating;
    }
  });

  const regions = Array.from(new Set(parties?.map(p => p.headquarters_region).filter(Boolean))) || [];
  const ideologies = Array.from(new Set(parties?.map(p => p.political_leaning).filter(Boolean))) || [];

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="container mx-auto px-4 py-8">
          <div className="text-center">Loading political parties...</div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="container mx-auto px-4 py-8">
          <div className="text-center text-destructive">Error loading political parties</div>
        </div>
      </div>
    );
  }

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
          <div className="mt-4 text-sm text-muted-foreground">
            Total Registered Parties: <span className="font-semibold">{parties?.length || 0}</span>
          </div>
        </div>

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
          {sortedParties?.map((party) => (
            <Link key={party.id} to={`/political-parties/${party.id}`}>
              <Card className="hover:shadow-lg transition-shadow cursor-pointer border-l-4 border-l-primary">
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
                      <span>{party.party_president}</span>
                    </div>
                  )}

                  {/* Location */}
                  <div className="flex items-center gap-2 text-sm">
                    <MapPin className="h-4 w-4 text-primary" />
                    <span>{party.headquarters_city}, {party.headquarters_region}</span>
                  </div>

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
                      {party.mps_count} MPs
                    </Badge>
                    <Badge variant="secondary" className="text-xs">
                      {party.senators_count} Senators
                    </Badge>
                    <Badge variant="secondary" className="text-xs">
                      {party.mayors_count} Mayors
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
                        Approval: {party.approval_rating.toFixed(1)}/5
                      </span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Award className="h-4 w-4 text-muted-foreground" />
                      <span className="text-xs text-muted-foreground">
                        {party.total_ratings} ratings
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>

        {sortedParties?.length === 0 && (
          <div className="text-center py-12">
            <p className="text-muted-foreground">No political parties found matching your criteria.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default PoliticalParties;