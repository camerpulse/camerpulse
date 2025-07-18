import { Link } from "react-router-dom";
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
  Globe
} from "lucide-react";

export const Footer = () => {
  return (
    <footer className="bg-muted/50 mt-16 py-12 px-4 border-t">
      <div className="container mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-5 gap-8">
          {/* Brand Section */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-gradient-to-r from-cm-green to-cm-red rounded-full flex items-center justify-center">
                <span className="text-white font-bold text-sm">CP</span>
              </div>
              <span className="font-bold text-lg">CamerPulse</span>
            </div>
            <p className="text-sm text-muted-foreground">
              Empowering Cameroonian democracy through technology, transparency, and civic engagement.
            </p>
            <div className="flex gap-3">
              <a href="#" className="text-muted-foreground hover:text-primary transition-colors">
                <Facebook className="w-5 h-5" />
              </a>
              <a href="#" className="text-muted-foreground hover:text-primary transition-colors">
                <Twitter className="w-5 h-5" />
              </a>
              <a href="#" className="text-muted-foreground hover:text-primary transition-colors">
                <Instagram className="w-5 h-5" />
              </a>
              <a href="#" className="text-muted-foreground hover:text-primary transition-colors">
                <Github className="w-5 h-5" />
              </a>
            </div>
          </div>

          {/* Civic Tools */}
          <div className="space-y-4">
            <h3 className="font-semibold flex items-center gap-2">
              <Users className="w-4 h-4 text-primary" />
              Civic Tools
            </h3>
            <div className="space-y-2 text-sm">
              <Link to="/polls" className="flex items-center gap-2 text-muted-foreground hover:text-primary transition-colors">
                <Vote className="w-3 h-3" />
                Polls & Surveys
              </Link>
              <Link to="/civic-portal" className="flex items-center gap-2 text-muted-foreground hover:text-primary transition-colors">
                <FileText className="w-3 h-3" />
                Civic Portal
              </Link>
              <Link to="/election-forecast" className="flex items-center gap-2 text-muted-foreground hover:text-primary transition-colors">
                <Calendar className="w-3 h-3" />
                Election Monitor
              </Link>
              <Link to="/promises" className="flex items-center gap-2 text-muted-foreground hover:text-primary transition-colors">
                <Target className="w-3 h-3" />
                Promise Tracker
              </Link>
            </div>
          </div>

          {/* Platforms & Trackers */}
          <div className="space-y-4">
            <h3 className="font-semibold flex items-center gap-2">
              <BarChart3 className="w-4 h-4 text-primary" />
              Platforms & Trackers
            </h3>
            <div className="space-y-2 text-sm">
              <Link to="/national-debt" className="flex items-center gap-2 text-muted-foreground hover:text-primary transition-colors">
                <DollarSign className="w-3 h-3" />
                National Debt
              </Link>
              <Link to="/billionaires" className="flex items-center gap-2 text-muted-foreground hover:text-primary transition-colors">
                <Crown className="w-3 h-3" />
                Billionaire Tracker
              </Link>
              <Link to="/marketplace" className="flex items-center gap-2 text-muted-foreground hover:text-primary transition-colors">
                <Briefcase className="w-3 h-3" />
                Marketplace
              </Link>
              <Link to="/camerplay" className="flex items-center gap-2 text-muted-foreground hover:text-primary transition-colors">
                <Music className="w-3 h-3" />
                CamerPlay Music
              </Link>
            </div>
          </div>

          {/* Political & Business Profiles */}
          <div className="space-y-4">
            <h3 className="font-semibold flex items-center gap-2">
              <Building className="w-4 h-4 text-primary" />
              Profiles & Directory
            </h3>
            <div className="space-y-2 text-sm">
              <Link to="/politicians" className="flex items-center gap-2 text-muted-foreground hover:text-primary transition-colors">
                <Users className="w-3 h-3" />
                Politicians
              </Link>
              <Link to="/political-parties" className="flex items-center gap-2 text-muted-foreground hover:text-primary transition-colors">
                <Scale className="w-3 h-3" />
                Political Parties
              </Link>
              <Link to="/companies" className="flex items-center gap-2 text-muted-foreground hover:text-primary transition-colors">
                <Building className="w-3 h-3" />
                Companies
              </Link>
              <Link to="/artist-landing" className="flex items-center gap-2 text-muted-foreground hover:text-primary transition-colors">
                <Music className="w-3 h-3" />
                Artists
              </Link>
            </div>
          </div>

          {/* Support */}
          <div className="space-y-4">
            <h3 className="font-semibold">Support</h3>
            <div className="space-y-2 text-sm">
              <Link to="/auth" className="block text-muted-foreground hover:text-primary transition-colors">
                Sign In / Register
              </Link>
              <a href="#" className="block text-muted-foreground hover:text-primary transition-colors">
                Help Center
              </a>
              <a href="#" className="block text-muted-foreground hover:text-primary transition-colors">
                Privacy Policy
              </a>
              <a href="#" className="block text-muted-foreground hover:text-primary transition-colors">
                Terms of Service
              </a>
              <a href="#" className="block text-muted-foreground hover:text-primary transition-colors">
                Contact Us
              </a>
            </div>
          </div>
        </div>

        {/* Bottom Section */}
        <div className="border-t mt-8 pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-sm text-muted-foreground">
            © 2024 CamerPulse. All rights reserved.
          </p>
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <span>Made with</span>
            <Heart className="w-4 h-4 text-red-500" />
            <span>for Cameroon</span>
          </div>
        </div>
      </div>
    </footer>
  );
};