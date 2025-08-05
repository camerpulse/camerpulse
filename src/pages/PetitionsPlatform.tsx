import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { URLBuilder } from '@/utils/slugUtils';
import { PetitionList } from '@/components/petitions/PetitionList';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Search, Plus, TrendingUp, Users, FileText, Filter } from 'lucide-react';

const CATEGORIES = [
  { value: 'all', label: 'All Categories', icon: '📋' },
  { value: 'governance', label: 'Governance', icon: '🏛️' },
  { value: 'justice', label: 'Justice', icon: '⚖️' },
  { value: 'education', label: 'Education', icon: '📚' },
  { value: 'health', label: 'Health', icon: '🏥' },
  { value: 'agriculture', label: 'Agriculture', icon: '🌾' },
  { value: 'digital_rights', label: 'Digital Rights', icon: '💻' },
  { value: 'local_issues', label: 'Local Issues', icon: '🏘️' },
  { value: 'corruption', label: 'Anti-Corruption', icon: '🛡️' },
  { value: 'security', label: 'Security', icon: '🔒' },
  { value: 'environment', label: 'Environment', icon: '🌍' },
  { value: 'traditional_authority', label: 'Traditional Authority', icon: '👑' },
  { value: 'others', label: 'Others', icon: '📝' }
];

export default function PetitionsPlatform() {
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <div className="bg-gradient-civic py-16">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-4xl md:text-6xl font-bold text-white mb-6">
            ✊🏾 Power to the People
          </h1>
          <p className="text-xl text-white/90 mb-8 max-w-2xl mx-auto">
            Start or sign petitions that drive real change in Cameroon. 
            Your voice matters in building a better nation.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to={URLBuilder.petitions.create()}>
              <Button size="lg" variant="secondary" className="petition-btn-create">
                <Plus className="h-5 w-5 mr-2" />
                Start a Petition
              </Button>
            </Link>
            <Button size="lg" variant="outline" className="border-white text-white hover:bg-white hover:text-primary">
              <TrendingUp className="h-5 w-5 mr-2" />
              Browse Trending
            </Button>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        {/* Stats Cards */}
        <div className="grid gap-6 md:grid-cols-3 mb-8">
          <Card className="petition-stats-card">
            <CardContent className="p-6 text-center">
              <div className="text-3xl font-bold text-primary mb-2">2,847</div>
              <div className="text-muted-foreground">Active Petitions</div>
            </CardContent>
          </Card>
          <Card className="petition-stats-card">
            <CardContent className="p-6 text-center">
              <div className="text-3xl font-bold text-primary mb-2">156K</div>
              <div className="text-muted-foreground">Total Signatures</div>
            </CardContent>
          </Card>
          <Card className="petition-stats-card">
            <CardContent className="p-6 text-center">
              <div className="text-3xl font-bold text-primary mb-2">89</div>
              <div className="text-muted-foreground">Victories Won</div>
            </CardContent>
          </Card>
        </div>

        {/* Search and Filters */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Filter className="h-5 w-5" />
              Find Petitions
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col lg:flex-row gap-4">
              {/* Search */}
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search petitions by title, description, or target..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10 petition-search"
                  />
                </div>
              </div>
              
              {/* Category Filter */}
              <div className="lg:w-64">
                <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                  <SelectTrigger className="petition-filter">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {CATEGORIES.map((category) => (
                      <SelectItem key={category.value} value={category.value}>
                        <div className="flex items-center gap-2">
                          <span>{category.icon}</span>
                          {category.label}
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Category Pills */}
        <div className="flex flex-wrap gap-2 mb-8">
          {CATEGORIES.slice(0, 8).map((category) => (
            <Badge
              key={category.value}
              variant={selectedCategory === category.value ? "default" : "outline"}
              className={`cursor-pointer transition-colors petition-category-pill ${
                selectedCategory === category.value ? 'petition-category-active' : ''
              }`}
              onClick={() => setSelectedCategory(category.value)}
            >
              {category.icon} {category.label}
            </Badge>
          ))}
        </div>

        {/* Petition List */}
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold">
              {selectedCategory === 'all' ? 'All Petitions' : 
               CATEGORIES.find(c => c.value === selectedCategory)?.label + ' Petitions'}
            </h2>
            <div className="text-sm text-muted-foreground">
              Sorted by signature count
            </div>
          </div>
          
          <PetitionList 
            category={selectedCategory}
            searchQuery={searchQuery}
          />
        </div>

        {/* Call to Action */}
        <Card className="mt-12 bg-gradient-primary text-white">
          <CardContent className="p-8 text-center">
            <h3 className="text-2xl font-bold mb-4">Ready to Make a Change?</h3>
            <p className="text-white/90 mb-6 max-w-2xl mx-auto">
              Every great movement starts with a single voice. 
              Create your petition today and rally your community around the causes that matter.
            </p>
            <div className="flex justify-center gap-4">
              <Link to={URLBuilder.petitions.create()}>
                <Button variant="secondary" size="lg">
                  <FileText className="h-5 w-5 mr-2" />
                  Create Petition
                </Button>
              </Link>
              <Button variant="outline" size="lg" className="border-white text-white hover:bg-white hover:text-primary">
                <Users className="h-5 w-5 mr-2" />
                Join Movement
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}