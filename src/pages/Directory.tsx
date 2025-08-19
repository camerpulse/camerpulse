import React, { useState, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Building, MapPin, Users, Star, Search, Filter, TrendingUp, AlertCircle } from 'lucide-react';

// Mock data for ministries
const mockMinistries = [
  {
    id: 'min-1',
    name: 'Ministry of Public Health',
    acronym: 'MINSANTE',
    minister: 'Dr. Manaouda Malachie',
    region: 'Centre',
    rating: 4.2,
    projects: 23,
    status: 'active',
    badges: ['Top Performing Ministry'],
    budget: '850B FCFA',
    lastUpdate: '2 days ago'
  },
  {
    id: 'min-2',
    name: 'Ministry of Education',
    acronym: 'MINEDUB',
    minister: 'Laurent Serge Etoundi Ngoa',
    region: 'Centre',
    rating: 3.8,
    projects: 45,
    status: 'active',
    badges: ['Most Active Council'],
    budget: '1.2T FCFA',
    lastUpdate: '1 day ago'
  },
  {
    id: 'min-3',
    name: 'Ministry of Transport',
    acronym: 'MINTRANS',
    minister: 'Jean Ernest Massena Ngalle Bibehe',
    region: 'Centre',
    rating: 3.2,
    projects: 18,
    status: 'under_audit',
    badges: ['Under Audit'],
    budget: '650B FCFA',
    lastUpdate: '5 days ago'
  },
  {
    id: 'min-4',
    name: 'Ministry of Agriculture',
    acronym: 'MINADER',
    minister: 'Gabriel Mbairobe',
    region: 'Centre',
    rating: 4.0,
    projects: 31,
    status: 'active',
    badges: [],
    budget: '920B FCFA',
    lastUpdate: '3 days ago'
  }
];

// Mock data for councils
const mockCouncils = [
  {
    id: 'council-1',
    name: 'Yaounde City Council',
    region: 'Centre',
    division: 'Mfoundi',
    mayor: 'Luc Messi Atangana',
    population: 3200000,
    rating: 4.1,
    projects: 15,
    status: 'active',
    badges: ['Most Active Council'],
    budget: '45B FCFA',
    lastUpdate: '1 day ago'
  },
  {
    id: 'council-2',
    name: 'Douala City Council',
    region: 'Littoral',
    division: 'Wouri',
    mayor: 'Roger Mbassa Ndine',
    population: 2800000,
    rating: 3.9,
    projects: 22,
    status: 'active',
    badges: [],
    budget: '52B FCFA',
    lastUpdate: '2 days ago'
  },
  {
    id: 'council-3',
    name: 'Bamenda City Council',
    region: 'Northwest',
    division: 'Mezam',
    mayor: 'Paul Achobang',
    population: 800000,
    rating: 3.4,
    projects: 8,
    status: 'flagged',
    badges: ['Flagged by Citizens'],
    budget: '18B FCFA',
    lastUpdate: '1 week ago'
  },
  {
    id: 'council-4',
    name: 'Bafoussam City Council',
    region: 'West',
    division: 'Mifi',
    mayor: 'Celestin Tawamba',
    population: 550000,
    rating: 4.3,
    projects: 12,
    status: 'active',
    badges: ['Top Performing Ministry'],
    budget: '22B FCFA',
    lastUpdate: '3 days ago'
  }
];

