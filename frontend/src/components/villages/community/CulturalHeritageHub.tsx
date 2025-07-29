import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Crown, Plus, Eye, Heart, Star, Image, Users, Calendar, Shield } from 'lucide-react';
import { useCulturalHeritage } from '@/hooks/useCulturalHeritage';
import { formatDistanceToNow } from 'date-fns';

interface CulturalHeritageHubProps {
  villageId: string;
}

const heritageTypes = [
  { value: 'tradition', label: 'Cultural Tradition', icon: Crown },
  { value: 'artifact', label: 'Artifact', icon: Shield },
  { value: 'ceremony', label: 'Ceremony', icon: Users },
  { value: 'architecture', label: 'Architecture', icon: Shield },
  { value: 'art', label: 'Traditional Art', icon: Image },
  { value: 'music', label: 'Music & Dance', icon: Star },
];

const categories = [
  { value: 'customs', label: 'Customs & Traditions' },
  { value: 'festivals', label: 'Festivals & Celebrations' },
  { value: 'crafts', label: 'Traditional Crafts' },
  { value: 'food', label: 'Traditional Food' },
  { value: 'clothing', label: 'Traditional Clothing' },
  { value: 'language', label: 'Language & Literature' },
  { value: 'beliefs', label: 'Beliefs & Spirituality' },
];

const significanceLevels = [
  { value: 'low', label: 'Local', color: 'bg-blue-100 text-blue-800' },
  { value: 'medium', label: 'Regional', color: 'bg-green-100 text-green-800' },
  { value: 'high', label: 'National', color: 'bg-orange-100 text-orange-800' },
  { value: 'critical', label: 'International', color: 'bg-red-100 text-red-800' },
];

const preservationStatus = [
  { value: 'documented', label: 'Documented', color: 'bg-green-100 text-green-800' },
  { value: 'active', label: 'Actively Practiced', color: 'bg-blue-100 text-blue-800' },
  { value: 'endangered', label: 'Endangered', color: 'bg-orange-100 text-orange-800' },
  { value: 'extinct', label: 'No Longer Practiced', color: 'bg-red-100 text-red-800' },
];

