import React from 'react';
import { AppLayout } from "@/components/Layout/AppLayout";
import { CivicComplaintForm } from "@/components/Civic/CivicComplaintForm";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Link } from "react-router-dom";
import { Users, Calendar, GraduationCap, Heart, Pill, Crown, Building } from "lucide-react";

const Index = () => {
  return (
    <AppLayout>
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-background via-background to-primary/5 py-8 lg:py-16">
        <div className="container mx-auto px-4">
          <div className="text-center max-w-4xl mx-auto">
            <h1 className="responsive-heading font-bold text-foreground mb-4">
              Welcome to CamerPulse
            </h1>
            <p className="responsive-text text-muted-foreground mb-8 max-w-2xl mx-auto">
              Your comprehensive civic superapp for democratic participation, tracking political promises, 
              and engaging with Cameroon's governance
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button asChild size="lg" className="bg-gradient-to-r from-primary to-accent">
                <Link to="/polls">🗳️ Explore Polls</Link>
              </Button>
              <Button asChild variant="outline" size="lg">
                <Link to="/politicians">👥 View Politicians</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>
      
      {/* Feature Cards Section */}
      <section className="py-8 lg:py-16">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
            {/* Civic Engagement Card */}
            <Card className="bg-gradient-civic/10 border-primary/20 hover:shadow-elegant transition-shadow">
              <CardHeader>
                <CardTitle className="flex items-center gap-3 responsive-title">
                  <Users className="h-6 w-6 sm:h-8 sm:w-8 text-primary" />
                  Civic Engagement
                </CardTitle>
                <CardDescription className="responsive-text">
                  Participate in democratic processes and make your voice heard
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button asChild className="w-full" variant="outline">
                  <Link to="/polls">Explore Polls</Link>
                </Button>
              </CardContent>
            </Card>

            {/* Politicians Tracker Card */}
            <Card className="bg-gradient-to-br from-secondary/10 to-background border-secondary/20 hover:shadow-elegant transition-shadow">
              <CardHeader>
                <CardTitle className="flex items-center gap-3 responsive-title">
                  <Users className="h-6 w-6 sm:h-8 sm:w-8 text-secondary-foreground" />
                  Politicians
                </CardTitle>
                <CardDescription className="responsive-text">
                  Track politicians, their promises, and civic performance
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button asChild className="w-full" variant="outline">
                  <Link to="/politicians">View Politicians</Link>
                </Button>
              </CardContent>
              </Card>

              {/* Directory Card */}
              <Card className="bg-gradient-to-br from-blue-500/10 to-background border-blue-500/20 hover:shadow-elegant transition-shadow">
                <CardHeader>
                  <CardTitle className="flex items-center gap-3 responsive-title">
                    <Building className="h-6 w-6 sm:h-8 sm:w-8 text-blue-600" />
                    Government Directory
                  </CardTitle>
                  <CardDescription className="responsive-text">
                    Browse ministries, councils, and government entities with detailed profiles
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Button asChild className="w-full" variant="outline">
                    <Link to="/directory">Browse Directory</Link>
                  </Button>
                </CardContent>
              </Card>

            {/* Events Card */}
            <Card className="bg-gradient-to-br from-green-500/10 to-background border-green-500/20 hover:shadow-elegant transition-shadow">
              <CardHeader>
                <CardTitle className="flex items-center gap-3 responsive-title">
                  <Calendar className="h-6 w-6 sm:h-8 sm:w-8 text-green-600" />
                  Civic Events
                </CardTitle>
                <CardDescription className="responsive-text">
                  Discover and participate in civic events with ticket management
                </CardDescription>
               </CardHeader>
               <CardContent className="space-y-2">
                 <Button asChild className="w-full" variant="outline">
                   <Link to="/events">Explore Events</Link>
                 </Button>
                 <Button asChild className="w-full" variant="secondary">
                   <Link to="/calendar">📅 Calendar View</Link>
                 </Button>
               </CardContent>
            </Card>

            {/* National Tracker Card */}
            <Card className="bg-gradient-to-br from-accent/10 to-background border-accent/20 hover:shadow-elegant transition-shadow md:col-span-2 lg:col-span-1">
              <CardHeader>
                <CardTitle className="flex items-center gap-3 responsive-title">
                  <Users className="h-6 w-6 sm:h-8 sm:w-8 text-accent-foreground" />
                  National Tracking
                </CardTitle>
                <CardDescription className="responsive-text">
                  Monitor national debt, economic indicators, and transparency
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button asChild className="w-full" variant="outline">
                  <Link to="/national-debt">View Trackers</Link>
                </Button>
              </CardContent>
            </Card>
           </div>

          {/* Services Directory Section */}
          <div className="mt-12">
            <div className="text-center mb-8">
              <h2 className="text-3xl font-bold mb-4">Civic Services Directory</h2>
              <p className="text-muted-foreground max-w-2xl mx-auto">
                Discover essential services and institutions across Cameroon. Find schools, hospitals, pharmacies, and villages with ratings and verified information.
              </p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <Card className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <CardTitle className="flex items-center gap-3 responsive-title">
                    <GraduationCap className="h-6 w-6 sm:h-8 sm:w-8 text-blue-600" />
                    Schools
                  </CardTitle>
                  <CardDescription className="responsive-text">
                    Find quality educational institutions from nursery to university level
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Button asChild className="w-full" variant="outline">
                    <Link to="/schools">Browse Schools</Link>
                  </Button>
                </CardContent>
              </Card>

              <Card className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <CardTitle className="flex items-center gap-3 responsive-title">
                    <Heart className="h-6 w-6 sm:h-8 sm:w-8 text-red-600" />
                    Hospitals
                  </CardTitle>
                  <CardDescription className="responsive-text">
                    Locate healthcare facilities, emergency services, and specialized care
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Button asChild className="w-full" variant="outline">
                    <Link to="/hospitals">Find Hospitals</Link>
                  </Button>
                </CardContent>
              </Card>

              <Card className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <CardTitle className="flex items-center gap-3 responsive-title">
                    <Pill className="h-6 w-6 sm:h-8 sm:w-8 text-green-600" />
                    Pharmacies
                  </CardTitle>
                  <CardDescription className="responsive-text">
                    Search for pharmacies, check medicine availability, and find herbal shops
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Button asChild className="w-full" variant="outline">
                    <Link to="/pharmacies">Find Pharmacies</Link>
                  </Button>
                </CardContent>
              </Card>

              <Card className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <CardTitle className="flex items-center gap-3 responsive-title">
                    <Crown className="h-6 w-6 sm:h-8 sm:w-8 text-amber-600" />
                    Villages
                  </CardTitle>
                  <CardDescription className="responsive-text">
                    Explore village heritage, development projects, and traditional authority
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Button asChild className="w-full" variant="outline">
                    <Link to="/villages">Explore Villages</Link>
                  </Button>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>
      
      {/* Civic Tools Section */}
      <section className="bg-muted/50 py-8 lg:py-16">
        <div className="container mx-auto px-4">
          <CivicComplaintForm />
        </div>
      </section>
    </AppLayout>
  );
};

export default Index;
