import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import camerPulseLogo from '@/assets/camerpulse-logo.png';
import {
  Building,
  Mail,
  Phone,
  MapPin,
  Facebook,
  Twitter,
  Linkedin,
  Instagram,
  Heart,
  GraduationCap,
  Hospital,
  Pill,
  Home,
  Church,
  Crown,
  Briefcase,
  TrendingUp,
  Users,
  FileText,
  Music,
  Calendar,
  Video,
  UserCheck,
  MapIcon,
  Vote,
  MessageCircle,
  Star,
  Zap,
  BookOpen,
  Scale,
  Globe,
  Handshake,
  Newspaper,
  DollarSign,
  Bug,
  BarChart3,
  Shield
} from 'lucide-react';

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-background border-t">
      {/* Main Footer Content */}
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 xl:grid-cols-7 gap-8">
          
          {/* Company Info */}
          <div className="space-y-4 lg:col-span-2">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg flex items-center justify-center">
                <img src={camerPulseLogo} alt="CamerPulse" className="w-8 h-8 rounded-lg" />
              </div>
              <span className="text-xl font-bold">CamerPulse</span>
            </div>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Cameroon's comprehensive civic engagement platform. Empowering citizens through 
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

          {/* 🏛️ Civic Directories */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold flex items-center gap-2">
              <Building className="h-4 w-4" />
              Civic Directories
            </h3>
            <nav className="space-y-2">
              <Link to="/schools" className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors">
                <GraduationCap className="h-3 w-3" />
                Schools
              </Link>
              <Link to="/hospitals" className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors">
                <Hospital className="h-3 w-3" />
                Hospitals
              </Link>
              <Link to="/pharmacies" className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors">
                <Pill className="h-3 w-3" />
                Pharmacies
              </Link>
              <Link to="/villages" className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors">
                <Home className="h-3 w-3" />
                Villages
              </Link>
              <Link to="/churches" className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors">
                <Church className="h-3 w-3" />
                Churches
              </Link>
              <Link to="/traditional-leaders" className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors">
                <Crown className="h-3 w-3" />
                Traditional Leaders
              </Link>
            </nav>
          </div>

          {/* 🏢 Businesses */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold flex items-center gap-2">
              <Briefcase className="h-4 w-4" />
              Businesses
            </h3>
            <nav className="space-y-2">
              <Link to="/companies" className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors">
                <Building className="h-3 w-3" />
                Companies
              </Link>
              <Link to="/billionaires" className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors">
                <TrendingUp className="h-3 w-3" />
                Billionaires
              </Link>
              <Link to="/economics" className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors">
                <BarChart3 className="h-3 w-3" />
                Economics
              </Link>
              <Link to="/business-verification" className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors">
                <Shield className="h-3 w-3" />
                Business Verification
              </Link>
              <Link to="/jobs" className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors">
                <Users className="h-3 w-3" />
                Job Board
              </Link>
            </nav>
          </div>

          {/* 🎶 Media & Engagement */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold flex items-center gap-2">
              <Music className="h-4 w-4" />
              Media & Engagement
            </h3>
            <nav className="space-y-2">
              <Link to="/camerplay" className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors">
                <Music className="h-3 w-3" />
                CamerPlay Music
              </Link>
              <Link to="/events" className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors">
                <Calendar className="h-3 w-3" />
                Events
              </Link>
              <Link to="/artists" className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors">
                <UserCheck className="h-3 w-3" />
                Artist Directory
              </Link>
              <Link to="/videos" className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors">
                <Video className="h-3 w-3" />
                Video Center
              </Link>
            </nav>
          </div>

          {/* 🧑‍⚖️ Government & Officials */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold flex items-center gap-2">
              <UserCheck className="h-4 w-4" />
              Government
            </h3>
            <nav className="space-y-2">
              <Link to="/senators" className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors">
                <Users className="h-3 w-3" />
                Senators
              </Link>
              <Link to="/mps" className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors">
                <Users className="h-3 w-3" />
                MPs
              </Link>
              <Link to="/ministers" className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors">
                <UserCheck className="h-3 w-3" />
                Ministers
              </Link>
              <Link to="/mayors" className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors">
                <MapIcon className="h-3 w-3" />
                Mayors
              </Link>
              <Link to="/governors" className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors">
                <Crown className="h-3 w-3" />
                Governors
              </Link>
              <Link to="/councils" className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors">
                <Building className="h-3 w-3" />
                Councils
              </Link>
              <Link to="/projects" className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors">
                <FileText className="h-3 w-3" />
                Government Projects
              </Link>
            </nav>
          </div>

          {/* ⚖️ Civic Tools */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold flex items-center gap-2">
              <Vote className="h-4 w-4" />
              Civic Tools
            </h3>
            <nav className="space-y-2">
              <Link to="/polls" className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors">
                <Vote className="h-3 w-3" />
                Polls
              </Link>
              <Link to="/petitions" className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors">
                <FileText className="h-3 w-3" />
                Petitions
              </Link>
              <Link to="/complaints" className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors">
                <MessageCircle className="h-3 w-3" />
                Complaints
              </Link>
              <Link to="/ratings" className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors">
                <Star className="h-3 w-3" />
                Ratings & Reviews
              </Link>
              <Link to="/pulse-messenger" className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors">
                <Zap className="h-3 w-3" />
                Pulse Messenger
              </Link>
            </nav>
          </div>
        </div>

        {/* Second Row - Knowledge & More */}
        <Separator className="my-8" />
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {/* 📚 Knowledge */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold flex items-center gap-2">
              <BookOpen className="h-4 w-4" />
              Knowledge
            </h3>
            <nav className="space-y-2">
              <Link to="/laws" className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors">
                <Scale className="h-3 w-3" />
                Laws & Constitution
              </Link>
              <Link to="/government-hierarchy" className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors">
                <Building className="h-3 w-3" />
                Government Hierarchy
              </Link>
              <Link to="/faqs" className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors">
                <MessageCircle className="h-3 w-3" />
                FAQs
              </Link>
              <Link to="/about" className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors">
                <Globe className="h-3 w-3" />
                About CamerPulse
              </Link>
            </nav>
          </div>

          {/* 🧩 More */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold flex items-center gap-2">
              <Globe className="h-4 w-4" />
              More
            </h3>
            <nav className="space-y-2">
              <Link to="/contact" className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors">
                <Mail className="h-3 w-3" />
                Contact
              </Link>
              <Link to="/partnerships" className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors">
                <Handshake className="h-3 w-3" />
                Partnerships
              </Link>
              <Link to="/press" className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors">
                <Newspaper className="h-3 w-3" />
                Press
              </Link>
              <Link to="/donate" className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors">
                <DollarSign className="h-3 w-3" />
                Donate
              </Link>
               <Link to="/report-bug" className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors">
                 <Bug className="h-3 w-3" />
                 Report a Bug
               </Link>
               <Link to="/admin" className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors">
                 <Shield className="h-3 w-3" />
                 Admin Panel
               </Link>
            </nav>
          </div>

          {/* Quick Platform Stats */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Platform Stats</h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="text-center p-3 bg-muted/50 rounded-md">
                <div className="text-lg font-bold text-foreground">250K+</div>
                <div className="text-xs text-muted-foreground">Citizens</div>
              </div>
              <div className="text-center p-3 bg-muted/50 rounded-md">
                <div className="text-lg font-bold text-foreground">15K+</div>
                <div className="text-xs text-muted-foreground">Villages</div>
              </div>
              <div className="text-center p-3 bg-muted/50 rounded-md">
                <div className="text-lg font-bold text-foreground">340+</div>
                <div className="text-xs text-muted-foreground">Politicians</div>
              </div>
              <div className="text-center p-3 bg-muted/50 rounded-md">
                <div className="text-lg font-bold text-foreground">2.4K+</div>
                <div className="text-xs text-muted-foreground">Polls</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Footer */}
      <div className="border-t">
        <div className="container mx-auto px-4 py-6">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex flex-col md:flex-row items-center gap-4 text-sm text-muted-foreground">
              <span>© {currentYear} CamerPulse. All rights reserved.</span>
              <Separator orientation="vertical" className="h-4 hidden md:block" />
              <span className="flex items-center gap-1">
                Made with <Heart className="h-3 w-3 text-red-500" /> in Cameroon
              </span>
            </div>
            
            {/* Legal Links */}
            <div className="flex flex-wrap items-center gap-4">
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
                  <Instagram className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}