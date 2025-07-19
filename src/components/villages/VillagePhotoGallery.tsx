import React, { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  Camera, Plus, Heart, Download, Share2, Eye, Trash2, 
  Upload, FolderPlus, Grid3X3, List, Search, Filter,
  ChevronLeft, ChevronRight, X, ZoomIn
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { formatDistanceToNow } from 'date-fns';

interface Photo {
  id: string;
  photo_url: string;
  thumbnail_url?: string;
  caption?: string;
  photographer_name?: string;
  photo_type: string;
  is_featured: boolean;
  likes_count: number;
  uploaded_by: string;
  upload_date: string;
  user_liked?: boolean;
}

interface Album {
  id: string;
  album_name: string;
  description?: string;
  cover_photo_url?: string;
  photos_count: number;
  is_featured: boolean;
  created_at: string;
}

interface VillagePhotoGalleryProps {
  villageId: string;
}

const photoTypes = [
  { value: 'general', label: 'General' },
  { value: 'landscape', label: 'Landscape' },
  { value: 'people', label: 'People' },
  { value: 'events', label: 'Events' },
  { value: 'culture', label: 'Culture' },
  { value: 'infrastructure', label: 'Infrastructure' },
  { value: 'historical', label: 'Historical' },
];

export const VillagePhotoGallery: React.FC<VillagePhotoGalleryProps> = ({ villageId }) => {
  const [photos, setPhotos] = useState<Photo[]>([]);
  const [albums, setAlbums] = useState<Album[]>([]);
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState<'grid' | 'albums'>('grid');
  const [selectedAlbum, setSelectedAlbum] = useState<string | null>(null);
  const [selectedPhoto, setSelectedPhoto] = useState<Photo | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<string>('all');
  const [isUploadOpen, setIsUploadOpen] = useState(false);
  const [isCreateAlbumOpen, setIsCreateAlbumOpen] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const [uploadData, setUploadData] = useState({
    files: [] as File[],
    album_id: '',
    photo_type: 'general',
    caption: '',
    photographer_name: '',
  });

  const [newAlbum, setNewAlbum] = useState({
    album_name: '',
    description: '',
  });

  useEffect(() => {
    fetchPhotos();
    fetchAlbums();
  }, [villageId, selectedAlbum, filterType]);

  const fetchPhotos = async () => {
    try {
      let query = supabase
        .from('village_photos')
        .select('*')
        .eq('village_id', villageId);

      if (selectedAlbum) {
        query = query.eq('album_id', selectedAlbum);
      }

      if (filterType !== 'all') {
        query = query.eq('photo_type', filterType);
      }

      query = query.order('upload_date', { ascending: false });

      const { data, error } = await query;
      if (error) throw error;

      // Check user likes
      const { data: { user } } = await supabase.auth.getUser();
      let photosWithLikes = data || [];

      if (user && data?.length) {
        const photoIds = data.map(p => p.id);
        const { data: likes } = await supabase
          .from('village_photo_likes')
          .select('photo_id')
          .eq('user_id', user.id)
          .in('photo_id', photoIds);

        photosWithLikes = data.map(photo => ({
          ...photo,
          user_liked: likes?.some(like => like.photo_id === photo.id) || false,
        }));
      }

      setPhotos(photosWithLikes);
    } catch (error) {
      console.error('Error fetching photos:', error);
      toast({
        title: "Error",
        description: "Failed to load photos",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchAlbums = async () => {
    try {
      const { data, error } = await supabase
        .from('village_photo_albums')
        .select('*')
        .eq('village_id', villageId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setAlbums(data || []);
    } catch (error) {
      console.error('Error fetching albums:', error);
    }
  };

  const createAlbum = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      toast({
        title: "Authentication required",
        description: "Please log in to create albums",
        variant: "destructive",
      });
      return;
    }

    if (!newAlbum.album_name.trim()) {
      toast({
        title: "Album name required",
        description: "Please enter an album name",
        variant: "destructive",
      });
      return;
    }

    try {
      const { error } = await supabase
        .from('village_photo_albums')
        .insert([{
          village_id: villageId,
          created_by: user.id,
          album_name: newAlbum.album_name.trim(),
          description: newAlbum.description.trim() || null,
        }]);

      if (error) throw error;

      setNewAlbum({ album_name: '', description: '' });
      setIsCreateAlbumOpen(false);
      fetchAlbums();
      toast({
        title: "Success",
        description: "Album created successfully",
      });
    } catch (error) {
      console.error('Error creating album:', error);
      toast({
        title: "Error",
        description: "Failed to create album",
        variant: "destructive",
      });
    }
  };

  const uploadPhotos = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user || uploadData.files.length === 0) return;

    try {
      setUploadProgress(0);
      const totalFiles = uploadData.files.length;
      let completed = 0;

      for (const file of uploadData.files) {
        const fileExt = file.name.split('.').pop();
        const fileName = `${user.id}/${Date.now()}_${Math.random()}.${fileExt}`;

        // Upload to storage
        const { error: uploadError } = await supabase.storage
          .from('village-photos')
          .upload(fileName, file);

        if (uploadError) throw uploadError;

        // Get public URL
        const { data: { publicUrl } } = supabase.storage
          .from('village-photos')
          .getPublicUrl(fileName);

        // Save to database
        const { error: dbError } = await supabase
          .from('village_photos')
          .insert([{
            village_id: villageId,
            album_id: uploadData.album_id || null,
            photo_url: publicUrl,
            caption: uploadData.caption.trim() || null,
            photographer_name: uploadData.photographer_name.trim() || null,
            photo_type: uploadData.photo_type,
            uploaded_by: user.id,
            file_size: file.size,
          }]);

        if (dbError) throw dbError;

        completed++;
        setUploadProgress((completed / totalFiles) * 100);
      }

      setUploadData({
        files: [],
        album_id: '',
        photo_type: 'general',
        caption: '',
        photographer_name: '',
      });
      setIsUploadOpen(false);
      setUploadProgress(0);
      fetchPhotos();
      toast({
        title: "Success",
        description: `${totalFiles} photos uploaded successfully`,
      });
    } catch (error) {
      console.error('Error uploading photos:', error);
      toast({
        title: "Error",
        description: "Failed to upload photos",
        variant: "destructive",
      });
    }
  };

  const toggleLike = async (photoId: string) => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      toast({
        title: "Authentication required",
        description: "Please log in to like photos",
        variant: "destructive",
      });
      return;
    }

    try {
      const photo = photos.find(p => p.id === photoId);
      if (!photo) return;

      if (photo.user_liked) {
        // Unlike
        await supabase
          .from('village_photo_likes')
          .delete()
          .eq('photo_id', photoId)
          .eq('user_id', user.id);
      } else {
        // Like
        await supabase
          .from('village_photo_likes')
          .insert([{ photo_id: photoId, user_id: user.id }]);
      }

      fetchPhotos();
    } catch (error) {
      console.error('Error toggling like:', error);
      toast({
        title: "Error",
        description: "Failed to update like",
        variant: "destructive",
      });
    }
  };

  const filteredPhotos = photos.filter(photo =>
    searchTerm === '' || 
    photo.caption?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    photo.photographer_name?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const PhotoCard: React.FC<{ photo: Photo; index: number }> = ({ photo, index }) => (
    <Card className="group relative overflow-hidden hover:shadow-lg transition-all cursor-pointer">
      <div className="aspect-square relative">
        <img
          src={photo.thumbnail_url || photo.photo_url}
          alt={photo.caption || 'Village photo'}
          className="w-full h-full object-cover"
          onClick={() => setSelectedPhoto(photo)}
        />
        <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-30 transition-all flex items-center justify-center">
          <div className="opacity-0 group-hover:opacity-100 transition-opacity flex space-x-2">
            <Button
              size="sm"
              variant="secondary"
              onClick={(e) => {
                e.stopPropagation();
                setSelectedPhoto(photo);
              }}
            >
              <ZoomIn className="h-4 w-4" />
            </Button>
            <Button
              size="sm"
              variant="secondary"
              onClick={(e) => {
                e.stopPropagation();
                toggleLike(photo.id);
              }}
            >
              <Heart className={`h-4 w-4 ${photo.user_liked ? 'fill-red-500 text-red-500' : ''}`} />
            </Button>
          </div>
        </div>
        {photo.is_featured && (
          <Badge className="absolute top-2 left-2" variant="secondary">
            Featured
          </Badge>
        )}
      </div>
      {photo.caption && (
        <CardContent className="p-3">
          <p className="text-sm text-muted-foreground line-clamp-2">{photo.caption}</p>
          <div className="flex items-center justify-between mt-2 text-xs text-muted-foreground">
            <span>{photo.photographer_name}</span>
            <div className="flex items-center space-x-1">
              <Heart className="h-3 w-3" />
              <span>{photo.likes_count}</span>
            </div>
          </div>
        </CardContent>
      )}
    </Card>
  );

  if (loading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="animate-pulse space-y-4">
            <div className="h-4 bg-muted rounded w-1/4"></div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {Array.from({ length: 8 }).map((_, i) => (
                <div key={i} className="aspect-square bg-muted rounded"></div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center space-x-2">
              <Camera className="h-5 w-5" />
              <span>Photo Gallery ({filteredPhotos.length})</span>
            </CardTitle>
            <div className="flex space-x-2">
              <Dialog open={isCreateAlbumOpen} onOpenChange={setIsCreateAlbumOpen}>
                <DialogTrigger asChild>
                  <Button variant="outline" size="sm">
                    <FolderPlus className="h-4 w-4 mr-2" />
                    New Album
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Create Photo Album</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4 mt-4">
                    <div>
                      <label className="text-sm font-medium">Album Name</label>
                      <Input
                        placeholder="Album name..."
                        value={newAlbum.album_name}
                        onChange={(e) => setNewAlbum({ ...newAlbum, album_name: e.target.value })}
                      />
                    </div>
                    <div>
                      <label className="text-sm font-medium">Description</label>
                      <Textarea
                        placeholder="Album description..."
                        value={newAlbum.description}
                        onChange={(e) => setNewAlbum({ ...newAlbum, description: e.target.value })}
                      />
                    </div>
                    <div className="flex space-x-2">
                      <Button onClick={createAlbum} className="flex-1">
                        Create Album
                      </Button>
                      <Button variant="outline" onClick={() => setIsCreateAlbumOpen(false)}>
                        Cancel
                      </Button>
                    </div>
                  </div>
                </DialogContent>
              </Dialog>

              <Dialog open={isUploadOpen} onOpenChange={setIsUploadOpen}>
                <DialogTrigger asChild>
                  <Button>
                    <Plus className="h-4 w-4 mr-2" />
                    Upload Photos
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-lg">
                  <DialogHeader>
                    <DialogTitle>Upload Photos</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4 mt-4">
                    <div>
                      <label className="text-sm font-medium">Select Photos</label>
                      <Input
                        type="file"
                        multiple
                        accept="image/*"
                        ref={fileInputRef}
                        onChange={(e) => {
                          const files = Array.from(e.target.files || []);
                          setUploadData({ ...uploadData, files });
                        }}
                      />
                      {uploadData.files.length > 0 && (
                        <p className="text-sm text-muted-foreground mt-1">
                          {uploadData.files.length} file(s) selected
                        </p>
                      )}
                    </div>
                    
                    <div>
                      <label className="text-sm font-medium">Album (Optional)</label>
                      <Select value={uploadData.album_id} onValueChange={(value) => setUploadData({ ...uploadData, album_id: value })}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select album or leave empty" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="">No album</SelectItem>
                          {albums.map((album) => (
                            <SelectItem key={album.id} value={album.id}>
                              {album.album_name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <label className="text-sm font-medium">Photo Type</label>
                      <Select value={uploadData.photo_type} onValueChange={(value) => setUploadData({ ...uploadData, photo_type: value })}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {photoTypes.map((type) => (
                            <SelectItem key={type.value} value={type.value}>
                              {type.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <label className="text-sm font-medium">Caption</label>
                      <Textarea
                        placeholder="Photo caption..."
                        value={uploadData.caption}
                        onChange={(e) => setUploadData({ ...uploadData, caption: e.target.value })}
                      />
                    </div>

                    <div>
                      <label className="text-sm font-medium">Photographer</label>
                      <Input
                        placeholder="Photographer name..."
                        value={uploadData.photographer_name}
                        onChange={(e) => setUploadData({ ...uploadData, photographer_name: e.target.value })}
                      />
                    </div>

                    {uploadProgress > 0 && (
                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span>Uploading...</span>
                          <span>{Math.round(uploadProgress)}%</span>
                        </div>
                        <div className="w-full bg-muted rounded-full h-2">
                          <div 
                            className="bg-primary h-2 rounded-full transition-all"
                            style={{ width: `${uploadProgress}%` }}
                          />
                        </div>
                      </div>
                    )}

                    <div className="flex space-x-2">
                      <Button 
                        onClick={uploadPhotos} 
                        disabled={uploadData.files.length === 0 || uploadProgress > 0}
                        className="flex-1"
                      >
                        {uploadProgress > 0 ? 'Uploading...' : 'Upload Photos'}
                      </Button>
                      <Button variant="outline" onClick={() => setIsUploadOpen(false)}>
                        Cancel
                      </Button>
                    </div>
                  </div>
                </DialogContent>
              </Dialog>
            </div>
          </div>

          {/* Filters and Search */}
          <div className="flex flex-col md:flex-row gap-4 mt-4">
            <div className="flex items-center space-x-2">
              <Button
                variant={view === 'grid' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setView('grid')}
              >
                <Grid3X3 className="h-4 w-4 mr-1" />
                Grid
              </Button>
              <Button
                variant={view === 'albums' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setView('albums')}
              >
                <List className="h-4 w-4 mr-1" />
                Albums
              </Button>
            </div>
            
            <div className="flex-1 flex gap-2">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search photos..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
              
              <Select value={filterType} onValueChange={setFilterType}>
                <SelectTrigger className="w-40">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  {photoTypes.map((type) => (
                    <SelectItem key={type.value} value={type.value}>
                      {type.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Albums filter */}
          {view === 'grid' && albums.length > 0 && (
            <div className="flex flex-wrap gap-2 mt-4">
              <Button
                variant={selectedAlbum === null ? 'default' : 'outline'}
                size="sm"
                onClick={() => setSelectedAlbum(null)}
              >
                All Photos
              </Button>
              {albums.map((album) => (
                <Button
                  key={album.id}
                  variant={selectedAlbum === album.id ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setSelectedAlbum(album.id)}
                >
                  {album.album_name} ({album.photos_count})
                </Button>
              ))}
            </div>
          )}
        </CardHeader>

        <CardContent>
          {view === 'albums' ? (
            // Albums View
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {albums.length === 0 ? (
                <div className="col-span-full text-center py-8 text-muted-foreground">
                  <Camera className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>No albums created yet. Create your first album!</p>
                </div>
              ) : (
                albums.map((album) => (
                  <Card key={album.id} className="cursor-pointer hover:shadow-md transition-shadow">
                    <div className="aspect-video relative overflow-hidden">
                      {album.cover_photo_url ? (
                        <img
                          src={album.cover_photo_url}
                          alt={album.album_name}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full bg-muted flex items-center justify-center">
                          <Camera className="h-12 w-12 text-muted-foreground" />
                        </div>
                      )}
                    </div>
                    <CardContent className="p-4">
                      <h3 className="font-medium mb-1">{album.album_name}</h3>
                      {album.description && (
                        <p className="text-sm text-muted-foreground mb-2 line-clamp-2">
                          {album.description}
                        </p>
                      )}
                      <div className="flex items-center justify-between text-xs text-muted-foreground">
                        <span>{album.photos_count} photos</span>
                        <span>{formatDistanceToNow(new Date(album.created_at), { addSuffix: true })}</span>
                      </div>
                    </CardContent>
                  </Card>
                ))
              )}
            </div>
          ) : (
            // Grid View
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {filteredPhotos.length === 0 ? (
                <div className="col-span-full text-center py-8 text-muted-foreground">
                  <Camera className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>No photos found. Upload some photos to get started!</p>
                </div>
              ) : (
                filteredPhotos.map((photo, index) => (
                  <PhotoCard key={photo.id} photo={photo} index={index} />
                ))
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Photo Lightbox */}
      {selectedPhoto && (
        <Dialog open={!!selectedPhoto} onOpenChange={() => setSelectedPhoto(null)}>
          <DialogContent className="max-w-4xl max-h-[90vh] p-0">
            <div className="relative">
              <img
                src={selectedPhoto.photo_url}
                alt={selectedPhoto.caption || 'Village photo'}
                className="w-full max-h-[70vh] object-contain"
              />
              <Button
                variant="ghost"
                size="sm"
                className="absolute top-2 right-2 bg-black/50 text-white hover:bg-black/70"
                onClick={() => setSelectedPhoto(null)}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
            {selectedPhoto.caption && (
              <div className="p-4">
                <p className="text-lg font-medium mb-2">{selectedPhoto.caption}</p>
                <div className="flex items-center justify-between text-sm text-muted-foreground">
                  <span>By {selectedPhoto.photographer_name || 'Anonymous'}</span>
                  <div className="flex items-center space-x-4">
                    <span>{formatDistanceToNow(new Date(selectedPhoto.upload_date), { addSuffix: true })}</span>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => toggleLike(selectedPhoto.id)}
                    >
                      <Heart className={`h-4 w-4 mr-1 ${selectedPhoto.user_liked ? 'fill-red-500 text-red-500' : ''}`} />
                      {selectedPhoto.likes_count}
                    </Button>
                  </div>
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>
      )}
    </>
  );
};