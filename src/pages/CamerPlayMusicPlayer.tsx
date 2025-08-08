import React, { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import MusicPlayer from '@/components/camerplay/MusicPlayer';


const CamerPlayMusicPlayer = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [currentTrack, setCurrentTrack] = useState<any>(undefined);
  const [isMinimized, setIsMinimized] = useState(false);

  const trackId = searchParams.get('track');
  const artistId = searchParams.get('artist');

  // Find track by ID if provided

  const handleClose = () => {
    navigate('/camerplay');
  };

  const handleTrackChange = (track: any) => {
    setCurrentTrack(track);
  };

  const handleToggleMinimize = () => {
    setIsMinimized(!isMinimized);
  };

  return (
    <MusicPlayer
      currentTrack={currentTrack}
      playlist={[]}
      isVisible={true}
      onClose={handleClose}
      onTrackChange={handleTrackChange}
      isMinimized={isMinimized}
      onToggleMinimize={handleToggleMinimize}
    />
  );
};

export default CamerPlayMusicPlayer;