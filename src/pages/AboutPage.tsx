import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Link } from 'react-router-dom';
import {
  Users,
  MapPin,
  Building2,
  TrendingUp,
  Heart,
  Star,
  Award,
  Shield,
  Vote,
  FileText,
  ArrowRight,
  Globe,
  Zap,
  Eye,
  Target,
  Lightbulb,
  Handshake,
  Calendar,
  CheckCircle
} from 'lucide-react';

const AboutPage: React.FC = () => {
  const milestones = [
    {
      year: '2023',
      title: 'CamerPulse Founded',
      description: 'Platform launched to connect Cameroonian citizens with their governance and heritage.'
    },
    {
      year: '2023',
      title: 'Villages Directory',
      description: 'First comprehensive digital registry of Cameroonian villages goes live.'
    },
    {
      year: '2024',
      title: 'Civic Reputation System',
      description: 'Revolutionary leader rating and accountability system introduced.'
    },
    {
      year: '2024',
      title: 'Jobs & Tenders Integration',
      description: 'Economic empowerment features added to support professional growth.'
    }
  ];

  const team = [
    {
      name: 'Dr. Aminata Nkomo',
      role: 'CEO & Founder',
      description: 'Former UN governance advisor with 15 years experience in African digital democracy.',
      image: '/api/placeholder/150/150'
    },
    {
      name: 'Jean-Baptiste Fouda',
      role: 'CTO',
      description: 'Tech entrepreneur with expertise in scalable civic technology platforms.',
      image: '/api/placeholder/150/150'
    },
    {
      name: 'Marie-Claire Biya',
      role: 'Head of Community',
      description: 'Community organizer focused on village digitalization and cultural preservation.',
      image: '/api/placeholder/150/150'
    },
    {
      name: 'Paul Atangana',
      role: 'Head of Partnerships',
      description: 'Government relations expert facilitating transparency initiatives.',
      image: '/api/placeholder/150/150'
    }
  ];

  const values = [
    {
      icon: Shield,
      title: 'Transparency',
      description: 'We believe in open governance and accessible public information for all citizens.'
    },
    {
      icon: Users,
      title: 'Community First',
      description: 'Every feature is designed to strengthen community bonds and civic participation.'
    },
    {
      icon: Heart,
      title: 'Cultural Heritage',
      description: 'Preserving and celebrating the rich diversity of Cameroonian villages and traditions.'
    },
    {
      icon: Target,
      title: 'Accountability',
      description: 'Empowering citizens to hold leaders accountable through data-driven insights.'
    },
    {
      icon: Lightbulb,
      title: 'Innovation',
      description: 'Leveraging technology to solve real problems facing Cameroonian communities.'
    },
    {
      icon: Handshake,
      title: 'Collaboration',
      description: 'Building bridges between citizens, government, and civil society organizations.'
    }
  ];

  const impact = [
    { metric: '250,000+', label: 'Active Citizens', icon: Users },
    { metric: '15,000+', label: 'Villages Mapped', icon: MapPin },
    { metric: '5,200+', label: 'Institutions Rated', icon: Building2 },
    { metric: '1.8M+', label: 'Civic Actions', icon: Vote }
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <section className="py-20 px-4 text-center bg-gradient-patriotic text-white">
        <div className="absolute inset-0 bg-black/20" />
        <div className="relative z-10 container mx-auto max-w-4xl">
          <Badge className="mb-6 bg-white/20 text-white border-white/30" variant="outline">
            🇨🇲 About CamerPulse
          </Badge>
          
          <h1 className="text-4xl md:text-6xl font-bold mb-6">
            Empowering Cameroon Through 
            <span className="block">Digital Democracy</span>
          </h1>
          
          <p className="text-xl mb-8 opacity-90 max-w-3xl mx-auto">
            CamerPulse is more than a platform—it's a movement to strengthen democracy, 
            preserve heritage, and create economic opportunities for every Cameroonian.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/villages">
              <Button size="lg" variant="secondary">
                <Heart className="w-5 h-5 mr-2" />
                Explore Villages
              </Button>
            </Link>
            <Link to="/civic-reputation">
              <Button size="lg" className="bg-white/10 hover:bg-white/20 text-white border-white/30">
                <Vote className="w-5 h-5 mr-2" />
                Rate Leaders
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Mission & Vision */}
      <section className="py-20 px-4">
        <div className="container mx-auto max-w-6xl">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            <Card className="border-2 border-primary/20">
              <CardHeader>
                <Target className="h-12 w-12 text-primary mb-4" />
                <CardTitle className="text-3xl">Our Mission</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-lg text-muted-foreground leading-relaxed">
                  To strengthen Cameroon's democracy by connecting citizens to their roots, 
                  empowering civic participation, and creating transparency in governance. 
                  We believe every village has value, every voice matters, and every citizen 
                  deserves access to opportunities and accountable leadership.
                </p>
              </CardContent>
            </Card>

            <Card className="border-2 border-secondary/20">
              <CardHeader>
                <Eye className="h-12 w-12 text-secondary mb-4" />
                <CardTitle className="text-3xl">Our Vision</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-lg text-muted-foreground leading-relaxed">
                  A Cameroon where technology serves humanity, where cultural heritage thrives 
                  alongside progress, and where every citizen—from the smallest village to the 
                  largest city—has the tools and voice to shape their future and hold leaders 
                  accountable.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Impact Stats */}
      <section className="py-16 px-4 bg-muted/30">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold mb-4">Our Impact</h2>
            <p className="text-xl text-muted-foreground">
              Real numbers showing the power of civic engagement
            </p>
          </div>
          
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
            {impact.map((stat, index) => (
              <Card key={index} className="text-center hover:shadow-lg transition-shadow">
                <CardContent className="p-6">
                  <stat.icon className="h-12 w-12 mx-auto mb-4 text-primary" />
                  <div className="text-4xl font-bold text-foreground mb-2">{stat.metric}</div>
                  <div className="text-muted-foreground">{stat.label}</div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Values */}
      <section className="py-20 px-4">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-6">Our Values</h2>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              The principles that guide everything we do at CamerPulse
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {values.map((value, index) => (
              <Card key={index} className="text-center hover:shadow-lg transition-all hover:-translate-y-1">
                <CardHeader>
                  <value.icon className="h-12 w-12 mx-auto mb-4 text-primary" />
                  <CardTitle className="text-xl">{value.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">{value.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Timeline */}
      <section className="py-20 px-4 bg-muted/30">
        <div className="container mx-auto max-w-4xl">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-6">Our Journey</h2>
            <p className="text-xl text-muted-foreground">
              Key milestones in building Cameroon's digital democracy platform
            </p>
          </div>

          <div className="space-y-8">
            {milestones.map((milestone, index) => (
              <Card key={index} className="relative">
                <CardContent className="p-6">
                  <div className="flex items-start gap-4">
                    <div className="flex-shrink-0">
                      <div className="w-12 h-12 bg-primary rounded-full flex items-center justify-center text-primary-foreground font-bold">
                        {milestone.year}
                      </div>
                    </div>
                    <div>
                      <h3 className="text-xl font-semibold mb-2">{milestone.title}</h3>
                      <p className="text-muted-foreground">{milestone.description}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Team */}
      <section className="py-20 px-4">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-6">Meet Our Team</h2>
            <p className="text-xl text-muted-foreground">
              Passionate Cameroonians building the future of civic engagement
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {team.map((member, index) => (
              <Card key={index} className="text-center hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="w-24 h-24 mx-auto mb-4 bg-muted rounded-full flex items-center justify-center">
                    <Users className="h-12 w-12 text-muted-foreground" />
                  </div>
                  <CardTitle className="text-lg">{member.name}</CardTitle>
                  <CardDescription className="text-primary font-medium">
                    {member.role}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">{member.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Call to Action */}
      <section className="py-20 px-4 bg-gradient-to-r from-primary to-primary-glow text-primary-foreground">
        <div className="container mx-auto max-w-4xl text-center">
          <h2 className="text-4xl font-bold mb-6">
            Ready to Join the Movement?
          </h2>
          <p className="text-xl mb-8 opacity-90">
            Be part of building a more transparent, participatory, and accountable Cameroon.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/auth">
              <Button size="lg" variant="secondary">
                <Users className="w-5 h-5 mr-2" />
                Join CamerPulse
              </Button>
            </Link>
            <Link to="/villages">
              <Button size="lg" className="bg-white/10 hover:bg-white/20 text-white border-white/30">
                <Heart className="w-5 h-5 mr-2" />
                Find Your Village
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};

export default AboutPage;