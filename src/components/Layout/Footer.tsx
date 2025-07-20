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
  Globe,
  Shield,
  MapPin
} from "lucide-react";

export const Footer = () => {
  return (
    <footer className="bg-muted/50 mt-16 py-12 px-4 border-t">
      <div className="container mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-5 gap-8">
          {/* Brand Section */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-gradient-to-r from-primary to-accent rounded-full flex items-center justify-center">
                <span className="text-white font-bold text-sm">CP</span>
              </div>
              <span className="font-bold text-lg">CamerPulse</span>
            </div>
            <p className="text-sm text-muted-foreground">
              Your comprehensive civic engagement platform for democratic participation, tracking political promises, and engaging with Cameroon's governance.
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

          {/* Civic Engagement */}
          <div className="space-y-4">
            <h3 className="font-semibold flex items-center gap-2">
              <Vote className="w-4 h-4 text-primary" />
              Civic Engagement
            </h3>
            <div className="space-y-2 text-sm">
              <Link to="/polls" className="flex items-center gap-2 text-muted-foreground hover:text-primary transition-colors">
                <Vote className="w-3 h-3" />
                Polls & Voting
              </Link>
              <Link to="/legislation" className="flex items-center gap-2 text-muted-foreground hover:text-primary transition-colors">
                <Scale className="w-3 h-3" />
                Legislative Tracker
              </Link>
              <Link to="/politicians" className="flex items-center gap-2 text-muted-foreground hover:text-primary transition-colors">
                <Users className="w-3 h-3" />
                Politicians
              </Link>
              <Link to="/petitions" className="flex items-center gap-2 text-muted-foreground hover:text-primary transition-colors">
                <FileText className="w-3 h-3" />
                Petitions
              </Link>
              <Link to="/events" className="flex items-center gap-2 text-muted-foreground hover:text-primary transition-colors">
                <Calendar className="w-3 h-3" />
                Civic Events
              </Link>
              <Link to="/government-projects" className="flex items-center gap-2 text-muted-foreground hover:text-primary transition-colors">
                <Target className="w-3 h-3" />
                Gov Projects
              </Link>
              <Link to="/analytics" className="flex items-center gap-2 text-muted-foreground hover:text-primary transition-colors">
                <TrendingUp className="w-3 h-3" />
                Analytics
              </Link>
              <Link to="/civic-education" className="flex items-center gap-2 text-muted-foreground hover:text-primary transition-colors">
                <Globe className="w-3 h-3" />
                Civic Education
              </Link>
            </div>
          </div>

          {/* Services Directory */}
          <div className="space-y-4">
            <h3 className="font-semibold flex items-center gap-2">
              <Building className="w-4 h-4 text-primary" />
              Services Directory
            </h3>
            <div className="space-y-2 text-sm">
              <Link to="/ministries" className="flex items-center gap-2 text-muted-foreground hover:text-primary transition-colors">
                <Building className="w-3 h-3" />
                Government Ministries
              </Link>
              <Link to="/councils" className="flex items-center gap-2 text-muted-foreground hover:text-primary transition-colors">
                <MapPin className="w-3 h-3" />
                Local Councils
              </Link>
              <Link to="/companies" className="flex items-center gap-2 text-muted-foreground hover:text-primary transition-colors">
                <Briefcase className="w-3 h-3" />
                Companies
              </Link>
              <Link to="/schools" className="flex items-center gap-2 text-muted-foreground hover:text-primary transition-colors">
                <Building className="w-3 h-3" />
                Schools
              </Link>
              <Link to="/hospitals" className="flex items-center gap-2 text-muted-foreground hover:text-primary transition-colors">
                <Heart className="w-3 h-3" />
                Hospitals
              </Link>
              <Link to="/pharmacies" className="flex items-center gap-2 text-muted-foreground hover:text-primary transition-colors">
                <Shield className="w-3 h-3" />
                Pharmacies
              </Link>
              <Link to="/villages" className="flex items-center gap-2 text-muted-foreground hover:text-primary transition-colors">
                <Crown className="w-3 h-3" />
                Villages
              </Link>
              <Link to="/institutions" className="flex items-center gap-2 text-muted-foreground hover:text-primary transition-colors">
                <Building className="w-3 h-3" />
                Institutions
              </Link>
            </div>
          </div>

          {/* Governance & Transparency */}
          <div className="space-y-4">
            <h3 className="font-semibold flex items-center gap-2">
              <Scale className="w-4 h-4 text-primary" />
              Governance & Transparency
            </h3>
            <div className="space-y-2 text-sm">
              <Link to="/national-debt" className="flex items-center gap-2 text-muted-foreground hover:text-primary transition-colors">
                <BarChart3 className="w-3 h-3" />
                National Debt
              </Link>
              <Link to="/billionaires" className="flex items-center gap-2 text-muted-foreground hover:text-primary transition-colors">
                <Crown className="w-3 h-3" />
                Billionaire Tracker
              </Link>
              <Link to="/election-forecast" className="flex items-center gap-2 text-muted-foreground hover:text-primary transition-colors">
                <TrendingUp className="w-3 h-3" />
                Election Forecast
              </Link>
              <Link to="/political-parties" className="flex items-center gap-2 text-muted-foreground hover:text-primary transition-colors">
                <Users className="w-3 h-3" />
                Political Parties
              </Link>
              <Link to="/camerplay" className="flex items-center gap-2 text-muted-foreground hover:text-primary transition-colors">
                <Music className="w-3 h-3" />
                CamerPlay Music
              </Link>
              <Link to="/rewards" className="flex items-center gap-2 text-muted-foreground hover:text-primary transition-colors">
                <DollarSign className="w-3 h-3" />
                Rewards Center
              </Link>
            </div>
          </div>

          {/* Support & Community */}
          <div className="space-y-4">
            <h3 className="font-semibold">Support & Community</h3>
            <div className="space-y-2 text-sm">
              <Link to="/auth" className="block text-muted-foreground hover:text-primary transition-colors">
                Sign In / Register
              </Link>
              <Link to="/help" className="block text-muted-foreground hover:text-primary transition-colors">
                Help Center
              </Link>
              <Link to="/contact" className="block text-muted-foreground hover:text-primary transition-colors">
                Contact Us
              </Link>
              <Link to="/privacy" className="block text-muted-foreground hover:text-primary transition-colors">
                Privacy Policy
              </Link>
              <Link to="/terms" className="block text-muted-foreground hover:text-primary transition-colors">
                Terms of Service
              </Link>
              <Link to="/community" className="block text-muted-foreground hover:text-primary transition-colors">
                Community Guidelines
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
            <span>for Cameroonian civic engagement</span>
          </div>
        </div>
      </div>
    </footer>
  );
};