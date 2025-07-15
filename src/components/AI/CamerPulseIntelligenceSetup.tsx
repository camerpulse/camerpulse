import React, { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Brain, Key, CheckCircle, AlertTriangle, ExternalLink } from 'lucide-react';

interface APIKeyStatus {
  name: string;
  required: boolean;
  configured: boolean;
  description: string;
  setupUrl?: string;
}

const CamerPulseIntelligenceSetup = () => {
  const [apiKeys, setApiKeys] = useState<APIKeyStatus[]>([
    {
      name: 'OPENAI_API_KEY',
      required: true,
      configured: false,
      description: 'For advanced sentiment analysis and language processing',
      setupUrl: 'https://platform.openai.com/api-keys'
    },
    {
      name: 'TWITTER_BEARER_TOKEN',
      required: true,
      configured: false,
      description: 'For real-time Twitter sentiment monitoring',
      setupUrl: 'https://developer.twitter.com/en/portal/dashboard'
    },
    {
      name: 'FACEBOOK_ACCESS_TOKEN',
      required: true,
      configured: false,
      description: 'For Facebook public content analysis',
      setupUrl: 'https://developers.facebook.com/tools/explorer'
    },
    {
      name: 'SERP_API_KEY',
      required: true,
      configured: false,
      description: 'For Google Trends and search sentiment analysis',
      setupUrl: 'https://serpapi.com/dashboard'
    },
    {
      name: 'PERPLEXITY_API_KEY',
      required: false,
      configured: false,
      description: 'For enhanced content verification and fact-checking',
      setupUrl: 'https://docs.perplexity.ai/docs/getting-started'
    },
    {
      name: 'FIRECRAWL_API_KEY',
      required: true,
      configured: false,
      description: 'For scraping government websites (since they have no APIs)',
      setupUrl: 'https://www.firecrawl.dev/app/api-keys'
    }
  ]);

  // Check API key status on mount
  React.useEffect(() => {
    const checkAPIStatus = async () => {
      try {
        const { data } = await supabase.functions.invoke('camerpulse-social-apis', {
          body: { action: 'platform_status' }
        });
        
        if (data?.success) {
          setApiKeys(prevKeys => 
            prevKeys.map(key => ({
              ...key,
              configured: data.status[key.name.toLowerCase().replace('_', '_')] || false
            }))
          );
        }
      } catch (error) {
        console.error('Error checking API status:', error);
      }
    };

    checkAPIStatus();
  }, []);

  const requiredKeys = apiKeys.filter(key => key.required);
  const configuredRequired = requiredKeys.filter(key => key.configured).length;
  const allRequiredConfigured = configuredRequired === requiredKeys.length;

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <div className="text-center space-y-4 mb-8">
        <div className="flex items-center justify-center space-x-3">
          <Brain className="h-12 w-12 text-primary animate-pulse" />
          <h1 className="text-4xl font-bold bg-gradient-to-r from-primary via-secondary to-accent bg-clip-text text-transparent">
            CAMERPULSE INTELLIGENCE SETUP
          </h1>
        </div>
        <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
          Configure your civic-grade national sentiment and election intelligence system with the required API keys to begin monitoring public opinion across Cameroon.
        </p>
      </div>

      {/* Setup Progress */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Key className="h-5 w-5" />
            <span>API Configuration Status</span>
          </CardTitle>
          <CardDescription>
            {configuredRequired} of {requiredKeys.length} required API keys configured
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center space-x-4">
            <div className="flex-1 bg-muted rounded-full h-2">
              <div 
                className="bg-primary rounded-full h-2 transition-all duration-300"
                style={{ width: `${(configuredRequired / requiredKeys.length) * 100}%` }}
              />
            </div>
            <span className="text-sm font-medium">
              {Math.round((configuredRequired / requiredKeys.length) * 100)}%
            </span>
          </div>
        </CardContent>
      </Card>

      {/* Status Alert */}
      {allRequiredConfigured ? (
        <Alert className="mb-6 border-green-200 bg-green-50">
          <CheckCircle className="h-4 w-4 text-green-600" />
          <AlertDescription>
            <strong className="text-green-800">Ready to Deploy!</strong> All required API keys are configured. 
            CamerPulse Intelligence can now begin monitoring and analyzing public sentiment.
          </AlertDescription>
        </Alert>
      ) : (
        <Alert className="mb-6 border-yellow-200 bg-yellow-50">
          <AlertTriangle className="h-4 w-4 text-yellow-600" />
          <AlertDescription>
            <strong className="text-yellow-800">Configuration Required:</strong> Please configure the remaining 
            API keys to enable full functionality.
          </AlertDescription>
        </Alert>
      )}

      {/* API Keys List */}
      <div className="grid gap-4">
        {apiKeys.map((apiKey) => (
          <Card key={apiKey.name} className={apiKey.configured ? 'border-green-200' : ''}>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg flex items-center space-x-2">
                  <span>{apiKey.name}</span>
                  {apiKey.required && (
                    <Badge variant="destructive" className="text-xs">Required</Badge>
                  )}
                  {!apiKey.required && (
                    <Badge variant="outline" className="text-xs">Optional</Badge>
                  )}
                </CardTitle>
                <div className="flex items-center space-x-2">
                  {apiKey.configured ? (
                    <CheckCircle className="h-5 w-5 text-green-600" />
                  ) : (
                    <AlertTriangle className="h-5 w-5 text-yellow-600" />
                  )}
                  <Badge variant={apiKey.configured ? 'default' : 'outline'}>
                    {apiKey.configured ? 'Configured' : 'Not Set'}
                  </Badge>
                </div>
              </div>
              <CardDescription>{apiKey.description}</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                {apiKey.setupUrl && (
                  <Button variant="outline" size="sm" asChild>
                    <a href={apiKey.setupUrl} target="_blank" rel="noopener noreferrer">
                      <ExternalLink className="h-4 w-4 mr-2" />
                      Get API Key
                    </a>
                  </Button>
                )}
                <div className="flex-1" />
                {!apiKey.configured && (
                  <div className="text-sm text-muted-foreground">
                    Configure in Supabase Edge Function Secrets
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Setup Instructions */}
      <Card className="mt-8">
        <CardHeader>
          <CardTitle>Setup Instructions</CardTitle>
          <CardDescription>
            Follow these steps to complete the CamerPulse Intelligence configuration
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="border-l-4 border-primary pl-4">
              <h4 className="font-semibold">Step 1: Obtain API Keys</h4>
              <p className="text-sm text-muted-foreground">
                Visit each provider's website and generate your API keys. Some may require account verification.
              </p>
            </div>
            <div className="border-l-4 border-primary pl-4">
              <h4 className="font-semibold">Step 2: Configure Secrets</h4>
              <p className="text-sm text-muted-foreground">
                Add each API key to your Supabase project's Edge Function secrets using the exact names shown above.
              </p>
            </div>
            <div className="border-l-4 border-primary pl-4">
              <h4 className="font-semibold">Step 3: Deploy & Monitor</h4>
              <p className="text-sm text-muted-foreground">
                Once configured, CamerPulse Intelligence will automatically begin monitoring and analyzing sentiment data.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Action Buttons */}
      <div className="mt-8 flex justify-center space-x-4">
        {allRequiredConfigured ? (
          <Button size="lg" className="bg-gradient-to-r from-primary to-secondary">
            <Brain className="h-5 w-5 mr-2" />
            Launch CamerPulse Intelligence Dashboard
          </Button>
        ) : (
          <Button variant="outline" size="lg" disabled>
            Complete Configuration First
          </Button>
        )}
      </div>
    </div>
  );
};

export default CamerPulseIntelligenceSetup;