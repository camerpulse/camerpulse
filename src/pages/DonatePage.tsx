import React from 'react';
import { AppLayout } from '@/components/Layout/AppLayout';
import { NokashDonationForm } from '@/components/donations/NokashDonationForm';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Heart, Shield, Users, Target, CheckCircle } from 'lucide-react';

const DonatePage: React.FC = () => {
  return (
    <AppLayout>
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        {/* Hero Section */}
        <div className="text-center mb-12">
          <div className="flex justify-center mb-6">
            <div className="p-4 bg-gradient-to-r from-red-500 to-pink-500 rounded-full">
              <Heart className="h-12 w-12 text-white" />
            </div>
          </div>
          <h1 className="text-4xl font-bold mb-4">Support CamerPulse</h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Help us build a more transparent and accountable Cameroon by supporting our civic engagement platform
          </p>
        </div>

        {/* Impact Statistics */}
        <div className="grid md:grid-cols-3 gap-6 mb-12">
          <Card className="text-center">
            <CardContent className="pt-6">
              <Users className="h-8 w-8 text-blue-600 mx-auto mb-3" />
              <div className="text-2xl font-bold">50,000+</div>
              <p className="text-muted-foreground">Active Citizens</p>
            </CardContent>
          </Card>
          <Card className="text-center">
            <CardContent className="pt-6">
              <Target className="h-8 w-8 text-green-600 mx-auto mb-3" />
              <div className="text-2xl font-bold">1,200+</div>
              <p className="text-muted-foreground">Civic Actions</p>
            </CardContent>
          </Card>
          <Card className="text-center">
            <CardContent className="pt-6">
              <Shield className="h-8 w-8 text-purple-600 mx-auto mb-3" />
              <div className="text-2xl font-bold">98%</div>
              <p className="text-muted-foreground">Trust Rating</p>
            </CardContent>
          </Card>
        </div>

        <div className="grid lg:grid-cols-2 gap-8">
          {/* Donation Form */}
          <div>
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Heart className="h-5 w-5 text-red-500" />
                  <span>Make a Donation</span>
                </CardTitle>
                <CardDescription>
                  Support our mission with a secure mobile money donation
                </CardDescription>
              </CardHeader>
              <CardContent>
                <NokashDonationForm />
              </CardContent>
            </Card>
          </div>

          {/* Why Donate */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Why Your Support Matters</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-start space-x-3">
                  <CheckCircle className="h-5 w-5 text-green-500 mt-0.5" />
                  <div>
                    <h4 className="font-semibold">Transparency Tools</h4>
                    <p className="text-sm text-muted-foreground">
                      Fund development of tools that track government spending and political promises
                    </p>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <CheckCircle className="h-5 w-5 text-green-500 mt-0.5" />
                  <div>
                    <h4 className="font-semibold">Civic Education</h4>
                    <p className="text-sm text-muted-foreground">
                      Support educational content that empowers citizens with knowledge
                    </p>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <CheckCircle className="h-5 w-5 text-green-500 mt-0.5" />
                  <div>
                    <h4 className="font-semibold">Platform Maintenance</h4>
                    <p className="text-sm text-muted-foreground">
                      Keep our servers running and services free for all citizens
                    </p>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <CheckCircle className="h-5 w-5 text-green-500 mt-0.5" />
                  <div>
                    <h4 className="font-semibold">Community Outreach</h4>
                    <p className="text-sm text-muted-foreground">
                      Expand our reach to rural communities across Cameroon
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Donation Security</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center space-x-2">
                    <Shield className="h-4 w-4 text-green-500" />
                    <span className="text-sm">Secured by Nokash mobile money</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Shield className="h-4 w-4 text-green-500" />
                    <span className="text-sm">Encrypted transaction processing</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Shield className="h-4 w-4 text-green-500" />
                    <span className="text-sm">Instant confirmation via email</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Shield className="h-4 w-4 text-green-500" />
                    <span className="text-sm">Full transaction transparency</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Thank You Message */}
        <div className="mt-12 text-center">
          <Card className="bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-950 dark:to-purple-950">
            <CardContent className="pt-8 pb-8">
              <Heart className="h-8 w-8 text-red-500 mx-auto mb-4" />
              <h3 className="text-xl font-semibold mb-2">Thank You for Your Support</h3>
              <p className="text-muted-foreground">
                Every donation, no matter the size, helps us build a more transparent and accountable Cameroon. 
                Together, we're strengthening democracy and empowering citizens.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </AppLayout>
  );
};

export default DonatePage;