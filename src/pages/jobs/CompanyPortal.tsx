import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useCompanies } from '@/hooks/useCompanies';
import { CompanyRegistration } from '@/components/jobs/CompanyRegistration';
import { CompanyDashboard } from '@/components/jobs/CompanyDashboard';
import { JobPostingForm } from '@/components/jobs/JobPostingForm';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Building2, ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

type ViewState = 'loading' | 'register' | 'dashboard' | 'post-job';

export const CompanyPortal: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { getUserCompany } = useCompanies();
  const [viewState, setViewState] = useState<ViewState>('loading');
  const [company, setCompany] = useState<any>(null);

  useEffect(() => {
    const checkCompanyStatus = async () => {
      if (!user) {
        navigate('/auth');
        return;
      }

      const userCompany = await getUserCompany();
      
      if (userCompany) {
        setCompany(userCompany);
        setViewState('dashboard');
      } else {
        setViewState('register');
      }
    };

    checkCompanyStatus();
  }, [user, navigate]);

  const handleRegistrationSuccess = () => {
    setViewState('loading');
    // Refresh company data
    getUserCompany().then(userCompany => {
      if (userCompany) {
        setCompany(userCompany);
        setViewState('dashboard');
      }
    });
  };

  const handleJobPostSuccess = () => {
    setViewState('dashboard');
  };

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card className="max-w-md">
          <CardContent className="p-8 text-center">
            <Building2 className="h-12 w-12 text-primary mx-auto mb-4" />
            <h2 className="text-xl font-semibold mb-2">Login Required</h2>
            <p className="text-muted-foreground mb-4">
              Please log in to access the company portal.
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
            onClick={() => {
              if (viewState === 'post-job') {
                setViewState('dashboard');
              } else {
                navigate('/jobs');
              }
            }}
            className="flex items-center gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            {viewState === 'post-job' ? 'Back to Dashboard' : 'Back to Jobs'}
          </Button>
          
          <div>
            <h1 className="text-2xl font-bold">Company Portal</h1>
            <p className="text-muted-foreground">
              {viewState === 'register' ? 'Register your company' :
               viewState === 'post-job' ? 'Post a new job' :
               'Manage your company and jobs'}
            </p>
          </div>
        </div>

        {/* Content */}
        {viewState === 'register' && (
          <CompanyRegistration onSuccess={handleRegistrationSuccess} />
        )}

        {viewState === 'dashboard' && company && (
          <CompanyDashboard 
            company={company} 
            onCreateJob={() => setViewState('post-job')}
          />
        )}

        {viewState === 'post-job' && company && (
          <JobPostingForm 
            companyId={company.id}
            onSuccess={handleJobPostSuccess}
          />
        )}
      </div>
    </div>
  );
};