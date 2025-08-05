import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Search, 
  Plus, 
  TrendingUp, 
  Clock, 
  Users, 
  Target,
  Filter
} from 'lucide-react';
import { URLBuilder } from '@/utils/slugUtils';

/**
 * Petitions listing page with search, filtering, and categories
 */
const PetitionsPage: React.FC = () => {
  const mockPetitions = [
    {
      id: '1',
      title: 'Improve Public Healthcare Access in Rural Areas',
      description: 'Petition to establish more healthcare facilities in remote villages across Cameroon.',
      signatures: 15420,
      target: 25000,
      category: 'Healthcare',
      status: 'Active',
      timeLeft: '15 days',
      location: 'National'
    },
    {
      id: '2',
      title: 'Better Road Infrastructure for Northern Regions',
      description: 'Calling for improved road networks to connect rural communities.',
      signatures: 8750,
      target: 15000,
      category: 'Infrastructure',
      status: 'Active',
      timeLeft: '8 days',
      location: 'North Region'
    },
    {
      id: '3',
      title: 'Education Funding Reform',
      description: 'Increase budget allocation for primary and secondary education.',
      signatures: 22100,
      target: 20000,
      category: 'Education',
      status: 'Successful',
      timeLeft: 'Completed',
      location: 'National'
    }
  ];

  return (
    <div className="container mx-auto px-4 py-6 space-y-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-bold">Petitions</h1>
          <p className="text-muted-foreground">
            Make your voice heard on issues that matter to your community
          </p>
        </div>
        <Button>
          <Plus className="w-4 h-4 mr-2" />
          Start a Petition
        </Button>
      </div>

      {/* Quick Stats */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Petitions</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">156</div>
            <p className="text-xs text-muted-foreground">
              +12 from last month
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Signatures</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">284K</div>
            <p className="text-xs text-muted-foreground">
              +18K from last month
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Successful</CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">42</div>
            <p className="text-xs text-muted-foreground">
              +3 from last month
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Search and Filters */}
      <Card>
        <CardHeader>
          <CardTitle>Find Petitions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col gap-4 md:flex-row">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input placeholder="Search petitions..." className="pl-10" />
              </div>
            </div>
            <div className="flex gap-2">
              <Select>
                <SelectTrigger className="w-[140px]">
                  <SelectValue placeholder="Category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Categories</SelectItem>
                  <SelectItem value="healthcare">Healthcare</SelectItem>
                  <SelectItem value="education">Education</SelectItem>
                  <SelectItem value="infrastructure">Infrastructure</SelectItem>
                  <SelectItem value="environment">Environment</SelectItem>
                </SelectContent>
              </Select>
              <Select>
                <SelectTrigger className="w-[120px]">
                  <SelectValue placeholder="Location" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Regions</SelectItem>
                  <SelectItem value="national">National</SelectItem>
                  <SelectItem value="centre">Centre</SelectItem>
                  <SelectItem value="north">North</SelectItem>
                  <SelectItem value="south">South</SelectItem>
                </SelectContent>
              </Select>
              <Button variant="outline" size="icon">
                <Filter className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Petitions Tabs */}
      <Tabs defaultValue="active" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="active">Active</TabsTrigger>
          <TabsTrigger value="trending">Trending</TabsTrigger>
          <TabsTrigger value="successful">Successful</TabsTrigger>
          <TabsTrigger value="recent">Recent</TabsTrigger>
        </TabsList>

        <TabsContent value="active" className="space-y-4">
          <div className="grid gap-4">
            {mockPetitions.map((petition) => (
              <Card key={petition.id} className="hover:shadow-md transition-shadow cursor-pointer">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <CardTitle className="text-lg mb-2">{petition.title}</CardTitle>
                      <CardDescription className="text-sm">
                        {petition.description}
                      </CardDescription>
                    </div>
                    <div className="flex flex-col items-end gap-2">
                      <Badge variant={petition.status === 'Successful' ? 'default' : 'secondary'}>
                        {petition.status}
                      </Badge>
                      <Badge variant="outline">{petition.category}</Badge>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div>
                      <div className="flex justify-between text-sm mb-2">
                        <span>{petition.signatures.toLocaleString()} signatures</span>
                        <span>{petition.target.toLocaleString()} target</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div 
                          className="bg-primary h-2 rounded-full" 
                          style={{ width: `${(petition.signatures / petition.target) * 100}%` }}
                        ></div>
                      </div>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4 text-sm text-muted-foreground">
                        <div className="flex items-center gap-1">
                          <Clock className="w-4 h-4" />
                          {petition.timeLeft}
                        </div>
                        <div className="flex items-center gap-1">
                          <Target className="w-4 h-4" />
                          {petition.location}
                        </div>
                      </div>
                      <Button size="sm">
                        Sign Petition
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="trending" className="space-y-4">
          <p className="text-muted-foreground">Trending petitions will be displayed here...</p>
        </TabsContent>

        <TabsContent value="successful" className="space-y-4">
          <p className="text-muted-foreground">Successful petitions will be displayed here...</p>
        </TabsContent>

        <TabsContent value="recent" className="space-y-4">
          <p className="text-muted-foreground">Recent petitions will be displayed here...</p>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default PetitionsPage;