import React from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { 
  FileText, 
  DollarSign, 
  Upload, 
  ShieldAlert, 
  Wrench,
  Users,
  ExternalLink
} from 'lucide-react';

const communityActions = [
  {
    icon: FileText,
    title: 'Start a Petition',
    description: 'Launch a civic petition for your village or region',
    color: 'bg-orange-100 text-orange-800 hover:bg-orange-200',
    action: 'Create Petition'
  },
  {
    icon: DollarSign,
    title: 'Support a Village Project',
    description: 'Contribute to development projects in villages',
    color: 'bg-green-100 text-green-800 hover:bg-green-200',
    action: 'Browse Projects'
  },
  {
    icon: Upload,
    title: 'Upload Historical Photos',
    description: 'Share historical photos and documents',
    color: 'bg-blue-100 text-blue-800 hover:bg-blue-200',
    action: 'Upload Media'
  },
  {
    icon: ShieldAlert,
    title: 'Report a Conflict',
    description: 'Report conflicts or disputes for resolution',
    color: 'bg-red-100 text-red-800 hover:bg-red-200',
    action: 'Report Issue'
  },
  {
    icon: Wrench,
    title: 'Volunteer as Moderator',
    description: 'Help moderate content and verify information',
    color: 'bg-purple-100 text-purple-800 hover:bg-purple-200',
    action: 'Apply Now'
  },
  {
    icon: Users,
    title: 'Join Diaspora Network',
    description: 'Connect with your village diaspora community',
    color: 'bg-indigo-100 text-indigo-800 hover:bg-indigo-200',
    action: 'Connect'
  }
];

export const CommunityActions: React.FC = () => {
  return (
    <div className="bg-gradient-to-r from-gray-50 to-gray-100 py-12">
      <div className="container mx-auto px-4">
        <Card className="p-8">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold mb-4">🤝 Community Actions</h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Take action to strengthen your village and contribute to civic development across Cameroon
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {communityActions.map((action, index) => (
              <div
                key={index}
                className={`p-6 rounded-lg border-2 transition-all hover:shadow-lg ${action.color} border-opacity-50`}
              >
                <div className="flex items-start gap-4">
                  <div className="p-3 bg-white rounded-lg shadow-sm">
                    <action.icon className="w-6 h-6" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-lg mb-2">{action.title}</h3>
                    <p className="text-sm opacity-80 mb-4">{action.description}</p>
                    <Button 
                      size="sm" 
                      className="w-full bg-white/80 hover:bg-white text-gray-900 border-0"
                    >
                      <ExternalLink className="w-4 h-4 mr-2" />
                      {action.action}
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Call to Action */}
          <div className="mt-12 text-center bg-gradient-civic p-8 rounded-lg text-white">
            <h3 className="text-2xl font-bold mb-4">
              "Let every village have a name, a voice, and a page"
            </h3>
            <p className="text-lg mb-6 opacity-90">
              Together, we build a stronger, more connected Cameroon
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button 
                size="lg" 
                variant="outline" 
                className="border-white text-white hover:bg-white hover:text-primary"
              >
                View All Villages
              </Button>
              <Button 
                size="lg" 
                className="bg-white text-primary hover:bg-gray-100"
              >
                Join the Movement
              </Button>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
};