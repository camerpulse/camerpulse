import React from 'react';
import { AppLayout } from "@/components/Layout/AppLayout";
import { CivicComplaintForm } from "@/components/Civic/CivicComplaintForm";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Link } from "react-router-dom";
import { Users, Calendar, GraduationCap, Heart, Pill, Crown, Building, TrendingUp } from "lucide-react";

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
              <Button asChild variant="secondary" size="lg">
                <Link to="/legislation">📜 Track Legislation</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>
      
      {/* Core Civic Features */}
      <section className="py-8 lg:py-16">
        <div className="container mx-auto px-4">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold mb-4">Core Civic Engagement</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Essential democratic tools for citizen participation and government transparency
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
            {/* Civic Engagement Card */}
            <Card className="bg-gradient-civic/10 border-primary/20 hover:shadow-elegant transition-shadow">
              <CardHeader>
                <CardTitle className="flex items-center gap-3 responsive-title">
                  <Users className="h-6 w-6 sm:h-8 sm:w-8 text-primary" />
                  Polls & Voting
                </CardTitle>
                <CardDescription className="responsive-text">
                  Participate in polls, surveys, and civic voting initiatives
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button asChild className="w-full" variant="outline">
                  <Link to="/polls">Explore Polls</Link>
                </Button>
              </CardContent>
            </Card>

            {/* Legislation Card */}
            <Card className="bg-gradient-to-br from-purple-500/10 to-background border-purple-500/20 hover:shadow-elegant transition-shadow">
              <CardHeader>
                <CardTitle className="flex items-center gap-3 responsive-title">
                  <Building className="h-6 w-6 sm:h-8 sm:w-8 text-purple-600" />
                  Legislative Tracker
                </CardTitle>
                <CardDescription className="responsive-text">
                  Track bills, laws, and parliamentary votes in real-time
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button asChild className="w-full" variant="outline">
                  <Link to="/legislation">Track Legislation</Link>
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

            {/* Petitions Card */}
            <Card className="bg-gradient-to-br from-green-500/10 to-background border-green-500/20 hover:shadow-elegant transition-shadow">
              <CardHeader>
                <CardTitle className="flex items-center gap-3 responsive-title">
                  <Users className="h-6 w-6 sm:h-8 sm:w-8 text-green-600" />
                  Petitions
                </CardTitle>
                <CardDescription className="responsive-text">
                  Create and sign petitions for civic change and reform
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button asChild className="w-full" variant="outline">
                  <Link to="/petitions">Browse Petitions</Link>
                </Button>
              </CardContent>
            </Card>

            {/* Government Projects Card */}
            <Card className="bg-gradient-to-br from-blue-500/10 to-background border-blue-500/20 hover:shadow-elegant transition-shadow">
              <CardHeader>
                <CardTitle className="flex items-center gap-3 responsive-title">
                  <Building className="h-6 w-6 sm:h-8 sm:w-8 text-blue-600" />
                  Gov Projects
                </CardTitle>
                <CardDescription className="responsive-text">
                  Track government projects and development initiatives
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button asChild className="w-full" variant="outline">
                  <Link to="/government-projects">View Projects</Link>
                </Button>
              </CardContent>
            </Card>

            {/* Events Card */}
            <Card className="bg-gradient-to-br from-orange-500/10 to-background border-orange-500/20 hover:shadow-elegant transition-shadow">
              <CardHeader>
                <CardTitle className="flex items-center gap-3 responsive-title">
                  <Calendar className="h-6 w-6 sm:h-8 sm:w-8 text-orange-600" />
                  Civic Events
                </CardTitle>
                <CardDescription className="responsive-text">
                  Discover and participate in civic events with tickets
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-2">
                <Button asChild className="w-full" variant="outline">
                  <Link to="/events">Explore Events</Link>
                </Button>
              </CardContent>
            </Card>
          </div>

          {/* Analytics & Intelligence Section */}
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold mb-4">Intelligence & Analytics</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Data-driven insights for informed civic participation and transparency
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
            <Card className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <CardTitle className="flex items-center gap-3 responsive-title">
                  <TrendingUp className="h-6 w-6 text-blue-600" />
                  Analytics
                </CardTitle>
                <CardDescription className="responsive-text">
                  Advanced analytics and data visualization tools
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button asChild className="w-full" variant="outline">
                  <Link to="/analytics">View Analytics</Link>
                </Button>
              </CardContent>
            </Card>

            <Card className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <CardTitle className="flex items-center gap-3 responsive-title">
                  <Users className="h-6 w-6 text-purple-600" />
                  Election Forecast
                </CardTitle>
                <CardDescription className="responsive-text">
                  AI-powered election predictions and analysis
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button asChild className="w-full" variant="outline">
                  <Link to="/election-forecast">View Forecasts</Link>
                </Button>
              </CardContent>
            </Card>

            <Card className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <CardTitle className="flex items-center gap-3 responsive-title">
                  <Crown className="h-6 w-6 text-amber-600" />
                  Billionaires
                </CardTitle>
                <CardDescription className="responsive-text">
                  Track wealth, transparency, and economic influence
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button asChild className="w-full" variant="outline">
                  <Link to="/billionaires">View Billionaires</Link>
                </Button>
              </CardContent>
            </Card>

            <Card className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <CardTitle className="flex items-center gap-3 responsive-title">
                  <TrendingUp className="h-6 w-6 text-red-600" />
                  National Debt
                </CardTitle>
                <CardDescription className="responsive-text">
                  Monitor national debt and economic indicators
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button asChild className="w-full" variant="outline">
                  <Link to="/national-debt">View Debt Tracker</Link>
                </Button>
              </CardContent>
            </Card>
          </div>

          {/* Directory & Services Section */}
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold mb-4">Directories & Services</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Comprehensive directories of institutions, services, and organizations across Cameroon
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
            <Card className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <CardTitle className="flex items-center gap-3 responsive-title">
                  <Building className="h-6 w-6 text-blue-600" />
                  Government
                </CardTitle>
                <CardDescription className="responsive-text">
                  Ministries, councils, and government entities
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button asChild className="w-full" variant="outline">
                  <Link to="/directory">Browse Directory</Link>
                </Button>
              </CardContent>
            </Card>

            <Card className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <CardTitle className="flex items-center gap-3 responsive-title">
                  <Building className="h-6 w-6 text-green-600" />
                  Companies
                </CardTitle>
                <CardDescription className="responsive-text">
                  Business directory with verified company profiles
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button asChild className="w-full" variant="outline">
                  <Link to="/companies">Find Companies</Link>
                </Button>
              </CardContent>
            </Card>

            <Card className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <CardTitle className="flex items-center gap-3 responsive-title">
                  <GraduationCap className="h-6 w-6 text-blue-600" />
                  Schools
                </CardTitle>
                <CardDescription className="responsive-text">
                  Educational institutions from nursery to university
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
                  <Heart className="h-6 w-6 text-red-600" />
                  Hospitals
                </CardTitle>
                <CardDescription className="responsive-text">
                  Healthcare facilities and emergency services
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
                  <Pill className="h-6 w-6 text-green-600" />
                  Pharmacies
                </CardTitle>
                <CardDescription className="responsive-text">
                  Medicine availability and herbal shops
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
                  <Crown className="h-6 w-6 text-amber-600" />
                  Villages
                </CardTitle>
                <CardDescription className="responsive-text">
                  Village heritage and traditional authority
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button asChild className="w-full" variant="outline">
                  <Link to="/villages">Explore Villages</Link>
                </Button>
              </CardContent>
            </Card>

            <Card className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <CardTitle className="flex items-center gap-3 responsive-title">
                  <Building className="h-6 w-6 text-purple-600" />
                  Institutions
                </CardTitle>
                <CardDescription className="responsive-text">
                  Comprehensive institutional directory
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button asChild className="w-full" variant="outline">
                  <Link to="/institutions">View Institutions</Link>
                </Button>
              </CardContent>
            </Card>

            <Card className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <CardTitle className="flex items-center gap-3 responsive-title">
                  <Users className="h-6 w-6 text-blue-600" />
                  Political Parties
                </CardTitle>
                <CardDescription className="responsive-text">
                  Political party profiles and performance
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button asChild className="w-full" variant="outline">
                  <Link to="/political-parties">View Parties</Link>
                </Button>
              </CardContent>
            </Card>
          </div>

          {/* Entertainment & Culture Section */}
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold mb-4">Entertainment & Culture</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Celebrating Cameroonian talent, music, and cultural heritage
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <Card className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <CardTitle className="flex items-center gap-3 responsive-title">
                  <Users className="h-6 w-6 text-pink-600" />
                  CamerPlay
                </CardTitle>
                <CardDescription className="responsive-text">
                  Music streaming, artist profiles, and entertainment
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-2">
                <Button asChild className="w-full" variant="outline">
                  <Link to="/camerplay">🎵 Music Platform</Link>
                </Button>
                <Button asChild className="w-full" variant="secondary">
                  <Link to="/artist-landing">🎤 For Artists</Link>
                </Button>
              </CardContent>
            </Card>

            <Card className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <CardTitle className="flex items-center gap-3 responsive-title">
                  <Calendar className="h-6 w-6 text-orange-600" />
                  Events & Awards
                </CardTitle>
                <CardDescription className="responsive-text">
                  Cultural events, concerts, and award ceremonies
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button asChild className="w-full" variant="outline">
                  <Link to="/camerplay/events">View Events</Link>
                </Button>
              </CardContent>
            </Card>

            <Card className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <CardTitle className="flex items-center gap-3 responsive-title">
                  <Crown className="h-6 w-6 text-gold-600" />
                  Rankings
                </CardTitle>
                <CardDescription className="responsive-text">
                  Artist rankings, charts, and music statistics
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button asChild className="w-full" variant="outline">
                  <Link to="/camerplay/rankings">View Rankings</Link>
                </Button>
              </CardContent>
            </Card>
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
