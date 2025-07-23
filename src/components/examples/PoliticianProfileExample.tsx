import React from 'react';
import { EntityReputationProfile } from '@/components/civic/EntityReputationProfile';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { MapPin, Calendar, ExternalLink, Phone, Mail } from 'lucide-react';

interface PoliticianProfilePageProps {
  politicianId: string;
}

// Example of how to integrate reputation into existing profile pages
export function PoliticianProfileExample({ politicianId }: PoliticianProfilePageProps) {
  const mockPolitician = {
    id: politicianId,
    name: "Hon. Dr. Sarah Mbaku",
    position: "Minister of Education",
    region: "Northwest",
    party: "CPDM",
    contact: {
      phone: "+237 650 123 456",
      email: "s.mbaku@education.gov.cm"
    },
    termStart: "2019-01-15",
    biography: "Dr. Sarah Mbaku has served as Minister of Education since 2019, focusing on educational reform and infrastructure development in Cameroon's educational sector."
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-muted/20 p-4">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Header Section */}
        <Card>
          <CardHeader>
            <div className="flex items-start gap-6">
              <Avatar className="h-24 w-24">
                <AvatarImage src={`https://api.dicebear.com/7.x/personas/svg?seed=${mockPolitician.name}`} />
                <AvatarFallback>SM</AvatarFallback>
              </Avatar>
              
              <div className="flex-1 space-y-3">
                <div>
                  <h1 className="text-3xl font-bold">{mockPolitician.name}</h1>
                  <p className="text-xl text-muted-foreground">{mockPolitician.position}</p>
                </div>
                
                <div className="flex flex-wrap gap-2">
                  <Badge variant="outline" className="flex items-center gap-1">
                    <MapPin className="h-3 w-3" />
                    {mockPolitician.region} Region
                  </Badge>
                  <Badge variant="outline">{mockPolitician.party}</Badge>
                  <Badge variant="outline" className="flex items-center gap-1">
                    <Calendar className="h-3 w-3" />
                    In office since {new Date(mockPolitician.termStart).getFullYear()}
                  </Badge>
                </div>

                <div className="flex gap-4 text-sm text-muted-foreground">
                  <div className="flex items-center gap-1">
                    <Phone className="h-3 w-3" />
                    {mockPolitician.contact.phone}
                  </div>
                  <div className="flex items-center gap-1">
                    <Mail className="h-3 w-3" />
                    {mockPolitician.contact.email}
                  </div>
                </div>
              </div>

              {/* Quick Contact Actions */}
              <div className="space-y-2">
                <Button size="sm">
                  <ExternalLink className="h-4 w-4 mr-2" />
                  Official Website
                </Button>
                <Button variant="outline" size="sm">
                  Send Message
                </Button>
              </div>
            </div>
          </CardHeader>
        </Card>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Biography */}
            <Card>
              <CardHeader>
                <CardTitle>Biography</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground leading-relaxed">
                  {mockPolitician.biography}
                </p>
              </CardContent>
            </Card>

            {/* Recent Activities */}
            <Card>
              <CardHeader>
                <CardTitle>Recent Activities</CardTitle>
                <CardDescription>Latest updates and public engagements</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="border-l-4 border-blue-500 pl-4 py-2">
                    <h4 className="font-medium">Education Budget Approval</h4>
                    <p className="text-sm text-muted-foreground">Successfully secured 15% budget increase for primary education infrastructure</p>
                    <span className="text-xs text-muted-foreground">2 days ago</span>
                  </div>
                  <div className="border-l-4 border-green-500 pl-4 py-2">
                    <h4 className="font-medium">Rural School Initiative Launch</h4>
                    <p className="text-sm text-muted-foreground">Launched program to build 50 new schools in rural Northwest region</p>
                    <span className="text-xs text-muted-foreground">1 week ago</span>
                  </div>
                  <div className="border-l-4 border-purple-500 pl-4 py-2">
                    <h4 className="font-medium">Teacher Training Program</h4>
                    <p className="text-sm text-muted-foreground">Announced new certification program for 1,000 teachers</p>
                    <span className="text-xs text-muted-foreground">2 weeks ago</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Key Achievements */}
            <Card>
              <CardHeader>
                <CardTitle>Key Achievements</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="text-center p-4 bg-green-50 rounded-lg">
                    <div className="text-2xl font-bold text-green-600">127</div>
                    <div className="text-sm text-green-800">Schools Built</div>
                  </div>
                  <div className="text-center p-4 bg-blue-50 rounded-lg">
                    <div className="text-2xl font-bold text-blue-600">2,450</div>
                    <div className="text-sm text-blue-800">Teachers Trained</div>
                  </div>
                  <div className="text-center p-4 bg-purple-50 rounded-lg">
                    <div className="text-2xl font-bold text-purple-600">89%</div>
                    <div className="text-sm text-purple-800">Budget Utilization</div>
                  </div>
                  <div className="text-center p-4 bg-orange-50 rounded-lg">
                    <div className="text-2xl font-bold text-orange-600">15</div>
                    <div className="text-sm text-orange-800">Bills Sponsored</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar - Reputation Profile */}
          <div className="space-y-6">
            {/* Integrated Reputation Profile */}
            <EntityReputationProfile
              entityId={mockPolitician.id}
              entityType="politician"
              entityName={mockPolitician.name}
              showFullProfile={true}
            />

            {/* Contact Information */}
            <Card>
              <CardHeader>
                <CardTitle>Contact Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Office Address</label>
                  <p className="text-sm">Ministry of Secondary Education<br />Building B, Government Quarter<br />Yaoundé, Cameroon</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Office Hours</label>
                  <p className="text-sm">Monday - Friday: 8:00 AM - 5:00 PM</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Public Office Hours</label>
                  <p className="text-sm">Tuesday & Thursday: 2:00 PM - 4:00 PM</p>
                </div>
              </CardContent>
            </Card>

            {/* Quick Links */}
            <Card>
              <CardHeader>
                <CardTitle>Quick Links</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <Button variant="outline" size="sm" className="w-full justify-start">
                  View Voting Record
                </Button>
                <Button variant="outline" size="sm" className="w-full justify-start">
                  Sponsored Legislation
                </Button>
                <Button variant="outline" size="sm" className="w-full justify-start">
                  Committee Memberships
                </Button>
                <Button variant="outline" size="sm" className="w-full justify-start">
                  Public Statements
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}