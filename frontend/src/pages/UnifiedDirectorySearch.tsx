import { useState } from 'react';
import { Search, MapPin, Filter, Compass, TrendingUp } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { SearchAndRecommend } from '@/components/directory/SearchAndRecommend';

const UnifiedDirectorySearch = () => {
  const [activeFilter, setActiveFilter] = useState<string>('all');

  const quickFilters = [
    { id: 'all', label: 'All Services', icon: '🏢', count: '2,847' },
    { id: 'schools', label: 'Schools', icon: '🏫', count: '1,243', color: 'directory-school' },
    { id: 'hospitals', label: 'Hospitals', icon: '🏥', count: '456', color: 'directory-hospital' },
    { id: 'pharmacies', label: 'Pharmacies', icon: '💊', count: '789', color: 'directory-pharmacy' },
    { id: 'villages', label: 'Villages', icon: '🏘️', count: '359', color: 'directory-village' },
  ];

  const featuredCategories = [
    {
      title: "Top Rated Schools",
      description: "Excellence in education across Cameroon",
      icon: "🏫",
      gradient: "gradient-directory-schools",
      link: "/schools"
    },
    {
      title: "Emergency Hospitals",
      description: "24/7 medical care when you need it most",
      icon: "🏥",
      gradient: "gradient-directory-hospitals",
      link: "/hospitals"
    },
    {
      title: "Licensed Pharmacies",
      description: "Verified medicine and healthcare products",
      icon: "💊",
      gradient: "gradient-directory-pharmacies",
      link: "/pharmacies"
    },
    {
      title: "Heritage Villages",
      description: "Discover Cameroon's cultural treasures",
      icon: "🏘️",
      gradient: "gradient-directory-villages",
      link: "/villages"
    }
  ];

  const trendingSearches = [
    "International schools in Douala",
    "24/7 pharmacies near me",
    "Best hospitals in Yaoundé",
    "Villages in Northwest Region",
    "Private schools Limbe",
    "Emergency clinics Bamenda"
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <div className="bg-gradient-civic py-16">
        <div className="container mx-auto px-4">
          <div className="text-center max-w-4xl mx-auto">
            <h1 className="text-4xl md:text-6xl font-bold text-white mb-6">
              Find Everything You Need
            </h1>
            <p className="text-xl text-white/90 mb-8">
              Discover schools, hospitals, pharmacies, and villages across Cameroon
            </p>
            
            {/* Quick Filter Buttons */}
            <div className="flex flex-wrap justify-center gap-3 mb-8">
              {quickFilters.map((filter) => (
                <Button
                  key={filter.id}
                  variant={activeFilter === filter.id ? "secondary" : "outline"}
                  className={`h-12 px-6 ${
                    activeFilter === filter.id 
                      ? 'bg-white text-primary shadow-lg' 
                      : 'bg-white/10 border-white/20 text-white hover:bg-white/20'
                  }`}
                  onClick={() => setActiveFilter(filter.id)}
                >
                  <span className="text-lg mr-2">{filter.icon}</span>
                  {filter.label}
                  <Badge 
                    variant="secondary" 
                    className="ml-2 bg-white/20 text-white border-0"
                  >
                    {filter.count}
                  </Badge>
                </Button>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        {/* Main Search Component */}
        <div className="mb-12">
          <SearchAndRecommend />
        </div>

        {/* Featured Categories */}
        <div className="mb-12">
          <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
            <Compass className="h-6 w-6" />
            Explore by Category
          </h2>
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            {featuredCategories.map((category, index) => (
              <Card key={index} className="directory-card overflow-hidden">
                <div className={`h-32 bg-${category.gradient} flex items-center justify-center`}>
                  <span className="text-4xl">{category.icon}</span>
                </div>
                <CardContent className="p-4">
                  <h3 className="font-semibold mb-2">{category.title}</h3>
                  <p className="text-sm text-muted-foreground mb-4">{category.description}</p>
                  <Button variant="outline" size="sm" className="w-full">
                    Explore
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Trending Searches */}
        <div className="mb-12">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5" />
                Trending Searches
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-2">
                {trendingSearches.map((search, index) => (
                  <Button
                    key={index}
                    variant="ghost"
                    size="sm"
                    className="h-8 text-sm text-muted-foreground hover:text-primary"
                  >
                    {search}
                  </Button>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Statistics */}
        <div className="grid gap-6 md:grid-cols-4 mb-12">
          <Card className="text-center">
            <CardContent className="p-6">
              <div className="text-3xl font-bold text-primary mb-2">2,847</div>
              <div className="text-muted-foreground">Total Institutions</div>
            </CardContent>
          </Card>
          <Card className="text-center">
            <CardContent className="p-6">
              <div className="text-3xl font-bold text-primary mb-2">1,456</div>
              <div className="text-muted-foreground">Verified Listings</div>
            </CardContent>
          </Card>
          <Card className="text-center">
            <CardContent className="p-6">
              <div className="text-3xl font-bold text-primary mb-2">89%</div>
              <div className="text-muted-foreground">Satisfaction Rate</div>
            </CardContent>
          </Card>
          <Card className="text-center">
            <CardContent className="p-6">
              <div className="text-3xl font-bold text-primary mb-2">24/7</div>
              <div className="text-muted-foreground">Support Available</div>
            </CardContent>
          </Card>
        </div>

        {/* Call to Action */}
        <Card className="bg-gradient-primary text-white">
          <CardContent className="p-8 text-center">
            <h3 className="text-2xl font-bold mb-4">Can't find what you're looking for?</h3>
            <p className="text-white/90 mb-6">
              Help us build the most comprehensive directory in Cameroon
            </p>
            <div className="flex justify-center gap-4">
              <Button variant="secondary" size="lg">
                Add Institution
              </Button>
              <Button variant="outline" size="lg" className="border-white text-white hover:bg-white hover:text-primary">
                Report Missing
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default UnifiedDirectorySearch;