import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ShoppingCart, Music, Calendar, Shirt, Play, Download } from 'lucide-react';

interface Product {
  id: string;
  product_name: string;
  description: string;
  price_fcfa: number;
  product_type: string;
  thumbnail_url: string;
  artist_id: string;
  is_featured: boolean;
  genres: string[];
}

export const FanStorefront: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedGenre, setSelectedGenre] = useState<string>('all');

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      const { data, error } = await supabase
        .from('storefront_products')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setProducts(data || []);
    } catch (error) {
      console.error('Error fetching products:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredProducts = products.filter(product => 
    product.product_name.toLowerCase().includes(searchTerm.toLowerCase()) &&
    (selectedGenre === 'all' || product.genres.includes(selectedGenre))
  );

  const getProductIcon = (type: string) => {
    switch (type) {
      case 'song':
      case 'album':
        return <Music className="h-5 w-5" />;
      case 'ticket':
        return <Calendar className="h-5 w-5" />;
      case 'merchandise':
        return <Shirt className="h-5 w-5" />;
      default:
        return <ShoppingCart className="h-5 w-5" />;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold flex items-center gap-3">
              <ShoppingCart className="h-8 w-8 text-primary" />
              Music Storefront
            </h1>
            <p className="text-muted-foreground">Discover and purchase music from Cameroonian artists</p>
          </div>
        </div>

        <div className="flex flex-col md:flex-row gap-4">
          <Input
            placeholder="Search products..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="md:max-w-xs"
          />
        </div>

        <Tabs defaultValue="all" className="space-y-6">
          <TabsList>
            <TabsTrigger value="all">All Products</TabsTrigger>
            <TabsTrigger value="music">Music</TabsTrigger>
            <TabsTrigger value="tickets">Tickets</TabsTrigger>
            <TabsTrigger value="merch">Merchandise</TabsTrigger>
          </TabsList>

          <TabsContent value="all" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {filteredProducts.map((product) => (
                <Card key={product.id} className="group hover:shadow-lg transition-shadow">
                  <CardHeader className="p-4">
                    <div className="w-full h-48 bg-gradient-civic rounded-lg flex items-center justify-center mb-4">
                      {getProductIcon(product.product_type)}
                    </div>
                    <CardTitle className="text-lg line-clamp-2">{product.product_name}</CardTitle>
                    <p className="text-sm text-muted-foreground line-clamp-2">{product.description}</p>
                  </CardHeader>
                  <CardContent className="p-4 pt-0">
                    <div className="flex items-center justify-between mb-4">
                      <div className="text-2xl font-bold text-primary">
                        {product.price_fcfa.toLocaleString()} FCFA
                      </div>
                      <Badge variant="outline" className="capitalize">
                        {product.product_type}
                      </Badge>
                    </div>
                    
                    <div className="flex gap-2">
                      {product.product_type === 'song' || product.product_type === 'album' ? (
                        <>
                          <Button variant="outline" size="sm" className="flex-1">
                            <Play className="h-4 w-4 mr-1" />
                            Preview
                          </Button>
                          <Button size="sm" className="flex-1">
                            <Download className="h-4 w-4 mr-1" />
                            Buy
                          </Button>
                        </>
                      ) : (
                        <Button size="sm" className="w-full">
                          <ShoppingCart className="h-4 w-4 mr-2" />
                          Add to Cart
                        </Button>
                      )}
                    </div>

                    {product.genres.length > 0 && (
                      <div className="flex flex-wrap gap-1 mt-3">
                        {product.genres.slice(0, 2).map((genre) => (
                          <Badge key={genre} variant="secondary" className="text-xs">
                            {genre}
                          </Badge>
                        ))}
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>

            {filteredProducts.length === 0 && (
              <Card>
                <CardContent className="p-12 text-center">
                  <ShoppingCart className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
                  <h3 className="text-xl font-semibold mb-2">No Products Found</h3>
                  <p className="text-muted-foreground">Check back later for new releases!</p>
                </CardContent>
              </Card>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};