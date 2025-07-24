import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Cookie, Settings, Info, Shield } from 'lucide-react';

const CookiesPage = () => {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="text-center mb-8">
        <h1 className="text-4xl font-bold mb-4">Cookie Policy</h1>
        <p className="text-lg text-muted-foreground">
          How CamerPulse uses cookies and similar technologies.
        </p>
      </div>

      <div className="max-w-4xl mx-auto space-y-8">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Info className="h-5 w-5" />
              What Are Cookies
            </CardTitle>
          </CardHeader>
          <CardContent className="prose prose-sm max-w-none">
            <p>
              Cookies are small text files stored on your device when you visit our website. They help us provide a better user experience, remember your preferences, and analyze platform usage to improve our services.
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Cookie className="h-5 w-5" />
              Types of Cookies We Use
            </CardTitle>
          </CardHeader>
          <CardContent className="prose prose-sm max-w-none">
            <div className="space-y-4">
              <div>
                <h4 className="font-semibold">Essential Cookies</h4>
                <p>Required for basic platform functionality, authentication, and security. These cannot be disabled.</p>
              </div>
              <div>
                <h4 className="font-semibold">Preference Cookies</h4>
                <p>Remember your settings like language, theme, and civic engagement preferences.</p>
              </div>
              <div>
                <h4 className="font-semibold">Analytics Cookies</h4>
                <p>Help us understand how users interact with the platform to improve functionality and user experience.</p>
              </div>
              <div>
                <h4 className="font-semibold">Security Cookies</h4>
                <p>Protect against fraud and ensure secure civic participation activities.</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Settings className="h-5 w-5" />
              Managing Your Cookie Preferences
            </CardTitle>
          </CardHeader>
          <CardContent className="prose prose-sm max-w-none">
            <p>You can control cookies through:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Your browser settings - most browsers allow you to refuse or delete cookies</li>
              <li>Our cookie preference center (coming soon)</li>
              <li>Third-party opt-out tools for analytics services</li>
            </ul>
            <p className="mt-4">
              Note: Disabling essential cookies may affect platform functionality and your ability to participate in civic activities.
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5" />
              Third-Party Cookies
            </CardTitle>
          </CardHeader>
          <CardContent className="prose prose-sm max-w-none">
            <p>We may use trusted third-party services that set cookies:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Analytics providers to understand platform usage</li>
              <li>Security services to protect against threats</li>
              <li>Infrastructure providers for platform hosting</li>
            </ul>
            <p className="mt-4">
              These third parties have their own privacy policies and cookie practices. We only work with providers that maintain high privacy standards.
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Data Retention</CardTitle>
          </CardHeader>
          <CardContent className="prose prose-sm max-w-none">
            <p>Cookie retention periods:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Session cookies: Deleted when you close your browser</li>
              <li>Preference cookies: Stored for up to 1 year</li>
              <li>Analytics cookies: Stored for up to 2 years</li>
              <li>Security cookies: Stored for the duration of security monitoring requirements</li>
            </ul>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Contact Us</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">
              Questions about our cookie policy: 
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

export default CookiesPage;