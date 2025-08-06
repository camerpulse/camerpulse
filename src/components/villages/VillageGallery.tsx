import React, { useState, useEffect } from 'react';
import { Camera, Upload, Eye, Heart, MessageCircle, MoreHorizontal } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface VillageGalleryProps {
  villageId: string;
}

interface Photo {
  id: string;
  url: string;
  title: string;
  description?: string;
  category: string;
  uploaded_by: string;
  likes_count: number;
  created_at: string;
}

export const VillageGallery: React.FC<VillageGalleryProps> = ({ villageId }) => {
  const [photos, setPhotos] = useState<Photo[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedPhoto, setSelectedPhoto] = useState<Photo | null>(null);

  const categories = [
    { id: 'all', name: 'All Photos', count: photos.length },
    { id: 'events', name: 'Events', count: photos.filter(p => p.category === 'events').length },
    { id: 'landmarks', name: 'Landmarks', count: photos.filter(p => p.category === 'landmarks').length },
    { id: 'people', name: 'People', count: photos.filter(p => p.category === 'people').length },
    { id: 'culture', name: 'Culture', count: photos.filter(p => p.category === 'culture').length },
    { id: 'development', name: 'Development', count: photos.filter(p => p.category === 'development').length },
  ];

  useEffect(() => {
    fetchPhotos();
  }, [villageId]);

  const fetchPhotos = async () => {
    try {
      const { data, error } = await supabase
        .from('village_photos')
        .select(`
          *,
          profiles:uploaded_by(username)
        `)
        .eq('village_id', villageId)
        .eq('status', 'approved')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setPhotos(data || []);
    } catch (error) {
      console.error('Error fetching photos:', error);
      toast.error('Failed to load photos');
    } finally {
      setLoading(false);
    }
  };

  const filteredPhotos = selectedCategory === 'all' 
    ? photos 
    : photos.filter(photo => photo.category === selectedCategory);

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="aspect-square bg-muted rounded-lg animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold">Village Gallery</h2>
          <p className="text-muted-foreground">Discover the beauty and life of the village through photos</p>
        </div>
        <Button>
          <Upload className="h-4 w-4 mr-2" />
          Upload Photo
        </Button>
      </div>

      {/* Category Filter */}
      <div className="flex flex-wrap gap-2">
        {categories.map((category) => (
          <Button
            key={category.id}
            variant={selectedCategory === category.id ? "default" : "outline"}
            size="sm"
            onClick={() => setSelectedCategory(category.id)}
            className="flex items-center gap-2"
          >
            {category.name}
            <Badge variant="secondary" className="text-xs">
              {category.count}
            </Badge>
          </Button>
        ))}
      </div>

      {/* Photo Grid */}
      {filteredPhotos.length === 0 ? (
        <Card className="text-center p-12">
          <Camera className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
          <h3 className="text-lg font-semibold mb-2">No photos yet</h3>
          <p className="text-muted-foreground mb-4">
            Be the first to share photos of this beautiful village!
          </p>
          <Button>
            <Upload className="h-4 w-4 mr-2" />
            Upload First Photo
          </Button>
        </Card>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {filteredPhotos.map((photo) => (
            <Card 
              key={photo.id} 
              className="overflow-hidden group cursor-pointer hover:shadow-lg transition-all duration-300"
              onClick={() => setSelectedPhoto(photo)}
            >
              <div className="relative aspect-square overflow-hidden">
                <img
                  src={photo.url}
                  alt={photo.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors duration-300" />
                <div className="absolute top-2 left-2">
                  <Badge variant="secondary" className="bg-black/50 text-white border-none">
                    {photo.category}
                  </Badge>
                </div>
                <div className="absolute bottom-2 right-2 flex gap-1">
                  <div className="bg-black/50 text-white px-2 py-1 rounded text-xs flex items-center">
                    <Heart className="h-3 w-3 mr-1" />
                    {photo.likes_count}
                  </div>
                </div>
              </div>
              <CardContent className="p-3">
                <h4 className="font-semibold text-sm truncate">{photo.title}</h4>
                {photo.description && (
                  <p className="text-xs text-muted-foreground line-clamp-2 mt-1">
                    {photo.description}
                  </p>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Photo Detail Modal */}
      <Dialog open={!!selectedPhoto} onOpenChange={() => setSelectedPhoto(null)}>
        <DialogContent className="max-w-4xl">
          {selectedPhoto && (
            <>
              <DialogHeader>
                <DialogTitle>{selectedPhoto.title}</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div className="relative">
                  <img
                    src={selectedPhoto.url}
                    alt={selectedPhoto.title}
                    className="w-full max-h-96 object-contain rounded-lg"
                  />
                </div>
                {selectedPhoto.description && (
                  <p className="text-muted-foreground">{selectedPhoto.description}</p>
                )}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <Button variant="outline" size="sm">
                      <Heart className="h-4 w-4 mr-2" />
                      {selectedPhoto.likes_count} Likes
                    </Button>
                    <Button variant="outline" size="sm">
                      <MessageCircle className="h-4 w-4 mr-2" />
                      Comment
                    </Button>
                  </div>
                  <Badge variant="secondary">{selectedPhoto.category}</Badge>
                </div>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};