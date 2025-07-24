import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Separator } from '@/components/ui/separator';
import {
  Building,
  Mail,
  Phone,
  MapPin,
  Facebook,
  Twitter,
  Linkedin,
  Instagram,
  FileText,
  Shield,
  BarChart3,
  Users,
  Award,
  Globe,
  ArrowRight,
  Heart
} from 'lucide-react';

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-background border-t">
      {/* Main Footer Content */}
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Company Info */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-gradient-to-br from-primary to-primary/80 rounded-lg flex items-center justify-center">
                <Building className="h-5 w-5 text-primary-foreground" />
              </div>
              <span className="text-xl font-bold">CamerPulse</span>
            </div>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Cameroon's comprehensive civic engagement platform. Empowering citizens through 
              transparency, democracy, and community connection from villages to national governance.
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
                <span>support@camertenders.cm</span>
              </div>
            </div>
          </div>

          {/* Civic Engagement */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Civic Platform</h3>
            <nav className="space-y-2">
              <Link 
                to="/villages" 
                className="block text-sm text-muted-foreground hover:text-foreground transition-colors"
              >
                Villages Directory
              </Link>
              <Link 
                to="/civic-reputation" 
                className="block text-sm text-muted-foreground hover:text-foreground transition-colors"
              >
                Rate Leaders
              </Link>
              <Link 
                to="/rankings/top-politicians" 
                className="block text-sm text-muted-foreground hover:text-foreground transition-colors"
              >
                Political Rankings
              </Link>
              <Link 
                to="/rankings/trusted-mayors" 
                className="block text-sm text-muted-foreground hover:text-foreground transition-colors"
              >
                Mayor Rankings
              </Link>
              <Link 
                to="/legislation" 
                className="block text-sm text-muted-foreground hover:text-foreground transition-colors"
              >
                Legislation Tracker
              </Link>
            </nav>
          </div>

          {/* Economic Opportunities */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Economic Platform</h3>
            <nav className="space-y-2">
              <Link 
                to="/tenders" 
                className="block text-sm text-muted-foreground hover:text-foreground transition-colors"
              >
                Government Tenders
              </Link>
              <Link 
                to="/jobs" 
                className="block text-sm text-muted-foreground hover:text-foreground transition-colors"
              >
                Job Opportunities
              </Link>
              <Link 
                to="/company" 
                className="block text-sm text-muted-foreground hover:text-foreground transition-colors"
              >
                Company Profiles
              </Link>
              <Link 
                to="/verification" 
                className="block text-sm text-muted-foreground hover:text-foreground transition-colors"
              >
                Business Verification
              </Link>
              <Link 
                to="/diaspora-connect" 
                className="block text-sm text-muted-foreground hover:text-foreground transition-colors"
              >
                Diaspora Connect
              </Link>
            </nav>
          </div>

          {/* Directories & Community */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Community Services</h3>
            <nav className="space-y-2">
              <Link 
                to="/hospitals" 
                className="block text-sm text-muted-foreground hover:text-foreground transition-colors"
              >
                Hospitals Directory
              </Link>
              <Link 
                to="/schools" 
                className="block text-sm text-muted-foreground hover:text-foreground transition-colors"
              >
                Schools Directory
              </Link>
              <Link 
                to="/pharmacies" 
                className="block text-sm text-muted-foreground hover:text-foreground transition-colors"
              >
                Pharmacies Directory
              </Link>
              <Link 
                to="/notifications" 
                className="block text-sm text-muted-foreground hover:text-foreground transition-colors"
              >
                Notification Center
              </Link>
              <Link 
                to="/support" 
                className="block text-sm text-muted-foreground hover:text-foreground transition-colors"
              >
                Support Center
              </Link>
            </nav>
            
            {/* Quick Stats */}
            <div className="grid grid-cols-2 gap-4 pt-4">
              <div className="text-center p-3 bg-muted/50 rounded-md">
                <div className="text-lg font-bold text-foreground">250K+</div>
                <div className="text-xs text-muted-foreground">Active Citizens</div>
              </div>
              <div className="text-center p-3 bg-muted/50 rounded-md">
                <div className="text-lg font-bold text-foreground">15K+</div>
                <div className="text-xs text-muted-foreground">Villages</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <Separator />

      {/* Features Section */}
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          <div className="text-center space-y-2">
            <div className="mx-auto w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
              <Shield className="h-6 w-6 text-primary" />
            </div>
            <h4 className="font-medium">Secure Platform</h4>
            <p className="text-xs text-muted-foreground">Bank-level security for all transactions</p>
          </div>
          
          <div className="text-center space-y-2">
            <div className="mx-auto w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
              <FileText className="h-6 w-6 text-primary" />
            </div>
            <h4 className="font-medium">Transparent Process</h4>
            <p className="text-xs text-muted-foreground">Open and fair tender processes</p>
          </div>
          
          <div className="text-center space-y-2">
            <div className="mx-auto w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
              <Users className="h-6 w-6 text-primary" />
            </div>
            <h4 className="font-medium">Community Driven</h4>
            <p className="text-xs text-muted-foreground">Built for Cameroon businesses</p>
          </div>
          
          <div className="text-center space-y-2">
            <div className="mx-auto w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
              <BarChart3 className="h-6 w-6 text-primary" />
            </div>
            <h4 className="font-medium">Real-time Analytics</h4>
            <p className="text-xs text-muted-foreground">Market insights and trends</p>
          </div>
        </div>
      </div>

      <Separator />

      {/* Bottom Footer */}
      <div className="container mx-auto px-4 py-6">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-4 text-sm text-muted-foreground">
            <span>© {currentYear} CamerPulse. All rights reserved.</span>
            <Separator orientation="vertical" className="h-4" />
            <span className="flex items-center gap-1">
              Made with <Heart className="h-3 w-3 text-red-500" /> in Cameroon
            </span>
          </div>
          
          {/* Legal Links */}
          <div className="flex items-center gap-4">
            <Link to="/privacy" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
              Privacy Policy
            </Link>
            <Link to="/terms" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
              Terms of Service
            </Link>
            <Link to="/cookies" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
              Cookie Policy
            </Link>
            
            <Separator orientation="vertical" className="h-4" />
            
            {/* Social Links */}
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
                <Globe className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}