export const CulturalHeritageHub: React.FC<CulturalHeritageHubProps> = ({ villageId }) => {
  const { heritage, loading, contributeHeritage, incrementViews, toggleLike } = useCulturalHeritage(villageId);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [newHeritage, setNewHeritage] = useState({
    title: '',
    description: '',
    heritage_type: 'tradition',
    category: 'customs',
    significance_level: 'medium',
    preservation_status: 'documented',
    historical_period: '',
    community_involvement: '',
  });

  const handleContributeHeritage = async () => {
    if (!newHeritage.title.trim() || !newHeritage.description.trim()) {
      return;
    }

    const success = await contributeHeritage(newHeritage);

    if (success) {
      setNewHeritage({
        title: '',
        description: '',
        heritage_type: 'tradition',
        category: 'customs',
        significance_level: 'medium',
        preservation_status: 'documented',
        historical_period: '',
        community_involvement: '',
      });
      setIsCreateOpen(false);
    }
  };

  const getSignificanceColor = (level: string) => {
    return significanceLevels.find(s => s.value === level)?.color || 'bg-gray-100 text-gray-800';
  };

  const getStatusColor = (status: string) => {
    return preservationStatus.find(s => s.value === status)?.color || 'bg-gray-100 text-gray-800';
  };

  const getTypeIcon = (type: string) => {
    const TypeIcon = heritageTypes.find(t => t.value === type)?.icon || Crown;
    return <TypeIcon className="h-4 w-4" />;
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="animate-pulse space-y-4">
            <div className="h-4 bg-muted rounded w-1/4"></div>
            <div className="space-y-2">
              <div className="h-3 bg-muted rounded"></div>
              <div className="h-3 bg-muted rounded w-5/6"></div>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center space-x-2">
            <Crown className="h-5 w-5" />
            <span>Cultural Heritage ({heritage.length})</span>
          </CardTitle>
          <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Contribute Heritage
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-lg">
              <DialogHeader>
                <DialogTitle>Contribute Cultural Heritage</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 mt-4">
                <div>
                  <label className="text-sm font-medium">Title</label>
                  <Input
                    placeholder="Heritage item name..."
                    value={newHeritage.title}
                    onChange={(e) => setNewHeritage({ ...newHeritage, title: e.target.value })}
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium">Type</label>
                    <Select 
                      value={newHeritage.heritage_type} 
                      onValueChange={(value) => setNewHeritage({ ...newHeritage, heritage_type: value })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {heritageTypes.map((type) => (
                          <SelectItem key={type.value} value={type.value}>
                            {type.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <label className="text-sm font-medium">Category</label>
                    <Select 
                      value={newHeritage.category} 
                      onValueChange={(value) => setNewHeritage({ ...newHeritage, category: value })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {categories.map((category) => (
                          <SelectItem key={category.value} value={category.value}>
                            {category.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium">Significance</label>
                    <Select 
                      value={newHeritage.significance_level} 
                      onValueChange={(value) => setNewHeritage({ ...newHeritage, significance_level: value })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {significanceLevels.map((level) => (
                          <SelectItem key={level.value} value={level.value}>
                            {level.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <label className="text-sm font-medium">Status</label>
                    <Select 
                      value={newHeritage.preservation_status} 
                      onValueChange={(value) => setNewHeritage({ ...newHeritage, preservation_status: value })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {preservationStatus.map((status) => (
                          <SelectItem key={status.value} value={status.value}>
                            {status.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div>
                  <label className="text-sm font-medium">Historical Period (Optional)</label>
                  <Input
                    placeholder="e.g., Pre-colonial, 18th century..."
                    value={newHeritage.historical_period}
                    onChange={(e) => setNewHeritage({ ...newHeritage, historical_period: e.target.value })}
                  />
                </div>
                <div>
                  <label className="text-sm font-medium">Description</label>
                  <Textarea
                    placeholder="Describe this cultural heritage..."
                    value={newHeritage.description}
                    onChange={(e) => setNewHeritage({ ...newHeritage, description: e.target.value })}
                    className="min-h-[100px]"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium">Community Involvement (Optional)</label>
                  <Textarea
                    placeholder="How is the community involved in preserving this?"
                    value={newHeritage.community_involvement}
                    onChange={(e) => setNewHeritage({ ...newHeritage, community_involvement: e.target.value })}
                    className="min-h-[60px]"
                  />
                </div>
                <div className="flex space-x-2">
                  <Button onClick={handleContributeHeritage} className="flex-1">
                    Contribute Heritage
                  </Button>
                  <Button variant="outline" onClick={() => setIsCreateOpen(false)}>
                    Cancel
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {heritage.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <Crown className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>No cultural heritage documented yet. Help preserve your culture!</p>
          </div>
        ) : (
          heritage.map((item) => (
            <Card 
              key={item.id} 
              className={`hover:shadow-md transition-shadow cursor-pointer ${
                item.is_featured ? 'border-primary' : ''
              }`}
              onClick={() => incrementViews(item.id)}
            >
              <CardContent className="p-4">
                <div className="space-y-3">
                  <div className="flex items-start justify-between">
                    <div className="flex-1 space-y-2">
                      <div className="flex items-center space-x-2">
                        {getTypeIcon(item.heritage_type)}
                        <h3 className="font-semibold text-sm">{item.title}</h3>
                        {item.is_featured && (
                          <Star className="h-4 w-4 text-yellow-500" />
                        )}
                      </div>
                      <p className="text-sm text-muted-foreground line-clamp-3">{item.description}</p>
                      {item.historical_period && (
                        <Badge variant="outline" className="text-xs">
                          <Calendar className="h-3 w-3 mr-1" />
                          {item.historical_period}
                        </Badge>
                      )}
                    </div>
                    <div className="flex flex-col space-y-1">
                      <Badge className={getSignificanceColor(item.significance_level)}>
                        {significanceLevels.find(s => s.value === item.significance_level)?.label}
                      </Badge>
                      <Badge className={getStatusColor(item.preservation_status)}>
                        {preservationStatus.find(s => s.value === item.preservation_status)?.label}
                      </Badge>
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between text-xs text-muted-foreground">
                    <div className="flex items-center space-x-4">
                      <span className="flex items-center space-x-1">
                        <Eye className="h-3 w-3" />
                        <span>{item.views_count}</span>
                      </span>
                      <button 
                        className="flex items-center space-x-1 hover:text-red-500 transition-colors"
                        onClick={(e) => {
                          e.stopPropagation();
                          toggleLike(item.id);
                        }}
                      >
                        <Heart className="h-3 w-3" />
                        <span>{item.likes_count}</span>
                      </button>
                      <Badge variant="outline" className="text-xs">
                        {categories.find(c => c.value === item.category)?.label}
                      </Badge>
                      {item.media_urls.length > 0 && <Image className="h-3 w-3" />}
                    </div>
                    <span>
                      {formatDistanceToNow(new Date(item.created_at), { addSuffix: true })}
                    </span>
                  </div>
                  
                  {item.community_involvement && (
                    <div className="text-xs text-muted-foreground border-t pt-2">
                      <div className="flex items-center space-x-1">
                        <Users className="h-3 w-3" />
                        <span className="font-medium">Community:</span>
                      </div>
                      <p className="mt-1 line-clamp-2">{item.community_involvement}</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </CardContent>
    </Card>
  );
};