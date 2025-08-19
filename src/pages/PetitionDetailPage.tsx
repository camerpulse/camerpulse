import React from 'react';
import { useParams } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Separator } from '@/components/ui/separator';
import { SafeHtml } from '@/components/Security/SafeHtml';
import { 
  Share2, 
  Heart, 
  MessageCircle, 
  Calendar, 
  MapPin, 
  Users, 
  Target,
  TrendingUp,
  Clock
} from 'lucide-react';
import { usePetitionSlug } from '@/hooks/useSlugResolver';

/**
 * Individual petition detail page with full information and interaction options
 */
const PetitionDetailPage: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const { entity: petition, loading, error } = usePetitionSlug();

  // Mock data for demonstration
  const mockPetition = {
    id: '1',
    title: 'Improve Public Healthcare Access in Rural Areas',
    description: 'This petition calls for the establishment of more healthcare facilities in remote villages across Cameroon. Many communities currently travel hours to reach the nearest clinic, putting lives at risk during medical emergencies.',
    fullContent: `
      <h3>The Problem</h3>
      <p>Rural communities in Cameroon face significant challenges accessing basic healthcare services. Currently, over 60% of rural villages are located more than 10km from the nearest health facility.</p>
      
      <h3>Our Solution</h3>
      <p>We propose the establishment of at least one primary healthcare center per administrative division, staffed with qualified medical personnel and equipped with essential medical supplies.</p>
      
      <h3>Expected Impact</h3>
      <ul>
        <li>Reduced travel time to healthcare facilities</li>
        <li>Lower maternal and infant mortality rates</li>
        <li>Better management of chronic diseases</li>
        <li>Improved emergency response capabilities</li>
      </ul>
    `,
    signatures: 15420,
    target: 25000,
    category: 'Healthcare',
    status: 'Active',
    createdAt: '2024-01-15',
    endDate: '2024-02-15',
    location: 'National',
    creator: {
      name: 'Dr. Marie Ngono',
      avatar: '',
      verified: true
    },
    updates: [
      {
        date: '2024-01-20',
        title: 'Ministry of Health Response',
        content: 'The Ministry has acknowledged the petition and scheduled a meeting for next week.'
      },
      {
        date: '2024-01-18',
        title: '10,000 Signatures Reached!',
        content: 'Thank you to everyone who has signed. We\'re gaining momentum!'
      }
    ],
    recentSignatures: [
      { name: 'Jean Paul K.', location: 'Yaounde', time: '2 hours ago' },
      { name: 'Fatima M.', location: 'Douala', time: '4 hours ago' },
      { name: 'Samuel T.', location: 'Bamenda', time: '6 hours ago' },
    ]
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-6">
        <div className="animate-pulse space-y-6">
          <div className="h-8 bg-gray-200 rounded w-3/4"></div>
          <div className="h-4 bg-gray-200 rounded w-1/2"></div>
          <div className="h-32 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-6">
        <Card>
          <CardContent className="text-center py-12">
            <p className="text-lg font-medium">Petition not found</p>
            <p className="text-muted-foreground">The petition you're looking for doesn't exist or has been removed.</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  const data = petition || mockPetition;
  const progressPercentage = (data.signatures / data.target) * 100;

  return (
    <div className="container mx-auto px-4 py-6 space-y-6">
      {/* Header */}
      <div className="space-y-4">
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <span>Petitions</span>
          <span>/</span>
          <Badge variant="outline">{data.category}</Badge>
        </div>
        
        <div>
          <h1 className="text-3xl font-bold mb-2">{data.title}</h1>
          <div className="flex items-center gap-4 text-sm text-muted-foreground">
            <div className="flex items-center gap-1">
              <Calendar className="w-4 h-4" />
              Started {new Date(data.createdAt).toLocaleDateString()}
            </div>
            <div className="flex items-center gap-1">
              <MapPin className="w-4 h-4" />
              {data.location}
            </div>
            <Badge variant={data.status === 'Active' ? 'default' : 'secondary'}>
              {data.status}
            </Badge>
          </div>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Petition Content */}
          <Card>
            <CardHeader>
              <CardTitle>Petition Details</CardTitle>
            </CardHeader>
            <CardContent className="prose max-w-none">
              <p className="text-lg mb-4">{data.description}</p>
              <SafeHtml 
                allowedTags={['p', 'br', 'strong', 'em', 'ul', 'li', 'ol', 'h1', 'h2', 'h3', 'blockquote']}
              >
                {data.fullContent}
              </SafeHtml>
            </CardContent>
          </Card>

          {/* Creator Info */}
          <Card>
            <CardHeader>
              <CardTitle>Started by</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-3">
                <Avatar>
                  <AvatarImage src={data.creator.avatar} />
                  <AvatarFallback>{data.creator.name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                </Avatar>
                <div>
                  <p className="font-medium flex items-center gap-2">
                    {data.creator.name}
                    {data.creator.verified && (
                      <Badge variant="secondary" className="text-xs">Verified</Badge>
                    )}
                  </p>
                  <p className="text-sm text-muted-foreground">Petition Creator</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Updates */}
          <Card>
            <CardHeader>
              <CardTitle>Updates</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {data.updates.map((update, index) => (
                <div key={index} className="border-l-2 border-primary pl-4">
                  <div className="flex items-center gap-2 mb-1">
                    <p className="font-medium">{update.title}</p>
                    <Badge variant="outline" className="text-xs">
                      {new Date(update.date).toLocaleDateString()}
                    </Badge>
                  </div>
                  <p className="text-sm text-muted-foreground">{update.content}</p>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Signature Progress */}
          <Card>
            <CardHeader>
              <CardTitle>Signatures</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="text-center">
                <div className="text-3xl font-bold">{data.signatures.toLocaleString()}</div>
                <div className="text-sm text-muted-foreground">of {data.target.toLocaleString()} goal</div>
              </div>
              
              <Progress value={progressPercentage} className="w-full" />
              
              <div className="flex items-center justify-between text-sm">
                <span>{Math.round(progressPercentage)}% complete</span>
                <div className="flex items-center gap-1 text-muted-foreground">
                  <Clock className="w-4 h-4" />
                  15 days left
                </div>
              </div>

              <Button className="w-full" size="lg">
                Sign This Petition
              </Button>

              <div className="flex gap-2">
                <Button variant="outline" size="sm" className="flex-1">
                  <Share2 className="w-4 h-4 mr-2" />
                  Share
                </Button>
                <Button variant="outline" size="sm" className="flex-1">
                  <Heart className="w-4 h-4 mr-2" />
                  Support
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Recent Signatures */}
          <Card>
            <CardHeader>
              <CardTitle>Recent Signatures</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {data.recentSignatures.map((signature, index) => (
                <div key={index} className="flex items-center justify-between">
                  <div>
                    <p className="font-medium text-sm">{signature.name}</p>
                    <p className="text-xs text-muted-foreground">{signature.location}</p>
                  </div>
                  <span className="text-xs text-muted-foreground">{signature.time}</span>
                </div>
              ))}
              <Separator />
              <div className="text-center">
                <Button variant="link" size="sm">
                  View all signatures
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Stats */}
          <Card>
            <CardHeader>
              <CardTitle>Impact</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <TrendingUp className="w-4 h-4 text-muted-foreground" />
                  <span className="text-sm">Daily signatures</span>
                </div>
                <span className="font-medium">+250</span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <MessageCircle className="w-4 h-4 text-muted-foreground" />
                  <span className="text-sm">Comments</span>
                </div>
                <span className="font-medium">89</span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Users className="w-4 h-4 text-muted-foreground" />
                  <span className="text-sm">Shares</span>
                </div>
                <span className="font-medium">342</span>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default PetitionDetailPage;