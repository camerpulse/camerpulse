import React, { useState } from 'react';
import { AdminModuleHeader } from '../components/AdminModuleHeader';
import { StatCard } from '../components/StatCard';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Music, Users, Award, TrendingUp, Play, UserCheck, 
  Calendar, DollarSign, Star, Headphones, Mic, Radio
} from 'lucide-react';

interface ArtistPlatformModuleProps {
  hasPermission: (permission: string) => boolean;
  logActivity: (action: string, details: any) => void;
  stats?: any;
}

export const ArtistPlatformModule: React.FC<ArtistPlatformModuleProps> = ({
  hasPermission,
  logActivity,
  stats
}) => {
  const [activeTab, setActiveTab] = useState('applications');

  // Mock data - replace with real data
  const artistApplications = [
    { id: 1, name: 'John Kameni', stage_name: 'J-Kam', status: 'pending', genre: 'Afrobeat', region: 'Douala' },
    { id: 2, name: 'Marie Nkomo', stage_name: 'La Reine', status: 'approved', genre: 'Makossa', region: 'Yaoundé' },
    { id: 3, name: 'Paul Mbarga', stage_name: 'P-Mbarga', status: 'under_review', genre: 'Bikutsi', region: 'Centre' }
  ];

  const musicReleases = [
    { id: 1, title: 'Africa Rising', artist: 'J-Kam', streams: 45000, revenue: 125000, status: 'published' },
    { id: 2, title: 'Cameroon Pride', artist: 'La Reine', streams: 72000, revenue: 198000, status: 'published' },
    { id: 3, title: 'Village Stories', artist: 'P-Mbarga', streams: 28000, revenue: 89000, status: 'pending' }
  ];

  const fanClubs = [
    { id: 1, name: 'J-Kam Official Fan Club', members: 2500, active_members: 1890, monthly_growth: 12 },
    { id: 2, name: 'La Reine Supporters', members: 4200, active_members: 3100, monthly_growth: 18 },
    { id: 3, name: 'Bikutsi Lovers', members: 1800, active_members: 1200, monthly_growth: 8 }
  ];

  const awards = [
    { id: 1, name: 'Best New Artist 2024', nominees: 12, votes: 15600, status: 'voting', ends_at: '2024-12-31' },
    { id: 2, name: 'Song of the Year', nominees: 25, votes: 28900, status: 'voting', ends_at: '2024-12-31' },
    { id: 3, name: 'Best Collaboration', nominees: 8, votes: 9200, status: 'upcoming', ends_at: '2025-01-15' }
  ];

  const handleApproveApplication = (id: number) => {
    logActivity('artist_application_approved', { application_id: id });
  };

  const handlePublishRelease = (id: number) => {
    logActivity('music_release_published', { release_id: id });
  };

  return (
    <div className="space-y-6">
      <AdminModuleHeader
        title="Artist Platform & Music Management"
        description="Comprehensive management of artists, music releases, fan clubs and awards"
        icon={Music}
        iconColor="text-purple-600"
        searchPlaceholder="Search artists, releases, awards..."
        onSearch={(query) => {
          console.log('Searching artists:', query);
        }}
        onRefresh={() => {
          logActivity('artist_platform_refresh', { timestamp: new Date() });
        }}
      />

      {/* Artist Platform Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Total Artists"
          value="1,247"
          icon={UserCheck}
          trend={{ value: 8.2, isPositive: true, period: "this month" }}
          description="Verified artists"
        />
        <StatCard
          title="Music Releases"
          value="3,892"
          icon={Music}
          trend={{ value: 12.5, isPositive: true, period: "this month" }}
          description="Total tracks published"
        />
        <StatCard
          title="Total Streams"
          value="2.4M"
          icon={Play}
          trend={{ value: 15.3, isPositive: true, period: "this week" }}
          description="Across all platforms"
        />
        <StatCard
          title="Artist Revenue"
          value="₣89.2M"
          icon={DollarSign}
          trend={{ value: 6.8, isPositive: true, period: "this month" }}
          description="Total earnings"
        />
      </div>

      {/* Artist Platform Management Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="applications">Artist Applications</TabsTrigger>
          <TabsTrigger value="music">Music Releases</TabsTrigger>
          <TabsTrigger value="fans">Fan Clubs</TabsTrigger>
          <TabsTrigger value="awards">Awards System</TabsTrigger>
        </TabsList>

        <TabsContent value="applications" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <UserCheck className="h-5 w-5" />
                Artist Applications
              </CardTitle>
              <CardDescription>
                Review and manage artist membership applications
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {artistApplications.map((application) => (
                  <div key={application.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center gap-4">
                      <div className="h-12 w-12 bg-gradient-to-br from-purple-400 to-pink-400 rounded-full flex items-center justify-center">
                        <Mic className="h-6 w-6 text-white" />
                      </div>
                      <div>
                        <h4 className="font-semibold">{application.name}</h4>
                        <p className="text-sm text-muted-foreground">Stage Name: {application.stage_name}</p>
                        <div className="flex items-center gap-2 mt-1">
                          <Badge variant="outline">{application.genre}</Badge>
                          <Badge variant="secondary">{application.region}</Badge>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge 
                        variant={
                          application.status === 'approved' ? 'default' : 
                          application.status === 'pending' ? 'secondary' : 'outline'
                        }
                      >
                        {application.status}
                      </Badge>
                      {application.status === 'pending' && (
                        <Button 
                          size="sm" 
                          onClick={() => handleApproveApplication(application.id)}
                        >
                          Approve
                        </Button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="music" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Music className="h-5 w-5" />
                Music Releases
              </CardTitle>
              <CardDescription>
                Manage music tracks, albums and streaming analytics
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {musicReleases.map((release) => (
                  <div key={release.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center gap-4">
                      <div className="h-12 w-12 bg-gradient-to-br from-blue-400 to-purple-400 rounded-lg flex items-center justify-center">
                        <Music className="h-6 w-6 text-white" />
                      </div>
                      <div>
                        <h4 className="font-semibold">{release.title}</h4>
                        <p className="text-sm text-muted-foreground">by {release.artist}</p>
                        <div className="flex items-center gap-4 mt-1 text-sm">
                          <span className="flex items-center gap-1">
                            <Play className="h-3 w-3" />
                            {release.streams.toLocaleString()} streams
                          </span>
                          <span className="flex items-center gap-1">
                            <DollarSign className="h-3 w-3" />
                            ₣{release.revenue.toLocaleString()}
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge 
                        variant={release.status === 'published' ? 'default' : 'secondary'}
                      >
                        {release.status}
                      </Badge>
                      {release.status === 'pending' && (
                        <Button 
                          size="sm" 
                          onClick={() => handlePublishRelease(release.id)}
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

        <TabsContent value="fans" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                Fan Clubs
              </CardTitle>
              <CardDescription>
                Monitor fan club activities and engagement
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {fanClubs.map((club) => (
                  <div key={club.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center gap-4">
                      <div className="h-12 w-12 bg-gradient-to-br from-green-400 to-blue-400 rounded-full flex items-center justify-center">
                        <Users className="h-6 w-6 text-white" />
                      </div>
                      <div>
                        <h4 className="font-semibold">{club.name}</h4>
                        <div className="flex items-center gap-4 mt-1 text-sm text-muted-foreground">
                          <span>{club.members.toLocaleString()} total members</span>
                          <span>{club.active_members.toLocaleString()} active</span>
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <Badge variant="default">
                        +{club.monthly_growth}% growth
                      </Badge>
                      <p className="text-sm text-muted-foreground mt-1">this month</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="awards" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Award className="h-5 w-5" />
                Awards System
              </CardTitle>
              <CardDescription>
                Manage awards, nominations and voting campaigns
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {awards.map((award) => (
                  <div key={award.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center gap-4">
                      <div className="h-12 w-12 bg-gradient-to-br from-yellow-400 to-orange-400 rounded-lg flex items-center justify-center">
                        <Award className="h-6 w-6 text-white" />
                      </div>
                      <div>
                        <h4 className="font-semibold">{award.name}</h4>
                        <div className="flex items-center gap-4 mt-1 text-sm text-muted-foreground">
                          <span>{award.nominees} nominees</span>
                          <span>{award.votes.toLocaleString()} votes</span>
                          <span>Ends: {award.ends_at}</span>
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <Badge 
                        variant={
                          award.status === 'voting' ? 'default' : 
                          award.status === 'upcoming' ? 'secondary' : 'outline'
                        }
                      >
                        {award.status}
                      </Badge>
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