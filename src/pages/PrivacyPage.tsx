import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Shield, Eye, Lock } from 'lucide-react';

const PrivacyPage = () => {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="text-center mb-8">
        <h1 className="text-4xl font-bold mb-4">Privacy Policy</h1>
        <p className="text-lg text-muted-foreground">
          How CamerPulse protects and handles your personal information.
        </p>
      </div>

      <div className="max-w-4xl mx-auto space-y-8">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5" />
              Data Protection
            </CardTitle>
          </CardHeader>
          <CardContent className="prose prose-sm max-w-none">
            <p>
              CamerPulse is committed to protecting your privacy and personal data. We collect only the information necessary to provide our civic engagement services and protect it with industry-standard security measures.
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Eye className="h-5 w-5" />
              Information We Collect
            </CardTitle>
          </CardHeader>
          <CardContent className="prose prose-sm max-w-none">
            <ul className="list-disc pl-6 space-y-2">
              <li>Account information (email, username, profile data)</li>
              <li>Civic engagement activities (poll participation, politician ratings)</li>
              <li>Usage analytics to improve platform functionality</li>
              <li>Device information for security and optimization</li>
            </ul>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Lock className="h-5 w-5" />
              How We Use Your Data
            </CardTitle>
          </CardHeader>
          <CardContent className="prose prose-sm max-w-none">
            <p>Your data is used exclusively to:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Provide civic engagement platform services</li>
              <li>Aggregate anonymous civic participation statistics</li>
              <li>Improve platform functionality and user experience</li>
              <li>Send important platform updates and notifications</li>
            </ul>
            <p className="mt-4">
              We never sell your personal data to third parties or use it for commercial advertising.
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Your Rights</CardTitle>
          </CardHeader>
          <CardContent className="prose prose-sm max-w-none">
            <p>You have the right to:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Access and download your personal data</li>
              <li>Correct inaccurate information</li>
              <li>Delete your account and associated data</li>
              <li>Opt out of non-essential communications</li>
              <li>Request data portability</li>
            </ul>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Contact Us</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">
              For privacy-related questions or requests, contact us at: 
              <a href="mailto:privacy@camerpulse.cm" className="text-primary ml-1">privacy@camerpulse.cm</a>
            </p>
            <p className="text-sm text-muted-foreground mt-4">
              Last updated: January 2024
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default PrivacyPage;