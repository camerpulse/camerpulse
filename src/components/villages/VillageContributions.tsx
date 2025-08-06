import React from 'react';
import { 
  Plus, Camera, Edit, FileText, Users, Building, 
  Calendar, MessageSquare, MapPin, Star, Upload, 
  PenTool, Megaphone, Flag, Heart
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';

interface VillageContributionsProps {
  villageId: string;
}

export const VillageContributions: React.FC<VillageContributionsProps> = ({ villageId }) => {
  const contributionTypes = [
    {
      id: 'photos',
      title: 'Share Photos',
      description: 'Upload photos of village life, events, landmarks, or development projects',
      icon: Camera,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50',
      action: 'Upload Photos'
    },
    {
      id: 'news',
      title: 'Submit News',
      description: 'Share important village news, announcements, or community updates',
      icon: Megaphone,
      color: 'text-green-600',
      bgColor: 'bg-green-50',
      action: 'Submit News'
    },
    {
      id: 'events',
      title: 'Create Event',
      description: 'Organize community events, meetings, celebrations, or cultural activities',
      icon: Calendar,
      color: 'text-purple-600',
      bgColor: 'bg-purple-50',
      action: 'Create Event'
    },
    {
      id: 'projects',
      title: 'Propose Project',
      description: 'Suggest development projects or community improvement initiatives',
      icon: Building,
      color: 'text-orange-600',
      bgColor: 'bg-orange-50',
      action: 'Propose Project'
    },
    {
      id: 'petition',
      title: 'Start Petition',
      description: 'Launch a petition for community issues or needed changes',
      icon: FileText,
      color: 'text-red-600',
      bgColor: 'bg-red-50',
      action: 'Start Petition'
    },
    {
      id: 'business',
      title: 'List Business',
      description: 'Add your business or service to the village directory',
      icon: Building,
      color: 'text-indigo-600',
      bgColor: 'bg-indigo-50',
      action: 'List Business'
    },
    {
      id: 'correction',
      title: 'Suggest Edit',
      description: 'Propose corrections or updates to village information',
      icon: Edit,
      color: 'text-teal-600',
      bgColor: 'bg-teal-50',
      action: 'Suggest Edit'
    },
    {
      id: 'review',
      title: 'Write Review',
      description: 'Review village institutions, services, or rate the village overall',
      icon: Star,
      color: 'text-yellow-600',
      bgColor: 'bg-yellow-50',
      action: 'Write Review'
    }
  ];

  const moderationInfo = [
    'All submissions are reviewed by community moderators before publication',
    'Photos must be appropriate and related to village life',
    'News and announcements should be factual and relevant',
    'Business listings require verification of ownership',
    'Respect community guidelines and maintain civil discourse'
  ];

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="text-center space-y-4">
        <h2 className="text-3xl font-bold">Contribute to Your Village</h2>
        <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
          Help build a comprehensive profile of your village by sharing photos, news, events, 
          and other valuable content that showcases your community.
        </p>
      </div>

      {/* Moderation Notice */}
      <Alert>
        <Flag className="h-4 w-4" />
        <AlertDescription>
          <strong>Content Moderation:</strong> All contributions are reviewed by community moderators 
          to ensure quality and appropriateness before being published.
        </AlertDescription>
      </Alert>

      {/* Contribution Options */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {contributionTypes.map((type) => {
          const IconComponent = type.icon;
          
          return (
            <Card key={type.id} className="hover:shadow-lg transition-all duration-300 group">
              <CardHeader className="text-center pb-4">
                <div className={`w-16 h-16 rounded-full ${type.bgColor} mx-auto mb-4 flex items-center justify-center group-hover:scale-110 transition-transform`}>
                  <IconComponent className={`h-8 w-8 ${type.color}`} />
                </div>
                <CardTitle className="text-xl">{type.title}</CardTitle>
              </CardHeader>
              <CardContent className="text-center space-y-4">
                <p className="text-muted-foreground">
                  {type.description}
                </p>
                <Button 
                  className="w-full group-hover:shadow-md transition-shadow"
                  variant="outline"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  {type.action}
                </Button>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Community Guidelines */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Heart className="h-5 w-5 mr-2 text-red-500" />
            Community Guidelines
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h4 className="font-semibold mb-3">Content Standards</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                {moderationInfo.map((item, index) => (
                  <li key={index} className="flex items-start">
                    <span className="w-2 h-2 bg-primary rounded-full mt-2 mr-3 flex-shrink-0" />
                    {item}
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-3">Quick Tips</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li className="flex items-start">
                  <span className="w-2 h-2 bg-green-500 rounded-full mt-2 mr-3 flex-shrink-0" />
                  Use clear, descriptive titles for better discoverability
                </li>
                <li className="flex items-start">
                  <span className="w-2 h-2 bg-green-500 rounded-full mt-2 mr-3 flex-shrink-0" />
                  Include relevant details and context in descriptions
                </li>
                <li className="flex items-start">
                  <span className="w-2 h-2 bg-green-500 rounded-full mt-2 mr-3 flex-shrink-0" />
                  Add accurate dates and locations for events
                </li>
                <li className="flex items-start">
                  <span className="w-2 h-2 bg-green-500 rounded-full mt-2 mr-3 flex-shrink-0" />
                  Use high-quality images when possible
                </li>
                <li className="flex items-start">
                  <span className="w-2 h-2 bg-green-500 rounded-full mt-2 mr-3 flex-shrink-0" />
                  Verify information before submitting
                </li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Contact Moderators */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <MessageSquare className="h-5 w-5 mr-2" />
            Need Help?
          </CardTitle>
        </CardHeader>
        <CardContent className="text-center space-y-4">
          <p className="text-muted-foreground">
            Have questions about contributing or need assistance with submissions? 
            Our community moderators are here to help.
          </p>
          <div className="flex gap-3 justify-center">
            <Button variant="outline">
              <MessageSquare className="h-4 w-4 mr-2" />
              Contact Moderators
            </Button>
            <Button variant="outline">
              <FileText className="h-4 w-4 mr-2" />
              View Guidelines
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};