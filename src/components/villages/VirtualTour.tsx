import React, { useState } from 'react';
import { Play, Pause, Volume2, VolumeX, Camera, MapPin, Users, Calendar, ArrowLeft, ArrowRight } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';

interface TourStop {
  id: string;
  title: string;
  description: string;
  imageUrl: string;
  coordinates?: { lat: number; lng: number };
  audioDescription?: string;
  facts?: string[];
  peopleCount?: number;
  historicalDate?: string;
}

interface VirtualTourProps {
  villageId: string;
  villageName: string;
}

const SAMPLE_TOUR_STOPS: TourStop[] = [
  {
    id: '1',
    title: 'Village Center & Chief\'s Palace',
    description: 'The heart of our community where traditional meetings and ceremonies take place. This historic palace has been the seat of leadership for over 200 years.',
    imageUrl: 'https://images.unsplash.com/photo-1605810230434-7631ac76ec81?w=800',
    facts: ['Built in 1823', 'Hosts 500+ people', 'Traditional architecture'],
    peopleCount: 15,
    historicalDate: '1823'
  },
  {
    id: '2', 
    title: 'New Health Center',
    description: 'Our modern health facility serving the entire community and surrounding villages. Equipped with the latest medical equipment thanks to diaspora support.',
    imageUrl: 'https://images.unsplash.com/photo-1519389950473-47ba0277781c?w=800',
    facts: ['Serves 15,000 people', 'Open 24/7', 'Emergency care available'],
    peopleCount: 8,
    historicalDate: '2024'
  },
  {
    id: '3',
    title: 'Primary School & Tech Lab',
    description: 'Where our children learn and prepare for the future. The new computer lab allows students to connect with the world and learn digital skills.',
    imageUrl: 'https://images.unsplash.com/photo-1487058792275-0ad4aaf24ca7?w=800',
    facts: ['450 students enrolled', '20 computers', 'Coding classes available'],
    peopleCount: 35,
    historicalDate: '1965, renovated 2024'
  },
  {
    id: '4',
    title: 'Women\'s Market & Processing Center', 
    description: 'The economic hub where our women process and sell agricultural products. This modern facility has tripled their income.',
    imageUrl: 'https://images.unsplash.com/photo-1472396961693-142e6e269027?w=800',
    facts: ['85 women vendors', '300% income increase', 'Organic certification'],
    peopleCount: 25,
    historicalDate: '2023'
  },
  {
    id: '5',
    title: 'Village Farmlands & River',
    description: 'Our fertile lands and clean water source that sustain the community. Traditional farming methods combined with modern techniques.',
    imageUrl: 'https://images.unsplash.com/photo-1500375592092-4000x6000?w=800',
    facts: ['500 hectares cultivated', 'Year-round water supply', 'Organic farming'],
    peopleCount: 12,
    historicalDate: 'Ancient'
  }
];

