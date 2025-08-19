import React from 'react';
import { AppLayout } from "@/components/Layout/AppLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Helmet } from 'react-helmet-async';
import { 
  Shield, 
  Users, 
  Target, 
  Eye, 
  Heart, 
  Globe, 
  Lightbulb, 
  Flag, 
  CheckCircle, 
  BarChart3,
  MessageCircle,
  Award,
  TrendingUp,
  Search,
  Scale,
  Star,
  Zap
} from "lucide-react";

const AboutUs = () => {
  const coreValues = [
    {
      title: "Integrity",
      description: "We uphold the highest standards of honesty and ethical conduct in all our operations.",
      icon: Shield,
      color: "from-primary to-primary-glow"
    },
    {
      title: "Unity",
      description: "We believe in bringing together all Cameroonians for our collective progress and development.",
      icon: Users,
      color: "from-secondary to-accent"
    },
    {
      title: "Innovation",
      description: "We leverage cutting-edge technology to solve complex civic challenges and improve governance.",
      icon: Lightbulb,
      color: "from-accent to-accent"
    },
    {
      title: "Patriotism",
      description: "Our love for Cameroon drives everything we do, always putting national interest first.",
      icon: Flag,
      color: "from-cm-red to-red-600"
    },
    {
      title: "Transparency",
      description: "We promote openness and clarity in all government operations and public institutions.",
      icon: Eye,
      color: "from-primary to-secondary"
    },
    {
      title: "Accountability",
      description: "We believe that every public servant must answer to the people they serve.",
      icon: Scale,
      color: "from-secondary to-primary"
    }
  ];

  const features = [
    {
      title: "Sentiment Monitoring",
      description: "Real-time analysis of public opinion and citizen feedback on government initiatives.",
      icon: MessageCircle
    },
    {
      title: "Officials Directory",
      description: "Comprehensive database of elected and appointed officials with performance tracking.",
      icon: Users
    },
    {
      title: "Corruption Index",
      description: "Data-driven transparency metrics to identify and address corruption risks.",
      icon: BarChart3
    },
    {
      title: "Company & Economy Tracker",
      description: "Monitor economic indicators and track business performance across sectors.",
      icon: TrendingUp
    },
    {
      title: "Citizen Engagement Tools",
      description: "Platforms for polls, petitions, and direct communication with representatives.",
      icon: Target
    },
    {
      title: "Research & Analytics",
      description: "Advanced data insights for media, researchers, and policy makers.",
      icon: Search
    }
  ];

  const whyMatters = [
    {
      title: "Protecting Government Image",
      description: "By identifying and addressing bad actors, we help maintain the integrity of our institutions.",
      icon: Shield
    },
    {
      title: "Empowering Citizens",
      description: "Providing tools and information that enable informed civic participation and decision-making.",
      icon: Users
    },
    {
      title: "Supporting Media & Researchers",
      description: "Offering verified data and insights for accurate reporting and academic research.",
      icon: Award
    },
    {
      title: "Guiding Policy Makers",
      description: "Delivering actionable intelligence to support evidence-based policy development.",
      icon: Target
    }
  ];

  return (
    <>
      <Helmet>
        <title>About Us - CamerPulse | Civic Intelligence Platform</title>
        <meta 
          name="description" 
          content="Learn about CamerPulse - AI-powered civic intelligence platform supporting transparency, accountability, and public trust in Cameroon. We help government and citizens collaborate for a better future." 
        />
        <meta name="keywords" content="CamerPulse about, civic platform Cameroon, government transparency, public accountability, civic intelligence" />
        <meta property="og:title" content="About CamerPulse - Civic Intelligence Platform" />
        <meta property="og:description" content="Discover how CamerPulse supports transparency and accountability in Cameroon through AI-powered civic intelligence." />
        <link rel="canonical" href="https://camerpulse.com/about" />
      </Helmet>

      <AppLayout>
        {/* Hero Section */}
        <section className="py-20 bg-gradient-to-br from-primary/10 via-secondary/5 to-accent/10">
          <div className="container mx-auto px-4 text-center">
            <div className="max-w-4xl mx-auto">
              <h1 className="text-4xl lg:text-6xl font-bold mb-8 bg-gradient-to-r from-primary via-secondary to-accent bg-clip-text text-transparent">
                About CamerPulse
              </h1>
              <div className="bg-card/80 backdrop-blur-sm rounded-2xl p-8 shadow-xl border border-primary/20">
                <p className="text-xl lg:text-2xl text-foreground leading-relaxed font-medium">
                  We are not fighting the government — rather, we are helping the government uproot bad actors who give our institutions a bad name. People elected or appointed to public office owe good performance and behavior to the masses.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* About CamerPulse Section */}
        <section className="py-20 bg-background">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto">
              <Card className="border-primary/20 shadow-xl">
                <CardHeader className="text-center pb-8">
                  <div className="w-20 h-20 bg-gradient-to-r from-primary to-primary-glow rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg">
                    <Globe className="w-10 h-10 text-white" />
                  </div>
                  <CardTitle className="text-3xl lg:text-4xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
                    About CamerPulse
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6 text-lg leading-relaxed">
                  <p className="text-muted-foreground">
                    CamerPulse is Cameroon's premier AI-powered civic intelligence and monitoring platform, designed to strengthen the bonds between government and citizens through transparency, accountability, and trust.
                  </p>
                  <p className="text-muted-foreground">
                    Our platform serves as a bridge, connecting the aspirations of the Cameroonian people with the dedication of public servants who work tirelessly for our nation's progress. We believe that when citizens are informed and government is transparent, Cameroon becomes stronger.
                  </p>
                  <p className="text-muted-foreground">
                    Through cutting-edge technology and data-driven insights, CamerPulse provides real-time civic intelligence that helps identify excellence, address challenges, and promote the values that make Cameroon great.
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>

        {/* Mission & Vision */}
        <section className="py-20 bg-gradient-to-br from-secondary/5 to-accent/5">
          <div className="container mx-auto px-4">
            <div className="grid md:grid-cols-2 gap-8 max-w-6xl mx-auto">
              <Card className="border-secondary/20 shadow-xl">
                <CardHeader className="text-center">
                  <div className="w-16 h-16 bg-gradient-to-r from-secondary to-accent rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg">
                    <Target className="w-8 h-8 text-white" />
                  </div>
                  <CardTitle className="text-2xl lg:text-3xl font-bold text-secondary">Our Mission</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground text-lg leading-relaxed">
                    To provide real-time civic intelligence that enhances transparency, promotes democratic accountability, and strengthens public trust in Cameroon's institutions through innovative technology and collaborative engagement.
                  </p>
                </CardContent>
              </Card>

              <Card className="border-accent/20 shadow-xl">
                <CardHeader className="text-center">
                  <div className="w-16 h-16 bg-gradient-to-r from-accent to-primary rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg">
                    <Eye className="w-8 h-8 text-white" />
                  </div>
                  <CardTitle className="text-2xl lg:text-3xl font-bold text-accent">Our Vision</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground text-lg leading-relaxed">
                    A One and Indivisible Cameroon where government and citizens work hand in hand, fostering mutual trust, national unity, and shared prosperity through transparency and collaborative governance.
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>

        {/* What We Do */}
        <section className="py-20 bg-background">
          <div className="container mx-auto px-4">
            <div className="text-center mb-16">
              <h2 className="text-4xl lg:text-5xl font-bold mb-6 bg-gradient-to-r from-primary via-secondary to-accent bg-clip-text text-transparent">
                What We Do
              </h2>
              <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
                Our comprehensive suite of tools and services supports both government efficiency and citizen engagement
              </p>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {features.map((feature, index) => (
                <Card key={index} className="border-primary/20 hover:shadow-xl transition-all duration-300 hover:scale-105">
                  <CardHeader className="text-center">
                    <div className="w-14 h-14 bg-gradient-to-r from-primary to-primary-glow rounded-xl flex items-center justify-center mx-auto mb-4 shadow-lg">
                      <feature.icon className="w-7 h-7 text-white" />
                    </div>
                    <CardTitle className="text-xl font-bold text-primary">{feature.title}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-muted-foreground text-center">{feature.description}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* Why CamerPulse Matters */}
        <section className="py-20 bg-gradient-to-br from-primary/5 to-secondary/5">
          <div className="container mx-auto px-4">
            <div className="text-center mb-16">
              <h2 className="text-4xl lg:text-5xl font-bold mb-6 bg-gradient-to-r from-primary via-secondary to-accent bg-clip-text text-transparent">
                Why CamerPulse Matters
              </h2>
              <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
                Our platform serves multiple stakeholders in building a stronger, more transparent Cameroon
              </p>
            </div>

            <div className="grid md:grid-cols-2 gap-8 max-w-5xl mx-auto">
              {whyMatters.map((item, index) => (
                <Card key={index} className="border-secondary/20 shadow-xl hover:shadow-2xl transition-all duration-300">
                  <CardHeader>
                    <div className="flex items-center space-x-4">
                      <div className="w-12 h-12 bg-gradient-to-r from-secondary to-accent rounded-xl flex items-center justify-center shadow-lg">
                        <item.icon className="w-6 h-6 text-white" />
                      </div>
                      <CardTitle className="text-xl font-bold text-secondary">{item.title}</CardTitle>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-muted-foreground leading-relaxed">{item.description}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* Core Values */}
        <section className="py-20 bg-background">
          <div className="container mx-auto px-4">
            <div className="text-center mb-16">
              <h2 className="text-4xl lg:text-5xl font-bold mb-6 bg-gradient-to-r from-primary via-secondary to-accent bg-clip-text text-transparent">
                Our Core Values
              </h2>
              <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
                The principles that guide our mission and shape our commitment to Cameroon
              </p>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {coreValues.map((value, index) => (
                <Card key={index} className="border-primary/20 hover:shadow-xl transition-all duration-300 group">
                  <CardHeader className="text-center">
                    <div className={`w-16 h-16 bg-gradient-to-r ${value.color} rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg group-hover:scale-110 transition-transform duration-300`}>
                      <value.icon className="w-8 h-8 text-white" />
                    </div>
                    <CardTitle className="text-xl font-bold text-primary">{value.title}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-muted-foreground text-center leading-relaxed">{value.description}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* Core Belief */}
        <section className="py-20 bg-gradient-to-br from-accent/5 via-primary/5 to-secondary/5">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto text-center">
              <Card className="border-accent/20 shadow-2xl bg-card/80 backdrop-blur-sm">
                <CardHeader className="pb-8">
                  <div className="w-20 h-20 bg-gradient-to-r from-accent via-primary to-secondary rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-xl">
                    <Heart className="w-10 h-10 text-white" />
                  </div>
                  <CardTitle className="text-3xl lg:text-4xl font-bold bg-gradient-to-r from-accent via-primary to-secondary bg-clip-text text-transparent">
                    Our Core Belief
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <p className="text-xl lg:text-2xl text-foreground leading-relaxed font-medium">
                    Accountability is not opposition — it is true patriotism.
                  </p>
                  <p className="text-lg text-muted-foreground leading-relaxed">
                    We believe that holding public servants accountable for their actions and performance is not an act of rebellion, but rather the highest form of love for our country. When we demand excellence from our leaders, we strengthen our institutions and secure a better future for all Cameroonians.
                  </p>
                  <div className="flex justify-center pt-4">
                    <Badge variant="secondary" className="px-6 py-2 text-lg font-semibold">
                      <Star className="w-5 h-5 mr-2" />
                      Unity Through Accountability
                    </Badge>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>

        {/* Call to Action */}
        <section className="py-20 bg-gradient-to-r from-primary via-secondary to-accent">
          <div className="container mx-auto px-4 text-center">
            <div className="max-w-3xl mx-auto">
              <h2 className="text-4xl lg:text-5xl font-bold mb-6 text-white">
                Join Us in Building a Better Cameroon
              </h2>
              <p className="text-xl text-white/90 mb-8 leading-relaxed">
                Together, we can create a transparent, accountable, and prosperous nation that serves all Cameroonians with dignity and excellence.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Badge variant="secondary" className="px-8 py-3 text-lg font-semibold bg-white/20 text-white border-white/30">
                  <Zap className="w-5 h-5 mr-2" />
                  Powered by AI Intelligence
                </Badge>
                <Badge variant="secondary" className="px-8 py-3 text-lg font-semibold bg-white/20 text-white border-white/30">
                  <CheckCircle className="w-5 h-5 mr-2" />
                  Verified & Trusted
                </Badge>
              </div>
            </div>
          </div>
        </section>
      </AppLayout>
    </>
  );
};

export default AboutUs;