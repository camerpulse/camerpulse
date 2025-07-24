import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { FileText, Users, Shield, Gavel } from 'lucide-react';

const TermsPage = () => {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="text-center mb-8">
        <h1 className="text-4xl font-bold mb-4">Terms of Service</h1>
        <p className="text-lg text-muted-foreground">
          Terms and conditions for using the CamerPulse platform.
        </p>
      </div>

      <div className="max-w-4xl mx-auto space-y-8">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Platform Usage
            </CardTitle>
          </CardHeader>
          <CardContent className="prose prose-sm max-w-none">
            <p>
              By using CamerPulse, you agree to use the platform responsibly for civic engagement and democratic participation. The platform is designed to foster constructive political discourse and transparent governance.
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              User Responsibilities
            </CardTitle>
          </CardHeader>
          <CardContent className="prose prose-sm max-w-none">
            <ul className="list-disc pl-6 space-y-2">
              <li>Provide accurate information when participating in polls and ratings</li>
              <li>Engage respectfully in political discussions and civic activities</li>
              <li>Respect the privacy and opinions of other platform users</li>
              <li>Report inappropriate content or behavior to platform moderators</li>
              <li>Use the platform for legitimate civic engagement purposes only</li>
            </ul>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5" />
              Platform Standards
            </CardTitle>
          </CardHeader>
          <CardContent className="prose prose-sm max-w-none">
            <p>CamerPulse maintains high standards for civic discourse:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>No hate speech, harassment, or discriminatory content</li>
              <li>No false information or deliberately misleading content</li>
              <li>No spam, unauthorized commercial activity, or manipulation</li>
              <li>No attempts to circumvent platform security measures</li>
              <li>Respect for democratic principles and rule of law</li>
            </ul>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Gavel className="h-5 w-5" />
              Enforcement
            </CardTitle>
          </CardHeader>
          <CardContent className="prose prose-sm max-w-none">
            <p>
              Violations of these terms may result in content removal, account suspension, or permanent ban from the platform. We reserve the right to investigate suspicious activities and cooperate with law enforcement when necessary.
            </p>
            <p className="mt-4">
              Appeals process: Users may appeal moderation decisions by contacting our support team within 30 days.
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Disclaimer</CardTitle>
          </CardHeader>
          <CardContent className="prose prose-sm max-w-none">
            <p>
              CamerPulse provides a platform for civic engagement but does not endorse any political candidate, party, or viewpoint. User-generated content reflects individual opinions and not the platform's official stance.
            </p>
            <p className="mt-4">
              The platform is provided "as is" without warranties. We strive for accuracy but cannot guarantee the completeness or reliability of all user-generated content.
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Contact & Updates</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">
              For questions about these terms: 
              <a href="mailto:legal@camerpulse.cm" className="text-primary ml-1">legal@camerpulse.cm</a>
            </p>
            <p className="text-sm text-muted-foreground mt-4">
              Terms last updated: January 2024. We will notify users of significant changes.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default TermsPage;