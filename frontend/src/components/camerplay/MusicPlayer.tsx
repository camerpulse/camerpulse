import React, { useState, useEffect, useRef } from 'react';
import { 
  Play, Pause, SkipBack, SkipForward, Volume2, VolumeX, 
  Repeat, Shuffle, Heart, MoreHorizontal, Maximize2,
  Download, Share2, ListMusic, X
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Slider } from '@/components/ui/slider';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { useToast } from '@/hooks/use-toast';

interface Track {
  id: string;
  title: string;
  artist: string;
  album?: string;
  duration: number;
  cover_image_url: string;
  audio_url: string;
  price_fcfa?: number;
  is_liked?: boolean;
}

interface MusicPlayerProps {
  currentTrack?: Track;
  playlist: Track[];
  isVisible: boolean;
  onClose?: () => void;
  onTrackChange?: (track: Track) => void;
  isMinimized?: boolean;
  onToggleMinimize?: () => void;
}

export const MusicPlayer: React.FC<MusicPlayerProps> = ({
  currentTrack,
  playlist = [],
  isVisible = false,
  onClose,
  onTrackChange,
  isMinimized = false,
  onToggleMinimize
}) => {
  const { toast } = useToast();
  const audioRef = useRef<HTMLAudioElement>(null);
  
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(0.8);
  const [isMuted, setIsMuted] = useState(false);
  const [isShuffling, setIsShuffling] = useState(false);
  const [repeatMode, setRepeatMode] = useState<'off' | 'all' | 'one'>('off');
  const [currentTrackIndex, setCurrentTrackIndex] = useState(0);
  const [showQueue, setShowQueue] = useState(false);

  // Mock track if none provided
  const defaultTrack: Track = {
    id: '1',
    title: 'Cameroon Rising',
    artist: 'Boy Takunda',
    album: 'Unity EP',
    duration: 225, // 3:45 in seconds
    cover_image_url: 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=300',
    audio_url: '/audio/sample.mp3',
    is_liked: false
  };

  const activeTrack = currentTrack || defaultTrack;

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const updateTime = () => setCurrentTime(audio.currentTime);
    const updateDuration = () => setDuration(audio.duration);
    
    audio.addEventListener('timeupdate', updateTime);
    audio.addEventListener('loadedmetadata', updateDuration);
    audio.addEventListener('ended', handleTrackEnd);

    return () => {
      audio.removeEventListener('timeupdate', updateTime);
      audio.removeEventListener('loadedmetadata', updateDuration);
      audio.removeEventListener('ended', handleTrackEnd);
    };
  }, [activeTrack]);

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = isMuted ? 0 : volume;
    }
  }, [volume, isMuted]);

  const togglePlay = () => {
    const audio = audioRef.current;
    if (!audio) return;

    if (isPlaying) {
      audio.pause();
    } else {
      audio.play().catch((error) => {
        console.error('Playback failed:', error);
        toast({
          title: "Playback Error",
          description: "Unable to play track. Please try again.",
          variant: "destructive"
        });
      });
    }
    setIsPlaying(!isPlaying);
  };

  const handleTrackEnd = () => {
    if (repeatMode === 'one') {
      if (audioRef.current) {
        audioRef.current.currentTime = 0;
        audioRef.current.play();
      }
    } else {
      skipForward();
    }
  };

  const skipForward = () => {
    if (playlist.length === 0) return;
    
    let nextIndex;
    if (isShuffling) {
      nextIndex = Math.floor(Math.random() * playlist.length);
    } else {
      nextIndex = (currentTrackIndex + 1) % playlist.length;
    }
    
    setCurrentTrackIndex(nextIndex);
    if (onTrackChange && playlist[nextIndex]) {
      onTrackChange(playlist[nextIndex]);
    }
  };

  const skipBackward = () => {
    if (playlist.length === 0) return;
    
    const prevIndex = currentTrackIndex === 0 ? playlist.length - 1 : currentTrackIndex - 1;
    setCurrentTrackIndex(prevIndex);
    if (onTrackChange && playlist[prevIndex]) {
      onTrackChange(playlist[prevIndex]);
    }
  };

  const handleSeek = (value: number[]) => {
    const audio = audioRef.current;
    if (audio && duration) {
      const seekTime = (value[0] / 100) * duration;
      audio.currentTime = seekTime;
      setCurrentTime(seekTime);
    }
  };

  const handleVolumeChange = (value: number[]) => {
    setVolume(value[0] / 100);
    setIsMuted(false);
  };

  const toggleMute = () => {
    setIsMuted(!isMuted);
  };

  const toggleShuffle = () => {
    setIsShuffling(!isShuffling);
    toast({
      title: isShuffling ? "Shuffle Off" : "Shuffle On",
      description: `Shuffle ${isShuffling ? 'disabled' : 'enabled'}`,
    });
  };

  const toggleRepeat = () => {
    const modes: ('off' | 'all' | 'one')[] = ['off', 'all', 'one'];
    const currentIndex = modes.indexOf(repeatMode);
    const nextMode = modes[(currentIndex + 1) % modes.length];
    setRepeatMode(nextMode);
    
    const modeText = nextMode === 'off' ? 'Off' : nextMode === 'all' ? 'All' : 'One';
    toast({
      title: `Repeat ${modeText}`,
      description: `Repeat mode set to ${modeText.toLowerCase()}`,
    });
  };

  const toggleLike = () => {
    toast({
      title: activeTrack.is_liked ? "Removed from Liked" : "Added to Liked",
      description: `${activeTrack.title} ${activeTrack.is_liked ? 'removed from' : 'added to'} your liked songs`,
    });
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  if (!isVisible) return null;

  // Minimized Player
  if (isMinimized) {
    return (
      <div className="fixed bottom-0 left-0 right-0 bg-background/95 backdrop-blur border-t border-border z-50">
        <div className="flex items-center justify-between px-4 py-2">
          <div className="flex items-center gap-3 flex-1">
            <img 
              src={activeTrack.cover_image_url} 
              alt={activeTrack.title}
              className="w-12 h-12 rounded object-cover"
            />
            <div className="min-w-0 flex-1">
              <p className="font-medium truncate">{activeTrack.title}</p>
              <p className="text-sm text-muted-foreground truncate">{activeTrack.artist}</p>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <Button size="sm" variant="ghost" onClick={skipBackward}>
              <SkipBack className="h-4 w-4" />
            </Button>
            <Button size="sm" onClick={togglePlay}>
              {isPlaying ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
            </Button>
            <Button size="sm" variant="ghost" onClick={skipForward}>
              <SkipForward className="h-4 w-4" />
            </Button>
            <Button size="sm" variant="ghost" onClick={onToggleMinimize}>
              <Maximize2 className="h-4 w-4" />
            </Button>
          </div>
        </div>
        
        <Progress 
          value={duration > 0 ? (currentTime / duration) * 100 : 0} 
          className="h-1 rounded-none" 
        />
        
        <audio ref={audioRef} src={activeTrack.audio_url} />
      </div>
    );
  }

  // Full Player
  return (
    <div className="fixed inset-0 bg-background z-50 flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="sm" onClick={onToggleMinimize}>
            <X className="h-4 w-4" />
          </Button>
          <h2 className="text-lg font-semibold">Now Playing</h2>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="sm" onClick={() => setShowQueue(!showQueue)}>
            <ListMusic className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="sm" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <div className="flex flex-1 overflow-hidden">
        {/* Main Player */}
        <div className="flex-1 flex flex-col items-center justify-center p-8">
          {/* Album Art */}
          <div className="relative mb-8">
            <img 
              src={activeTrack.cover_image_url} 
              alt={activeTrack.title}
              className="w-80 h-80 rounded-xl shadow-2xl object-cover"
            />
            <div className="absolute inset-0 rounded-xl bg-gradient-to-t from-black/20 to-transparent" />
          </div>

          {/* Track Info */}
          <div className="text-center mb-8 max-w-md">
            <h1 className="text-3xl font-bold mb-2">{activeTrack.title}</h1>
            <p className="text-xl text-muted-foreground mb-2">{activeTrack.artist}</p>
            {activeTrack.album && (
              <p className="text-sm text-muted-foreground">{activeTrack.album}</p>
            )}
            {activeTrack.price_fcfa && (
              <Badge variant="outline" className="mt-2">
                {activeTrack.price_fcfa.toLocaleString()} FCFA
              </Badge>
            )}
          </div>

          {/* Progress Bar */}
          <div className="w-full max-w-md mb-6">
            <Slider
              value={[duration > 0 ? (currentTime / duration) * 100 : 0]}
              onValueChange={handleSeek}
              max={100}
              step={0.1}
              className="w-full"
            />
            <div className="flex justify-between text-sm text-muted-foreground mt-2">
              <span>{formatTime(currentTime)}</span>
              <span>{formatTime(duration)}</span>
            </div>
          </div>

          {/* Controls */}
          <div className="flex items-center gap-4 mb-6">
            <Button
              variant="ghost"
              size="sm"
              onClick={toggleShuffle}
              className={isShuffling ? "text-primary" : ""}
            >
              <Shuffle className="h-4 w-4" />
            </Button>
            
            <Button variant="ghost" size="lg" onClick={skipBackward}>
              <SkipBack className="h-6 w-6" />
            </Button>
            
            <Button size="lg" onClick={togglePlay} className="h-14 w-14 rounded-full">
              {isPlaying ? <Pause className="h-8 w-8" /> : <Play className="h-8 w-8" />}
            </Button>
            
            <Button variant="ghost" size="lg" onClick={skipForward}>
              <SkipForward className="h-6 w-6" />
            </Button>
            
            <Button
              variant="ghost"
              size="sm"
              onClick={toggleRepeat}
              className={repeatMode !== 'off' ? "text-primary" : ""}
            >
              <Repeat className="h-4 w-4" />
              {repeatMode === 'one' && <span className="text-xs ml-1">1</span>}
            </Button>
          </div>

          {/* Secondary Controls */}
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="sm" onClick={toggleLike}>
              <Heart className={`h-4 w-4 ${activeTrack.is_liked ? 'fill-current text-red-500' : ''}`} />
            </Button>
            
            <Button variant="ghost" size="sm">
              <Download className="h-4 w-4" />
            </Button>
            
            <Button variant="ghost" size="sm">
              <Share2 className="h-4 w-4" />
            </Button>

            <div className="flex items-center gap-2 ml-4">
              <Button variant="ghost" size="sm" onClick={toggleMute}>
                {isMuted ? <VolumeX className="h-4 w-4" /> : <Volume2 className="h-4 w-4" />}
              </Button>
              <Slider
                value={[isMuted ? 0 : volume * 100]}
                onValueChange={handleVolumeChange}
                max={100}
                step={1}
                className="w-20"
              />
            </div>
          </div>
        </div>

        {/* Queue Sidebar */}
        {showQueue && (
          <div className="w-80 border-l bg-muted/30 p-4 overflow-y-auto">
            <h3 className="font-semibold mb-4">Up Next</h3>
            <div className="space-y-2">
              {playlist.map((track, index) => (
                <Card 
                  key={track.id} 
                  className={`cursor-pointer hover:bg-muted/50 transition-colors ${
                    index === currentTrackIndex ? 'ring-2 ring-primary' : ''
                  }`}
                  onClick={() => {
                    setCurrentTrackIndex(index);
                    if (onTrackChange) onTrackChange(track);
                  }}
                >
                  <CardContent className="p-3">
                    <div className="flex items-center gap-3">
                      <img 
                        src={track.cover_image_url} 
                        alt={track.title}
                        className="w-12 h-12 rounded object-cover"
                      />
                      <div className="flex-1 min-w-0">
                        <p className="font-medium truncate">{track.title}</p>
                        <p className="text-sm text-muted-foreground truncate">{track.artist}</p>
                      </div>
                      <span className="text-sm text-muted-foreground">
                        {formatTime(track.duration)}
                      </span>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}
      </div>

      <audio ref={audioRef} src={activeTrack.audio_url} />
    </div>
  );
};

export default MusicPlayer;