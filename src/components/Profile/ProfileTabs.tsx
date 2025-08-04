import React from 'react';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Grid3X3, 
  User, 
  Camera, 
  Video, 
  Users, 
  Activity,
  Award,
  Vote,
  Calendar,
  Music,
  FileText,
  MapPin
} from 'lucide-react';

interface ProfileTabsProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
  profile: any;
  isOwnProfile: boolean;
}

export const ProfileTabs: React.FC<ProfileTabsProps> = ({
  activeTab,
  onTabChange,
  profile,
  isOwnProfile
}) => {
  const tabs = [
    { id: 'wall', label: 'Wall', icon: Grid3X3, count: profile.posts_count },
    { id: 'about', label: 'About', icon: User },
    { id: 'photos', label: 'Photos', icon: Camera, count: profile.photos_count },
    { id: 'videos', label: 'Videos', icon: Video, count: profile.videos_count },
    { id: 'connections', label: 'Connections', icon: Users, count: profile.connections_count },
    { id: 'activity', label: 'Activity', icon: Activity },
  ];

  // Add additional tabs based on profile type or content
  if (profile.achievements_count > 0) {
    tabs.push({ 
      id: 'achievements', 
      label: 'Awards', 
      icon: Award, 
      count: profile.achievements_count 
    });
  }

  if (profile.polls_created > 0 || isOwnProfile) {
    tabs.push({ 
      id: 'polls', 
      label: 'Polls', 
      icon: Vote, 
      count: profile.polls_created 
    });
  }

  if (profile.events_created > 0 || isOwnProfile) {
    tabs.push({ 
      id: 'events', 
      label: 'Events', 
      icon: Calendar, 
      count: profile.events_created 
    });
  }

  if (profile.profile_type === 'artist' || profile.music_content > 0) {
    tabs.push({ 
      id: 'music', 
      label: 'Music', 
      icon: Music, 
      count: profile.music_content 
    });
  }

  if (profile.articles_count > 0) {
    tabs.push({ 
      id: 'articles', 
      label: 'Articles', 
      icon: FileText, 
      count: profile.articles_count 
    });
  }

  if (profile.places_visited > 0) {
    tabs.push({ 
      id: 'places', 
      label: 'Places', 
      icon: MapPin, 
      count: profile.places_visited 
    });
  }

  return (
    <Tabs value={activeTab} onValueChange={onTabChange} className="w-full">
      <TabsList className="grid grid-cols-3 lg:grid-cols-6 xl:grid-cols-8 bg-background border-b rounded-none h-auto p-0 w-full">
        {tabs.slice(0, 8).map((tab) => {
          const Icon = tab.icon;
          return (
            <TabsTrigger 
              key={tab.id}
              value={tab.id}
              className="flex items-center gap-2 data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none py-3 px-2 lg:px-4"
            >
              <Icon className="h-4 w-4" />
              <span className="hidden sm:inline text-sm">{tab.label}</span>
              {tab.count !== undefined && tab.count > 0 && (
                <span className="text-xs bg-primary/10 text-primary px-1.5 py-0.5 rounded-full min-w-[20px] text-center">
                  {tab.count > 99 ? '99+' : tab.count}
                </span>
              )}
            </TabsTrigger>
          );
        })}
      </TabsList>
    </Tabs>
  );
};