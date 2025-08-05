/**
 * CamerPulse Design System Preview
 * 
 * Visual preview component showcasing all design system elements.
 * Use this for testing and documentation purposes.
 */

import React from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { CheckCircle, AlertTriangle, Info, Heart, Users } from 'lucide-react';

export const DesignSystemPreview: React.FC = () => {
  return (
    <div className="p-8 max-w-6xl mx-auto space-y-12">
      {/* Header */}
      <div className="text-center space-y-4">
        <h1 className="text-4xl font-bold bg-gradient-civic bg-clip-text text-transparent">
          CamerPulse Design System
        </h1>
        <p className="text-lg text-muted-foreground max-w-3xl mx-auto">
          A comprehensive design system for civic engagement, built on Cameroon's national identity
          with CamerPulse brand enhancements.
        </p>
      </div>

      {/* Colors */}
      <section className="space-y-6">
        <h2 className="text-2xl font-semibold">Brand Colors</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-primary">Primary (CamerPulse Red)</CardTitle>
              <CardDescription>#B9121B</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-16 bg-primary rounded-lg"></div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle className="text-secondary">Secondary (National Green)</CardTitle>
              <CardDescription>#1F7D2C</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-16 bg-secondary rounded-lg"></div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle className="text-accent">Accent (Pulse Yellow)</CardTitle>
              <CardDescription>#F59E0B</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-16 bg-accent rounded-lg"></div>
            </CardContent>
          </Card>
        </div>

        {/* Gradient Showcase */}
        <div className="space-y-4">
          <h3 className="text-xl font-medium">Brand Gradients</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="h-16 bg-gradient-civic rounded-lg flex items-center justify-center">
              <span className="text-white font-semibold">Civic Gradient</span>
            </div>
            <div className="h-16 bg-gradient-flag rounded-lg flex items-center justify-center">
              <span className="text-white font-bold">Cameroon Flag</span>
            </div>
          </div>
        </div>
      </section>

      {/* Typography */}
      <section className="space-y-6">
        <h2 className="text-2xl font-semibold">Typography</h2>
        <div className="space-y-4">
          <div className="space-y-2">
            <h1 className="text-4xl font-bold">Heading 1 - Platform Title</h1>
            <h2 className="text-3xl font-semibold">Heading 2 - Section Title</h2>
            <h3 className="text-2xl font-medium">Heading 3 - Subsection</h3>
            <h4 className="text-xl font-medium">Heading 4 - Component Title</h4>
            <h5 className="text-lg font-medium">Heading 5 - Card Title</h5>
            <h6 className="text-base font-medium">Heading 6 - Label</h6>
          </div>
          
          <Separator />
          
          <div className="space-y-2">
            <p className="text-lg">Large body text for important content and introductions.</p>
            <p className="text-base">Regular body text for general content and descriptions.</p>
            <p className="text-sm">Small text for captions, metadata, and secondary information.</p>
            <p className="text-xs text-muted-foreground">Extra small text for fine print and disclaimers.</p>
          </div>
        </div>
      </section>

      {/* Buttons */}
      <section className="space-y-6">
        <h2 className="text-2xl font-semibold">Buttons</h2>
        
        <div className="space-y-4">
          <div className="space-y-2">
            <h3 className="text-lg font-medium">Primary Actions</h3>
            <div className="flex flex-wrap gap-3">
              <Button variant="default">Primary</Button>
              <Button variant="secondary">Secondary</Button>
              <Button variant="destructive">Destructive</Button>
              <Button variant="outline">Outline</Button>
              <Button variant="ghost">Ghost</Button>
              <Button variant="link">Link</Button>
            </div>
          </div>

          <div className="space-y-2">
            <h3 className="text-lg font-medium">Civic Actions</h3>
            <div className="flex flex-wrap gap-3">
              <Button className="bg-gradient-civic text-white">Vote Now</Button>
              <Button className="bg-gradient-flag text-white">Government Action</Button>
              <Button variant="outline" className="border-primary text-primary">
                <Users className="mr-2 h-4 w-4" />
                Join Discussion
              </Button>
            </div>
          </div>

          <div className="space-y-2">
            <h3 className="text-lg font-medium">Button Sizes</h3>
            <div className="flex flex-wrap items-center gap-3">
              <Button size="sm">Small</Button>
              <Button size="default">Default</Button>
              <Button size="lg">Large</Button>
              <Button size="icon">
                <Heart className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Badges */}
      <section className="space-y-6">
        <h2 className="text-2xl font-semibold">Badges & Status Indicators</h2>
        
        <div className="space-y-4">
          <div className="space-y-2">
            <h3 className="text-lg font-medium">Government Positions</h3>
            <div className="flex flex-wrap gap-2">
              <Badge className="bg-gradient-civic text-white">Minister</Badge>
              <Badge variant="secondary">Deputy</Badge>
              <Badge className="bg-primary text-primary-foreground">Mayor</Badge>
              <Badge className="bg-accent text-accent-foreground">Councilor</Badge>
            </div>
          </div>

          <div className="space-y-2">
            <h3 className="text-lg font-medium">Verification Status</h3>
            <div className="flex flex-wrap gap-2">
              <Badge className="bg-blue-500 text-white">
                <CheckCircle className="mr-1 h-3 w-3" />
                Verified
              </Badge>
              <Badge className="bg-gradient-flag text-white">
                <CheckCircle className="mr-1 h-3 w-3" />
                Government Verified
              </Badge>
              <Badge variant="outline">Pending</Badge>
            </div>
          </div>

          <div className="space-y-2">
            <h3 className="text-lg font-medium">Semantic States</h3>
            <div className="flex flex-wrap gap-2">
              <Badge className="bg-green-500 text-white">Active</Badge>
              <Badge className="bg-yellow-500 text-white">Pending</Badge>
              <Badge className="bg-red-500 text-white">Suspended</Badge>
              <Badge className="bg-gray-500 text-white">Inactive</Badge>
            </div>
          </div>
        </div>
      </section>

      {/* Alerts */}
      <section className="space-y-6">
        <h2 className="text-2xl font-semibold">Alerts & Notifications</h2>
        
        <div className="space-y-4">
          <Alert>
            <Info className="h-4 w-4" />
            <AlertTitle>Information</AlertTitle>
            <AlertDescription>
              This is a general information alert for platform updates.
            </AlertDescription>
          </Alert>

          <Alert className="border-green-200 bg-green-50 text-green-800">
            <CheckCircle className="h-4 w-4" />
            <AlertTitle>Success</AlertTitle>
            <AlertDescription>
              Your vote has been successfully recorded in the system.
            </AlertDescription>
          </Alert>

          <Alert className="border-yellow-200 bg-yellow-50 text-yellow-800">
            <AlertTriangle className="h-4 w-4" />
            <AlertTitle>Warning</AlertTitle>
            <AlertDescription>
              Election period ends in 24 hours. Make sure to cast your vote.
            </AlertDescription>
          </Alert>

          <Alert className="border-red-200 bg-red-50 text-red-800">
            <AlertTriangle className="h-4 w-4" />
            <AlertTitle>Emergency</AlertTitle>
            <AlertDescription>
              Important government announcement: Please stay updated on current developments.
            </AlertDescription>
          </Alert>

          <Alert className="bg-gradient-civic text-white border-transparent">
            <Info className="h-4 w-4" />
            <AlertTitle>National Update</AlertTitle>
            <AlertDescription>
              New civic engagement initiative launched. Join the national dialogue.
            </AlertDescription>
          </Alert>
        </div>
      </section>

      {/* Forms */}
      <section className="space-y-6">
        <h2 className="text-2xl font-semibold">Form Components</h2>
        
        <Card className="max-w-md">
          <CardHeader>
            <CardTitle>Civic Registration</CardTitle>
            <CardDescription>Register for civic engagement updates</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Full Name *</Label>
              <Input id="name" placeholder="Enter your full name" />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="region">Region</Label>
              <Input id="region" placeholder="Select your region" />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="interests">Civic Interests</Label>
              <div className="flex flex-wrap gap-2">
                <Badge variant="outline" className="cursor-pointer hover:bg-primary hover:text-primary-foreground">
                  Local Politics
                </Badge>
                <Badge variant="outline" className="cursor-pointer hover:bg-primary hover:text-primary-foreground">
                  Education
                </Badge>
                <Badge variant="outline" className="cursor-pointer hover:bg-primary hover:text-primary-foreground">
                  Healthcare
                </Badge>
              </div>
            </div>
            
            <Button className="w-full bg-gradient-civic text-white">
              Register for Updates
            </Button>
          </CardContent>
        </Card>
      </section>

      {/* Cards */}
      <section className="space-y-6">
        <h2 className="text-2xl font-semibold">Cards & Layouts</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Local Poll</CardTitle>
                <Badge className="bg-green-500 text-white">Active</Badge>
              </div>
              <CardDescription>Infrastructure Development</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground mb-4">
                Should the city prioritize road improvements in the downtown area?
              </p>
              <Button size="sm" className="w-full">Vote Now</Button>
            </CardContent>
          </Card>

          <Card className="border-primary">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-primary">Government Update</CardTitle>
                <Badge className="bg-gradient-flag text-white">Official</Badge>
              </div>
              <CardDescription>Ministry of Health</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground mb-4">
                New healthcare initiative launching next month in all regions.
              </p>
              <Button variant="outline" size="sm" className="w-full border-primary text-primary">
                Read More
              </Button>
            </CardContent>
          </Card>

          <Card className="bg-gradient-civic text-white">
            <CardHeader>
              <CardTitle>Civic Engagement</CardTitle>
              <CardDescription className="text-white/80">Weekly Summary</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-sm">Polls Voted</span>
                  <span className="font-semibold">12</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm">Discussions</span>
                  <span className="font-semibold">5</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm">Updates Read</span>
                  <span className="font-semibold">28</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Footer */}
      <div className="pt-12 border-t border-border text-center text-muted-foreground">
        <p>CamerPulse Design System - Built for Civic Engagement</p>
        <p className="text-sm mt-2">Proudly serving Cameroon with accessible, inclusive design</p>
      </div>
    </div>
  );
};

export default DesignSystemPreview;