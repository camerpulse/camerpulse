import { Link } from "react-router-dom";
import { URLBuilder } from '@/utils/slugUtils';
import { useLanguage } from '@/contexts/LanguageContext';
import { 
  Heart, 
  Github, 
  Twitter, 
  Facebook, 
  Instagram,
  Vote,
  Users,
  Building,
  TrendingUp,
  Crown,
  FileText,
  BarChart3,
  Target,
  Calendar,
  Music,
  Briefcase,
  Scale,
  AlertTriangle,
  DollarSign,
  Globe,
  Shield,
  MapPin,
  Home,
  ShoppingBag,
  MessageCircle,
  Bell,
  Settings,
  HelpCircle,
  GraduationCap,
  Landmark,
  Factory,
  School,
  Stethoscope,
  Pill,
  TreePine,
  UserCheck,
  Search,
  Mail,
  Book,
  Lock,
  Gavel
} from "lucide-react";

export const Footer = () => {
  const { getLocalizedPath } = useLanguage();
  return (
    <footer className="bg-gradient-to-br from-muted/30 to-background mt-16 py-12 px-4 border-t border-border/50">
      <div className="container mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-8">
          {/* Brand Section */}
          <div className="space-y-4 lg:col-span-2">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-gradient-to-br from-primary to-primary-glow rounded-xl flex items-center justify-center shadow-md">
                <span className="text-white font-bold text-sm">CP</span>
              </div>
              <span className="font-bold text-lg text-foreground">CamerPulse</span>
            </div>
            <p className="text-sm text-muted-foreground">
              Your comprehensive civic engagement platform for democratic participation, tracking political promises, and engaging with Cameroon's governance.
            </p>
            <div className="flex gap-3">
              <a href="#" className="text-muted-foreground hover:text-primary transition-colors" aria-label="Facebook">
                <Facebook className="w-5 h-5" />
              </a>
              <a href="#" className="text-muted-foreground hover:text-primary transition-colors" aria-label="Twitter">
                <Twitter className="w-5 h-5" />
              </a>
              <a href="#" className="text-muted-foreground hover:text-primary transition-colors" aria-label="Instagram">
                <Instagram className="w-5 h-5" />
              </a>
              <a href="#" className="text-muted-foreground hover:text-primary transition-colors" aria-label="GitHub">
                <Github className="w-5 h-5" />
              </a>
            </div>
          </div>

          {/* Platform & Navigation */}
          <div className="space-y-4">
            <h3 className="font-semibold flex items-center gap-2">
              <Home className="w-4 h-4 text-primary" />
              Platform
            </h3>
            <div className="space-y-2 text-sm">
              <Link to={getLocalizedPath('/')} className="flex items-center gap-2 text-muted-foreground hover:text-primary transition-colors">
                <Home className="w-3 h-3" />
                Homepage
              </Link>
              <Link to={getLocalizedPath('/civic-dashboard')} className="flex items-center gap-2 text-muted-foreground hover:text-primary transition-colors">
                <BarChart3 className="w-3 h-3" />
                Civic Dashboard
              </Link>
              <Link to={getLocalizedPath('/feed')} className="flex items-center gap-2 text-muted-foreground hover:text-primary transition-colors">
                <Users className="w-3 h-3" />
                Community Feed
              </Link>
              <Link to={getLocalizedPath('/search')} className="flex items-center gap-2 text-muted-foreground hover:text-primary transition-colors">
                <Search className="w-3 h-3" />
                Advanced Search
              </Link>
              <Link to={getLocalizedPath('/messages')} className="flex items-center gap-2 text-muted-foreground hover:text-primary transition-colors">
                <MessageCircle className="w-3 h-3" />
                Messaging Center
              </Link>
              <Link to={getLocalizedPath('/notifications')} className="flex items-center gap-2 text-muted-foreground hover:text-primary transition-colors">
                <Bell className="w-3 h-3" />
                Notifications
              </Link>
            </div>
          </div>

          {/* Directories */}
          <div className="space-y-4">
            <h3 className="font-semibold flex items-center gap-2">
              <Building className="w-4 h-4 text-primary" />
              Directories
            </h3>
            <div className="space-y-2 text-sm">
              <Link to={getLocalizedPath('/villages')} className="flex items-center gap-2 text-muted-foreground hover:text-primary transition-colors">
                <TreePine className="w-3 h-3" />
                Villages Directory
              </Link>
              <Link to={getLocalizedPath('/fons')} className="flex items-center gap-2 text-muted-foreground hover:text-primary transition-colors">
                <Crown className="w-3 h-3" />
                Royal Heritage (Fons)
              </Link>
              <Link to={getLocalizedPath('/schools')} className="flex items-center gap-2 text-muted-foreground hover:text-primary transition-colors">
                <School className="w-3 h-3" />
                Schools
              </Link>
              <Link to={getLocalizedPath('/hospitals')} className="flex items-center gap-2 text-muted-foreground hover:text-primary transition-colors">
                <Stethoscope className="w-3 h-3" />
                Hospitals
              </Link>
              <Link to={getLocalizedPath('/pharmacies')} className="flex items-center gap-2 text-muted-foreground hover:text-primary transition-colors">
                <Pill className="w-3 h-3" />
                Pharmacies
              </Link>
              <Link to={getLocalizedPath('/companies')} className="flex items-center gap-2 text-muted-foreground hover:text-primary transition-colors">
                <Factory className="w-3 h-3" />
                Companies
              </Link>
            </div>
          </div>

          {/* Political & Civic */}
          <div className="space-y-4">
            <h3 className="font-semibold flex items-center gap-2">
              <Vote className="w-4 h-4 text-primary" />
              Political & Civic
            </h3>
            <div className="space-y-2 text-sm">
              <Link to={getLocalizedPath('/politicians')} className="flex items-center gap-2 text-muted-foreground hover:text-primary transition-colors">
                <UserCheck className="w-3 h-3" />
                Politicians
              </Link>
              <Link to={getLocalizedPath('/senators')} className="flex items-center gap-2 text-muted-foreground hover:text-primary transition-colors">
                <Landmark className="w-3 h-3" />
                Senators
              </Link>
              <Link to={getLocalizedPath('/mps')} className="flex items-center gap-2 text-muted-foreground hover:text-primary transition-colors">
                <Scale className="w-3 h-3" />
                MPs
              </Link>
              <Link to={getLocalizedPath('/ministers')} className="flex items-center gap-2 text-muted-foreground hover:text-primary transition-colors">
                <Building className="w-3 h-3" />
                Ministers
              </Link>
              <Link to={getLocalizedPath('/political-parties')} className="flex items-center gap-2 text-muted-foreground hover:text-primary transition-colors">
                <Users className="w-3 h-3" />
                Political Parties
              </Link>
              <Link to={getLocalizedPath('/polls')} className="flex items-center gap-2 text-muted-foreground hover:text-primary transition-colors">
                <Vote className="w-3 h-3" />
                Polls & Surveys
              </Link>
              <Link to={getLocalizedPath('/petitions')} className="flex items-center gap-2 text-muted-foreground hover:text-primary transition-colors">
                <FileText className="w-3 h-3" />
                Petitions
              </Link>
              <Link to={getLocalizedPath('/civic-education')} className="flex items-center gap-2 text-muted-foreground hover:text-primary transition-colors">
                <GraduationCap className="w-3 h-3" />
                Civic Education
              </Link>
            </div>
          </div>

          {/* Community & Services */}
          <div className="space-y-4">
            <h3 className="font-semibold flex items-center gap-2">
              <ShoppingBag className="w-4 h-4 text-primary" />
              Community & Services
            </h3>
            <div className="space-y-2 text-sm">
              <Link to={getLocalizedPath('/jobs')} className="flex items-center gap-2 text-muted-foreground hover:text-primary transition-colors">
                <Briefcase className="w-3 h-3" />
                Jobs Portal
              </Link>
              <Link to={getLocalizedPath('/marketplace')} className="flex items-center gap-2 text-muted-foreground hover:text-primary transition-colors">
                <ShoppingBag className="w-3 h-3" />
                Marketplace
              </Link>
              <Link to={getLocalizedPath('/music')} className="flex items-center gap-2 text-muted-foreground hover:text-primary transition-colors">
                <Music className="w-3 h-3" />
                Music Platform
              </Link>
              <Link to={getLocalizedPath('/auth')} className="flex items-center gap-2 text-muted-foreground hover:text-primary transition-colors">
                <UserCheck className="w-3 h-3" />
                Sign In / Register
              </Link>
              <Link to={getLocalizedPath('/help')} className="flex items-center gap-2 text-muted-foreground hover:text-primary transition-colors">
                <HelpCircle className="w-3 h-3" />
                Help Center
              </Link>
              <Link to={getLocalizedPath('/contact')} className="flex items-center gap-2 text-muted-foreground hover:text-primary transition-colors">
                <Mail className="w-3 h-3" />
                Contact Us
              </Link>
              <Link to={getLocalizedPath('/about')} className="flex items-center gap-2 text-muted-foreground hover:text-primary transition-colors">
                <Book className="w-3 h-3" />
                About
              </Link>
            </div>
          </div>
        </div>

        {/* Bottom Section */}
        <div className="border-t mt-8 pt-8">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-4">
            <div className="flex flex-col sm:flex-row gap-4 text-sm">
              <Link to={getLocalizedPath('/privacy')} className="flex items-center gap-2 text-muted-foreground hover:text-primary transition-colors">
                <Lock className="w-3 h-3" />
                Privacy Policy
              </Link>
              <Link to={getLocalizedPath('/terms')} className="flex items-center gap-2 text-muted-foreground hover:text-primary transition-colors">
                <Gavel className="w-3 h-3" />
                Terms of Service
              </Link>
              <Link to={getLocalizedPath('/cookies')} className="flex items-center gap-2 text-muted-foreground hover:text-primary transition-colors">
                <Settings className="w-3 h-3" />
                Cookie Policy
              </Link>
            </div>
          </div>
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-sm text-muted-foreground">
              © 2024 CamerPulse. All rights reserved.
            </p>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <span>Made with</span>
              <Heart className="w-4 h-4 text-red-500" />
              <span>for Cameroonian civic engagement</span>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};