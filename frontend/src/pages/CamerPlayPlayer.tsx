import { useState, useRef, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { AppLayout } from '@/components/Layout/AppLayout';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Play, Pause, SkipBack, SkipForward, Volume2, Heart, Share2, Download } from 'lucide-react';
import { toast } from 'sonner';

interface Track {
  id: string;
  track_id: string;
  title: string;
  artist: string;
  duration_seconds: number | null;
  audio_file_url: string | null;
  play_count: number;
  release: {
    title: string;
    cover_art_url: string | null;
    release_date: string;
  };
}

const CamerPlayPlayer = () => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTrack, setCurrentTrack] = useState<Track | null>(null);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(100);
  const [currentTrackIndex, setCurrentTrackIndex] = useState(0);
  
  const audioRef = useRef<HTMLAudioElement>(null);

  // Fetch all published tracks
  const { data: tracks = [], isLoading } = useQuery({
    queryKey: ['camerplay-tracks'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('music_tracks')
        .select(`
          *,
          release:music_releases(
            title,
            cover_art_url,
            release_date,
            artist:artist_memberships(stage_name)
          )
        `)
        .eq('music_releases.status', 'published')
        .order('created_at', { ascending: false });

      if (error) throw error;
      return (data || []).map(track => ({
        ...track,
        artist: track.release?.artist?.stage_name || 'Unknown Artist'
      })) as Track[];
    }
  });

  // Set first track as current when tracks load
  useEffect(() => {
    if (tracks.length > 0 && !currentTrack) {
      setCurrentTrack(tracks[0]);
      setCurrentTrackIndex(0);
    }
  }, [tracks, currentTrack]);

  // Audio event listeners
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const updateTime = () => setCurrentTime(audio.currentTime);
    const updateDuration = () => setDuration(audio.duration);
    const handleEnded = () => {
      setIsPlaying(false);
      handleNext();
    };

    audio.addEventListener('timeupdate', updateTime);
    audio.addEventListener('loadedmetadata', updateDuration);
    audio.addEventListener('ended', handleEnded);

    return () => {
      audio.removeEventListener('timeupdate', updateTime);
      audio.removeEventListener('loadedmetadata', updateDuration);
      audio.removeEventListener('ended', handleEnded);
    };
  }, [currentTrack]);

  // Update volume
  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = volume / 100;
    }
  }, [volume]);

  const handlePlayPause = async () => {
    if (!audioRef.current || !currentTrack?.audio_file_url) return;

    if (isPlaying) {
      audioRef.current.pause();
      setIsPlaying(false);
    } else {
      try {
        await audioRef.current.play();
        setIsPlaying(true);
        
        // Log play count
        await supabase
          .from('track_plays')
          .insert({
            track_id: currentTrack.id,
            played_at: new Date().toISOString()
          });
      } catch (error) {
        toast.error('Failed to play track');
        console.error('Playback error:', error);
      }
    }
  };

  const handleNext = () => {
    if (tracks.length === 0) return;
    const nextIndex = (currentTrackIndex + 1) % tracks.length;
    setCurrentTrackIndex(nextIndex);
    setCurrentTrack(tracks[nextIndex]);
    setIsPlaying(false);
  };

  const handlePrevious = () => {
    if (tracks.length === 0) return;
    const prevIndex = currentTrackIndex === 0 ? tracks.length - 1 : currentTrackIndex - 1;
    setCurrentTrackIndex(prevIndex);
    setCurrentTrack(tracks[prevIndex]);
    setIsPlaying(false);
  };

  const handleSeek = (value: number[]) => {
    if (audioRef.current) {
      audioRef.current.currentTime = value[0];
      setCurrentTime(value[0]);
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const handleTrackSelect = (track: Track, index: number) => {
    setCurrentTrack(track);
    setCurrentTrackIndex(index);
    setIsPlaying(false);
  };

  const handleDownload = async (track: Track) => {
    if (!track.audio_file_url) {
      toast.error('Download not available for this track');
      return;
    }

    try {
      // Log the purchase/download
        await supabase
          .from('track_purchases')
          .insert({
            track_id: track.id,
            purchase_type: 'download',
            amount_paid: 0, // Free download for demo
            purchased_at: new Date().toISOString()
          });

      // Create download link
      const link = document.createElement('a');
      link.href = track.audio_file_url;
      link.download = `${track.artist} - ${track.title}.mp3`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      toast.success('Download started');
    } catch (error) {
      toast.error('Download failed');
      console.error('Download error:', error);
    }
  };

  if (isLoading) {
    return (
      <AppLayout>
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-lg">Loading tracks...</div>
        </div>
      </AppLayout>
    );
  }

  if (tracks.length === 0) {
    return (
      <AppLayout>
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <h2 className="text-2xl font-bold mb-2">No tracks available</h2>
            <p className="text-muted-foreground">Check back soon for new music!</p>
          </div>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Current Track Display */}
          <div className="lg:col-span-2">
            <Card className="mb-8">
              <CardContent className="p-8">
                <div className="flex flex-col md:flex-row gap-6">
                  <div className="flex-shrink-0">
                    <img
                      src={currentTrack?.release.cover_art_url || '/placeholder.svg'}
                      alt={currentTrack?.release.title}
                      className="w-64 h-64 object-cover rounded-lg shadow-lg"
                    />
                  </div>
                  
                  <div className="flex-1 space-y-4">
                    <div>
                      <h1 className="text-3xl font-bold">{currentTrack?.title}</h1>
                      <p className="text-xl text-muted-foreground">{currentTrack?.artist}</p>
                      <p className="text-sm text-muted-foreground">{currentTrack?.release.title}</p>
                    </div>

                    <div className="flex gap-2">
                      <Badge variant="secondary">{currentTrack?.play_count} plays</Badge>
                      <Badge variant="outline">
                        {new Date(currentTrack?.release.release_date || '').getFullYear()}
                      </Badge>
                    </div>

                    <div className="flex gap-2">
                      <Button variant="outline" size="sm">
                        <Heart className="w-4 h-4 mr-2" />
                        Like
                      </Button>
                      <Button variant="outline" size="sm">
                        <Share2 className="w-4 h-4 mr-2" />
                        Share
                      </Button>
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => currentTrack && handleDownload(currentTrack)}
                      >
                        <Download className="w-4 h-4 mr-2" />
                        Download
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Audio Player Controls */}
            <Card>
              <CardContent className="p-6">
                <div className="space-y-4">
                  {/* Progress Bar */}
                  <div className="space-y-2">
                    <Slider
                      value={[currentTime]}
                      max={duration || 100}
                      step={1}
                      onValueChange={handleSeek}
                      className="w-full"
                    />
                    <div className="flex justify-between text-sm text-muted-foreground">
                      <span>{formatTime(currentTime)}</span>
                      <span>{formatTime(duration)}</span>
                    </div>
                  </div>

                  {/* Player Controls */}
                  <div className="flex items-center justify-center gap-4">
                    <Button variant="outline" size="icon" onClick={handlePrevious}>
                      <SkipBack className="w-4 h-4" />
                    </Button>
                    
                    <Button size="icon" onClick={handlePlayPause} className="w-12 h-12">
                      {isPlaying ? <Pause className="w-6 h-6" /> : <Play className="w-6 h-6" />}
                    </Button>
                    
                    <Button variant="outline" size="icon" onClick={handleNext}>
                      <SkipForward className="w-4 h-4" />
                    </Button>
                  </div>

                  {/* Volume Control */}
                  <div className="flex items-center gap-2">
                    <Volume2 className="w-4 h-4" />
                    <Slider
                      value={[volume]}
                      max={100}
                      step={1}
                      onValueChange={(value) => setVolume(value[0])}
                      className="w-24"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Track List */}
          <div className="space-y-4">
            <h2 className="text-xl font-bold">All Tracks</h2>
            <div className="space-y-2">
              {tracks.map((track, index) => (
                <Card 
                  key={track.id}
                  className={`cursor-pointer transition-colors ${
                    currentTrack?.id === track.id ? 'border-primary' : ''
                  }`}
                  onClick={() => handleTrackSelect(track, index)}
                >
                  <CardContent className="p-4">
                    <div className="flex gap-3">
                      <img
                        src={track.release.cover_art_url || '/placeholder.svg'}
                        alt={track.release.title}
                        className="w-12 h-12 object-cover rounded"
                      />
                      <div className="flex-1 min-w-0">
                        <h3 className="font-medium truncate">{track.title}</h3>
                        <p className="text-sm text-muted-foreground truncate">
                          {track.artist}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {track.play_count} plays
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </div>

        {/* Hidden Audio Element */}
        {currentTrack?.audio_file_url && (
          <audio
            ref={audioRef}
            src={currentTrack.audio_file_url}
            preload="metadata"
          />
        )}
      </div>
    </AppLayout>
  );
};

export default CamerPlayPlayer;