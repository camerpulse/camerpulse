import React from 'react';
import { Link } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  FileText, 
  TrendingUp, 
  Users, 
  Building2, 
  Award, 
  Search,
  ArrowRight,
  Shield,
  Eye,
  DollarSign,
  Clock
} from 'lucide-react';

const CamerTendersHome: React.FC = () => {
  const features = [
    {
      title: "Browse Tenders",
      description: "Explore thousands of government procurement opportunities across Cameroon.",
      icon: Search,
      href: "/tenders",
      color: "bg-blue-500"
    },
    {
      title: "Submit Bids",
      description: "Participate in transparent bidding processes with secure document submission.",
      icon: FileText,
      href: "/tenders/create",
      color: "bg-green-500"
    },
    {
      title: "Track Applications",
      description: "Monitor your bid status and receive real-time updates on tender progress.",
      icon: Clock,
      href: "/my-bids",
      color: "bg-purple-500"
    },
    {
      title: "Analytics Dashboard",
      description: "Access insights and analytics to improve your bidding success rate.",
      icon: TrendingUp,
      href: "/analytics",
      color: "bg-orange-500"
    }
  ];

  const stats = [
    { label: "Active Tenders", value: "2,500+", icon: FileText },
    { label: "Registered Bidders", value: "15,000+", icon: Users },
    { label: "Total Value", value: "₦85B+", icon: DollarSign },
    { label: "Successful Bids", value: "8,200+", icon: Award }
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <section className="relative py-20 px-4 text-center bg-gradient-to-br from-blue-600 to-blue-800 text-white overflow-hidden">
        <div className="absolute inset-0 bg-black/10" />
        <div className="relative z-10 container mx-auto max-w-6xl">
          <Badge className="mb-6 bg-white/20 text-white border-white/30" variant="outline">
            🏛️ Transparent Public Procurement
          </Badge>
          
          <h1 className="text-4xl md:text-7xl font-bold mb-8 leading-tight">
            CamerTenders
            <span className="block text-blue-200">
              Platform
            </span>
          </h1>
          
          <p className="text-xl md:text-2xl mb-12 text-blue-100 max-w-4xl mx-auto leading-relaxed">
            Your gateway to government procurement opportunities in Cameroon. 
            Transparent, efficient, and accessible tender management for all.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center max-w-lg mx-auto">
            <Link to="/tenders" className="w-full sm:w-auto">
              <Button size="lg" className="w-full bg-white text-blue-800 hover:bg-blue-50">
                <Search className="w-5 h-5 mr-2" />
                Browse Tenders
              </Button>
            </Link>
            <Link to="/auth" className="w-full sm:w-auto">
              <Button size="lg" variant="outline" className="w-full text-white border-white/30 hover:bg-white/10">
                <Users className="w-5 h-5 mr-2" />
                Register to Bid
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 px-4 bg-gray-50">
        <div className="container mx-auto max-w-6xl">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
            {stats.map((stat, index) => (
              <Card key={index} className="text-center hover:shadow-lg transition-all duration-300">
                <CardContent className="p-6">
                  <stat.icon className="h-8 w-8 mx-auto mb-3 text-blue-600" />
                  <div className="text-3xl font-bold text-gray-900 mb-1">{stat.value}</div>
                  <div className="text-sm text-gray-600">{stat.label}</div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 px-4">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold mb-6 text-gray-900">
              Everything You Need for Tendering
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              From discovering opportunities to submitting winning bids, 
              our platform streamlines the entire procurement process.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {features.map((feature, index) => (
              <Link key={index} to={feature.href} className="group">
                <Card className="h-full hover:shadow-xl transition-all duration-300 group-hover:-translate-y-2">
                  <CardHeader className="pb-4">
                    <div className={`w-16 h-16 rounded-xl ${feature.color} flex items-center justify-center mb-4 shadow-lg`}>
                      <feature.icon className="h-8 w-8 text-white" />
                    </div>
                    <CardTitle className="text-2xl">{feature.title}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <CardDescription className="text-base leading-relaxed mb-4">
                      {feature.description}
                    </CardDescription>
                    <Button variant="ghost" className="p-0 h-auto group-hover:text-blue-600">
                      Get Started <ArrowRight className="h-4 w-4 ml-1 group-hover:translate-x-1 transition-transform" />
                    </Button>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Values Section */}
      <section className="py-20 px-4 bg-gray-50">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-6 text-gray-900">
              Why Choose CamerTenders?
            </h2>
            <p className="text-lg text-gray-600">
              Built on principles of transparency, efficiency, and fairness
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <Card className="text-center">
              <CardContent className="p-8">
                <Shield className="h-12 w-12 mx-auto mb-4 text-blue-600" />
                <h3 className="text-xl font-semibold mb-3">Secure & Trusted</h3>
                <p className="text-gray-600">
                  Bank-level security with encrypted document submission and verified user profiles.
                </p>
              </CardContent>
            </Card>
            
            <Card className="text-center">
              <CardContent className="p-8">
                <Eye className="h-12 w-12 mx-auto mb-4 text-green-600" />
                <h3 className="text-xl font-semibold mb-3">Fully Transparent</h3>
                <p className="text-gray-600">
                  Open bidding process with public tender information and fair evaluation criteria.
                </p>
              </CardContent>
            </Card>
            
            <Card className="text-center">
              <CardContent className="p-8">
                <Building2 className="h-12 w-12 mx-auto mb-4 text-purple-600" />
                <h3 className="text-xl font-semibold mb-3">Government Backed</h3>
                <p className="text-gray-600">
                  Official platform endorsed by government agencies for legitimate procurement.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4 bg-gradient-to-r from-blue-600 to-blue-800 text-white">
        <div className="container mx-auto max-w-4xl text-center">
          <h2 className="text-4xl font-bold mb-6">
            Ready to Start Bidding?
          </h2>
          <p className="text-xl mb-8 text-blue-100">
            Join thousands of businesses already participating in transparent government procurement.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/auth">
              <Button size="lg" className="min-w-[200px] bg-white text-blue-800 hover:bg-blue-50">
                <Users className="w-5 h-5 mr-2" />
                Create Account
              </Button>
            </Link>
            <Link to="/tenders">
              <Button size="lg" variant="outline" className="min-w-[200px] text-white border-white/30 hover:bg-white/10">
                <Search className="w-5 h-5 mr-2" />
                Browse Tenders
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};

export default CamerTendersHome;