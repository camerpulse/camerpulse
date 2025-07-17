import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Music, Star, Calendar, DollarSign, Award, Users, Headphones, CreditCard } from "lucide-react";
import { Link } from "react-router-dom";

const benefits = [
  {
    icon: Music,
    title: "CamerPlay Music Platform",
    description: "Upload tracks, albums, and singles with professional distribution"
  },
  {
    icon: Star,
    title: "Artist ID Card",
    description: "Official verification with unique ID number and QR code"
  },
  {
    icon: Calendar,
    title: "Event Management",
    description: "Create and sell tickets for your concerts and shows"
  },
  {
    icon: DollarSign,
    title: "Album Store & Royalties",
    description: "Sell music directly and track earnings in real-time"
  },
  {
    icon: Award,
    title: "Award Nominations",
    description: "Eligible for CamerPulse music awards and recognition"
  },
  {
    icon: Users,
    title: "Brand Ambassador Program",
    description: "Access to exclusive brand partnerships and deals"
  },
  {
    icon: Headphones,
    title: "Streaming Analytics",
    description: "Detailed analytics and external platform tracking"
  },
  {
    icon: CreditCard,
    title: "Professional Tools",
    description: "Legal templates, contracts, and business resources"
  }
];

const ArtistLanding = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/30">
      <div className="container mx-auto px-4 py-16">
        {/* Hero Section */}
        <div className="text-center mb-16">
          <Badge variant="secondary" className="mb-4">
            Official CamerPulse Artist Program
          </Badge>
          <h1 className="text-5xl font-bold mb-6 bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
            Become a Verified Artist
          </h1>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto mb-8">
            Join Cameroon's premier music platform. Get your official Artist ID, access professional tools, 
            and unlock unlimited opportunities to grow your music career.
          </p>
          
          <div className="flex gap-4 justify-center">
            <Button asChild size="lg" className="px-8">
              <Link to="/artist-register">Start Registration</Link>
            </Button>
            <Button asChild variant="outline" size="lg">
              <Link to="/login">Already Registered? Log In</Link>
            </Button>
          </div>
        </div>

        {/* Artist ID Card Preview */}
        <div className="max-w-md mx-auto mb-16">
          <Card className="bg-gradient-to-br from-primary/10 to-accent/10 border-2 border-primary/20">
            <CardHeader className="text-center">
              <div className="w-20 h-20 rounded-full bg-muted mx-auto mb-4 flex items-center justify-center">
                <Music className="w-10 h-10 text-primary" />
              </div>
              <CardTitle>Sample Artist Name</CardTitle>
              <CardDescription>CPA-2024-123456</CardDescription>
            </CardHeader>
            <CardContent className="text-center">
              <Badge variant="secondary" className="mb-4">✓ Verified CamerPulse Artist</Badge>
              <div className="bg-muted/50 h-20 w-20 mx-auto rounded border-2 border-dashed border-muted-foreground/30 flex items-center justify-center">
                <span className="text-xs text-muted-foreground">QR Code</span>
              </div>
              <p className="text-sm text-muted-foreground mt-2">Valid Until: Dec 2025</p>
            </CardContent>
          </Card>
        </div>

        {/* Benefits Grid */}
        <div className="mb-16">
          <h2 className="text-3xl font-bold text-center mb-12">What You Get as a Verified Artist</h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {benefits.map((benefit, index) => (
              <Card key={index} className="text-center hover:shadow-lg transition-shadow">
                <CardHeader>
                  <benefit.icon className="w-12 h-12 text-primary mx-auto mb-4" />
                  <CardTitle className="text-lg">{benefit.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription>{benefit.description}</CardDescription>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Pricing */}
        <div className="text-center mb-16">
          <h2 className="text-3xl font-bold mb-8">Simple, One-Time Investment</h2>
          <Card className="max-w-md mx-auto">
            <CardHeader>
              <CardTitle className="text-2xl">Membership Fee</CardTitle>
              <CardDescription>One-time payment to unlock all features</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-4xl font-bold text-primary mb-4">25,000 FCFA</div>
              <p className="text-muted-foreground mb-6">
                Includes verification, ID card generation, and lifetime access to all artist features
              </p>
              <div className="text-sm text-muted-foreground">
                <p>✓ Mobile Money (MTN, Orange)</p>
                <p>✓ Credit/Debit Cards</p>
                <p>✓ PayPal & Crypto accepted</p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Process Steps */}
        <div className="mb-16">
          <h2 className="text-3xl font-bold text-center mb-12">How It Works</h2>
          <div className="grid md:grid-cols-4 gap-8">
            {[
              { step: "1", title: "Register", desc: "Fill out your artist application with details and documents" },
              { step: "2", title: "Pay Fee", desc: "Complete one-time membership payment securely" },
              { step: "3", title: "Verification", desc: "Our team reviews and verifies your application" },
              { step: "4", title: "Get ID & Access", desc: "Receive your Artist ID and unlock all features" }
            ].map((item, index) => (
              <div key={index} className="text-center">
                <div className="w-16 h-16 rounded-full bg-primary text-primary-foreground font-bold text-xl flex items-center justify-center mx-auto mb-4">
                  {item.step}
                </div>
                <h3 className="text-xl font-semibold mb-2">{item.title}</h3>
                <p className="text-muted-foreground">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>

        {/* CTA */}
        <div className="text-center">
          <h2 className="text-3xl font-bold mb-4">Ready to Start Your Music Journey?</h2>
          <p className="text-xl text-muted-foreground mb-8">
            Join hundreds of verified Cameroonian artists on CamerPulse
          </p>
          <Button asChild size="lg" className="px-12">
            <Link to="/artist-register">Register Now</Link>
          </Button>
        </div>
      </div>
    </div>
  );
};

export default ArtistLanding;