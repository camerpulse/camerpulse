import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Search, MapPin, Filter, Grid } from 'lucide-react';
import { Link } from 'react-router-dom';

const VillagesSearchPage = () => {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="text-center mb-8">
        <h1 className="text-4xl font-bold mb-4">🔍 Search Villages</h1>
        <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
          Find villages across Cameroon by name, region, or characteristics. Discover your roots and connect with communities.
        </p>
      </div>

      <div className="max-w-4xl mx-auto">
        {/* Search Interface */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Search className="h-5 w-5" />
              Village Search
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex gap-4">
              <div className="flex-1">
                <Input 
                  placeholder="Enter village name..." 
                  className="w-full"
                />
              </div>
              <Button>
                <Search className="h-4 w-4 mr-2" />
                Search
              </Button>
            </div>
            
            <div className="grid md:grid-cols-3 gap-4">
              <div>
                <label className="text-sm font-medium mb-2 block">Region</label>
                <select className="w-full p-2 border rounded-md">
                  <option value="">All Regions</option>
                  <option value="centre">Centre</option>
                  <option value="littoral">Littoral</option>
                  <option value="west">West</option>
                  <option value="northwest">Northwest</option>
                  <option value="southwest">Southwest</option>
                  <option value="north">North</option>
                  <option value="adamawa">Adamawa</option>
                  <option value="east">East</option>
                  <option value="south">South</option>
                  <option value="far-north">Far North</option>
                </select>
              </div>
              
              <div>
                <label className="text-sm font-medium mb-2 block">Population</label>
                <select className="w-full p-2 border rounded-md">
                  <option value="">Any Size</option>
                  <option value="small">Small (&lt; 1,000)</option>
                  <option value="medium">Medium (1,000 - 5,000)</option>
                  <option value="large">Large (&gt; 5,000)</option>
                </select>
              </div>
              
              <div>
                <label className="text-sm font-medium mb-2 block">Language</label>
                <select className="w-full p-2 border rounded-md">
                  <option value="">All Languages</option>
                  <option value="french">French</option>
                  <option value="english">English</option>
                  <option value="fulfulde">Fulfulde</option>
                  <option value="ewondo">Ewondo</option>
                  <option value="duala">Duala</option>
                </select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Quick Stats */}
        <div className="grid md:grid-cols-3 gap-6 mb-8">
          <Card>
            <CardContent className="p-6 text-center">
              <MapPin className="h-8 w-8 mx-auto mb-3 text-primary" />
              <div className="text-2xl font-bold mb-1">13,287</div>
              <div className="text-sm text-muted-foreground">Total Villages</div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6 text-center">
              <Grid className="h-8 w-8 mx-auto mb-3 text-green-500" />
              <div className="text-2xl font-bold mb-1">2,456</div>
              <div className="text-sm text-muted-foreground">Searchable Profiles</div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6 text-center">
              <Filter className="h-8 w-8 mx-auto mb-3 text-blue-500" />
              <div className="text-2xl font-bold mb-1">10</div>
              <div className="text-sm text-muted-foreground">Regions Covered</div>
            </CardContent>
          </Card>
        </div>

        {/* Search Results Placeholder */}
        <Card>
          <CardHeader>
            <CardTitle>Search Results</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-center py-12">
              <Search className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
              <h3 className="text-lg font-semibold mb-2">Start Your Search</h3>
              <p className="text-muted-foreground mb-6">
                Enter a village name or use the filters above to find communities across Cameroon.
              </p>
              <div className="text-sm text-muted-foreground">
                Popular searches: Bamenda, Douala, Yaoundé, Bafoussam, Garoua
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="text-center mt-8">
          <p className="text-muted-foreground mb-4">
            Can't find your village? Help us expand our database.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button asChild>
              <Link to="/auth">Add Your Village</Link>
            </Button>
            <Button asChild variant="outline">
              <Link to="/villages">Browse All Villages</Link>
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VillagesSearchPage;