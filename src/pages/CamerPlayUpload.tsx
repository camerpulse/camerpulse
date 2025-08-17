import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Upload, Music, Image, Plus, X, Save } from 'lucide-react';

interface TrackData {
  title: string;
  trackNumber: number;
  audioFile: File | null;
  lyrics?: string;
  featuredArtists: string[];
  producers: string[];
}

interface ReleaseData {
  title: string;
  releaseType: 'single' | 'ep' | 'album';
  genre: string;
  language: string;
  coverArt: File | null;
  releaseDate: string;
  moodTags: string[];
  pricingType: 'free' | 'paid' | 'streaming_only';
  pricePerTrack: number;
  albumPrice: number;
  streamingEnabled: boolean;
  externalLinks: Record<string, string>;
}

const CamerPlayUpload = () => {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [artistMembership, setArtistMembership] = useState<any>(null);
  const [currentStep, setCurrentStep] = useState(1);
  
  const [releaseData, setReleaseData] = useState<ReleaseData>({
    title: '',
    releaseType: 'single',
    genre: '',
    language: 'English',
    coverArt: null,
    releaseDate: new Date().toISOString().split('T')[0],
    moodTags: [],
    pricingType: 'free',
    pricePerTrack: 0,
    albumPrice: 0,
    streamingEnabled: true,
    externalLinks: {}
  });

  const [tracks, setTracks] = useState<TrackData[]>([
    {
      title: '',
      trackNumber: 1,
      audioFile: null,
      lyrics: '',
      featuredArtists: [],
      producers: []
    }
  ]);

  const [newTag, setNewTag] = useState('');
  const [newFeaturedArtist, setNewFeaturedArtist] = useState('');
  const [newProducer, setNewProducer] = useState('');

  const genres = [
    'Afrobeat', 'Makossa', 'Bikutsi', 'Mangue', 'Hip Hop', 'R&B', 'Gospel', 
    'Jazz', 'Blues', 'Reggae', 'Pop', 'Rock', 'Electronic', 'Classical', 'Folk'
  ];

  const languages = ['English', 'French', 'Pidgin English', 'Douala', 'Bamoun', 'Fulfude', 'Ewondo'];

  // Check if user is a verified artist
  useEffect(() => {
    checkArtistStatus();
  }, []);

  const checkArtistStatus = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data: membership } = await supabase
        .from('artist_memberships')
        .select('*')
        .eq('user_id', user.id)
        .eq('membership_active', true)
        .single();

      setArtistMembership(membership);
    } catch (error) {
      console.error('Error checking artist status:', error);
    }
  };

  const addTrack = () => {
    setTracks([...tracks, {
      title: '',
      trackNumber: tracks.length + 1,
      audioFile: null,
      lyrics: '',
      featuredArtists: [],
      producers: []
    }]);
  };

  const removeTrack = (index: number) => {
    if (tracks.length > 1) {
      setTracks(tracks.filter((_, i) => i !== index));
    }
  };

  const updateTrack = (index: number, field: keyof TrackData, value: any) => {
    const updatedTracks = [...tracks];
    updatedTracks[index] = { ...updatedTracks[index], [field]: value };
    setTracks(updatedTracks);
  };

  const addTag = () => {
    if (newTag && !releaseData.moodTags.includes(newTag)) {
      setReleaseData({
        ...releaseData,
        moodTags: [...releaseData.moodTags, newTag]
      });
      setNewTag('');
    }
  };

  const removeTag = (tag: string) => {
    setReleaseData({
      ...releaseData,
      moodTags: releaseData.moodTags.filter(t => t !== tag)
    });
  };

  const addFeaturedArtist = (trackIndex: number) => {
    if (newFeaturedArtist) {
      updateTrack(trackIndex, 'featuredArtists', [
        ...tracks[trackIndex].featuredArtists,
        newFeaturedArtist
      ]);
      setNewFeaturedArtist('');
    }
  };

  const addProducer = (trackIndex: number) => {
    if (newProducer) {
      updateTrack(trackIndex, 'producers', [
        ...tracks[trackIndex].producers,
        newProducer
      ]);
      setNewProducer('');
    }
  };

  const uploadFiles = async () => {
    const uploadedFiles: any = {};

    // Upload cover art if present
    if (releaseData.coverArt) {
      const coverFileName = `${Date.now()}_${releaseData.coverArt.name}`;
      const { data: coverData, error: coverError } = await supabase.storage
        .from('album-covers')
        .upload(coverFileName, releaseData.coverArt);

      if (coverError) throw coverError;
      uploadedFiles.coverArt = coverData.path;
    }

    // Upload audio files
    uploadedFiles.tracks = [];
    for (let i = 0; i < tracks.length; i++) {
      const track = tracks[i];
      if (track.audioFile) {
        const audioFileName = `${Date.now()}_${i}_${track.audioFile.name}`;
        const { data: audioData, error: audioError } = await supabase.storage
          .from('music-files')
          .upload(audioFileName, track.audioFile);

        if (audioError) throw audioError;
        uploadedFiles.tracks.push({
          ...track,
          audioFilePath: audioData.path
        });
      }
    }

    return uploadedFiles;
  };

  const saveDraft = async () => {
    setIsLoading(true);
    try {
      if (!artistMembership) {
        toast({
          title: "Not Authorized",
          description: "You must be a verified artist to upload music.",
          variant: "destructive"
        });
        return;
      }

      const uploadedFiles = await uploadFiles();

      // Create release record
      const { data: release, error: releaseError } = await supabase
        .from('music_releases')
        .insert({
          artist_id: artistMembership.id,
          title: releaseData.title,
          release_type: releaseData.releaseType,
          genre: releaseData.genre,
          language: releaseData.language,
          cover_art_url: uploadedFiles.coverArt,
          release_date: releaseData.releaseDate,
          mood_tags: releaseData.moodTags,
          pricing_type: releaseData.pricingType,
          price_per_track: releaseData.pricePerTrack,
          album_price: releaseData.albumPrice,
          streaming_enabled: releaseData.streamingEnabled,
          external_links: releaseData.externalLinks,
          total_tracks: tracks.length,
          status: 'draft'
        })
        .select()
        .single();

      if (releaseError) throw releaseError;

      // Create track records
      for (const uploadedTrack of uploadedFiles.tracks) {
        const { error: trackError } = await supabase
          .from('music_tracks')
          .insert({
            release_id: release.id,
            track_id: await generateTrackId(),
            title: uploadedTrack.title,
            track_number: uploadedTrack.trackNumber,
            audio_file_url: uploadedTrack.audioFilePath,
            audio_format: getAudioFormat(uploadedTrack.audioFile.name),
            file_size_bytes: uploadedTrack.audioFile.size,
            lyrics: uploadedTrack.lyrics,
            featured_artists: uploadedTrack.featuredArtists,
            producers: uploadedTrack.producers
          });

        if (trackError) throw trackError;
      }

      toast({
        title: "Draft Saved",
        description: "Your music has been saved as a draft successfully."
      });

      // Reset form
      setCurrentStep(1);
      setReleaseData({
        title: '',
        releaseType: 'single',
        genre: '',
        language: 'English',
        coverArt: null,
        releaseDate: new Date().toISOString().split('T')[0],
        moodTags: [],
        pricingType: 'free',
        pricePerTrack: 0,
        albumPrice: 0,
        streamingEnabled: true,
        externalLinks: {}
      });
      setTracks([{
        title: '',
        trackNumber: 1,
        audioFile: null,
        lyrics: '',
        featuredArtists: [],
        producers: []
      }]);

    } catch (error) {
      console.error('Error saving:', error);
      toast({
        title: "Upload Failed",
        description: "There was an error uploading your music. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const generateTrackId = async () => {
    const { data } = await supabase.rpc('generate_track_id');
    return data;
  };

  const getAudioFormat = (filename: string): 'mp3' | 'wav' | 'flac' => {
    const extension = filename.split('.').pop()?.toLowerCase();
    if (extension === 'wav') return 'wav';
    if (extension === 'flac') return 'flac';
    return 'mp3';
  };

  if (!artistMembership) {
    return (
      <div className="container mx-auto py-8">
        <Card>
          <CardContent className="text-center py-8">
            <Music className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
            <h2 className="text-xl font-semibold mb-2">Artist Verification Required</h2>
            <p className="text-muted-foreground mb-4">
              You need to be a verified CamerPulse artist to upload music.
            </p>
            <Button asChild>
              <Link to="/artist-register">Apply for Artist Membership</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">CamerPlay Upload Studio</h1>
        <p className="text-muted-foreground">
          Upload your music to reach fans across Cameroon and beyond
        </p>
      </div>

      <div className="grid lg:grid-cols-4 gap-6">
        {/* Progress Steps */}
        <div className="lg:col-span-1">
          <Card>
            <CardHeader>
              <CardTitle className="text-sm">Upload Progress</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <div className={`p-2 rounded ${currentStep >= 1 ? 'bg-primary/10 text-primary' : 'text-muted-foreground'}`}>
                1. Release Details
              </div>
              <div className={`p-2 rounded ${currentStep >= 2 ? 'bg-primary/10 text-primary' : 'text-muted-foreground'}`}>
                2. Track Upload
              </div>
              <div className={`p-2 rounded ${currentStep >= 3 ? 'bg-primary/10 text-primary' : 'text-muted-foreground'}`}>
                3. Pricing & Settings
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content */}
        <div className="lg:col-span-3">
          {currentStep === 1 && (
            <Card>
              <CardHeader>
                <CardTitle>Release Information</CardTitle>
                <CardDescription>
                  Tell us about your music release
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="title">Release Title</Label>
                    <Input
                      id="title"
                      value={releaseData.title}
                      onChange={(e) => setReleaseData({ ...releaseData, title: e.target.value })}
                      placeholder="Enter release title"
                    />
                  </div>
                  <div>
                    <Label htmlFor="releaseType">Release Type</Label>
                    <Select
                      value={releaseData.releaseType}
                      onValueChange={(value: 'single' | 'ep' | 'album') => 
                        setReleaseData({ ...releaseData, releaseType: value })
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="single">Single</SelectItem>
                        <SelectItem value="ep">EP</SelectItem>
                        <SelectItem value="album">Album</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="genre">Genre</Label>
                    <Select
                      value={releaseData.genre}
                      onValueChange={(value) => setReleaseData({ ...releaseData, genre: value })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select genre" />
                      </SelectTrigger>
                      <SelectContent>
                        {genres.map((genre) => (
                          <SelectItem key={genre} value={genre}>{genre}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="language">Language</Label>
                    <Select
                      value={releaseData.language}
                      onValueChange={(value) => setReleaseData({ ...releaseData, language: value })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {languages.map((lang) => (
                          <SelectItem key={lang} value={lang}>{lang}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div>
                  <Label htmlFor="releaseDate">Release Date</Label>
                  <Input
                    id="releaseDate"
                    type="date"
                    value={releaseData.releaseDate}
                    onChange={(e) => setReleaseData({ ...releaseData, releaseDate: e.target.value })}
                  />
                </div>

                <div>
                  <Label htmlFor="coverArt">Cover Art</Label>
                  <div className="mt-2">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) {
                          setReleaseData({ ...releaseData, coverArt: file });
                        }
                      }}
                      className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-primary file:text-primary-foreground hover:file:bg-primary/90"
                    />
                  </div>
                </div>

                <div>
                  <Label>Mood Tags</Label>
                  <div className="flex gap-2 mt-2">
                    <Input
                      value={newTag}
                      onChange={(e) => setNewTag(e.target.value)}
                      placeholder="Add mood tag"
                      onKeyPress={(e) => e.key === 'Enter' && addTag()}
                    />
                    <Button type="button" onClick={addTag} size="sm">
                      <Plus className="h-4 w-4" />
                    </Button>
                  </div>
                  <div className="flex flex-wrap gap-2 mt-2">
                    {releaseData.moodTags.map((tag) => (
                      <Badge key={tag} variant="secondary" className="cursor-pointer" onClick={() => removeTag(tag)}>
                        {tag} <X className="h-3 w-3 ml-1" />
                      </Badge>
                    ))}
                  </div>
                </div>

                <div className="flex justify-end">
                  <Button onClick={() => setCurrentStep(2)}>
                    Next: Upload Tracks
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {currentStep === 2 && (
            <Card>
              <CardHeader>
                <CardTitle>Track Upload</CardTitle>
                <CardDescription>
                  Upload your audio files and add track details
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {tracks.map((track, index) => (
                  <div key={index} className="p-4 border rounded-lg space-y-4">
                    <div className="flex justify-between items-center">
                      <h4 className="font-medium">Track {index + 1}</h4>
                      {tracks.length > 1 && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => removeTrack(index)}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      )}
                    </div>

                    <div>
                      <Label htmlFor={`track-title-${index}`}>Track Title</Label>
                      <Input
                        id={`track-title-${index}`}
                        value={track.title}
                        onChange={(e) => updateTrack(index, 'title', e.target.value)}
                        placeholder="Enter track title"
                      />
                    </div>

                    <div>
                      <Label htmlFor={`audio-file-${index}`}>Audio File</Label>
                      <input
                        type="file"
                        accept=".mp3,.wav,.flac"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) {
                            updateTrack(index, 'audioFile', file);
                          }
                        }}
                        className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-primary file:text-primary-foreground hover:file:bg-primary/90 mt-2"
                      />
                    </div>

                    <div>
                      <Label htmlFor={`lyrics-${index}`}>Lyrics (Optional)</Label>
                      <Textarea
                        id={`lyrics-${index}`}
                        value={track.lyrics}
                        onChange={(e) => updateTrack(index, 'lyrics', e.target.value)}
                        placeholder="Enter lyrics..."
                        rows={3}
                      />
                    </div>

                    <Separator />

                    <div>
                      <Label>Featured Artists</Label>
                      <div className="flex gap-2 mt-2">
                        <Input
                          value={newFeaturedArtist}
                          onChange={(e) => setNewFeaturedArtist(e.target.value)}
                          placeholder="Add featured artist"
                          onKeyPress={(e) => e.key === 'Enter' && addFeaturedArtist(index)}
                        />
                        <Button type="button" onClick={() => addFeaturedArtist(index)} size="sm">
                          <Plus className="h-4 w-4" />
                        </Button>
                      </div>
                      <div className="flex flex-wrap gap-2 mt-2">
                        {track.featuredArtists.map((artist) => (
                          <Badge key={artist} variant="secondary">
                            {artist}
                          </Badge>
                        ))}
                      </div>
                    </div>

                    <div>
                      <Label>Producers</Label>
                      <div className="flex gap-2 mt-2">
                        <Input
                          value={newProducer}
                          onChange={(e) => setNewProducer(e.target.value)}
                          placeholder="Add producer"
                          onKeyPress={(e) => e.key === 'Enter' && addProducer(index)}
                        />
                        <Button type="button" onClick={() => addProducer(index)} size="sm">
                          <Plus className="h-4 w-4" />
                        </Button>
                      </div>
                      <div className="flex flex-wrap gap-2 mt-2">
                        {track.producers.map((producer) => (
                          <Badge key={producer} variant="secondary">
                            {producer}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  </div>
                ))}

                <Button
                  type="button"
                  variant="outline"
                  onClick={addTrack}
                  className="w-full"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Add Another Track
                </Button>

                <div className="flex justify-between">
                  <Button variant="outline" onClick={() => setCurrentStep(1)}>
                    Previous
                  </Button>
                  <Button onClick={() => setCurrentStep(3)}>
                    Next: Pricing
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {currentStep === 3 && (
            <Card>
              <CardHeader>
                <CardTitle>Pricing & Settings</CardTitle>
                <CardDescription>
                  Set your pricing and distribution preferences
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div>
                  <Label htmlFor="pricingType">Pricing Model</Label>
                  <Select
                    value={releaseData.pricingType}
                    onValueChange={(value: 'free' | 'paid' | 'streaming_only') => 
                      setReleaseData({ ...releaseData, pricingType: value })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="free">Free Download</SelectItem>
                      <SelectItem value="paid">Paid Download</SelectItem>
                      <SelectItem value="streaming_only">Streaming Only</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {releaseData.pricingType === 'paid' && (
                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="pricePerTrack">Price per Track (FCFA)</Label>
                      <Input
                        id="pricePerTrack"
                        type="number"
                        value={releaseData.pricePerTrack}
                        onChange={(e) => setReleaseData({ ...releaseData, pricePerTrack: Number(e.target.value) })}
                        placeholder="500"
                      />
                    </div>
                    <div>
                      <Label htmlFor="albumPrice">Album Price (FCFA)</Label>
                      <Input
                        id="albumPrice"
                        type="number"
                        value={releaseData.albumPrice}
                        onChange={(e) => setReleaseData({ ...releaseData, albumPrice: Number(e.target.value) })}
                        placeholder="2000"
                      />
                    </div>
                  </div>
                )}

                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="streamingEnabled"
                    checked={releaseData.streamingEnabled}
                    onChange={(e) => setReleaseData({ ...releaseData, streamingEnabled: e.target.checked })}
                    className="rounded border-gray-300"
                  />
                  <Label htmlFor="streamingEnabled">Enable Streaming</Label>
                </div>

                <div className="flex justify-between">
                  <Button variant="outline" onClick={() => setCurrentStep(2)}>
                    Previous
                  </Button>
                  <div className="space-x-2">
                    <Button
                      variant="outline"
                      onClick={saveDraft}
                      disabled={isLoading}
                    >
                      <Save className="h-4 w-4 mr-2" />
                      Save Draft
                    </Button>
                    <Button onClick={saveDraft} disabled={isLoading}>
                      {isLoading ? 'Uploading...' : 'Upload Music'}
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
};

export default CamerPlayUpload;