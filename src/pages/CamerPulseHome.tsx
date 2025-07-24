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
            
            <Link to="/camerplay" className="block">
              <Card className="hover:shadow-lg transition-shadow">
                <CardContent className="p-6 text-center">
                  <Heart className="h-8 w-8 mx-auto mb-3 text-primary" />
                  <h3 className="font-semibold mb-2">CamerPlay</h3>
                  <p className="text-sm text-muted-foreground">Music streaming & artist platform</p>
                </CardContent>
              </Card>
            </Link>
            
            <Link to="/economics" className="block">
              <Card className="hover:shadow-lg transition-shadow">
                <CardContent className="p-6 text-center">
                  <TrendingUp className="h-8 w-8 mx-auto mb-3 text-primary" />
                  <h3 className="font-semibold mb-2">Economics</h3>
                  <p className="text-sm text-muted-foreground">Economic analysis & business insights</p>
                </CardContent>
              </Card>
            </Link>
            
            <Link to="/villages" className="block">
              <Card className="hover:shadow-lg transition-shadow">
                <CardContent className="p-6 text-center">
                  <MapPin className="h-8 w-8 mx-auto mb-3 text-primary" />
                  <h3 className="font-semibold mb-2">Villages</h3>
                  <p className="text-sm text-muted-foreground">Comprehensive village registry</p>
                </CardContent>
              </Card>
            </Link>
            
            <Link to="/pulse-messenger" className="block">
              <Card className="hover:shadow-lg transition-shadow">
                <CardContent className="p-6 text-center">
                  <MessageCircle className="h-8 w-8 mx-auto mb-3 text-primary" />
                  <h3 className="font-semibold mb-2">Pulse Messenger</h3>
                  <p className="text-sm text-muted-foreground">Secure civic communication</p>
                </CardContent>
              </Card>
            </Link>
            
            <Link to="/ratings" className="block">
              <Card className="hover:shadow-lg transition-shadow">
                <CardContent className="p-6 text-center">
                  <Shield className="h-8 w-8 mx-auto mb-3 text-primary" />
                  <h3 className="font-semibold mb-2">Rating System</h3>
                  <p className="text-sm text-muted-foreground">Civic credibility & reviews</p>
                </CardContent>
              </Card>
            </Link>
            
            <Link to="/user/profile" className="block">
              <Card className="hover:shadow-lg transition-shadow">
                <CardContent className="p-6 text-center">
                  <Users className="h-8 w-8 mx-auto mb-3 text-primary" />
                  <h3 className="font-semibold mb-2">User Profiles</h3>
                  <p className="text-sm text-muted-foreground">Advanced social profiles & networking</p>
                </CardContent>
              </Card>
            </Link>
            
            <Link to="/laws" className="block">
              <Card className="hover:shadow-lg transition-shadow">
                <CardContent className="p-6 text-center">
                  <Scale className="h-8 w-8 mx-auto mb-3 text-primary" />
                  <h3 className="font-semibold mb-2">Civic Education</h3>
                  <p className="text-sm text-muted-foreground">Constitution & rights learning</p>
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

    </div>
  );
};

export default CamerPulseHome;