const Directory: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [regionFilter, setRegionFilter] = useState('all');
  const [sortBy, setSortBy] = useState('name');
  const [activeTab, setActiveTab] = useState('ministries');
  const navigate = useNavigate();

  const regions = ['Centre', 'Littoral', 'Northwest', 'West', 'North', 'Far North', 'East', 'South', 'Southwest', 'Adamawa'];

  const filteredMinistries = useMemo(() => {
    let filtered = mockMinistries.filter(ministry => {
      const matchesSearch = ministry.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           ministry.acronym.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           ministry.minister.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesRegion = regionFilter === 'all' || ministry.region === regionFilter;
      return matchesSearch && matchesRegion;
    });

    return filtered.sort((a, b) => {
      switch (sortBy) {
        case 'rating':
          return b.rating - a.rating;
        case 'projects':
          return b.projects - a.projects;
        case 'recent':
          return new Date(b.lastUpdate).getTime() - new Date(a.lastUpdate).getTime();
        default:
          return a.name.localeCompare(b.name);
      }
    });
  }, [searchTerm, regionFilter, sortBy]);

  const filteredCouncils = useMemo(() => {
    let filtered = mockCouncils.filter(council => {
      const matchesSearch = council.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           council.mayor.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           council.division.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesRegion = regionFilter === 'all' || council.region === regionFilter;
      return matchesSearch && matchesRegion;
    });

    return filtered.sort((a, b) => {
      switch (sortBy) {
        case 'rating':
          return b.rating - a.rating;
        case 'projects':
          return b.projects - a.projects;
        case 'recent':
          return new Date(b.lastUpdate).getTime() - new Date(a.lastUpdate).getTime();
        default:
          return a.name.localeCompare(b.name);
      }
    });
  }, [searchTerm, regionFilter, sortBy]);

  const getBadgeColor = (badge: string) => {
    switch (badge) {
      case 'Top Performing Ministry':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'Most Active Council':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'Under Audit':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'Flagged by Citizens':
        return 'bg-red-100 text-red-800 border-red-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'under_audit':
        return <AlertCircle className="h-4 w-4 text-yellow-500" />;
      case 'flagged':
        return <AlertCircle className="h-4 w-4 text-red-500" />;
      default:
        return <TrendingUp className="h-4 w-4 text-green-500" />;
    }
  };

  const renderMinistryCard = (ministry: any) => (
    <Card key={ministry.id} className="hover:shadow-lg transition-shadow cursor-pointer animate-fade-in">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <CardTitle className="text-lg font-semibold text-foreground">
              {ministry.name}
            </CardTitle>
            <p className="text-sm text-muted-foreground font-medium">{ministry.acronym}</p>
            <p className="text-sm text-muted-foreground mt-1">Minister: {ministry.minister}</p>
          </div>
          <div className="flex items-center gap-2">
            {getStatusIcon(ministry.status)}
            <div className="flex items-center gap-1">
              <Star className="h-4 w-4 text-yellow-500 fill-current" />
              <span className="text-sm font-medium">{ministry.rating}</span>
            </div>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Active Projects</span>
            <span className="font-medium">{ministry.projects}</span>
          </div>
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Budget</span>
            <span className="font-medium">{ministry.budget}</span>
          </div>
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Last Update</span>
            <span className="font-medium">{ministry.lastUpdate}</span>
          </div>
          
          {ministry.badges.length > 0 && (
            <div className="flex flex-wrap gap-2 pt-2">
              {ministry.badges.map((badge: string, index: number) => (
                <Badge key={index} className={getBadgeColor(badge)}>
                  {badge}
                </Badge>
              ))}
            </div>
          )}
          
          <div className="flex gap-2 pt-2">
            <Button 
              size="sm" 
              onClick={() => navigate(`/directory/ministry/${ministry.id}`)}
              className="flex-1"
            >
              View Profile
            </Button>
            <Button size="sm" variant="outline" className="flex-1">
              Rate & Review
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );

  const renderCouncilCard = (council: any) => (
    <Card key={council.id} className="hover:shadow-lg transition-shadow cursor-pointer animate-fade-in">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <CardTitle className="text-lg font-semibold text-foreground">
              {council.name}
            </CardTitle>
            <p className="text-sm text-muted-foreground font-medium">{council.region} Region, {council.division} Division</p>
            <p className="text-sm text-muted-foreground mt-1">Mayor: {council.mayor}</p>
          </div>
          <div className="flex items-center gap-2">
            {getStatusIcon(council.status)}
            <div className="flex items-center gap-1">
              <Star className="h-4 w-4 text-yellow-500 fill-current" />
              <span className="text-sm font-medium">{council.rating}</span>
            </div>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Population</span>
            <span className="font-medium">{council.population.toLocaleString()}</span>
          </div>
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Active Projects</span>
            <span className="font-medium">{council.projects}</span>
          </div>
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Budget</span>
            <span className="font-medium">{council.budget}</span>
          </div>
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Last Update</span>
            <span className="font-medium">{council.lastUpdate}</span>
          </div>
          
          {council.badges.length > 0 && (
            <div className="flex flex-wrap gap-2 pt-2">
              {council.badges.map((badge: string, index: number) => (
                <Badge key={index} className={getBadgeColor(badge)}>
                  {badge}
                </Badge>
              ))}
            </div>
          )}
          
          <div className="flex gap-2 pt-2">
            <Button 
              size="sm" 
              onClick={() => navigate(`/directory/council/${council.id}`)}
              className="flex-1"
            >
              View Profile
            </Button>
            <Button size="sm" variant="outline" className="flex-1">
              Rate & Review
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );

  return (
    <div className="container mx-auto py-8 px-4 max-w-7xl">
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-4">
          <Building className="h-8 w-8 text-primary" />
          <div>
            <h1 className="text-3xl font-bold text-foreground">Government Directory</h1>
            <p className="text-muted-foreground">Browse ministries, councils, and government entities</p>
          </div>
        </div>

        {/* Search and Filters */}
        <div className="flex flex-col sm:flex-row gap-4 mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search ministries, councils, officials..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          <Select value={regionFilter} onValueChange={setRegionFilter}>
            <SelectTrigger className="w-48">
              <SelectValue placeholder="Filter by region" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Regions</SelectItem>
              {regions.map(region => (
                <SelectItem key={region} value={region}>{region}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={sortBy} onValueChange={setSortBy}>
            <SelectTrigger className="w-48">
              <SelectValue placeholder="Sort by" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="name">Name A-Z</SelectItem>
              <SelectItem value="rating">Highest Rated</SelectItem>
              <SelectItem value="projects">Most Projects</SelectItem>
              <SelectItem value="recent">Recent Activity</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="ministries" className="flex items-center gap-2">
            <Building className="h-4 w-4" />
            Ministries ({filteredMinistries.length})
          </TabsTrigger>
          <TabsTrigger value="councils" className="flex items-center gap-2">
            <MapPin className="h-4 w-4" />
            Councils ({filteredCouncils.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="ministries" className="mt-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredMinistries.map(renderMinistryCard)}
          </div>
          {filteredMinistries.length === 0 && (
            <div className="text-center py-12">
              <Building className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-medium text-foreground mb-2">No ministries found</h3>
              <p className="text-muted-foreground">Try adjusting your search or filter criteria</p>
            </div>
          )}
        </TabsContent>

        <TabsContent value="councils" className="mt-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredCouncils.map(renderCouncilCard)}
          </div>
          {filteredCouncils.length === 0 && (
            <div className="text-center py-12">
              <MapPin className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-medium text-foreground mb-2">No councils found</h3>
              <p className="text-muted-foreground">Try adjusting your search or filter criteria</p>
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Directory;