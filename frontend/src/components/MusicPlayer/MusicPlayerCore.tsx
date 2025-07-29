import React, { useState, useRef, useEffect } from 'react';
import { 
  Play, 
  Pause, 
  SkipBack, 
  SkipForward, 
  Repeat, 
  Shuffle, 
  Volume2, 
  VolumeX, 
  Heart, 
  Download 
} from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Card } from "@/components/ui/card";
import { supabase } from '@/integrations/supabase/client';

interface Track {
  id: string;
  title: string;
  artist: string;
  duration: number;
  audioUrl: string;
  coverArtUrl?: string;
}

interface MusicPlayerProps {
  tracks: Track[];
  initialTrackIndex?: number;
}

const MusicPlayerCore: React.FC<MusicPlayerProps> = ({ 
  tracks, 
  initialTrackIndex = 0 
}) => {
  const [currentTrackIndex, setCurrentTrackIndex] = useState(initialTrackIndex);
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [volume, setVolume] = useState(0.5);
  const [isShuffle, setIsShuffle] = useState(false);
  const [isRepeat, setIsRepeat] = useState(false);
  const [isMuted, setIsMuted] = useState(false);

  const audioRef = useRef<HTMLAudioElement>(null);
  const progressRef = useRef<NodeJS.Timeout | null>(null);

  const currentTrack = tracks[currentTrackIndex];

  // Track play history
  const recordPlayHistory = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (user) {
        await supabase
          .from('track_plays')
          .insert({
            track_id: currentTrack.id,
            user_id: user.id,
            play_duration: Math.floor(audioRef.current?.currentTime || 0)
          });
      }
    } catch (error) {
      console.error('Failed to record play history:', error);
    }
  };

  useEffect(() => {
    const audioElement = audioRef.current;
    if (!audioElement) return;

    const handleEnded = () => {
      recordPlayHistory();
      
      if (isRepeat) {
        audioElement.currentTime = 0;
        audioElement.play();
      } else if (isShuffle) {
        const randomIndex = Math.floor(Math.random() * tracks.length);
        setCurrentTrackIndex(randomIndex);
        setIsPlaying(true);
      } else if (currentTrackIndex < tracks.length - 1) {
        setCurrentTrackIndex(prev => prev + 1);
        setIsPlaying(true);
      } else {
        setIsPlaying(false);
      }
    };

    audioElement.addEventListener('ended', handleEnded);
    return () => {
      audioElement.removeEventListener('ended', handleEnded);
    };
  }, [currentTrackIndex, tracks, isRepeat, isShuffle]);

  useEffect(() => {
    const audioElement = audioRef.current;
    if (!audioElement) return;

    if (isPlaying) {
      audioElement.play();
      progressRef.current = setInterval(() => {
        const currentTime = audioElement.currentTime;
        const duration = audioElement.duration;
        const progressPercentage = (currentTime / duration) * 100;
        setProgress(progressPercentage);
      }, 1000);
    } else {
      audioElement.pause();
      if (progressRef.current) {
        clearInterval(progressRef.current);
      }
    }

    return () => {
      if (progressRef.current) {
        clearInterval(progressRef.current);
      }
    };
  }, [isPlaying]);

  const togglePlay = () => {
    setIsPlaying(prev => !prev);
  };

  const handleSeek = (value: number[]) => {
    const audioElement = audioRef.current;
    if (!audioElement) return;

    const seekTime = (value[0] / 100) * audioElement.duration;
    audioElement.currentTime = seekTime;
    setProgress(value[0]);
  };

  const handleVolumeChange = (value: number[]) => {
    const audioElement = audioRef.current;
    if (!audioElement) return;

    const newVolume = value[0] / 100;
    audioElement.volume = newVolume;
    setVolume(newVolume);
    setIsMuted(newVolume === 0);
  };

  const toggleMute = () => {
    const audioElement = audioRef.current;
    if (!audioElement) return;

    if (isMuted) {
      audioElement.volume = volume;
      setIsMuted(false);
    } else {
      audioElement.volume = 0;
      setIsMuted(true);
    }
  };

  const nextTrack = () => {
    setCurrentTrackIndex(prev => 
      isShuffle 
        ? Math.floor(Math.random() * tracks.length)
        : prev === tracks.length - 1 ? 0 : prev + 1
    );
    setIsPlaying(true);
  };

  const prevTrack = () => {
    setCurrentTrackIndex(prev => 
      prev === 0 ? tracks.length - 1 : prev - 1
    );
    setIsPlaying(true);
  };

  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = Math.floor(seconds % 60);
    return `${minutes}:${remainingSeconds < 10 ? '0' : ''}${remainingSeconds}`;
  };

  return (
    <Card className="w-full max-w-md mx-auto p-4 shadow-lg">
      <div className="flex flex-col items-center mb-4">
        <img 
          src={currentTrack.coverArtUrl || '/placeholder-album.png'} 
          alt={currentTrack.title} 
          className="w-48 h-48 object-cover rounded-lg mb-4 shadow-md"
        />
        <div className="text-center">
          <h3 className="text-xl font-bold">{currentTrack.title}</h3>
          <p className="text-muted-foreground">{currentTrack.artist}</p>
        </div>
      </div>

      <audio 
        ref={audioRef} 
        src={currentTrack.audioUrl} 
        preload="metadata"
      />

      <div className="flex flex-col space-y-4">
        <div>
          <Slider 
            value={[progress]} 
            onValueChange={handleSeek} 
            min={0} 
            max={100} 
            className="w-full" 
          />
          <div className="flex justify-between text-xs text-muted-foreground mt-1">
            <span>{formatTime((audioRef.current?.currentTime || 0))}</span>
            <span>{formatTime(currentTrack.duration)}</span>
          </div>
        </div>

        <div className="flex justify-between items-center">
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={() => setIsShuffle(prev => !prev)}
            className={isShuffle ? 'text-primary' : ''}
          >
            <Shuffle className="h-5 w-5" />
          </Button>
          <Button variant="ghost" size="icon" onClick={prevTrack}>
            <SkipBack className="h-6 w-6" />
          </Button>
          <Button 
            variant="default" 
            size="icon" 
            className="rounded-full w-12 h-12" 
            onClick={togglePlay}
          >
            {isPlaying ? <Pause className="h-6 w-6" /> : <Play className="h-6 w-6" />}
          </Button>
          <Button variant="ghost" size="icon" onClick={nextTrack}>
            <SkipForward className="h-6 w-6" />
          </Button>
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={() => setIsRepeat(prev => !prev)}
            className={isRepeat ? 'text-primary' : ''}
          >
            <Repeat className="h-5 w-5" />
          </Button>
        </div>

        <div className="flex items-center space-x-2">
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={toggleMute}
          >
            {isMuted ? <VolumeX className="h-5 w-5" /> : <Volume2 className="h-5 w-5" />}
          </Button>
          <Slider 
            value={[volume * 100]} 
            onValueChange={handleVolumeChange} 
            min={0} 
            max={100} 
            className="flex-1" 
          />
        </div>

        <div className="flex justify-between mt-2">
          <Button variant="outline" size="sm">
            <Heart className="h-4 w-4 mr-2" /> Like
          </Button>
          <Button variant="outline" size="sm">
            <Download className="h-4 w-4 mr-2" /> Download
          </Button>
        </div>
      </div>
    </Card>
  );
};

export default MusicPlayerCore;