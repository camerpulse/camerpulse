import React, { useState, useRef, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { 
  Mic, 
  Video, 
  Square, 
  Play, 
  Pause, 
  Upload, 
  FileAudio, 
  FileVideo,
  Save,
  Clock,
  User,
  MapPin,
  Tag
} from 'lucide-react';

interface Recording {
  id: string;
  title: string;
  description: string;
  category: string;
  language: string;
  narrator_name: string;
  village_location: string;
  audio_url?: string;
  video_url?: string;
  duration_seconds: number;
  created_at: string;
  tags: string[];
}

export const OralTraditionRecorder = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isRecording, setIsRecording] = useState(false);
  const [recordingType, setRecordingType] = useState<'audio' | 'video'>('audio');
  const [mediaRecorder, setMediaRecorder] = useState<MediaRecorder | null>(null);
  const [recordedChunks, setRecordedChunks] = useState<Blob[]>([]);
  const [recordingDuration, setRecordingDuration] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentRecording, setCurrentRecording] = useState<{
    title: string;
    description: string;
    category: string;
    language: string;
    narrator_name: string;
    village_location: string;
    tags: string[];
  }>({
    title: '',
    description: '',
    category: '',
    language: 'French',
    narrator_name: '',
    village_location: '',
    tags: []
  });

  const videoRef = useRef<HTMLVideoElement>(null);
  const audioRef = useRef<HTMLAudioElement>(null);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const streamRef = useRef<MediaStream | null>(null);

  // Fetch existing recordings
  const { data: recordings, isLoading } = useQuery({
    queryKey: ['oral_traditions'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('village_oral_traditions')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data as Recording[];
    },
  });

  // Save recording mutation
  const saveRecordingMutation = useMutation({
    mutationFn: async (recordingData: any) => {
      const { error } = await supabase
        .from('village_oral_traditions')
        .insert(recordingData);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['oral_traditions'] });
      toast({
        title: "Recording saved",
        description: "Your oral tradition has been preserved successfully.",
      });
      resetRecording();
    },
    onError: (error) => {
      toast({
        title: "Error saving recording",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const startRecording = async () => {
    try {
      const constraints = recordingType === 'video' 
        ? { video: true, audio: true }
        : { audio: true };

      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      streamRef.current = stream;

      if (recordingType === 'video' && videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play();
      }

      const recorder = new MediaRecorder(stream);
      const chunks: Blob[] = [];

      recorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          chunks.push(event.data);
        }
      };

      recorder.onstop = () => {
        setRecordedChunks(chunks);
        stopStream();
      };

      recorder.start();
      setMediaRecorder(recorder);
      setIsRecording(true);
      setRecordingDuration(0);

      // Start duration timer
      intervalRef.current = setInterval(() => {
        setRecordingDuration(prev => prev + 1);
      }, 1000);

    } catch (error) {
      toast({
        title: "Recording error",
        description: "Could not access microphone/camera. Please check permissions.",
        variant: "destructive",
      });
    }
  };

  const stopRecording = () => {
    if (mediaRecorder && mediaRecorder.state === 'recording') {
      mediaRecorder.stop();
    }
    setIsRecording(false);
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }
  };

  const stopStream = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
  };

  const playRecording = () => {
    if (recordedChunks.length > 0) {
      const blob = new Blob(recordedChunks, { 
        type: recordingType === 'video' ? 'video/webm' : 'audio/webm' 
      });
      const url = URL.createObjectURL(blob);
      
      if (recordingType === 'video' && videoRef.current) {
        videoRef.current.src = url;
        videoRef.current.play();
        setIsPlaying(true);
        videoRef.current.onended = () => setIsPlaying(false);
      } else if (audioRef.current) {
        audioRef.current.src = url;
        audioRef.current.play();
        setIsPlaying(true);
        audioRef.current.onended = () => setIsPlaying(false);
      }
    }
  };

  const saveRecording = async () => {
    if (recordedChunks.length === 0) {
      toast({
        title: "No recording",
        description: "Please record something first.",
        variant: "destructive",
      });
      return;
    }

    if (!currentRecording.title || !currentRecording.narrator_name) {
      toast({
        title: "Missing information",
        description: "Please provide at least a title and narrator name.",
        variant: "destructive",
      });
      return;
    }

    const blob = new Blob(recordedChunks, { 
      type: recordingType === 'video' ? 'video/webm' : 'audio/webm' 
    });
    
    // Convert to base64 for storage (in a real app, you'd upload to storage)
    const reader = new FileReader();
    reader.onloadend = () => {
      const base64Data = reader.result as string;
      
      const recordingData = {
        ...currentRecording,
        [recordingType === 'video' ? 'video_url' : 'audio_url']: base64Data,
        duration_seconds: recordingDuration,
        created_at: new Date().toISOString(),
      };

      saveRecordingMutation.mutate(recordingData);
    };
    reader.readAsDataURL(blob);
  };

  const resetRecording = () => {
    setRecordedChunks([]);
    setRecordingDuration(0);
    setIsPlaying(false);
    setCurrentRecording({
      title: '',
      description: '',
      category: '',
      language: 'French',
      narrator_name: '',
      village_location: '',
      tags: []
    });
    stopStream();
  };

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const categories = [
    'Folktales & Legends',
    'Historical Accounts',
    'Proverbs & Sayings',
    'Songs & Music',
    'Ceremonial Traditions',
    'Family Stories',
    'Agricultural Knowledge',
    'Healing Traditions',
    'Cultural Practices',
    'Language Lessons'
  ];

  const languages = [
    'French', 'English', 'Duala', 'Ewondo', 'Bulu', 'Bamoun', 'Fulfulde', 
    'Gbaya', 'Bassa', 'Bakweri', 'Limbum', 'Kom', 'Other'
  ];

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold flex items-center">
          <FileAudio className="h-6 w-6 mr-2 text-primary" />
          Oral Tradition Recorder
        </h2>
        <p className="text-muted-foreground">
          Preserve and share traditional stories, songs, and cultural knowledge
        </p>
      </div>

      {/* Recording Interface */}
      <Card>
        <CardHeader>
          <CardTitle>Create New Recording</CardTitle>
          <CardDescription>
            Record audio or video to preserve oral traditions and cultural heritage
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Recording Type Selection */}
          <div className="flex gap-4">
            <Button
              variant={recordingType === 'audio' ? 'default' : 'outline'}
              onClick={() => setRecordingType('audio')}
              disabled={isRecording}
            >
              <Mic className="h-4 w-4 mr-2" />
              Audio Only
            </Button>
            <Button
              variant={recordingType === 'video' ? 'default' : 'outline'}
              onClick={() => setRecordingType('video')}
              disabled={isRecording}
            >
              <Video className="h-4 w-4 mr-2" />
              Video & Audio
            </Button>
          </div>

          {/* Media Preview */}
          <div className="bg-muted/20 rounded-lg p-4">
            {recordingType === 'video' ? (
              <video
                ref={videoRef}
                className="w-full max-w-md mx-auto rounded-lg"
                controls={!isRecording && recordedChunks.length > 0}
                style={{ display: isRecording || recordedChunks.length > 0 ? 'block' : 'none' }}
              />
            ) : (
              <audio
                ref={audioRef}
                className="w-full"
                controls={recordedChunks.length > 0}
                style={{ display: recordedChunks.length > 0 ? 'block' : 'none' }}
              />
            )}
            
            {!isRecording && recordedChunks.length === 0 && (
              <div className="text-center py-8">
                <div className="text-muted-foreground">
                  {recordingType === 'video' ? (
                    <Video className="h-12 w-12 mx-auto mb-2" />
                  ) : (
                    <Mic className="h-12 w-12 mx-auto mb-2" />
                  )}
                  <p>Ready to record {recordingType}</p>
                </div>
              </div>
            )}
          </div>

          {/* Recording Controls */}
          <div className="flex items-center gap-4 justify-center">
            {!isRecording ? (
              <Button onClick={startRecording} size="lg">
                {recordingType === 'video' ? (
                  <Video className="h-5 w-5 mr-2" />
                ) : (
                  <Mic className="h-5 w-5 mr-2" />
                )}
                Start Recording
              </Button>
            ) : (
              <Button onClick={stopRecording} variant="destructive" size="lg">
                <Square className="h-5 w-5 mr-2" />
                Stop Recording
              </Button>
            )}

            {recordedChunks.length > 0 && !isRecording && (
              <>
                <Button onClick={playRecording} variant="outline" disabled={isPlaying}>
                  <Play className="h-4 w-4 mr-2" />
                  Play
                </Button>
                <Button onClick={resetRecording} variant="outline">
                  Reset
                </Button>
              </>
            )}

            {isRecording && (
              <div className="flex items-center gap-2 text-red-600">
                <div className="w-3 h-3 bg-red-600 rounded-full animate-pulse" />
                <span className="font-mono">{formatDuration(recordingDuration)}</span>
              </div>
            )}
          </div>

          {/* Recording Details Form */}
          {recordedChunks.length > 0 && (
            <div className="space-y-4 border-t pt-6">
              <h3 className="font-semibold">Recording Details</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="title">Title *</Label>
                  <Input
                    id="title"
                    value={currentRecording.title}
                    onChange={(e) => setCurrentRecording(prev => ({
                      ...prev,
                      title: e.target.value
                    }))}
                    placeholder="e.g., The Legend of Lake Nyos"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="narrator">Narrator Name *</Label>
                  <Input
                    id="narrator"
                    value={currentRecording.narrator_name}
                    onChange={(e) => setCurrentRecording(prev => ({
                      ...prev,
                      narrator_name: e.target.value
                    }))}
                    placeholder="e.g., Elder Marie Ngozi"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="category">Category</Label>
                  <Select
                    value={currentRecording.category}
                    onValueChange={(value) => setCurrentRecording(prev => ({
                      ...prev,
                      category: value
                    }))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent>
                      {categories.map(category => (
                        <SelectItem key={category} value={category}>
                          {category}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="language">Language</Label>
                  <Select
                    value={currentRecording.language}
                    onValueChange={(value) => setCurrentRecording(prev => ({
                      ...prev,
                      language: value
                    }))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {languages.map(language => (
                        <SelectItem key={language} value={language}>
                          {language}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="location">Village/Location</Label>
                  <Input
                    id="location"
                    value={currentRecording.village_location}
                    onChange={(e) => setCurrentRecording(prev => ({
                      ...prev,
                      village_location: e.target.value
                    }))}
                    placeholder="e.g., Bamenda, North West Region"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={currentRecording.description}
                  onChange={(e) => setCurrentRecording(prev => ({
                    ...prev,
                    description: e.target.value
                  }))}
                  placeholder="Describe the story, its significance, and any cultural context..."
                  rows={3}
                />
              </div>

              <div className="flex justify-end space-x-2">
                <Button
                  onClick={saveRecording}
                  disabled={saveRecordingMutation.isPending}
                >
                  <Save className="h-4 w-4 mr-2" />
                  {saveRecordingMutation.isPending ? 'Saving...' : 'Save Recording'}
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Existing Recordings */}
      <Card>
        <CardHeader>
          <CardTitle>Preserved Oral Traditions</CardTitle>
          <CardDescription>
            Browse and listen to recorded cultural heritage
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="text-center py-8">Loading recordings...</div>
          ) : !recordings?.length ? (
            <div className="text-center py-8">
              <FileAudio className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">No recordings yet</h3>
              <p className="text-muted-foreground">
                Start preserving oral traditions by creating your first recording
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {recordings.map((recording) => (
                <div
                  key={recording.id}
                  className="p-4 border rounded-lg space-y-3"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h3 className="font-semibold">{recording.title}</h3>
                      <p className="text-sm text-muted-foreground">{recording.description}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      {recording.audio_url && (
                        <Badge variant="secondary">
                          <FileAudio className="h-3 w-3 mr-1" />
                          Audio
                        </Badge>
                      )}
                      {recording.video_url && (
                        <Badge variant="secondary">
                          <FileVideo className="h-3 w-3 mr-1" />
                          Video
                        </Badge>
                      )}
                    </div>
                  </div>

                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                    <div className="flex items-center gap-1">
                      <User className="h-3 w-3 text-muted-foreground" />
                      <span>{recording.narrator_name}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <MapPin className="h-3 w-3 text-muted-foreground" />
                      <span>{recording.village_location || 'Unknown'}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Clock className="h-3 w-3 text-muted-foreground" />
                      <span>{formatDuration(recording.duration_seconds)}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Tag className="h-3 w-3 text-muted-foreground" />
                      <span>{recording.language}</span>
                    </div>
                  </div>

                  {recording.category && (
                    <Badge variant="outline">{recording.category}</Badge>
                  )}
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
