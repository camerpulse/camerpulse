import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  MapPin, 
  Users, 
  Search, 
  Plus,
  Home,
  Heart,
  TreePine,
  Mountain
} from 'lucide-react';

export function VillagesPage() {
  const featuredVillages = [
    {
      name: "Douala",
      region: "Littoral",
      population: "2.9M",
      type: "Urban Center",
      heritage: "Economic Capital",
      image: "🏙️"
    },
    {
      name: "Yaoundé", 
      region: "Centre",
      population: "4.1M",
      type: "Capital City",
      heritage: "Political Center",
      image: "🏛️"
    },
    {
      name: "Bafoussam",
      region: "West", 
      population: "347K",
      type: "Regional Capital",
      heritage: "Agricultural Hub",
      image: "🌾"
    },
    {
      name: "Bamenda",
      region: "Northwest",
      population: "2.1M",
      type: "Regional Capital", 
      heritage: "Mountain Heritage",
      image: "⛰️"
    }
  ];

  const regions = [
    { name: "Adamawa", villages: 250, icon: Mountain },
    { name: "Centre", villages: 890, icon: Home },
    { name: "East", villages: 340, icon: TreePine },
    { name: "Far North", villages: 1200, icon: Users },
    { name: "Littoral", villages: 150, icon: Heart },
    { name: "North", villages: 670, icon: Mountain },
    { name: "Northwest", villages: 950, icon: TreePine },
    { name: "South", villages: 420, icon: Home },
    { name: "Southwest", villages: 380, icon: Heart },
    { name: "West", villages: 780, icon: Users }
  ];

  return (
    <div className="container mx-auto px-4 py-8 max-w-7xl">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-4">
          <MapPin className="h-8 w-8 text-primary" />
          <h1 className="text-3xl font-bold text-foreground">Villages & Communities</h1>
        </div>
        <p className="text-lg text-muted-foreground max-w-3xl">
          Discover your ancestral heritage and connect with communities across Cameroon. 
          Explore our comprehensive database of villages, towns, and cities.
        </p>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <Button size="lg" className="h-14 justify-start">
          <Search className="h-5 w-5 mr-3" />
          Find Your Village
        </Button>
        <Button size="lg" variant="outline" className="h-14 justify-start">
          <Plus className="h-5 w-5 mr-3" />
          Add Village Info
        </Button>
        <Button size="lg" variant="outline" className="h-14 justify-start">
          <Heart className="h-5 w-5 mr-3" />
          Heritage Stories
        </Button>
      </div>

      {/* Featured Villages */}
      <div className="mb-12">
        <h2 className="text-2xl font-bold mb-6 text-foreground">Featured Communities</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {featuredVillages.map((village, index) => (
            <Card key={index} className="hover:shadow-lg transition-shadow cursor-pointer">
              <CardHeader className="text-center pb-4">
                <div className="text-4xl mb-3">{village.image}</div>
                <CardTitle className="text-lg">{village.name}</CardTitle>
                <Badge variant="secondary">{village.region} Region</Badge>
              </CardHeader>
              <CardContent className="text-center space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Population:</span>
                  <span className="font-medium">{village.population}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Type:</span>
                  <span className="font-medium">{village.type}</span>
                </div>
                <p className="text-xs text-muted-foreground mt-3">{village.heritage}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Regions Overview */}
      <div className="mb-12">
        <h2 className="text-2xl font-bold mb-6 text-foreground">Explore by Region</h2>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
          {regions.map((region, index) => (
            <Card key={index} className="hover:shadow-md transition-shadow cursor-pointer">
              <CardContent className="p-4 text-center">
                <region.icon className="h-8 w-8 text-primary mx-auto mb-3" />
                <h3 className="font-semibold text-sm mb-1">{region.name}</h3>
                <p className="text-xs text-muted-foreground">{region.villages} communities</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Call to Action */}
      <Card className="bg-gradient-to-r from-primary/10 to-secondary/10 border-primary/20">
        <CardContent className="p-8 text-center">
          <h3 className="text-2xl font-bold mb-4 text-foreground">Connect with Your Roots</h3>
          <p className="text-muted-foreground mb-6 max-w-2xl mx-auto">
            Every Cameroonian has a village story. Help us build the most comprehensive 
            heritage database by sharing your community's history and culture.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg">
              <Users className="h-5 w-5 mr-2" />
              Share Your Story
            </Button>
            <Button size="lg" variant="outline">
              <MapPin className="h-5 w-5 mr-2" />
              Browse All Villages
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}