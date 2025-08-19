import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { cn } from '@/lib/utils';
import { 
  Target, BarChart3, Timer, Map, 
  ArrowLeftRight, PlayCircle, Flag 
} from 'lucide-react';

interface PollOption {
  id: string;
  text: string;
  emoji?: string;
  image_url?: string;
  vote_count?: number;
}

interface PollTemplate {
  id: string;
  template_name: string;
  style_name: string;
  layout_type: string;
  color_theme: any;
  features: any;
}

interface PollTemplateRendererProps {
  template: PollTemplate;
  poll: {
    id: string;
    title: string;
    description?: string;
    options: PollOption[];
    total_votes?: number;
    expires_at?: string;
    region?: string;
  };
  onVote: (optionId: string) => void;
  hasVoted?: boolean;
  selectedOption?: string;
  showResults?: boolean;
  className?: string;
}

export const PollTemplateRenderer: React.FC<PollTemplateRendererProps> = ({
  template,
  poll,
  onVote,
  hasVoted = false,
  selectedOption,
  showResults = false,
  className
}) => {
  const [timeLeft, setTimeLeft] = useState<number | null>(null);
  const [currentSlide, setCurrentSlide] = useState(0);
  
  const colorTheme = template.color_theme;
  const features = template.features;
  const totalVotes = poll.total_votes || 0;

  // Timer logic for flash polls
  useEffect(() => {
    if (template.layout_type === 'timer' && poll.expires_at) {
      const updateTimer = () => {
        const now = new Date().getTime();
        const expiry = new Date(poll.expires_at!).getTime();
        const diff = expiry - now;
        
        if (diff > 0) {
          setTimeLeft(Math.floor(diff / 1000));
        } else {
          setTimeLeft(0);
        }
      };

      updateTimer();
      const interval = setInterval(updateTimer, 1000);
      return () => clearInterval(interval);
    }
  }, [template.layout_type, poll.expires_at]);

  // Format timer display
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // Calculate vote percentage
  const getVotePercentage = (option: PollOption) => {
    if (!showResults || totalVotes === 0) return 0;
    return ((option.vote_count || 0) / totalVotes) * 100;
  };

  // Render based on template type
  const renderTemplate = () => {
    switch (template.layout_type) {
      case 'card':
        return <CivicCardTemplate />;
      case 'ballot':
        return <InteractiveBallotTemplate />;
      case 'chart':
        return <BarChartTemplate />;
      case 'emoji':
        return <EmojiBurstTemplate />;
      case 'radar':
        return <RadarSentimentTemplate />;
      case 'timer':
        return <FlashPollTemplate />;
      case 'comparison':
        return <SideBySideTemplate />;
      case 'heatmap':
        return <PulseHeatmapTemplate />;
      case 'carousel':
        return <CarouselTemplate />;
      case 'voice':
        return <VoicePollTemplate />;
      default:
        return <CivicCardTemplate />;
    }
  };

  // Template Components
  const CivicCardTemplate = () => (
    <Card 
      className={cn("relative overflow-hidden transition-all duration-300", className)}
      style={{ backgroundColor: colorTheme.background, borderColor: colorTheme.primary }}
    >
      {features.hasFlag && (
        <div className="absolute top-4 right-4">
          <Badge className="flex items-center gap-1" style={{ backgroundColor: colorTheme.accent }}>
            <Flag className="h-3 w-3" />
            Cameroon
          </Badge>
        </div>
      )}
      
      <CardHeader style={{ color: colorTheme.text }}>
        <CardTitle className="text-xl">{poll.title}</CardTitle>
        {poll.description && (
          <p className="text-sm opacity-80">{poll.description}</p>
        )}
      </CardHeader>

      <CardContent className="space-y-3">
        {poll.options.map((option, index) => {
          const percentage = getVotePercentage(option);
          const isSelected = selectedOption === option.id;
          
          return (
            <div key={option.id} className="space-y-2">
              <Button
                variant={isSelected ? "default" : "outline"}
                className="w-full justify-start h-auto p-4"
                onClick={() => !hasVoted && onVote(option.id)}
                disabled={hasVoted}
                style={{
                  backgroundColor: isSelected ? colorTheme.primary : 'transparent',
                  borderColor: colorTheme.primary,
                  color: isSelected ? colorTheme.background : colorTheme.text
                }}
              >
                <div className="flex items-center justify-between w-full">
                  <span>{option.text}</span>
                  {showResults && (
                    <Badge variant="secondary">
                      {option.vote_count || 0} votes
                    </Badge>
                  )}
                </div>
              </Button>
              
              {showResults && features.hasProgressBars && (
                <div className="px-1">
                  <div className="flex justify-between text-xs mb-1">
                    <span>{percentage.toFixed(1)}%</span>
                  </div>
                  <Progress 
                    value={percentage} 
                    className="h-2"
                    style={{ backgroundColor: colorTheme.secondary }}
                  />
                </div>
              )}
            </div>
          );
        })}

        {showResults && (
          <div className="text-center pt-2">
            <Badge variant="outline" style={{ borderColor: colorTheme.primary }}>
              {totalVotes} total votes
            </Badge>
          </div>
        )}
      </CardContent>
    </Card>
  );

  const InteractiveBallotTemplate = () => (
    <Card 
      className={cn("border-2 bg-white", className)}
      style={{ borderColor: colorTheme.primary }}
    >
      <CardHeader className="text-center border-b-2 border-gray-200">
        <CardTitle className="text-2xl font-serif" style={{ color: colorTheme.primary }}>
          ELECTRONIC BALLOT
        </CardTitle>
        <p className="text-sm text-gray-600 font-serif">
          {poll.title}
        </p>
      </CardHeader>

      <CardContent className="p-6">
        <div className="space-y-4">
          {poll.options.map((option, index) => {
            const isSelected = selectedOption === option.id;
            const percentage = getVotePercentage(option);
            
            return (
              <div 
                key={option.id}
                className="flex items-center gap-4 p-4 border rounded cursor-pointer transition-colors"
                style={{ 
                  borderColor: isSelected ? colorTheme.primary : '#e5e7eb',
                  backgroundColor: isSelected ? colorTheme.secondary + '20' : 'white'
                }}
                onClick={() => !hasVoted && onVote(option.id)}
              >
                <div 
                  className="w-6 h-6 border-2 rounded flex items-center justify-center"
                  style={{ borderColor: colorTheme.primary }}
                >
                  {isSelected && (
                    <div 
                      className="w-3 h-3 rounded"
                      style={{ backgroundColor: colorTheme.primary }}
                    />
                  )}
                </div>
                
                <div className="flex-1">
                  <span className="font-serif text-lg">{option.text}</span>
                  {showResults && (
                    <div className="text-sm text-gray-600 mt-1">
                      {percentage.toFixed(1)}% ({option.vote_count || 0} votes)
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        <div className="text-center mt-6 pt-4 border-t">
          <p className="text-xs text-gray-500 font-serif">
            Vote électronique sécurisé • CamerPulse
          </p>
        </div>
      </CardContent>
    </Card>
  );

  const BarChartTemplate = () => (
    <Card className={cn(className)} style={{ backgroundColor: colorTheme.background }}>
      <CardHeader>
        <CardTitle style={{ color: colorTheme.text }}>{poll.title}</CardTitle>
        {poll.description && (
          <p className="text-sm opacity-80" style={{ color: colorTheme.text }}>
            {poll.description}
          </p>
        )}
      </CardHeader>

      <CardContent className="space-y-4">
        {poll.options.map((option, index) => {
          const percentage = getVotePercentage(option);
          const isSelected = selectedOption === option.id;
          
          return (
            <div key={option.id} className="space-y-2">
              <div className="flex justify-between items-center">
                <Button
                  variant={isSelected ? "default" : "ghost"}
                  className="text-left justify-start"
                  onClick={() => !hasVoted && onVote(option.id)}
                  disabled={hasVoted}
                  style={{
                    color: isSelected ? colorTheme.background : colorTheme.text,
                    backgroundColor: isSelected ? colorTheme.primary : 'transparent'
                  }}
                >
                  {option.text}
                </Button>
                
                {showResults && (
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium">{percentage.toFixed(1)}%</span>
                    <Badge variant="outline">{option.vote_count || 0}</Badge>
                  </div>
                )}
              </div>
              
              {showResults && (
                <div className="relative">
                  <div 
                    className="h-8 rounded transition-all duration-1000 ease-out flex items-center px-3"
                    style={{
                      backgroundColor: colorTheme.primary,
                      width: `${Math.max(percentage, 5)}%`
                    }}
                  >
                    <span className="text-white text-sm font-medium">
                      {option.vote_count || 0}
                    </span>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </CardContent>
    </Card>
  );

  const EmojiBurstTemplate = () => (
    <Card 
      className={cn("text-center", className)}
      style={{ backgroundColor: colorTheme.background }}
    >
      <CardHeader>
        <CardTitle style={{ color: colorTheme.text }}>{poll.title}</CardTitle>
        {poll.description && (
          <p className="text-sm opacity-80" style={{ color: colorTheme.text }}>
            {poll.description}
          </p>
        )}
      </CardHeader>

      <CardContent>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {poll.options.map((option, index) => {
            const percentage = getVotePercentage(option);
            const isSelected = selectedOption === option.id;
            
            return (
              <div key={option.id} className="space-y-2">
                <Button
                  variant="ghost"
                  className={cn(
                    "h-24 w-full flex-col transition-all duration-300 hover:scale-110",
                    isSelected && "ring-2 ring-offset-2"
                  )}
                  style={{
                    backgroundColor: isSelected ? colorTheme.primary + '20' : 'transparent',
                    borderColor: isSelected ? colorTheme.primary : 'transparent'
                  }}
                  onClick={() => !hasVoted && onVote(option.id)}
                  disabled={hasVoted}
                >
                  <div className="text-4xl mb-2">
                    {option.emoji || '😊'}
                  </div>
                  <span className="text-sm" style={{ color: colorTheme.text }}>
                    {option.text}
                  </span>
                </Button>
                
                {showResults && (
                  <div className="text-center space-y-1">
                    <div className="text-lg font-bold" style={{ color: colorTheme.primary }}>
                      {percentage.toFixed(0)}%
                    </div>
                    <Badge variant="outline" className="text-xs">
                      {option.vote_count || 0}
                    </Badge>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {showResults && (
          <div className="mt-6 pt-4 border-t">
            <Badge variant="outline" style={{ borderColor: colorTheme.primary }}>
              {totalVotes} total reactions
            </Badge>
          </div>
        )}
      </CardContent>
    </Card>
  );

  const FlashPollTemplate = () => (
    <Card 
      className={cn("relative overflow-hidden border-2", className)}
      style={{ 
        backgroundColor: colorTheme.background,
        borderColor: colorTheme.primary
      }}
    >
      {/* Urgency indicator */}
      <div 
        className="absolute top-0 left-0 right-0 h-1 animate-pulse"
        style={{ backgroundColor: colorTheme.primary }}
      />
      
      <CardHeader className="text-center">
        <div className="flex items-center justify-center gap-2 mb-2">
          <Timer className="h-5 w-5 /* animate-spin - disabled */" style={{ color: colorTheme.primary }} />
          <Badge 
            variant="destructive" 
            className="animate-pulse"
            style={{ backgroundColor: colorTheme.primary }}
          >
            FLASH POLL
          </Badge>
        </div>
        
        <CardTitle style={{ color: colorTheme.text }}>{poll.title}</CardTitle>
        
        {timeLeft !== null && (
          <div className="space-y-2">
            <div 
              className="text-3xl font-bold animate-pulse"
              style={{ color: colorTheme.primary }}
            >
              {formatTime(timeLeft)}
            </div>
            <p className="text-sm opacity-80">Time Remaining</p>
          </div>
        )}
      </CardHeader>

      <CardContent className="space-y-3">
        {poll.options.map((option, index) => {
          const percentage = getVotePercentage(option);
          const isSelected = selectedOption === option.id;
          
          return (
            <Button
              key={option.id}
              variant={isSelected ? "default" : "outline"}
              className="w-full h-12 text-lg transition-all duration-200 hover:scale-105"
              onClick={() => !hasVoted && timeLeft !== 0 && onVote(option.id)}
              disabled={hasVoted || timeLeft === 0}
              style={{
                backgroundColor: isSelected ? colorTheme.primary : 'transparent',
                borderColor: colorTheme.primary,
                color: isSelected ? colorTheme.background : colorTheme.text
              }}
            >
              <div className="flex items-center justify-between w-full">
                <span>{option.text}</span>
                {showResults && (
                  <Badge variant="secondary">
                    {percentage.toFixed(0)}%
                  </Badge>
                )}
              </div>
            </Button>
          );
        })}

        {timeLeft === 0 && (
          <div className="text-center py-4">
            <Badge variant="destructive" className="text-lg">
              POLL EXPIRED
            </Badge>
          </div>
        )}
      </CardContent>
    </Card>
  );

  const CarouselTemplate = () => (
    <Card className={cn(className)} style={{ backgroundColor: colorTheme.background }}>
      <CardHeader className="text-center">
        <CardTitle style={{ color: colorTheme.text }}>{poll.title}</CardTitle>
        {poll.description && (
          <p className="text-sm opacity-80" style={{ color: colorTheme.text }}>
            {poll.description}
          </p>
        )}
      </CardHeader>

      <CardContent>
        {poll.options.length > 0 && (
          <div className="space-y-4">
            {/* Current option display */}
            <div className="text-center">
              <div 
                className="relative h-48 rounded-lg overflow-hidden mb-4"
                style={{ backgroundColor: colorTheme.secondary }}
              >
                {poll.options[currentSlide]?.image_url ? (
                  <img 
                    src={poll.options[currentSlide].image_url} 
                    alt={poll.options[currentSlide].text}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <PlayCircle 
                      className="h-16 w-16"
                      style={{ color: colorTheme.primary }}
                    />
                  </div>
                )}
              </div>
              
              <h3 className="text-xl font-semibold mb-2" style={{ color: colorTheme.text }}>
                {poll.options[currentSlide]?.text}
              </h3>
              
              <Button
                size="lg"
                onClick={() => !hasVoted && onVote(poll.options[currentSlide].id)}
                disabled={hasVoted}
                style={{ backgroundColor: colorTheme.primary }}
              >
                Vote for this option
              </Button>
            </div>

            {/* Navigation */}
            <div className="flex justify-center items-center gap-4">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentSlide(Math.max(0, currentSlide - 1))}
                disabled={currentSlide === 0}
              >
                Previous
              </Button>
              
              <div className="flex gap-1">
                {poll.options.map((_, index) => (
                  <div
                    key={index}
                    className={cn(
                      "w-2 h-2 rounded-full cursor-pointer",
                      index === currentSlide ? "opacity-100" : "opacity-30"
                    )}
                    style={{ backgroundColor: colorTheme.primary }}
                    onClick={() => setCurrentSlide(index)}
                  />
                ))}
              </div>
              
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentSlide(Math.min(poll.options.length - 1, currentSlide + 1))}
                disabled={currentSlide === poll.options.length - 1}
              >
                Next
              </Button>
            </div>

            {showResults && (
              <div className="text-center mt-4">
                <div className="text-sm space-y-1">
                  {poll.options.map((option, index) => (
                    <div key={option.id} className="flex justify-between">
                      <span>{option.text}</span>
                      <span>{getVotePercentage(option).toFixed(1)}%</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );

  // Simplified versions for other templates
  const SideBySideTemplate = () => <CivicCardTemplate />;
  const PulseHeatmapTemplate = () => <CivicCardTemplate />;
  const RadarSentimentTemplate = () => <CivicCardTemplate />;
  const VoicePollTemplate = () => <CivicCardTemplate />;

  return renderTemplate();
};