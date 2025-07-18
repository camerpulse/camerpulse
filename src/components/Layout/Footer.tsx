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
              <Link to="/events" className="flex items-center gap-2 text-green-600 hover:text-green-700 transition-colors font-semibold">
                <Calendar className="w-4 h-4" />
                🎟️ Events & Tickets
              </Link>
              <Link to="/feed" className="flex items-center gap-2 text-muted-foreground hover:text-primary transition-colors">
                <TrendingUp className="w-3 h-3" />
                Pulse Feed
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
              <Link to="/messenger" className="flex items-center gap-2 text-muted-foreground hover:text-primary transition-colors">
                <Users className="w-3 h-3" />
                Messenger
              </Link>
              <Link to="/rewards" className="flex items-center gap-2 text-muted-foreground hover:text-primary transition-colors">
                <Crown className="w-3 h-3" />
                Rewards Center
              </Link>
              <Link to="/regional-analytics" className="flex items-center gap-2 text-muted-foreground hover:text-primary transition-colors">
                <BarChart3 className="w-3 h-3" />
                Regional Analytics
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

          {/* Support & Admin */}
          <div className="space-y-4">
            <h3 className="font-semibold">Support & Admin</h3>
            <div className="space-y-2 text-sm">
              <Link to="/auth" className="block text-muted-foreground hover:text-primary transition-colors">
                Sign In / Register
              </Link>
              <Link to="/admin" className="block text-muted-foreground hover:text-primary transition-colors">
                Admin Panel
              </Link>
              <Link to="/camerpulse-intelligence" className="block text-muted-foreground hover:text-primary transition-colors">
                Intelligence Hub
              </Link>
              <Link to="/notification-settings" className="block text-muted-foreground hover:text-primary transition-colors">
                Notifications
              </Link>
              <Link to="/ecosystem" className="block text-muted-foreground hover:text-primary transition-colors">
                Ecosystem
              </Link>
              <Link to="/fan-portal" className="block text-muted-foreground hover:text-primary transition-colors">
                Fan Portal
              </Link>
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