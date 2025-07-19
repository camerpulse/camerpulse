import React, { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import MusicPlayer from '@/components/camerplay/MusicPlayer';

// Mock playlist data
const mockPlaylist = [
  {
    id: '1',
    title: 'Cameroon Rising',
    artist: 'Boy Takunda',
    album: 'Unity EP',
    duration: 225,
    cover_image_url: 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=300',
    audio_url: '/audio/sample1.mp3',
    is_liked: true
  },
  {
    id: '2',
    title: 'Village Pride',
    artist: 'Boy Takunda',
    album: 'Unity EP',
    duration: 252,
    cover_image_url: 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=300',
    audio_url: '/audio/sample2.mp3',
    is_liked: false
  },
  {
    id: '3',
    title: 'Unity Anthem',
    artist: 'Boy Takunda',
    album: 'Unity EP',
    duration: 198,
    cover_image_url: 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=300',
    audio_url: '/audio/sample3.mp3',
    is_liked: false
  },
  {
    id: '4',
    title: 'Mountain Dreams',
    artist: 'Boy Takunda',
    album: 'Unity EP',
    duration: 234,
    cover_image_url: 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=300',
    audio_url: '/audio/sample4.mp3',
    is_liked: true
  },
  {
    id: '5',
    title: 'Cameroon Heartbeat',
    artist: 'Boy Takunda',
    album: 'Unity EP',
    duration: 267,
    cover_image_url: 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=300',
    audio_url: '/audio/sample5.mp3',
    is_liked: false
  }
];

const CamerPlayMusicPlayer = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [currentTrack, setCurrentTrack] = useState(mockPlaylist[0]);
  const [isMinimized, setIsMinimized] = useState(false);

  const trackId = searchParams.get('track');
  const artistId = searchParams.get('artist');

  // Find track by ID if provided
  React.useEffect(() => {
    if (trackId) {
      const track = mockPlaylist.find(t => t.id === trackId);
      if (track) {
        setCurrentTrack(track);
      }
    }
  }, [trackId]);

  const handleClose = () => {
    navigate('/camerplay');
  };

  const handleTrackChange = (track: typeof mockPlaylist[0]) => {
    setCurrentTrack(track);
  };

  const handleToggleMinimize = () => {
    setIsMinimized(!isMinimized);
  };

  return (
    <MusicPlayer
      currentTrack={currentTrack}
      playlist={mockPlaylist}
      isVisible={true}
      onClose={handleClose}
      onTrackChange={handleTrackChange}
      isMinimized={isMinimized}
      onToggleMinimize={handleToggleMinimize}
    />
  );
};

export default CamerPlayMusicPlayer;