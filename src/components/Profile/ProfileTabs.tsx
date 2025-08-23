import React from 'react';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Grid3X3,
  Users,
  Music,
  Briefcase,
  Building,
  Stethoscope,
  Home,
  Camera,
  Video,
  Award
} from 'lucide-react';

interface ProfileTabsProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
  hasMusic: boolean;
  hasJob: boolean;
  hasHealthcare: boolean;
  hasVillage: boolean;
}

export const ProfileTabs: React.FC<ProfileTabsProps> = ({
  activeTab,
  onTabChange,
  hasMusic,
  hasJob,
  hasHealthcare,
  hasVillage
}) => {
  return (
    <Tabs value={activeTab} onValueChange={onTabChange} className="w-full">
      <TabsList className="grid w-full auto-cols-fr grid-flow-col bg-background border-b rounded-none h-auto p-0">
        <TabsTrigger 
          value="overview" 
          className="flex items-center gap-2 data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none"
        >
          <Grid3X3 className="h-4 w-4" />
          <span className="hidden sm:inline">Overview</span>
        </TabsTrigger>
        
        <TabsTrigger 
          value="about" 
          className="flex items-center gap-2 data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none"
        >
          <Users className="h-4 w-4" />
          <span className="hidden sm:inline">About</span>
        </TabsTrigger>

        {hasMusic && (
          <TabsTrigger 
            value="music" 
            className="flex items-center gap-2 data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none"
          >
            <Music className="h-4 w-4" />
            <span className="hidden sm:inline">Music</span>
          </TabsTrigger>
        )}

        {hasJob && (
          <TabsTrigger 
            value="professional" 
            className="flex items-center gap-2 data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none"
          >
            <Briefcase className="h-4 w-4" />
            <span className="hidden sm:inline">Professional</span>
          </TabsTrigger>
        )}


        {hasHealthcare && (
          <TabsTrigger 
            value="healthcare" 
            className="flex items-center gap-2 data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none"
          >
            <Stethoscope className="h-4 w-4" />
            <span className="hidden sm:inline">Healthcare</span>
          </TabsTrigger>
        )}

        {hasVillage && (
          <TabsTrigger 
            value="village" 
            className="flex items-center gap-2 data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none"
          >
            <Home className="h-4 w-4" />
            <span className="hidden sm:inline">Village</span>
          </TabsTrigger>
        )}

        <TabsTrigger 
          value="media" 
          className="flex items-center gap-2 data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none"
        >
          <Camera className="h-4 w-4" />
          <span className="hidden sm:inline">Media</span>
        </TabsTrigger>

        <TabsTrigger 
          value="achievements" 
          className="flex items-center gap-2 data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none"
        >
          <Award className="h-4 w-4" />
          <span className="hidden sm:inline">Awards</span>
        </TabsTrigger>
      </TabsList>
    </Tabs>
  );
};