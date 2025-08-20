import React, { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { AppLayout } from '@/components/Layout/AppLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { PostComposer } from '@/components/feed/PostComposer';
import { InfinitePostFeed } from '@/components/feed/InfinitePostFeed';
import { ResponsiveFeedLayout } from '@/components/feed/ResponsiveFeedLayout';
import { FeedAlgorithm } from '@/hooks/useFeedAlgorithm';
import {
  Search,
  RefreshCw,
  Bell,
  Settings,
  Shield,
} from 'lucide-react';


export default function Feed() {
  const { user, isAdmin } = useAuth();
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedAlgorithm, setSelectedAlgorithm] = useState<FeedAlgorithm>('recommended');


  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  return (
    <AppLayout>
      <div className="min-h-screen bg-background">
        {/* Top Navigation Bar */}
        <div className="sticky top-0 z-50 bg-background/95 backdrop-blur-sm border-b border-border">
          <div className="container mx-auto px-4 py-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <h1 className="text-xl font-bold text-primary">CamerPulse</h1>
                <Badge variant="secondary" className="bg-green-100 text-green-800">
                  Live
                </Badge>
              </div>
              
              <div className="flex items-center gap-2">
                <form onSubmit={handleSearch} className="hidden md:flex">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      type="search"
                      placeholder="Search CamerPulse..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-10 w-64"
                    />
                  </div>
                </form>
                
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => window.location.reload()}
                >
                  <RefreshCw className="h-4 w-4" />
                </Button>
                
                <Button variant="ghost" size="icon">
                  <Bell className="h-4 w-4" />
                </Button>
                
                {user && (
                  <Button variant="ghost" size="icon" onClick={() => navigate('/settings')}>
                    <Settings className="h-4 w-4" />
                  </Button>
                )}
                
                {isAdmin() && (
                  <Button variant="outline" size="sm" onClick={() => navigate('/admin/security')}>
                    <Shield className="h-4 w-4 mr-2" />
                    Admin
                  </Button>
                )}
              </div>
            </div>
          </div>
        </div>

        <ResponsiveFeedLayout
          selectedAlgorithm={selectedAlgorithm}
          onAlgorithmChange={setSelectedAlgorithm}
        >
          {/* Post Composer */}
          {user ? (
            <div className="mb-6">
              <PostComposer />
            </div>
          ) : (
            <Card className="mb-6">
              <CardContent className="p-6 text-center">
                <h3 className="text-lg font-semibold mb-2">Join the Conversation</h3>
                <p className="text-muted-foreground mb-4">
                  Sign in to share your voice and engage with your community
                </p>
                <Button onClick={() => navigate('/auth')}>
                  Sign In
                </Button>
              </CardContent>
            </Card>
          )}

          {/* Posts Feed */}
          <InfinitePostFeed />
        </ResponsiveFeedLayout>
      </div>
    </AppLayout>
  );
}