import React, { useState } from 'react';
import { Camera, Upload, Heart, Search, Eye, Download, X } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';

interface Photo {
  id: string;
  photo_url: string;
  caption: string;
  photographer_name: string;
  photo_type: string;
  likes_count: number;
  upload_date: string;
}

interface VillagePhotoGalleryProps {
  villageId: string;
}

export const VillagePhotoGallery: React.FC<VillagePhotoGalleryProps> = ({ villageId }) => {
  const [selectedType, setSelectedType] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [uploadDialogOpen, setUploadDialogOpen] = useState(false);
  const [newAlbumDialogOpen, setNewAlbumDialogOpen] = useState(false);
  const [selectedPhoto, setSelectedPhoto] = useState<Photo | null>(null);

  const photoTypes = [
    'all', 'landscape', 'people', 'events', 'infrastructure', 
    'culture', 'nature', 'development', 'historical'
  ];

  // Sample photos for demo
  const samplePhotos: Photo[] = [
    {
      id: '1',
      photo_url: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2340&q=80',
      caption: 'Village landscape view',
      photographer_name: 'John Doe',
      photo_type: 'landscape',
      likes_count: 15,
      upload_date: '2024-01-15'
    },
    {
      id: '2',
      photo_url: 'https://images.unsplash.com/photo-1559827260-dc66d52bef19?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2340&q=80',
      caption: 'Traditional village architecture',
      photographer_name: 'Jane Smith',
      photo_type: 'culture',
      likes_count: 23,
      upload_date: '2024-01-20'
    },
    {
      id: '3',
      photo_url: 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2340&q=80',
      caption: 'Community gathering',
      photographer_name: 'Mike Johnson',
      photo_type: 'people',
      likes_count: 31,
      upload_date: '2024-01-25'
    },
    {
      id: '4',
      photo_url: 'https://images.unsplash.com/photo-1547036967-23d11aacaee0?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2340&q=80',
      caption: 'Market day activities',
      photographer_name: 'Sarah Wilson',
      photo_type: 'events',
      likes_count: 18,
      upload_date: '2024-02-01'
    },
    {
      id: '5',
      photo_url: 'https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2313&q=80',
      caption: 'New school building',
      photographer_name: 'David Brown',
      photo_type: 'infrastructure',
      likes_count: 27,
      upload_date: '2024-02-05'
    },
    {
      id: '6',
      photo_url: 'https://images.unsplash.com/photo-1441123694162-e54a981ceba5?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2340&q=80',
      caption: 'Natural forest preserve',
      photographer_name: 'Emma Davis',
      photo_type: 'nature',
      likes_count: 35,
      upload_date: '2024-02-10'
    }
  ];

  const filteredPhotos = samplePhotos.filter(photo => {
    const matchesType = selectedType === 'all' || photo.photo_type === selectedType;
    const matchesSearch = !searchTerm || 
      photo.caption.toLowerCase().includes(searchTerm.toLowerCase()) ||
      photo.photographer_name.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesType && matchesSearch;
  });

  const handleLikePhoto = (photoId: string) => {
    toast.success('Photo liked! (Demo mode)');
  };

  const PhotoCard = ({ photo }: { photo: Photo }) => (
    <Card className="group cursor-pointer hover:shadow-lg transition-all duration-200">
      <div className="relative overflow-hidden rounded-t-lg aspect-square">
        <img
          src={photo.photo_url}
          alt={photo.caption || 'Village photo'}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
          onClick={() => setSelectedPhoto(photo)}
        />
        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors duration-200 flex items-center justify-center">
          <Eye className="h-8 w-8 text-white opacity-0 group-hover:opacity-100 transition-opacity duration-200" />
        </div>
        <Badge variant="secondary" className="absolute top-2 right-2 text-xs">
          {photo.photo_type}
        </Badge>
      </div>
      <CardContent className="p-3">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <p className="text-sm font-medium line-clamp-2 mb-1">{photo.caption}</p>
            <p className="text-xs text-muted-foreground">by {photo.photographer_name}</p>
            <p className="text-xs text-muted-foreground">
              {new Date(photo.upload_date).toLocaleDateString()}
            </p>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={(e) => {
              e.stopPropagation();
              handleLikePhoto(photo.id);
            }}
            className="flex items-center gap-1 text-xs"
          >
            <Heart className="h-3 w-3" />
            {photo.likes_count}
          </Button>
        </div>
      </CardContent>
    </Card>
  );

  const PhotoLightbox = ({ photo, onClose }: { photo: Photo; onClose: () => void }) => (
    <Dialog open={!!photo} onOpenChange={() => onClose()}>
      <DialogContent className="max-w-4xl w-full h-[90vh]">
        <DialogHeader>
          <DialogTitle className="flex items-center justify-between">
            <span>{photo.caption || 'Village Photo'}</span>
            <Button variant="ghost" size="sm" onClick={onClose}>
              <X className="h-4 w-4" />
            </Button>
          </DialogTitle>
        </DialogHeader>
        <div className="flex flex-col lg:flex-row gap-4 h-full">
          <div className="flex-1 flex items-center justify-center bg-muted rounded-lg overflow-hidden">
            <img
              src={photo.photo_url}
              alt={photo.caption || 'Village photo'}
              className="max-w-full max-h-full object-contain"
            />
          </div>
          <div className="lg:w-80 space-y-4">
            <div>
              <h4 className="font-semibold mb-2">Photo Details</h4>
              <div className="space-y-2 text-sm">
                <div>
                  <span className="text-muted-foreground">Type:</span>
                  <Badge variant="outline" className="ml-2">{photo.photo_type}</Badge>
                </div>
                <div>
                  <span className="text-muted-foreground">Photographer:</span>
                  <span className="ml-2">{photo.photographer_name}</span>
                </div>
                <div>
                  <span className="text-muted-foreground">Uploaded:</span>
                  <span className="ml-2">{new Date(photo.upload_date).toLocaleDateString()}</span>
                </div>
                <div>
                  <span className="text-muted-foreground">Likes:</span>
                  <span className="ml-2">{photo.likes_count}</span>
                </div>
              </div>
            </div>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleLikePhoto(photo.id)}
                className="flex-1"
              >
                <Heart className="h-4 w-4 mr-2" />
                Like
              </Button>
              <Button variant="outline" size="sm">
                <Download className="h-4 w-4 mr-2" />
                Download
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h3 className="text-2xl font-bold">Photo Gallery</h3>
          <p className="text-muted-foreground">
            {filteredPhotos.length} photos • Demo mode
          </p>
        </div>
        <div className="flex gap-2">
          <Dialog open={newAlbumDialogOpen} onOpenChange={setNewAlbumDialogOpen}>
            <DialogTrigger asChild>
              <Button variant="outline">
                <Camera className="h-4 w-4 mr-2" />
                New Album
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Create New Album</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <p className="text-sm text-muted-foreground">
                  Album creation will be available when the database is fully connected.
                </p>
              </div>
            </DialogContent>
          </Dialog>
          <Dialog open={uploadDialogOpen} onOpenChange={setUploadDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Upload className="h-4 w-4 mr-2" />
                Upload Photos
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Upload Photos</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <p className="text-sm text-muted-foreground">
                  Photo upload functionality will be available when the database is fully connected.
                </p>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search photos by caption or photographer..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        <Select value={selectedType} onValueChange={setSelectedType}>
          <SelectTrigger className="w-full sm:w-48">
            <SelectValue placeholder="Photo Type" />
          </SelectTrigger>
          <SelectContent>
            {photoTypes.map((type) => (
              <SelectItem key={type} value={type}>
                {type === 'all' ? 'All Types' : type.charAt(0).toUpperCase() + type.slice(1)}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Photos Grid */}
      <div>
        {filteredPhotos.length === 0 ? (
          <Card className="text-center py-12">
            <CardContent>
              <Camera className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">No photos found</h3>
              <p className="text-muted-foreground mb-4">
                {searchTerm || selectedType !== 'all'
                  ? 'No photos match your search criteria.'
                  : 'Be the first to share photos of this village!'
                }
              </p>
              <Button onClick={() => setUploadDialogOpen(true)}>
                <Upload className="h-4 w-4 mr-2" />
                Upload First Photo
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {filteredPhotos.map((photo) => (
              <PhotoCard key={photo.id} photo={photo} />
            ))}
          </div>
        )}
      </div>

      {/* Lightbox */}
      {selectedPhoto && (
        <PhotoLightbox 
          photo={selectedPhoto} 
          onClose={() => setSelectedPhoto(null)} 
        />
      )}
    </div>
  );
};