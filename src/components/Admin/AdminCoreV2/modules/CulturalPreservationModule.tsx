import React, { useState } from 'react';
import { AdminModuleHeader } from '../components/AdminModuleHeader';
import { StatCard } from '../components/StatCard';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Globe, BookOpen, Calendar, Users, MapPin, Languages, 
  TreePine, Camera, Archive, Star, Heart, Music
} from 'lucide-react';

interface CulturalPreservationModuleProps {
  hasPermission: (permission: string) => boolean;
  logActivity: (action: string, details: any) => void;
  stats?: any;
}

export const CulturalPreservationModule: React.FC<CulturalPreservationModuleProps> = ({
  hasPermission,
  logActivity,
  stats
}) => {
  const [activeTab, setActiveTab] = useState('languages');

  // Mock data - replace with real data
  const languageProgress = [
    { id: 1, language: 'Fulfulde', learners: 2450, lessons: 89, progress: 78, status: 'active' },
    { id: 2, language: 'Douala', learners: 1820, lessons: 67, progress: 65, status: 'active' },
    { id: 3, language: 'Bamun', learners: 980, lessons: 45, progress: 58, status: 'development' },
    { id: 4, language: 'Bassa', learners: 1340, lessons: 72, progress: 82, status: 'active' }
  ];

  const culturalEvents = [
    { id: 1, name: 'Ngondo Festival', date: '2024-12-15', region: 'Douala', participants: 25000, status: 'upcoming' },
    { id: 2, name: 'Medumba Traditional Wedding', date: '2024-11-20', region: 'West', participants: 1500, status: 'ongoing' },
    { id: 3, name: 'Bamun Heritage Day', date: '2024-10-30', region: 'West', participants: 8000, status: 'completed' }
  ];

  const familyTrees = [
    { id: 1, family_name: 'Mbarga', members: 450, generations: 8, village: 'Sangmelima', verified: true },
    { id: 2, family_name: 'Nkomo', members: 320, generations: 6, village: 'Douala', verified: false },
    { id: 3, family_name: 'Kameni', members: 680, generations: 9, village: 'Bafoussam', verified: true }
  ];

  const oralTraditions = [
    { id: 1, title: 'The Legend of Mount Cameroon', type: 'Legend', language: 'Douala', recordings: 12, status: 'complete' },
    { id: 2, title: 'Fulani Cattle Herding Songs', type: 'Songs', language: 'Fulfulde', recordings: 28, status: 'active' },
    { id: 3, title: 'Bamileke Wisdom Proverbs', type: 'Proverbs', language: 'Ghomala', recordings: 45, status: 'complete' }
  ];

  const handleVerifyFamilyTree = (id: number) => {
    logActivity('family_tree_verified', { tree_id: id });
  };

  const handlePublishTradition = (id: number) => {
    logActivity('oral_tradition_published', { tradition_id: id });
  };

  return (
    <div className="space-y-6">
      <AdminModuleHeader
        title="Cultural Preservation & Heritage"
        description="Preserve and promote Cameroonian languages, traditions and cultural heritage"
        icon={Globe}
        iconColor="text-green-600"
        searchPlaceholder="Search languages, events, traditions..."
        onSearch={(query) => {
          console.log('Searching cultural content:', query);
        }}
        onRefresh={() => {
          logActivity('cultural_preservation_refresh', { timestamp: new Date() });
        }}
      />

      {/* Cultural Preservation Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Languages"
          value="25"
          icon={Languages}
          description="Active preservation programs"
          badge={{ text: "Growing", variant: "default" }}
        />
        <StatCard
          title="Cultural Events"
          value="148"
          icon={Calendar}
          trend={{ value: 23.5, isPositive: true, period: "this year" }}
          description="Documented events"
        />
        <StatCard
          title="Family Trees"
          value="2,847"
          icon={TreePine}
          trend={{ value: 12.8, isPositive: true, period: "this month" }}
          description="Genealogy records"
        />
        <StatCard
          title="Oral Traditions"
          value="892"
          icon={Archive}
          trend={{ value: 8.4, isPositive: true, period: "this month" }}
          description="Stories & traditions"
        />
      </div>

      {/* Cultural Preservation Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="languages">Language Learning</TabsTrigger>
          <TabsTrigger value="events">Cultural Events</TabsTrigger>
          <TabsTrigger value="genealogy">Family Trees</TabsTrigger>
          <TabsTrigger value="traditions">Oral Traditions</TabsTrigger>
        </TabsList>

        <TabsContent value="languages" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Languages className="h-5 w-5" />
                Language Learning Progress
              </CardTitle>
              <CardDescription>
                Monitor progress of Cameroonian language preservation and learning programs
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {languageProgress.map((lang) => (
                  <div key={lang.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center gap-4">
                      <div className="h-12 w-12 bg-gradient-to-br from-green-400 to-blue-400 rounded-full flex items-center justify-center">
                        <BookOpen className="h-6 w-6 text-white" />
                      </div>
                      <div>
                        <h4 className="font-semibold">{lang.language}</h4>
                        <div className="flex items-center gap-4 mt-1 text-sm text-muted-foreground">
                          <span>{lang.learners.toLocaleString()} learners</span>
                          <span>{lang.lessons} lessons</span>
                        </div>
                        <div className="w-40 bg-gray-200 rounded-full h-2 mt-2">
                          <div 
                            className="bg-green-500 h-2 rounded-full" 
                            style={{ width: `${lang.progress}%` }}
                          ></div>
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <Badge 
                        variant={lang.status === 'active' ? 'default' : 'secondary'}
                      >
                        {lang.status}
                      </Badge>
                      <p className="text-sm text-muted-foreground mt-1">{lang.progress}% complete</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="events" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="h-5 w-5" />
                Cultural Events Calendar
              </CardTitle>
              <CardDescription>
                Manage traditional ceremonies and cultural celebrations
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {culturalEvents.map((event) => (
                  <div key={event.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center gap-4">
                      <div className="h-12 w-12 bg-gradient-to-br from-purple-400 to-pink-400 rounded-lg flex items-center justify-center">
                        <Calendar className="h-6 w-6 text-white" />
                      </div>
                      <div>
                        <h4 className="font-semibold">{event.name}</h4>
                        <div className="flex items-center gap-4 mt-1 text-sm text-muted-foreground">
                          <span className="flex items-center gap-1">
                            <MapPin className="h-3 w-3" />
                            {event.region}
                          </span>
                          <span className="flex items-center gap-1">
                            <Users className="h-3 w-3" />
                            {event.participants.toLocaleString()} participants
                          </span>
                          <span>{event.date}</span>
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <Badge 
                        variant={
                          event.status === 'ongoing' ? 'default' : 
                          event.status === 'upcoming' ? 'secondary' : 'outline'
                        }
                      >
                        {event.status}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="genealogy" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TreePine className="h-5 w-5" />
                Village Family Trees
              </CardTitle>
              <CardDescription>
                Manage genealogy records and family lineage documentation
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {familyTrees.map((tree) => (
                  <div key={tree.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center gap-4">
                      <div className="h-12 w-12 bg-gradient-to-br from-amber-400 to-orange-400 rounded-full flex items-center justify-center">
                        <TreePine className="h-6 w-6 text-white" />
                      </div>
                      <div>
                        <h4 className="font-semibold">{tree.family_name} Family</h4>
                        <div className="flex items-center gap-4 mt-1 text-sm text-muted-foreground">
                          <span>{tree.members} members</span>
                          <span>{tree.generations} generations</span>
                          <span className="flex items-center gap-1">
                            <MapPin className="h-3 w-3" />
                            {tree.village}
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge 
                        variant={tree.verified ? 'default' : 'secondary'}
                      >
                        {tree.verified ? 'Verified' : 'Pending'}
                      </Badge>
                      {!tree.verified && (
                        <Button 
                          size="sm" 
                          onClick={() => handleVerifyFamilyTree(tree.id)}
                        >
                          Verify
                        </Button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="traditions" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Archive className="h-5 w-5" />
                Oral Traditions Archive
              </CardTitle>
              <CardDescription>
                Preserve stories, songs, proverbs and traditional knowledge
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {oralTraditions.map((tradition) => (
                  <div key={tradition.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center gap-4">
                      <div className="h-12 w-12 bg-gradient-to-br from-indigo-400 to-purple-400 rounded-lg flex items-center justify-center">
                        {tradition.type === 'Songs' ? (
                          <Music className="h-6 w-6 text-white" />
                        ) : (
                          <Archive className="h-6 w-6 text-white" />
                        )}
                      </div>
                      <div>
                        <h4 className="font-semibold">{tradition.title}</h4>
                        <div className="flex items-center gap-4 mt-1 text-sm text-muted-foreground">
                          <Badge variant="outline">{tradition.type}</Badge>
                          <span>{tradition.language}</span>
                          <span>{tradition.recordings} recordings</span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge 
                        variant={tradition.status === 'complete' ? 'default' : 'secondary'}
                      >
                        {tradition.status}
                      </Badge>
                      {tradition.status === 'active' && (
                        <Button 
                          size="sm" 
                          onClick={() => handlePublishTradition(tradition.id)}
                        >
                          Publish
                        </Button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};