import React from 'react';
import { AppLayout } from '@/components/Layout/AppLayout';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { OralTraditionRecorder } from '@/components/Cultural/OralTraditionRecorder';
import { TraditionalRecipeSharing } from '@/components/Cultural/TraditionalRecipeSharing';
import { CeremonialCalendar } from '@/components/Cultural/CeremonialCalendar';
import { LanguagePreservation } from '@/components/Cultural/LanguagePreservation';
import { 
  Mic, 
  ChefHat, 
  Calendar, 
  Languages,
  Heart,
  Star
} from 'lucide-react';

export const CulturalHeritageCenter = () => {
  return (
    <AppLayout>
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold bg-gradient-civic bg-clip-text text-transparent mb-4">
              Cultural Heritage Center
            </h1>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              Preserve, share, and celebrate Cameroon's rich cultural traditions through 
              digital storytelling, recipe sharing, ceremonial tracking, and language preservation
            </p>
          </div>

          {/* Feature Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <div className="bg-gradient-to-br from-primary/10 to-primary/5 border border-primary/20 rounded-lg p-6 text-center">
              <Mic className="h-8 w-8 text-primary mx-auto mb-3" />
              <h3 className="font-semibold mb-2">Oral Traditions</h3>
              <p className="text-sm text-muted-foreground">
                Record and preserve traditional stories, songs, and cultural knowledge
              </p>
            </div>
            
            <div className="bg-gradient-to-br from-green-500/10 to-green-500/5 border border-green-500/20 rounded-lg p-6 text-center">
              <ChefHat className="h-8 w-8 text-green-600 mx-auto mb-3" />
              <h3 className="font-semibold mb-2">Traditional Recipes</h3>
              <p className="text-sm text-muted-foreground">
                Share ancestral culinary wisdom and cooking techniques
              </p>
            </div>
            
            <div className="bg-gradient-to-br from-blue-500/10 to-blue-500/5 border border-blue-500/20 rounded-lg p-6 text-center">
              <Calendar className="h-8 w-8 text-blue-600 mx-auto mb-3" />
              <h3 className="font-semibold mb-2">Ceremonial Calendar</h3>
              <p className="text-sm text-muted-foreground">
                Track traditional ceremonies and cultural events
              </p>
            </div>
            
            <div className="bg-gradient-to-br from-purple-500/10 to-purple-500/5 border border-purple-500/20 rounded-lg p-6 text-center">
              <Languages className="h-8 w-8 text-purple-600 mx-auto mb-3" />
              <h3 className="font-semibold mb-2">Language Tools</h3>
              <p className="text-sm text-muted-foreground">
                Preserve local languages with digital dictionaries and lessons
              </p>
            </div>
          </div>

          {/* Main Content Tabs */}
          <Tabs defaultValue="oral-traditions" className="space-y-6">
            <TabsList className="grid w-full grid-cols-4 h-auto">
              <TabsTrigger value="oral-traditions" className="flex flex-col items-center gap-2 py-3">
                <Mic className="h-5 w-5" />
                <span className="text-xs">Oral Traditions</span>
              </TabsTrigger>
              <TabsTrigger value="recipes" className="flex flex-col items-center gap-2 py-3">
                <ChefHat className="h-5 w-5" />
                <span className="text-xs">Recipes</span>
              </TabsTrigger>
              <TabsTrigger value="calendar" className="flex flex-col items-center gap-2 py-3">
                <Calendar className="h-5 w-5" />
                <span className="text-xs">Calendar</span>
              </TabsTrigger>
              <TabsTrigger value="language" className="flex flex-col items-center gap-2 py-3">
                <Languages className="h-5 w-5" />
                <span className="text-xs">Language</span>
              </TabsTrigger>
            </TabsList>

            <TabsContent value="oral-traditions">
              <OralTraditionRecorder />
            </TabsContent>

            <TabsContent value="recipes">
              <TraditionalRecipeSharing />
            </TabsContent>

            <TabsContent value="calendar">
              <CeremonialCalendar />
            </TabsContent>

            <TabsContent value="language">
              <LanguagePreservation />
            </TabsContent>
          </Tabs>

          {/* Statistics Footer */}
          <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-6 text-center">
            <div className="bg-gradient-to-br from-primary/5 to-transparent border rounded-lg p-6">
              <div className="flex items-center justify-center gap-2 mb-2">
                <Heart className="h-5 w-5 text-primary" />
                <span className="text-2xl font-bold">250+</span>
              </div>
              <p className="text-sm text-muted-foreground">Cultural Artifacts Preserved</p>
            </div>
            
            <div className="bg-gradient-to-br from-green-500/5 to-transparent border rounded-lg p-6">
              <div className="flex items-center justify-center gap-2 mb-2">
                <Star className="h-5 w-5 text-green-600" />
                <span className="text-2xl font-bold">15</span>
              </div>
              <p className="text-sm text-muted-foreground">Languages Documented</p>
            </div>
            
            <div className="bg-gradient-to-br from-blue-500/5 to-transparent border rounded-lg p-6">
              <div className="flex items-center justify-center gap-2 mb-2">
                <Calendar className="h-5 w-5 text-blue-600" />
                <span className="text-2xl font-bold">50+</span>
              </div>
              <p className="text-sm text-muted-foreground">Ceremonies Tracked</p>
            </div>
          </div>
        </div>
      </div>
    </AppLayout>
  );
};