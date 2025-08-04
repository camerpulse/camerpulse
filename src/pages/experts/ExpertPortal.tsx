import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useExperts } from '@/hooks/useExperts';
import { ExpertProfileForm } from '@/components/experts/ExpertProfileForm';
import { ExpertDashboard } from '@/components/experts/ExpertDashboard';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { User, ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

type ViewState = 'loading' | 'register' | 'dashboard';

export const ExpertPortal: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { getUserExpertProfile } = useExperts();
  const [viewState, setViewState] = useState<ViewState>('loading');
  const [expertProfile, setExpertProfile] = useState<any>(null);

  useEffect(() => {
    const checkExpertStatus = async () => {
      if (!user) {
        navigate('/auth');
        return;
      }

      const userExpertProfile = await getUserExpertProfile();
      
      if (userExpertProfile) {
        setExpertProfile(userExpertProfile);
        setViewState('dashboard');
      } else {
        setViewState('register');
      }
    };

    checkExpertStatus();
  }, [user, navigate]);

  const handleRegistrationSuccess = () => {
    setViewState('loading');
    // Refresh expert profile data
    getUserExpertProfile().then(userExpertProfile => {
      if (userExpertProfile) {
        setExpertProfile(userExpertProfile);
        setViewState('dashboard');
      }
    });
  };

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card className="max-w-md">
          <CardContent className="p-8 text-center">
            <User className="h-12 w-12 text-primary mx-auto mb-4" />
            <h2 className="text-xl font-semibold mb-2">Login Required</h2>
            <p className="text-muted-foreground mb-4">
              Please log in to access the expert portal.
            </p>
            <Button onClick={() => navigate('/auth')}>
              Go to Login
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (viewState === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <Button 
            variant="ghost" 
            onClick={() => navigate('/jobs')}
            className="flex items-center gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Jobs
          </Button>
          
          <div>
            <h1 className="text-2xl font-bold">Expert Portal</h1>
            <p className="text-muted-foreground">
              {viewState === 'register' ? 'Join as a verified expert' : 'Manage your expert profile and projects'}
            </p>
          </div>
        </div>

        {/* Content */}
        {viewState === 'register' && (
          <ExpertProfileForm onSuccess={handleRegistrationSuccess} />
        )}

        {viewState === 'dashboard' && expertProfile && (
          <ExpertDashboard 
            expertProfile={expertProfile} 
            onCreateProfile={() => {
              // Navigate to public profile or open in new tab
              window.open(`/experts/${expertProfile.id}`, '_blank');
            }}
          />
        )}
      </div>
    </div>
  );
};