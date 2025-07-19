import React, { useState, useEffect } from 'react';
import { Crown, Users, Calendar, Phone, Mail, MapPin, Award, Star, Plus, Edit } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { toast } from 'sonner';

interface Leader {
  id: string;
  name: string;
  position: string;
  category: string;
  term_start: string;
  term_end?: string;
  is_current: boolean;
  contact_phone?: string;
  contact_email?: string;
  bio?: string;
  achievements?: string[];
  photo_url?: string;
  rating: number;
  total_ratings: number;
  appointed_by?: string;
}

interface VillageLeadershipProps {
  villageId: string;
  villageName: string;
}

export const VillageLeadership: React.FC<VillageLeadershipProps> = ({ villageId, villageName }) => {
  const [leaders, setLeaders] = useState<Leader[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [addLeaderDialogOpen, setAddLeaderDialogOpen] = useState(false);

  const leadershipCategories = [
    { value: 'all', label: 'All Leaders' },
    { value: 'traditional', label: 'Traditional Authority' },
    { value: 'administrative', label: 'Administrative' },
    { value: 'religious', label: 'Religious Leaders' },
    { value: 'development', label: 'Development Committee' },
    { value: 'youth', label: 'Youth Leadership' },
    { value: 'women', label: 'Women Groups' },
    { value: 'education', label: 'Education Committee' }
  ];

  // Sample leaders for demo
  const sampleLeaders: Leader[] = [
    {
      id: '1',
      name: 'Chief Emmanuel Nkomo',
      position: 'Village Chief',
      category: 'traditional',
      term_start: '2015-03-01',
      is_current: true,
      contact_phone: '+237 6XX XXX XXX',
      bio: 'Third-generation chief committed to preserving traditions while embracing development',
      achievements: ['Led village water project', 'Established peace committee', 'Cultural preservation initiatives'],
      photo_url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?ixlib=rb-4.0.3&auto=format&fit=crop&w=150&q=80',
      rating: 4.7,
      total_ratings: 89,
      appointed_by: 'Traditional Council'
    },
    {
      id: '2',
      name: 'Marie Fotso',
      position: 'Development Committee Chair',
      category: 'development',
      term_start: '2022-01-15',
      term_end: '2025-01-14',
      is_current: true,
      contact_phone: '+237 6XX XXX XXX',
      contact_email: 'marie.fotso@email.com',
      bio: 'Engineer leading infrastructure and social development projects',
      achievements: ['School renovation project', 'Women empowerment programs', 'Youth skills training'],
      photo_url: 'https://images.unsplash.com/photo-1494790108755-2616b612b786?ixlib=rb-4.0.3&auto=format&fit=crop&w=150&q=80',
      rating: 4.9,
      total_ratings: 67,
      appointed_by: 'Community Election'
    },
    {
      id: '3',
      name: 'Pastor Jean Mballa',
      position: 'Religious Council Representative',
      category: 'religious',
      term_start: '2020-06-01',
      is_current: true,
      contact_phone: '+237 6XX XXX XXX',
      bio: 'Interfaith leader promoting unity and spiritual guidance',
      achievements: ['Peace mediation', 'Community counseling', 'Interfaith dialogue'],
      photo_url: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-4.0.3&auto=format&fit=crop&w=150&q=80',
      rating: 4.6,
      total_ratings: 45,
      appointed_by: 'Religious Council'
    },
    {
      id: '4',
      name: 'Dr. Paul Kenne',
      position: 'Education Committee Head',
      category: 'education',
      term_start: '2023-09-01',
      term_end: '2026-08-31',
      is_current: true,
      contact_email: 'paul.kenne@email.com',
      bio: 'Former university professor focused on improving educational standards',
      achievements: ['Teacher training programs', 'Scholarship fund establishment', 'Digital learning initiative'],
      photo_url: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?ixlib=rb-4.0.3&auto=format&fit=crop&w=150&q=80',
      rating: 4.8,
      total_ratings: 52,
      appointed_by: 'Community Assembly'
    },
    {
      id: '5',
      name: 'Grace Mbenda',
      position: 'Women Group Leader',
      category: 'women',
      term_start: '2021-03-08',
      term_end: '2024-03-07',
      is_current: true,
      contact_phone: '+237 6XX XXX XXX',
      bio: 'Advocate for women rights and economic empowerment',
      achievements: ['Microfinance cooperative', 'Health awareness campaigns', 'Skills training center'],
      photo_url: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?ixlib=rb-4.0.3&auto=format&fit=crop&w=150&q=80',
      rating: 4.5,
      total_ratings: 73,
      appointed_by: 'Women Assembly'
    }
  ];

  useEffect(() => {
    // Demo mode - using sample data
    setLeaders(sampleLeaders);
    setLoading(false);
  }, [villageId]);

  const filteredLeaders = leaders.filter(leader => 
    selectedCategory === 'all' || leader.category === selectedCategory
  );

  const currentLeaders = filteredLeaders.filter(leader => leader.is_current);
  const formerLeaders = filteredLeaders.filter(leader => !leader.is_current);

  const getCategoryInfo = (category: string) => {
    return leadershipCategories.find(cat => cat.value === category) || leadershipCategories[0];
  };

  const renderStars = (rating: number) => {
    const stars = [];
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 !== 0;

    for (let i = 0; i < fullStars; i++) {
      stars.push(<Star key={i} className="h-4 w-4 fill-primary text-primary" />);
    }

    if (hasHalfStar) {
      stars.push(<Star key="half" className="h-4 w-4 fill-primary/50 text-primary" />);
    }

    const emptyStars = 5 - stars.length;
    for (let i = 0; i < emptyStars; i++) {
      stars.push(<Star key={`empty-${i}`} className="h-4 w-4 text-muted-foreground" />);
    }

    return stars;
  };

  const LeaderCard = ({ leader }: { leader: Leader }) => {
    const categoryInfo = getCategoryInfo(leader.category);
    
    return (
      <Card className="hover:shadow-lg transition-all duration-200">
        <CardHeader className="pb-3">
          <div className="flex items-start gap-4">
            <Avatar className="h-16 w-16">
              <AvatarImage src={leader.photo_url} alt={leader.name} />
              <AvatarFallback className="text-lg">
                {leader.name.split(' ').map(n => n[0]).join('')}
              </AvatarFallback>
            </Avatar>
            
            <div className="flex-1">
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="font-bold text-lg flex items-center gap-2">
                    {leader.name}
                    {leader.category === 'traditional' && <Crown className="h-5 w-5 text-primary" />}
                  </h3>
                  <p className="text-primary font-medium">{leader.position}</p>
                  <Badge variant="outline" className="mt-1">
                    {categoryInfo.label}
                  </Badge>
                </div>
                
                {leader.is_current && (
                  <Badge variant="success">Current</Badge>
                )}
              </div>
              
              <div className="flex items-center mt-2">
                {renderStars(leader.rating)}
                <span className="ml-2 text-sm text-muted-foreground">
                  {leader.rating.toFixed(1)} ({leader.total_ratings} ratings)
                </span>
              </div>
            </div>
          </div>
        </CardHeader>
        
        <CardContent>
          {leader.bio && (
            <p className="text-sm text-muted-foreground mb-3">{leader.bio}</p>
          )}
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm mb-3">
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4 text-muted-foreground" />
              <span>Since {new Date(leader.term_start).toLocaleDateString()}</span>
            </div>
            {leader.term_end && (
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4 text-muted-foreground" />
                <span>Until {new Date(leader.term_end).toLocaleDateString()}</span>
              </div>
            )}
            {leader.contact_phone && (
              <div className="flex items-center gap-2">
                <Phone className="h-4 w-4 text-muted-foreground" />
                <span>{leader.contact_phone}</span>
              </div>
            )}
            {leader.contact_email && (
              <div className="flex items-center gap-2">
                <Mail className="h-4 w-4 text-muted-foreground" />
                <span>{leader.contact_email}</span>
              </div>
            )}
          </div>
          
          {leader.achievements && leader.achievements.length > 0 && (
            <div>
              <h4 className="font-semibold mb-2 flex items-center gap-2">
                <Award className="h-4 w-4" />
                Key Achievements
              </h4>
              <ul className="text-sm space-y-1">
                {leader.achievements.slice(0, 3).map((achievement, index) => (
                  <li key={index} className="flex items-start gap-2">
                    <span className="text-primary">•</span>
                    <span>{achievement}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
          
          {leader.appointed_by && (
            <div className="mt-3 pt-3 border-t">
              <p className="text-xs text-muted-foreground">
                Appointed by: {leader.appointed_by}
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    );
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h3 className="text-2xl font-bold">Village Leadership</h3>
          <p className="text-muted-foreground">
            {currentLeaders.length} current leaders • {formerLeaders.length} former leaders
          </p>
        </div>
        
        <div className="flex gap-2">
          <Select value={selectedCategory} onValueChange={setSelectedCategory}>
            <SelectTrigger className="w-48">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {leadershipCategories.map(category => (
                <SelectItem key={category.value} value={category.value}>
                  {category.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          
          <Dialog open={addLeaderDialogOpen} onOpenChange={setAddLeaderDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Add Leader
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Add Village Leader</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <p className="text-sm text-muted-foreground">
                  Leader management functionality will be available when the database is fully connected.
                </p>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Leadership Statistics */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {leadershipCategories.slice(1, 5).map(category => {
          const count = leaders.filter(l => l.category === category.value && l.is_current).length;
          return (
            <Card key={category.value} className="text-center p-4">
              <div className="text-2xl font-bold text-primary mb-1">{count}</div>
              <div className="text-sm text-muted-foreground">{category.label}</div>
            </Card>
          );
        })}
      </div>

      {/* Current Leaders */}
      <div>
        <h4 className="text-lg font-semibold mb-4">Current Leadership</h4>
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
        ) : currentLeaders.length === 0 ? (
          <Card className="text-center py-12">
            <CardContent>
              <Users className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">No Current Leaders Found</h3>
              <p className="text-muted-foreground mb-4">
                {selectedCategory !== 'all' 
                  ? `No leaders found in ${getCategoryInfo(selectedCategory).label} category.`
                  : 'No leadership information available for this village.'
                }
              </p>
              <Button onClick={() => setAddLeaderDialogOpen(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Add First Leader
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {currentLeaders.map((leader) => (
              <LeaderCard key={leader.id} leader={leader} />
            ))}
          </div>
        )}
      </div>

      {/* Former Leaders */}
      {formerLeaders.length > 0 && (
        <div>
          <Separator className="my-6" />
          <h4 className="text-lg font-semibold mb-4">Former Leaders</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {formerLeaders.map((leader) => (
              <LeaderCard key={leader.id} leader={leader} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
};