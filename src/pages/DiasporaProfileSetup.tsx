import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { DiasporaProfileSetup } from '@/components/diaspora/DiasporaProfileSetup';
import { ArrowLeft, Globe } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';

const DiasporaProfileSetupPage: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background py-8">
      <div className="container mx-auto px-4 max-w-4xl">
        {/* Header */}
        <div className="mb-8">
          <Button 
            variant="ghost" 
            onClick={() => navigate('/diaspora-connect')}
            className="mb-4"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to DiasporaConnect
          </Button>
          
          <div className="text-center">
            <Globe className="mx-auto h-16 w-16 text-primary mb-4" />
            <h1 className="text-3xl font-bold text-foreground mb-4">
              Create Your Diaspora Profile
            </h1>
            <p className="text-muted-foreground mb-8 max-w-2xl mx-auto">
              Join the global Cameroonian diaspora community and start making an impact on your home region's development.
            </p>
          </div>
        </div>

        {/* Profile Setup Form */}
        <Card>
          <CardHeader>
            <CardTitle>Profile Information</CardTitle>
          </CardHeader>
          <CardContent>
            <DiasporaProfileSetup />
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default DiasporaProfileSetupPage;