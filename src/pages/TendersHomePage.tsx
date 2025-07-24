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

const TendersHomePage: React.FC = () => {
  const features = [
    {
      title: "Browse Tenders",
      description: "Explore thousands of government procurement opportunities across Cameroon.",
      icon: Search,
      href: "/tenders/list",
      color: "bg-blue-500"
    },
    {
      title: "Submit Bids",
      description: "Submit competitive bids with our streamlined digital platform.",
      icon: FileText,
      href: "/auth",
      color: "bg-green-500"
    },
    {
      title: "Track Performance",
      description: "Monitor your bidding success rate and business growth metrics.",
      icon: TrendingUp,
      href: "/dashboard",
      color: "bg-purple-500"
    },
    {
      title: "Company Verification",
      description: "Get verified status to increase your credibility and bid success rate.",
      icon: Shield,
      href: "/verification",
      color: "bg-orange-500"
    }
  ];

  const stats = [
    { icon: FileText, value: "2,450+", label: "Active Tenders" },
    { icon: Users, value: "15,000+", label: "Registered Bidders" },
    { icon: Building2, value: "850+", label: "Government Agencies" },
    { icon: Award, value: "₦45B+", label: "Total Contract Value" }
  ];

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-blue-900 via-blue-800 to-blue-600 text-white py-20 px-4">
        <div className="container mx-auto max-w-6xl text-center">
          <Badge className="mb-6 bg-white/20 text-white border-white/30">
            🏛️ CamerTenders - Government Procurement Platform
          </Badge>
          
          <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold mb-6 leading-tight">
            Cameroon's Premier<br />
            <span className="bg-gradient-to-r from-yellow-300 to-orange-300 bg-clip-text text-transparent">
              Tender Platform
            </span>
          </h1>
          
          <p className="text-xl md:text-2xl mb-8 text-blue-100 max-w-3xl mx-auto">
            Connect with government opportunities, submit competitive bids, and grow your business with transparent, digital procurement processes.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center max-w-lg mx-auto">
            <Link to="/tenders/list" className="w-full sm:w-auto">
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
              Our comprehensive platform provides all the tools and resources you need to succeed in government procurement.
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => (
              <Card key={index} className="group hover:shadow-xl transition-all duration-300 hover:-translate-y-2">
                <CardHeader className="text-center">
                  <div className={`${feature.color} w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform duration-300`}>
                    <feature.icon className="h-8 w-8 text-white" />
                  </div>
                  <CardTitle className="text-xl mb-2">{feature.title}</CardTitle>
                  <CardDescription className="text-gray-600">
                    {feature.description}
                  </CardDescription>
                </CardHeader>
                <CardContent className="text-center pt-0">
                  <Link to={feature.href}>
                    <Button variant="outline" className="group-hover:bg-blue-600 group-hover:text-white transition-colors duration-300">
                      Get Started
                      <ArrowRight className="w-4 h-4 ml-2" />
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Trust & Security Section */}
      <section className="py-20 px-4 bg-gray-900 text-white">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold mb-6">
              Built for Trust & Transparency
            </h2>
            <p className="text-xl text-gray-300 max-w-3xl mx-auto">
              Our platform ensures fair, transparent, and secure tender processes for all stakeholders.
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="bg-green-600 w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-6">
                <Shield className="h-8 w-8 text-white" />
              </div>
              <h3 className="text-2xl font-bold mb-4">Secure Platform</h3>
              <p className="text-gray-300">
                Bank-level security ensures all your data and transactions are protected with advanced encryption.
              </p>
            </div>
            
            <div className="text-center">
              <div className="bg-blue-600 w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-6">
                <Eye className="h-8 w-8 text-white" />
              </div>
              <h3 className="text-2xl font-bold mb-4">Full Transparency</h3>
              <p className="text-gray-300">
                Complete visibility into tender processes, evaluation criteria, and award decisions.
              </p>
            </div>
            
            <div className="text-center">
              <div className="bg-purple-600 w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-6">
                <Clock className="h-8 w-8 text-white" />
              </div>
              <h3 className="text-2xl font-bold mb-4">Real-time Updates</h3>
              <p className="text-gray-300">
                Get instant notifications about new tenders, bid updates, and important announcements.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Call to Action */}
      <section className="py-20 px-4 bg-gradient-to-r from-blue-600 to-purple-600">
        <div className="container mx-auto max-w-4xl text-center text-white">
          <h2 className="text-4xl md:text-5xl font-bold mb-6">
            Ready to Start Bidding?
          </h2>
          <p className="text-xl mb-8 opacity-90">
            Join thousands of successful businesses already using CamerTenders to grow their operations.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/auth">
              <Button size="lg" className="bg-white text-blue-600 hover:bg-gray-100">
                <Users className="w-5 h-5 mr-2" />
                Create Account
              </Button>
            </Link>
            <Link to="/tenders/list">
              <Button size="lg" variant="outline" className="text-white border-white hover:bg-white/10">
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

export default TendersHomePage;