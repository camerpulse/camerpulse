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
  Shield
} from "lucide-react";

export const Footer = () => {
  return (
    <footer className="bg-muted/50 mt-16 py-12 px-4 border-t">
      <div className="container mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-5 gap-8">
          {/* Brand Section */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center">
                <span className="text-white font-bold text-sm">CP</span>
              </div>
              <span className="font-bold text-lg">CamerPlay</span>
            </div>
            <p className="text-sm text-muted-foreground">
              Celebrating Cameroonian music, culture, and entertainment. Connect with artists, discover events, and experience the rhythm of Cameroon.
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

          {/* Events & Shows */}
          <div className="space-y-4">
            <h3 className="font-semibold flex items-center gap-2">
              <Calendar className="w-4 h-4 text-primary" />
              Events & Shows
            </h3>
            <div className="space-y-2 text-sm">
              <Link to="/events" className="flex items-center gap-2 text-muted-foreground hover:text-primary transition-colors">
                <Calendar className="w-3 h-3" />
                All Events
              </Link>
              <Link to="/concerts" className="flex items-center gap-2 text-muted-foreground hover:text-primary transition-colors">
                <Music className="w-3 h-3" />
                Concerts
              </Link>
              <Link to="/festivals" className="flex items-center gap-2 text-muted-foreground hover:text-primary transition-colors">
                <Crown className="w-3 h-3" />
                Festivals
              </Link>
              <Link to="/comedy-shows" className="flex items-center gap-2 text-muted-foreground hover:text-primary transition-colors">
                <Users className="w-3 h-3" />
                Comedy Shows
              </Link>
              <Link to="/tickets" className="flex items-center gap-2 text-muted-foreground hover:text-primary transition-colors">
                <FileText className="w-3 h-3" />
                My Tickets
              </Link>
              <Link to="/event-organizers" className="flex items-center gap-2 text-muted-foreground hover:text-primary transition-colors">
                <Briefcase className="w-3 h-3" />
                For Organizers
              </Link>
            </div>
          </div>

          {/* Music & Entertainment */}
          <div className="space-y-4">
            <h3 className="font-semibold flex items-center gap-2">
              <Music className="w-4 h-4 text-primary" />
              Music & Entertainment
            </h3>
            <div className="space-y-2 text-sm">
              <Link to="/music" className="flex items-center gap-2 text-muted-foreground hover:text-primary transition-colors">
                <Music className="w-3 h-3" />
                Music Library
              </Link>
              <Link to="/radio" className="flex items-center gap-2 text-muted-foreground hover:text-primary transition-colors">
                <TrendingUp className="w-3 h-3" />
                CamerPlay Radio
              </Link>
              <Link to="/playlists" className="flex items-center gap-2 text-muted-foreground hover:text-primary transition-colors">
                <BarChart3 className="w-3 h-3" />
                Playlists
              </Link>
              <Link to="/genres" className="flex items-center gap-2 text-muted-foreground hover:text-primary transition-colors">
                <Globe className="w-3 h-3" />
                Genres
              </Link>
              <Link to="/trending" className="flex items-center gap-2 text-muted-foreground hover:text-primary transition-colors">
                <TrendingUp className="w-3 h-3" />
                Trending Now
              </Link>
              <Link to="/discover" className="flex items-center gap-2 text-muted-foreground hover:text-primary transition-colors">
                <Target className="w-3 h-3" />
                Discover New Music
              </Link>
            </div>
          </div>

          {/* Artists & Awards */}
          <div className="space-y-4">
            <h3 className="font-semibold flex items-center gap-2">
              <Crown className="w-4 h-4 text-primary" />
              Artists & Awards
            </h3>
            <div className="space-y-2 text-sm">
              <Link to="/artists" className="flex items-center gap-2 text-muted-foreground hover:text-primary transition-colors">
                <Users className="w-3 h-3" />
                All Artists
              </Link>
              <Link to="/rising-stars" className="flex items-center gap-2 text-muted-foreground hover:text-primary transition-colors">
                <TrendingUp className="w-3 h-3" />
                Rising Stars
              </Link>
              <Link to="/awards" className="flex items-center gap-2 text-muted-foreground hover:text-primary transition-colors">
                <Crown className="w-3 h-3" />
                Awards & Voting
              </Link>
              <Link to="/artist-portal" className="flex items-center gap-2 text-muted-foreground hover:text-primary transition-colors">
                <Briefcase className="w-3 h-3" />
                Artist Portal
              </Link>
              <Link to="/fan-clubs" className="flex items-center gap-2 text-muted-foreground hover:text-primary transition-colors">
                <Heart className="w-3 h-3" />
                Fan Clubs
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
            © 2024 CamerPlay. All rights reserved.
          </p>
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <span>Made with</span>
            <Heart className="w-4 h-4 text-red-500" />
            <span>for Cameroonian music lovers</span>
          </div>
        </div>
      </div>
    </footer>
  );
};