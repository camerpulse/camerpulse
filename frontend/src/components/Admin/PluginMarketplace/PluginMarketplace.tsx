import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { usePluginMarketplace } from '@/hooks/usePluginMarketplace';
import { 
  Search, 
  Download, 
  Star, 
  Shield, 
  Filter,
  Store,
  Verified,
  TrendingUp,
  Users,
  Heart,
  ExternalLink
} from 'lucide-react';
import { toast } from 'sonner';

export const PluginMarketplace: React.FC = () => {
  const {
    plugins,
    featuredPlugins,
    categories,
    filters,
    isLoading,
    installPlugin,
    isInstalling,
    updateFilters,
    clearFilters
  } = usePluginMarketplace();

  const [selectedPlugin, setSelectedPlugin] = useState<string | null>(null);

  const handleInstallPlugin = async (pluginId: string) => {
    try {
      await installPlugin({ pluginId });
    } catch (error) {
      console.error('Installation failed:', error);
    }
  };

  const getSecurityBadge = (status: string) => {
    switch (status) {
      case 'passed':
        return <Badge className="bg-green-100 text-green-800"><Shield className="h-3 w-3 mr-1" />Verified</Badge>;
      case 'manual_review':
        return <Badge variant="outline"><Shield className="h-3 w-3 mr-1" />Under Review</Badge>;
      case 'failed':
        return <Badge variant="destructive"><Shield className="h-3 w-3 mr-1" />Security Risk</Badge>;
      default:
        return <Badge variant="secondary"><Shield className="h-3 w-3 mr-1" />Scanning</Badge>;
    }
  };

  const getRatingStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star
        key={i}
        className={`h-4 w-4 ${i < Math.floor(rating) ? 'text-yellow-400 fill-current' : 'text-gray-300'}`}
      />
    ));
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold flex items-center">
            <Store className="h-8 w-8 mr-3" />
            Plugin Marketplace
          </h1>
          <p className="text-muted-foreground">
            Discover and install plugins to extend CamerPulse functionality
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <Badge variant="outline">{plugins.length} Plugins Available</Badge>
        </div>
      </div>

      {/* Search and Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
              <Input
                placeholder="Search plugins..."
                value={filters.search || ''}
                onChange={(e) => updateFilters({ search: e.target.value })}
                className="pl-10"
              />
            </div>
            
            <Select value={filters.category || ''} onValueChange={(value) => updateFilters({ category: value || undefined })}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="All Categories" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">All Categories</SelectItem>
                {categories.map(category => (
                  <SelectItem key={category} value={category}>
                    {category.charAt(0).toUpperCase() + category.slice(1)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Button 
              variant="outline" 
              onClick={clearFilters}
              className="flex items-center"
            >
              <Filter className="h-4 w-4 mr-2" />
              Clear
            </Button>
          </div>
        </CardContent>
      </Card>

      <Tabs defaultValue="browse" className="space-y-6">
        <TabsList>
          <TabsTrigger value="browse">Browse All</TabsTrigger>
          <TabsTrigger value="featured">Featured</TabsTrigger>
          <TabsTrigger value="popular">Most Popular</TabsTrigger>
          <TabsTrigger value="newest">Newest</TabsTrigger>
        </TabsList>

        <TabsContent value="browse" className="space-y-6">
          {/* Featured Section */}
          {featuredPlugins.length > 0 && (
            <div>
              <h2 className="text-xl font-semibold mb-4 flex items-center">
                <TrendingUp className="h-5 w-5 mr-2" />
                Featured Plugins
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {featuredPlugins.slice(0, 3).map((plugin) => (
                  <Card key={plugin.id} className="relative border-2 border-primary/20">
                    <div className="absolute top-3 right-3">
                      <Badge className="bg-primary">
                        <Star className="h-3 w-3 mr-1" />
                        Featured
                      </Badge>
                    </div>
                    <CardHeader className="pb-3">
                      <div className="flex items-start justify-between">
                        <div className="flex-1 pr-8">
                          <CardTitle className="text-lg">{plugin.display_name}</CardTitle>
                          <CardDescription className="text-sm mt-1">
                            by {plugin.author_name}
                            {plugin.is_official && (
                              <Verified className="h-4 w-4 text-blue-500 inline ml-1" />
                            )}
                          </CardDescription>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <p className="text-sm">{plugin.description}</p>
                      
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                          <div className="flex items-center">
                            <Download className="h-4 w-4 mr-1" />
                            {plugin.download_count.toLocaleString()}
                          </div>
                          <div className="flex items-center">
                            {getRatingStars(plugin.rating_average)}
                            <span className="ml-1">({plugin.rating_count})</span>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          <Badge variant="outline">{plugin.category}</Badge>
                          {getSecurityBadge(plugin.security_scan_status)}
                        </div>
                        <Button 
                          onClick={() => handleInstallPlugin(plugin.plugin_id)}
                          disabled={isInstalling}
                          size="sm"
                        >
                          <Download className="h-4 w-4 mr-2" />
                          Install
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          )}

          {/* All Plugins Grid */}
          <div>
            <h2 className="text-xl font-semibold mb-4">All Plugins</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {plugins.map((plugin) => (
                <Card key={plugin.id} className="hover:shadow-lg transition-shadow">
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <CardTitle className="text-lg">{plugin.display_name}</CardTitle>
                        <CardDescription className="text-sm mt-1">
                          by {plugin.author_name}
                          {plugin.is_official && (
                            <Verified className="h-4 w-4 text-blue-500 inline ml-1" />
                          )}
                        </CardDescription>
                      </div>
                      <div className="text-right">
                        <div className="text-sm font-medium">v{plugin.version}</div>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <p className="text-sm">{plugin.description}</p>
                    
                    <div className="flex items-center justify-between text-sm text-muted-foreground">
                      <div className="flex items-center">
                        <Download className="h-4 w-4 mr-1" />
                        {plugin.download_count.toLocaleString()}
                      </div>
                      <div className="flex items-center">
                        <Users className="h-4 w-4 mr-1" />
                        {plugin.install_count.toLocaleString()}
                      </div>
                      <div className="flex items-center">
                        {getRatingStars(plugin.rating_average)}
                        <span className="ml-1">({plugin.rating_count})</span>
                      </div>
                    </div>

                    {plugin.tags.length > 0 && (
                      <div className="flex flex-wrap gap-1">
                        {plugin.tags.slice(0, 3).map(tag => (
                          <Badge key={tag} variant="secondary" className="text-xs">
                            {tag}
                          </Badge>
                        ))}
                        {plugin.tags.length > 3 && (
                          <Badge variant="secondary" className="text-xs">
                            +{plugin.tags.length - 3}
                          </Badge>
                        )}
                      </div>
                    )}

                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <Badge variant="outline">{plugin.category}</Badge>
                        {getSecurityBadge(plugin.security_scan_status)}
                      </div>
                      <Button 
                        onClick={() => handleInstallPlugin(plugin.plugin_id)}
                        disabled={isInstalling}
                        size="sm"
                      >
                        <Download className="h-4 w-4 mr-2" />
                        Install
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>

          {plugins.length === 0 && (
            <Card>
              <CardContent className="text-center py-12">
                <Store className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-medium mb-2">No plugins found</h3>
                <p className="text-muted-foreground">
                  {filters.search ? 'Try adjusting your search terms' : 'No plugins match the current filters'}
                </p>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="featured">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {featuredPlugins.map((plugin) => (
              <Card key={plugin.id} className="border-2 border-primary/20">
                <CardHeader>
                  <CardTitle className="flex items-center">
                    {plugin.display_name}
                    <Star className="h-4 w-4 text-yellow-400 ml-2" />
                  </CardTitle>
                  <CardDescription>by {plugin.author_name}</CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-sm mb-4">{plugin.description}</p>
                  <div className="flex justify-between items-center">
                    <Badge variant="outline">{plugin.category}</Badge>
                    <Button size="sm" onClick={() => handleInstallPlugin(plugin.plugin_id)}>
                      Install
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="popular">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...plugins]
              .sort((a, b) => b.download_count - a.download_count)
              .slice(0, 12)
              .map((plugin) => (
                <Card key={plugin.id}>
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      {plugin.display_name}
                      <TrendingUp className="h-4 w-4 text-green-500 ml-2" />
                    </CardTitle>
                    <CardDescription>
                      {plugin.download_count.toLocaleString()} downloads
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm mb-4">{plugin.description}</p>
                    <div className="flex justify-between items-center">
                      <Badge variant="outline">{plugin.category}</Badge>
                      <Button size="sm" onClick={() => handleInstallPlugin(plugin.plugin_id)}>
                        Install
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
          </div>
        </TabsContent>

        <TabsContent value="newest">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...plugins]
              .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
              .slice(0, 12)
              .map((plugin) => (
                <Card key={plugin.id}>
                  <CardHeader>
                    <CardTitle>{plugin.display_name}</CardTitle>
                    <CardDescription>
                      Added {new Date(plugin.created_at).toLocaleDateString()}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm mb-4">{plugin.description}</p>
                    <div className="flex justify-between items-center">
                      <Badge variant="outline">{plugin.category}</Badge>
                      <Button size="sm" onClick={() => handleInstallPlugin(plugin.plugin_id)}>
                        Install
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};