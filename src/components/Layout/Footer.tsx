import { Link } from "react-router-dom";
import { Heart, Github, Twitter, Facebook, Instagram } from "lucide-react";

export const Footer = () => {
  return (
    <footer className="bg-muted/50 mt-16 py-12 px-4 border-t">
      <div className="container mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
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

          {/* Platform Links */}
          <div className="space-y-4">
            <h3 className="font-semibold">Platform</h3>
            <div className="space-y-2 text-sm">
              <Link to="/polls" className="block text-muted-foreground hover:text-primary transition-colors">
                Polls & Surveys
              </Link>
              <Link to="/politicians" className="block text-muted-foreground hover:text-primary transition-colors">
                Politicians
              </Link>
              <Link to="/political-parties" className="block text-muted-foreground hover:text-primary transition-colors">
                Political Parties
              </Link>
              <Link to="/news" className="block text-muted-foreground hover:text-primary transition-colors">
                News & Updates
              </Link>
              <Link to="/civic-portal" className="block text-muted-foreground hover:text-primary transition-colors">
                Civic Portal
              </Link>
            </div>
          </div>

          {/* Services */}
          <div className="space-y-4">
            <h3 className="font-semibold">Services</h3>
            <div className="space-y-2 text-sm">
              <Link to="/marketplace" className="block text-muted-foreground hover:text-primary transition-colors">
                Marketplace
              </Link>
              <Link to="/companies" className="block text-muted-foreground hover:text-primary transition-colors">
                Companies
              </Link>
              <Link to="/billionaires" className="block text-muted-foreground hover:text-primary transition-colors">
                Billionaire Tracker
              </Link>
              <Link to="/national-debt" className="block text-muted-foreground hover:text-primary transition-colors">
                National Debt
              </Link>
              <Link to="/camerplay" className="block text-muted-foreground hover:text-primary transition-colors">
                CamerPlay Music
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