import React from 'react';
import { AppLayout } from '@/components/Layout/AppLayout';
import { AdvancedPollTemplates } from '@/components/PollTemplates/AdvancedPollTemplates';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';

const PollTemplatesPage: React.FC = () => {
  const navigate = useNavigate();

  const handleSelectTemplate = (template: any) => {
    // Navigate to poll creation with selected template
    navigate('/dashboard/polls', { 
      state: { selectedTemplate: template } 
    });
  };

  return (
    <AppLayout>
      <div className="min-h-screen bg-gradient-to-br from-background via-background to-accent/5">
        <div className="container mx-auto px-4 py-6 lg:py-8 max-w-7xl">
          {/* Header */}
          <div className="flex items-center gap-4 mb-8">
            <Button 
              variant="ghost" 
              onClick={() => navigate(-1)}
              className="flex items-center gap-2"
            >
              <ArrowLeft className="h-4 w-4" />
              Back
            </Button>
            
            <div>
              <h1 className="text-3xl font-bold">Poll Templates</h1>
              <p className="text-muted-foreground">
                Choose from our collection of professional poll templates
              </p>
            </div>
          </div>

          {/* Templates */}
          <AdvancedPollTemplates 
            onSelectTemplate={handleSelectTemplate}
            showCreateButton={true}
          />
        </div>
      </div>
    </AppLayout>
  );
};

export default PollTemplatesPage;