import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import camerPulseLogo from '@/assets/camerpulse-logo.png';
import { 
  Building, 
  Vote, 
  Users, 
  Scale, 
  FileText, 
  TrendingUp, 
  MapPin, 
  Heart,
  Eye,
  MessageCircle,
  Shield,
  Globe,
  ArrowRight,
  Phone,
  Mail,
  Facebook,
  Twitter,
  Linkedin,
  Instagram
} from 'lucide-react';

const CamerPulseHome = () => {
  return (
    <div className="min-h-screen bg-background">
      {/* CamerPulse Header */}
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-16 items-center justify-between">
          <div className="flex items-center gap-6">
            <Link to="/" className="flex items-center gap-2 hover:opacity-90 transition-opacity">
              <div className="w-8 h-8 rounded-lg flex items-center justify-center">
                <img src={camerPulseLogo} alt="CamerPulse" className="w-8 h-8 rounded-lg" />
              </div>
              <div className="flex flex-col">
                <span className="text-xl font-bold text-foreground">CamerPulse</span>
                <span className="text-xs text-muted-foreground hidden sm:block">Civic Engagement Platform</span>
              </div>
            </Link>
            
            {/* Navigation */}
            <nav className="hidden md:flex items-center gap-6">
              <Link to="/polls" className="text-sm font-medium transition-colors hover:text-primary text-muted-foreground">
                Polls
              </Link>
              <Link to="/politicians" className="text-sm font-medium transition-colors hover:text-primary text-muted-foreground">
                Politicians
              </Link>
              <Link to="/legislation" className="text-sm font-medium transition-colors hover:text-primary text-muted-foreground">
                Legislation
              </Link>
              <Link to="/judiciary" className="text-sm font-medium transition-colors hover:text-primary text-muted-foreground">
                Judiciary
              </Link>
              <Link to="/analytics" className="text-sm font-medium transition-colors hover:text-primary text-muted-foreground">
                Analytics
              </Link>
              <Link to="/diaspora-connect" className="text-sm font-medium transition-colors hover:text-primary text-muted-foreground">
                Diaspora
              </Link>
            </nav>
          </div>

          <div className="flex items-center gap-2">
            <Button asChild variant="ghost" size="sm">
              <Link to="/auth">Sign In</Link>
            </Button>
            <Button asChild size="sm">
              <Link to="/auth">Join Platform</Link>
            </Button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="py-20 px-4 bg-gradient-to-br from-primary/10 via-background to-primary/5">
        <div className="container mx-auto max-w-6xl text-center">
          <Badge className="mb-6 bg-primary/10 text-primary border-primary/20">
            🇨🇲 Cameroon's Civic Engagement Platform
          </Badge>
          
          <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold mb-6 leading-tight">
            Empowering Cameroonian<br />
            <span className="bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">
              Democracy
            </span>
          </h1>
          
          <p className="text-xl md:text-2xl mb-8 text-muted-foreground max-w-3xl mx-auto">
            Connect with your community, track political performance, participate in polls, and shape the future of Cameroon through transparent civic engagement.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center max-w-lg mx-auto">
            <Button asChild size="lg" className="w-full sm:w-auto">
              <Link to="/polls">
                <Vote className="w-5 h-5 mr-2" />
                Start Participating
              </Link>
            </Button>
            <Button asChild size="lg" variant="outline" className="w-full sm:w-auto">
              <Link to="/politicians">
                <Users className="w-5 h-5 mr-2" />
                Track Politicians
              </Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Platform Stats */}
      <section className="py-16 px-4 bg-muted/30">
        <div className="container mx-auto max-w-6xl">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
            <Card className="text-center">
              <CardContent className="p-6">
                <Users className="h-8 w-8 mx-auto mb-3 text-primary" />
                <div className="text-3xl font-bold mb-1">250K+</div>
                <div className="text-sm text-muted-foreground">Active Citizens</div>
              </CardContent>
            </Card>
            <Card className="text-center">
              <CardContent className="p-6">
                <Vote className="h-8 w-8 mx-auto mb-3 text-primary" />
                <div className="text-3xl font-bold mb-1">15K+</div>
                <div className="text-sm text-muted-foreground">Polls Conducted</div>
              </CardContent>
            </Card>
            <Card className="text-center">
              <CardContent className="p-6">
                <MapPin className="h-8 w-8 mx-auto mb-3 text-primary" />
                <div className="text-3xl font-bold mb-1">360+</div>
                <div className="text-sm text-muted-foreground">Villages Connected</div>
              </CardContent>
            </Card>
            <Card className="text-center">
              <CardContent className="p-6">
                <FileText className="h-8 w-8 mx-auto mb-3 text-primary" />
                <div className="text-3xl font-bold mb-1">1.2K+</div>
                <div className="text-sm text-muted-foreground">Bills Tracked</div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Core Features */}
      <section className="py-20 px-4">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold mb-6">
              Your Civic Engagement Hub
            </h2>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              Everything you need to participate in Cameroon's democracy and hold leaders accountable.
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            <Card className="group hover:shadow-xl transition-all duration-300 hover:-translate-y-2">
              <CardHeader className="text-center">
                <div className="bg-blue-500 w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform duration-300">
                  <Vote className="h-8 w-8 text-white" />
                </div>
                <CardTitle className="text-xl mb-2">Polls & Voting</CardTitle>
                <p className="text-muted-foreground">
                  Participate in democratic processes and civic polls across Cameroon
                </p>
              </CardHeader>
              <CardContent className="text-center pt-0">
                <Link to="/polls">
                  <Button variant="outline" className="group-hover:bg-blue-600 group-hover:text-white transition-colors duration-300">
                    Participate Now
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                </Link>
              </CardContent>
            </Card>

            <Card className="group hover:shadow-xl transition-all duration-300 hover:-translate-y-2">
              <CardHeader className="text-center">
                <div className="bg-green-500 w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform duration-300">
                  <Users className="h-8 w-8 text-white" />
                </div>
                <CardTitle className="text-xl mb-2">Political Tracking</CardTitle>
                <p className="text-muted-foreground">
                  Track and rate your political representatives and their performance
                </p>
              </CardHeader>
              <CardContent className="text-center pt-0">
                <Link to="/politicians">
                  <Button variant="outline" className="group-hover:bg-green-600 group-hover:text-white transition-colors duration-300">
                    View Politicians
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                </Link>
              </CardContent>
            </Card>

            <Card className="group hover:shadow-xl transition-all duration-300 hover:-translate-y-2">
              <CardHeader className="text-center">
                <div className="bg-purple-500 w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform duration-300">
                  <FileText className="h-8 w-8 text-white" />
                </div>
                <CardTitle className="text-xl mb-2">Legislation Tracker</CardTitle>
                <p className="text-muted-foreground">
                  Follow bills and legislative processes in real-time
                </p>
              </CardHeader>
              <CardContent className="text-center pt-0">
                <Link to="/legislation">
                  <Button variant="outline" className="group-hover:bg-purple-600 group-hover:text-white transition-colors duration-300">
                    Track Bills
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                </Link>
              </CardContent>
            </Card>

            <Card className="group hover:shadow-xl transition-all duration-300 hover:-translate-y-2">
              <CardHeader className="text-center">
                <div className="bg-amber-500 w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform duration-300">
                  <Scale className="h-8 w-8 text-white" />
                </div>
                <CardTitle className="text-xl mb-2">Judicial Transparency</CardTitle>
                <p className="text-muted-foreground">
                  Access judicial information and court proceedings
                </p>
              </CardHeader>
              <CardContent className="text-center pt-0">
                <Link to="/judiciary">
                  <Button variant="outline" className="group-hover:bg-amber-600 group-hover:text-white transition-colors duration-300">
                    View Courts
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                </Link>
              </CardContent>
            </Card>

            <Card className="group hover:shadow-xl transition-all duration-300 hover:-translate-y-2">
              <CardHeader className="text-center">
                <div className="bg-red-500 w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform duration-300">
                  <TrendingUp className="h-8 w-8 text-white" />
                </div>
                <CardTitle className="text-xl mb-2">Civic Analytics</CardTitle>
                <p className="text-muted-foreground">
                  Data-driven insights on governance and civic engagement
                </p>
              </CardHeader>
              <CardContent className="text-center pt-0">
                <Link to="/analytics">
                  <Button variant="outline" className="group-hover:bg-red-600 group-hover:text-white transition-colors duration-300">
                    View Analytics
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                </Link>
              </CardContent>
            </Card>

            <Card className="group hover:shadow-xl transition-all duration-300 hover:-translate-y-2">
              <CardHeader className="text-center">
                <div className="bg-cyan-500 w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform duration-300">
                  <Globe className="h-8 w-8 text-white" />
                </div>
                <CardTitle className="text-xl mb-2">Diaspora Connect</CardTitle>
                <p className="text-muted-foreground">
                  Connect the Cameroonian diaspora with homeland politics
                </p>
              </CardHeader>
              <CardContent className="text-center pt-0">
                <Link to="/diaspora-connect">
                  <Button variant="outline" className="group-hover:bg-cyan-600 group-hover:text-white transition-colors duration-300">
                    Connect Now
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                </Link>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Additional Services */}
      <section className="py-16 px-4 bg-muted/30">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">Additional Services</h2>
            <p className="text-lg text-muted-foreground">
              Comprehensive platform features for the Cameroonian community
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Link to="/tenders" className="block">
              <Card className="hover:shadow-lg transition-shadow">
                <CardContent className="p-6 text-center">
                  <Building className="h-8 w-8 mx-auto mb-3 text-primary" />
                  <h3 className="font-semibold mb-2">Tenders</h3>
                  <p className="text-sm text-muted-foreground">Government procurement opportunities</p>
                </CardContent>
              </Card>
            </Link>
            
            <Link to="/schools" className="block">
              <Card className="hover:shadow-lg transition-shadow">
                <CardContent className="p-6 text-center">
                  <Building className="h-8 w-8 mx-auto mb-3 text-primary" />
                  <h3 className="font-semibold mb-2">Schools</h3>
                  <p className="text-sm text-muted-foreground">Educational institutions directory</p>
                </CardContent>
              </Card>
            </Link>
            
            <Link to="/hospitals" className="block">
              <Card className="hover:shadow-lg transition-shadow">
                <CardContent className="p-6 text-center">
                  <Heart className="h-8 w-8 mx-auto mb-3 text-primary" />
                  <h3 className="font-semibold mb-2">Hospitals</h3>
                  <p className="text-sm text-muted-foreground">Healthcare facilities directory</p>
                </CardContent>
              </Card>
            </Link>
            
            <Link to="/jobs" className="block">
              <Card className="hover:shadow-lg transition-shadow">
                <CardContent className="p-6 text-center">
                  <Users className="h-8 w-8 mx-auto mb-3 text-primary" />
                  <h3 className="font-semibold mb-2">Jobs</h3>
                  <p className="text-sm text-muted-foreground">Employment opportunities</p>
                </CardContent>
              </Card>
            </Link>
          </div>
        </div>
      </section>

      {/* Call to Action */}
      <section className="py-20 px-4 bg-gradient-to-r from-primary to-primary/80">
        <div className="container mx-auto max-w-4xl text-center text-white">
          <h2 className="text-4xl md:text-5xl font-bold mb-6">
            Join the Democratic Movement
          </h2>
          <p className="text-xl mb-8 opacity-90">
            Be part of building a transparent, accountable, and participatory democracy in Cameroon.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button asChild size="lg" className="bg-white text-primary hover:bg-white/90">
              <Link to="/auth">
                <Users className="w-5 h-5 mr-2" />
                Join CamerPulse
              </Link>
            </Button>
            <Button asChild size="lg" variant="outline" className="border-white text-white hover:bg-white/10">
              <Link to="/polls">
                <Vote className="w-5 h-5 mr-2" />
                Start Participating
              </Link>
            </Button>
          </div>
        </div>
      </section>

      {/* CamerPulse Footer */}
      <footer className="bg-background border-t">
        <div className="container mx-auto px-4 py-12">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {/* Company Info */}
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg flex items-center justify-center">
                  <img src={camerPulseLogo} alt="CamerPulse" className="w-8 h-8 rounded-lg" />
                </div>
                <span className="text-xl font-bold">CamerPulse</span>
              </div>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Cameroon's premier civic engagement platform. Empowering citizens through 
                transparency, democracy, and community connection.
              </p>
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <MapPin className="h-4 w-4" />
                  <span>Yaoundé, Cameroon</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Phone className="h-4 w-4" />
                  <span>+237 6XX XXX XXX</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Mail className="h-4 w-4" />
                  <span>support@camerpulse.cm</span>
                </div>
              </div>
            </div>

            {/* Civic Features */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Civic Platform</h3>
              <nav className="space-y-2">
                <Link to="/polls" className="block text-sm text-muted-foreground hover:text-foreground transition-colors">
                  Polls & Voting
                </Link>
                <Link to="/politicians" className="block text-sm text-muted-foreground hover:text-foreground transition-colors">
                  Political Tracking
                </Link>
                <Link to="/legislation" className="block text-sm text-muted-foreground hover:text-foreground transition-colors">
                  Legislation Tracker
                </Link>
                <Link to="/judiciary" className="block text-sm text-muted-foreground hover:text-foreground transition-colors">
                  Judicial Transparency
                </Link>
                <Link to="/analytics" className="block text-sm text-muted-foreground hover:text-foreground transition-colors">
                  Civic Analytics
                </Link>
              </nav>
            </div>

            {/* Community Services */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Community Services</h3>
              <nav className="space-y-2">
                <Link to="/diaspora-connect" className="block text-sm text-muted-foreground hover:text-foreground transition-colors">
                  Diaspora Connect
                </Link>
                <Link to="/hospitals" className="block text-sm text-muted-foreground hover:text-foreground transition-colors">
                  Hospitals Directory
                </Link>
                <Link to="/schools" className="block text-sm text-muted-foreground hover:text-foreground transition-colors">
                  Schools Directory
                </Link>
                <Link to="/jobs" className="block text-sm text-muted-foreground hover:text-foreground transition-colors">
                  Job Opportunities
                </Link>
                <Link to="/tenders" className="block text-sm text-muted-foreground hover:text-foreground transition-colors">
                  Government Tenders
                </Link>
              </nav>
            </div>

            {/* Platform Info */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Platform</h3>
              <nav className="space-y-2">
                <Link to="/about" className="block text-sm text-muted-foreground hover:text-foreground transition-colors">
                  About CamerPulse
                </Link>
                <Link to="/privacy" className="block text-sm text-muted-foreground hover:text-foreground transition-colors">
                  Privacy Policy
                </Link>
                <Link to="/terms" className="block text-sm text-muted-foreground hover:text-foreground transition-colors">
                  Terms of Service
                </Link>
                <Link to="/support" className="block text-sm text-muted-foreground hover:text-foreground transition-colors">
                  Support Center
                </Link>
              </nav>
              
              {/* Quick Stats */}
              <div className="grid grid-cols-2 gap-4 pt-4">
                <div className="text-center p-3 bg-muted/50 rounded-md">
                  <div className="text-lg font-bold text-foreground">250K+</div>
                  <div className="text-xs text-muted-foreground">Citizens</div>
                </div>
                <div className="text-center p-3 bg-muted/50 rounded-md">
                  <div className="text-lg font-bold text-foreground">360+</div>
                  <div className="text-xs text-muted-foreground">Villages</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="border-t">
          <div className="container mx-auto px-4 py-6">
            <div className="flex flex-col md:flex-row items-center justify-between gap-4">
              <div className="flex items-center gap-4 text-sm text-muted-foreground">
                <span>© 2024 CamerPulse. All rights reserved.</span>
                <span className="flex items-center gap-1">
                  Made with <Heart className="h-3 w-3 text-red-500" /> in Cameroon
                </span>
              </div>
              
              <div className="flex items-center gap-2">
                <Button variant="ghost" size="sm" className="w-8 h-8 p-0">
                  <Facebook className="h-4 w-4" />
                </Button>
                <Button variant="ghost" size="sm" className="w-8 h-8 p-0">
                  <Twitter className="h-4 w-4" />
                </Button>
                <Button variant="ghost" size="sm" className="w-8 h-8 p-0">
                  <Linkedin className="h-4 w-4" />
                </Button>
                <Button variant="ghost" size="sm" className="w-8 h-8 p-0">
                  <Instagram className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default CamerPulseHome;