export const VirtualTour: React.FC<VirtualTourProps> = ({ villageId, villageName }) => {
  const [currentStop, setCurrentStop] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [tourProgress, setTourProgress] = useState(0);

  const currentTourStop = SAMPLE_TOUR_STOPS[currentStop];
  const progress = ((currentStop + 1) / SAMPLE_TOUR_STOPS.length) * 100;

  const nextStop = () => {
    if (currentStop < SAMPLE_TOUR_STOPS.length - 1) {
      setCurrentStop(currentStop + 1);
      setTourProgress(((currentStop + 2) / SAMPLE_TOUR_STOPS.length) * 100);
    }
  };

  const prevStop = () => {
    if (currentStop > 0) {
      setCurrentStop(currentStop - 1);
      setTourProgress(((currentStop) / SAMPLE_TOUR_STOPS.length) * 100);
    }
  };

  const goToStop = (index: number) => {
    setCurrentStop(index);
    setTourProgress(((index + 1) / SAMPLE_TOUR_STOPS.length) * 100);
  };

  return (
    <div className="space-y-6">
      {/* Tour Header */}
      <Card className="bg-gradient-to-r from-primary/20 to-primary/5">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Camera className="h-6 w-6" />
            Virtual Tour: {villageName}
          </CardTitle>
          <p className="text-muted-foreground">
            Take an immersive journey through our village and see the impact of community development
          </p>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between mb-4">
            <Badge variant="outline" className="flex items-center gap-1">
              <MapPin className="h-4 w-4" />
              Stop {currentStop + 1} of {SAMPLE_TOUR_STOPS.length}
            </Badge>
            <div className="flex items-center gap-2">
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => setIsMuted(!isMuted)}
              >
                {isMuted ? <VolumeX className="h-4 w-4" /> : <Volume2 className="h-4 w-4" />}
              </Button>
              <Button 
                onClick={() => setIsPlaying(!isPlaying)}
                className="bg-primary text-primary-foreground"
              >
                {isPlaying ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
                {isPlaying ? 'Pause Tour' : 'Start Tour'}
              </Button>
            </div>
          </div>
          <Progress value={progress} className="mb-2" />
          <p className="text-sm text-muted-foreground">Tour Progress: {Math.round(progress)}%</p>
        </CardContent>
      </Card>

      {/* Main Tour Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Tour View */}
        <div className="lg:col-span-2">
          <Card className="overflow-hidden">
            <div className="relative">
              <img 
                src={currentTourStop.imageUrl} 
                alt={currentTourStop.title}
                className="w-full h-96 object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
              <div className="absolute bottom-4 left-4 right-4 text-white">
                <h3 className="text-2xl font-bold mb-2">{currentTourStop.title}</h3>
                <p className="text-white/90">{currentTourStop.description}</p>
              </div>
              
              {/* Navigation Arrows */}
              <div className="absolute inset-y-0 left-0 flex items-center">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={prevStop}
                  disabled={currentStop === 0}
                  className="ml-4 bg-black/20 hover:bg-black/40 text-white"
                >
                  <ArrowLeft className="h-4 w-4" />
                </Button>
              </div>
              <div className="absolute inset-y-0 right-0 flex items-center">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={nextStop}
                  disabled={currentStop === SAMPLE_TOUR_STOPS.length - 1}
                  className="mr-4 bg-black/20 hover:bg-black/40 text-white"
                >
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </div>

              {/* Live Indicators */}
              <div className="absolute top-4 right-4 flex gap-2">
                {currentTourStop.peopleCount && (
                  <Badge variant="secondary" className="bg-green-500/90 text-white">
                    <Users className="h-3 w-3 mr-1" />
                    {currentTourStop.peopleCount} people here
                  </Badge>
                )}
                {currentTourStop.historicalDate && (
                  <Badge variant="secondary" className="bg-blue-500/90 text-white">
                    <Calendar className="h-3 w-3 mr-1" />
                    Est. {currentTourStop.historicalDate}
                  </Badge>
                )}
              </div>
            </div>

            {/* Tour Facts */}
            {currentTourStop.facts && (
              <CardContent className="pt-6">
                <h4 className="font-semibold mb-3">Did you know?</h4>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {currentTourStop.facts.map((fact, index) => (
                    <div key={index} className="flex items-center gap-2 text-sm">
                      <div className="w-2 h-2 bg-primary rounded-full" />
                      {fact}
                    </div>
                  ))}
                </div>
              </CardContent>
            )}
          </Card>
        </div>

        {/* Tour Navigation & Info */}
        <div className="space-y-6">
          {/* Tour Stops */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Tour Stops</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {SAMPLE_TOUR_STOPS.map((stop, index) => (
                <div
                  key={stop.id}
                  onClick={() => goToStop(index)}
                  className={`p-3 rounded-lg cursor-pointer transition-all ${
                    index === currentStop
                      ? 'bg-primary text-primary-foreground'
                      : 'bg-muted hover:bg-muted/80'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                      index === currentStop
                        ? 'bg-primary-foreground text-primary'
                        : 'bg-background text-muted-foreground'
                    }`}>
                      {index + 1}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className={`font-medium truncate ${
                        index === currentStop ? 'text-primary-foreground' : ''
                      }`}>
                        {stop.title}
                      </p>
                      <p className={`text-sm truncate ${
                        index === currentStop 
                          ? 'text-primary-foreground/80' 
                          : 'text-muted-foreground'
                      }`}>
                        {stop.description.substring(0, 50)}...
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Tour Stats */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Tour Statistics</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Total Views</span>
                <span className="font-medium">1,247</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Avg. Duration</span>
                <span className="font-medium">8m 32s</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Completion Rate</span>
                <span className="font-medium">89%</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Rating</span>
                <span className="font-medium">4.8/5.0</span>
              </div>
            </CardContent>
          </Card>

          {/* Share Tour */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Share This Tour</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <Button variant="outline" className="w-full">
                Copy Tour Link
              </Button>
              <Button variant="outline" className="w-full">
                Share on Social Media
              </Button>
              <Button variant="outline" className="w-full">
                Download as Video
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};