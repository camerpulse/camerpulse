import React, { useState, useEffect } from 'react';
import { Star, DollarSign, Award, Crown, Search, Plus, Filter, MapPin, Calendar, ExternalLink } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';
import { toast } from 'sonner';

interface NotablePerson {
  id: string;
  name: string;
  category: string;
  profession?: string;
  industry?: string;
  net_worth_usd?: number;
  achievements: string[];
  description: string;
  photo_url?: string;
  birth_year?: number;
  current_location?: string;
  connection_to_village: string;
  verification_status: string;
  social_links?: {
    wikipedia?: string;
    linkedin?: string;
    website?: string;
  };
  awards?: string[];
  created_at: string;
}

interface VillageNotablePeopleProps {
  villageId: string;
  villageName: string;
}

export const VillageNotablePeople: React.FC<VillageNotablePeopleProps> = ({ villageId, villageName }) => {
  const [people, setPeople] = useState<NotablePerson[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [addPersonDialogOpen, setAddPersonDialogOpen] = useState(false);

  const categories = [
    { value: 'all', label: 'All Categories', icon: Star },
    { value: 'billionaire', label: 'Billionaires', icon: DollarSign },
    { value: 'celebrity', label: 'Celebrities', icon: Award },
    { value: 'politician', label: 'Politicians', icon: Crown },
    { value: 'athlete', label: 'Athletes', icon: Award },
    { value: 'academic', label: 'Academics', icon: Award },
    { value: 'entrepreneur', label: 'Entrepreneurs', icon: DollarSign },
    { value: 'artist', label: 'Artists', icon: Award },
    { value: 'philanthropist', label: 'Philanthropists', icon: Award }
  ];

  // Sample notable people for demo
  const samplePeople: NotablePerson[] = [
    {
      id: '1',
      name: 'Dr. Emmanuel Nganou',
      category: 'billionaire',
      profession: 'Tech Entrepreneur & Investor',
      industry: 'Technology',
      net_worth_usd: 2500000000,
      achievements: [
        'Founded one of Africa largest fintech companies',
        'Featured in Forbes Africa Billionaires list',
        'Funded 50+ schools across Cameroon',
        'Created 10,000+ jobs in tech sector'
      ],
      description: 'Pioneering entrepreneur who built a fintech empire from humble village beginnings. Known for revolutionary mobile banking solutions across Africa.',
      photo_url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?ixlib=rb-4.0.3&auto=format&fit=crop&w=150&q=80',
      birth_year: 1975,
      current_location: 'San Francisco, USA',
      connection_to_village: 'Born and raised until age 18, parents still live here',
      verification_status: 'verified',
      social_links: {
        wikipedia: 'https://en.wikipedia.org/wiki/Emmanuel_Nganou',
        linkedin: 'https://linkedin.com/in/emmanuel-nganou',
        website: 'https://nganouventures.com'
      },
      awards: ['Forbes 40 Under 40', 'African Entrepreneur of the Year', 'UN Global Compact Leader'],
      created_at: '2024-01-15T10:00:00Z'
    },
    {
      id: '2',
      name: 'Grace Mbali',
      category: 'celebrity',
      profession: 'International Recording Artist',
      industry: 'Entertainment',
      achievements: [
        'Grammy Award winner',
        '50+ million records sold worldwide',
        'UN Goodwill Ambassador',
        'Founded arts education foundation'
      ],
      description: 'International music sensation whose traditional Cameroonian rhythms have captivated global audiences. Strong advocate for African culture.',
      photo_url: 'https://images.unsplash.com/photo-1494790108755-2616b612b786?ixlib=rb-4.0.3&auto=format&fit=crop&w=150&q=80',
      birth_year: 1985,
      current_location: 'London, UK',
      connection_to_village: 'Grandmother was village traditional healer, visits annually',
      verification_status: 'verified',
      social_links: {
        website: 'https://gracembali.com'
      },
      awards: ['Grammy Award', 'MOBO Award', 'African Music Awards'],
      created_at: '2024-01-20T14:30:00Z'
    },
    {
      id: '3',
      name: 'Hon. Paul Fotso',
      category: 'politician',
      profession: 'Minister & Former Ambassador',
      industry: 'Government',
      achievements: [
        'Former Ambassador to France',
        'Current Minister of Rural Development',
        'Authored major rural development policies',
        'Built 30+ health centers in rural areas'
      ],
      description: 'Seasoned diplomat and politician who has dedicated his career to rural development and international relations.',
      photo_url: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-4.0.3&auto=format&fit=crop&w=150&q=80',
      birth_year: 1960,
      current_location: 'Yaoundé, Cameroon',
      connection_to_village: 'Son of former village chief, sponsors annual development projects',
      verification_status: 'verified',
      awards: ['Order of Merit', 'Diplomatic Excellence Award'],
      created_at: '2024-02-01T09:15:00Z'
    },
    {
      id: '4',
      name: 'Prof. Marie Kenne',
      category: 'academic',
      profession: 'Climate Science Professor',
      industry: 'Education & Research',
      achievements: [
        'Leading climate researcher at MIT',
        'Published 100+ peer-reviewed papers',
        'IPCC report contributing author',
        'Founded climate adaptation institute'
      ],
      description: 'World-renowned climate scientist whose research on African climate patterns has influenced global policy.',
      photo_url: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?ixlib=rb-4.0.3&auto=format&fit=crop&w=150&q=80',
      birth_year: 1970,
      current_location: 'Boston, USA',
      connection_to_village: 'Conducted research on local farming practices, funds scholarship program',
      verification_status: 'verified',
      social_links: {
        linkedin: 'https://linkedin.com/in/marie-kenne'
      },
      awards: ['MacArthur Fellowship', 'Climate Science Excellence Award'],
      created_at: '2024-02-10T16:00:00Z'
    },
    {
      id: '5',
      name: 'Jean-Baptiste Mvondo',
      category: 'athlete',
      profession: 'Olympic Marathon Runner',
      industry: 'Sports',
      achievements: [
        'Olympic silver medalist',
        'World Championship gold medalist',
        'Marathon world record holder (2019-2021)',
        'Founded youth athletics academy'
      ],
      description: 'Elite marathon runner who broke barriers in international athletics while proudly representing African excellence.',
      photo_url: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?ixlib=rb-4.0.3&auto=format&fit=crop&w=150&q=80',
      birth_year: 1988,
      current_location: 'Nairobi, Kenya',
      connection_to_village: 'Trained on village paths as youth, built sports complex for local children',
      verification_status: 'verified',
      awards: ['Olympic Silver Medal', 'World Championship Gold', 'Sports Excellence Award'],
      created_at: '2024-02-15T11:30:00Z'
    }
  ];

  useEffect(() => {
    // Demo mode - using sample data
    setPeople(samplePeople);
    setLoading(false);
  }, [villageId]);

  const filteredPeople = people.filter(person => {
    const matchesCategory = selectedCategory === 'all' || person.category === selectedCategory;
    const matchesSearch = !searchTerm || 
      person.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      person.profession?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      person.description.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const getCategoryInfo = (category: string) => {
    return categories.find(cat => cat.value === category) || categories[0];
  };

  const getNetWorthDisplay = (netWorth: number) => {
    if (netWorth >= 1000000000) {
      return `$${(netWorth / 1000000000).toFixed(1)}B`;
    } else if (netWorth >= 1000000) {
      return `$${(netWorth / 1000000).toFixed(0)}M`;
    } else {
      return `$${netWorth.toLocaleString()}`;
    }
  };

  const PersonCard = ({ person }: { person: NotablePerson }) => {
    const categoryInfo = getCategoryInfo(person.category);
    const CategoryIcon = categoryInfo.icon;

    return (
      <Card className="hover:shadow-lg transition-all duration-200">
        <CardHeader className="pb-3">
          <div className="flex items-start gap-4">
            <Avatar className="h-16 w-16">
              <AvatarImage src={person.photo_url} alt={person.name} />
              <AvatarFallback className="text-lg">
                {person.name.split(' ').map(n => n[0]).join('')}
              </AvatarFallback>
            </Avatar>
            
            <div className="flex-1">
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="font-bold text-lg flex items-center gap-2">
                    {person.name}
                    <CategoryIcon className="h-5 w-5 text-primary" />
                  </h3>
                  <p className="text-primary font-medium">{person.profession}</p>
                  <Badge variant="outline" className="mt-1">
                    {categoryInfo.label}
                  </Badge>
                </div>
                
                {person.net_worth_usd && (
                  <div className="text-right">
                    <div className="text-lg font-bold text-success">
                      {getNetWorthDisplay(person.net_worth_usd)}
                    </div>
                    <div className="text-xs text-muted-foreground">Net Worth</div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </CardHeader>
        
        <CardContent>
          <p className="text-sm text-muted-foreground mb-4 line-clamp-3">
            {person.description}
          </p>

          <div className="space-y-3">
            {/* Connection to Village */}
            <div>
              <h5 className="font-medium text-sm mb-1 flex items-center gap-2">
                <MapPin className="h-4 w-4 text-primary" />
                Village Connection
              </h5>
              <p className="text-xs text-muted-foreground">{person.connection_to_village}</p>
            </div>

            {/* Key Achievements */}
            <div>
              <h5 className="font-medium text-sm mb-2 flex items-center gap-2">
                <Award className="h-4 w-4 text-primary" />
                Key Achievements
              </h5>
              <ul className="text-xs space-y-1">
                {person.achievements.slice(0, 3).map((achievement, index) => (
                  <li key={index} className="flex items-start gap-2">
                    <span className="text-primary">•</span>
                    <span className="text-muted-foreground">{achievement}</span>
                  </li>
                ))}
                {person.achievements.length > 3 && (
                  <li className="text-xs text-primary">+{person.achievements.length - 3} more...</li>
                )}
              </ul>
            </div>

            {/* Awards */}
            {person.awards && person.awards.length > 0 && (
              <div>
                <h5 className="font-medium text-sm mb-2">Awards & Recognition</h5>
                <div className="flex flex-wrap gap-1">
                  {person.awards.slice(0, 2).map((award, index) => (
                    <Badge key={index} variant="secondary" className="text-xs">
                      {award}
                    </Badge>
                  ))}
                  {person.awards.length > 2 && (
                    <Badge variant="outline" className="text-xs">
                      +{person.awards.length - 2} more
                    </Badge>
                  )}
                </div>
              </div>
            )}

            {/* Personal Info */}
            <div className="flex items-center justify-between text-xs text-muted-foreground pt-2 border-t">
              <div className="flex items-center gap-4">
                {person.birth_year && (
                  <span>Born {person.birth_year}</span>
                )}
                {person.current_location && (
                  <span>Lives in {person.current_location}</span>
                )}
              </div>
              
              {person.social_links && Object.keys(person.social_links).length > 0 && (
                <div className="flex items-center gap-2">
                  {Object.entries(person.social_links).map(([platform, url]) => (
                    <Button
                      key={platform}
                      variant="ghost"
                      size="sm"
                      className="h-6 w-6 p-0"
                      onClick={() => window.open(url, '_blank')}
                    >
                      <ExternalLink className="h-3 w-3" />
                    </Button>
                  ))}
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    );
  };

  const getStatsForCategory = (category: string) => {
    return filteredPeople.filter(p => category === 'all' || p.category === category).length;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h3 className="text-2xl font-bold">Notable People</h3>
          <p className="text-muted-foreground">
            {filteredPeople.length} notable individuals • Celebrating village excellence
          </p>
        </div>
        
        <Dialog open={addPersonDialogOpen} onOpenChange={setAddPersonDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Add Person
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add Notable Person</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <p className="text-sm text-muted-foreground">
                Notable people management functionality will be available when the database is fully connected.
              </p>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search by name, profession, or achievements..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        <Select value={selectedCategory} onValueChange={setSelectedCategory}>
          <SelectTrigger className="w-full sm:w-48">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {categories.map(category => (
              <SelectItem key={category.value} value={category.value}>
                {category.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Statistics */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        {categories.slice(1, 6).map(category => {
          const count = getStatsForCategory(category.value);
          const Icon = category.icon;
          return (
            <Card key={category.value} className="text-center p-4">
              <div className="flex items-center justify-center mb-2">
                <Icon className="h-6 w-6 text-primary" />
              </div>
              <div className="text-2xl font-bold text-primary">{count}</div>
              <div className="text-sm text-muted-foreground">{category.label}</div>
            </Card>
          );
        })}
      </div>

      {/* People Grid */}
      <div>
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {Array.from({ length: 4 }).map((_, i) => (
              <Card key={i} className="animate-pulse">
                <CardHeader>
                  <div className="flex items-start gap-4">
                    <div className="h-16 w-16 bg-muted rounded-full"></div>
                    <div className="flex-1 space-y-2">
                      <div className="h-5 bg-muted rounded w-3/4"></div>
                      <div className="h-4 bg-muted rounded w-1/2"></div>
                      <div className="h-3 bg-muted rounded w-1/3"></div>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div className="h-3 bg-muted rounded"></div>
                    <div className="h-3 bg-muted rounded w-2/3"></div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : filteredPeople.length === 0 ? (
          <Card className="text-center py-12">
            <CardContent>
              <Award className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">No Notable People Found</h3>
              <p className="text-muted-foreground mb-4">
                {searchTerm || selectedCategory !== 'all'
                  ? 'No people match your search criteria.'
                  : 'Be the first to celebrate notable individuals from this village!'
                }
              </p>
              <Button onClick={() => setAddPersonDialogOpen(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Add First Person
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {filteredPeople.map((person) => (
              <PersonCard key={person.id} person={person} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};