import React, { useMemo } from "react";
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
  Home,
  ShoppingBag,
  TreePine,
  Crown,
  School,
  Stethoscope,
  Pill,
  Factory,
  UserCheck,
  Landmark,
  Scale,
  FileText,
  GraduationCap,
  Briefcase,
  Music,
  HelpCircle,
  Mail,
  Book,
  Lock,
  Gavel,
  Settings,
  BarChart3,
  Search,
  MessageCircle,
  Bell,
  Info
} from "lucide-react";

// Memoized footer sections configuration
const FOOTER_SECTIONS = [
  {
    id: 'platform',
    title: 'Platform',
    icon: Home,
    links: [
      { path: '/', label: 'Homepage', icon: Home },
      { path: '/about', label: 'About Us', icon: Info },
      { path: '/civic-dashboard', label: 'Civic Dashboard', icon: BarChart3 },
      { path: '/feed', label: 'Community Feed', icon: Users },
      { path: '/search', label: 'Advanced Search', icon: Search },
      { path: '/messages', label: 'Messaging Center', icon: MessageCircle },
      { path: '/notifications', label: 'Notifications', icon: Bell },
    ]
  },
  {
    id: 'directories',
    title: 'Directories',
    icon: Building,
    links: [
      { path: '/villages', label: 'Villages Directory', icon: TreePine },
      { path: '/fons', label: 'Royal Heritage (Fons)', icon: Crown },
      { path: '/schools', label: 'Schools', icon: School },
      { path: '/hospitals', label: 'Hospitals', icon: Stethoscope },
      { path: '/pharmacies', label: 'Pharmacies', icon: Pill },
      { path: '/companies', label: 'Companies', icon: Factory },
    ]
  },
  {
    id: 'political',
    title: 'Political & Civic',
    icon: Vote,
    links: [
      { path: '/politicians', label: 'Politicians', icon: UserCheck },
      { path: '/senators', label: 'Senators', icon: Landmark },
      { path: '/mps', label: 'MPs', icon: Scale },
      { path: '/ministers', label: 'Ministers', icon: Building },
      { path: '/political-parties', label: 'Political Parties', icon: Users },
      { path: '/polls', label: 'Polls & Surveys', icon: Vote },
      { path: '/petitions', label: 'Petitions', icon: FileText },
      { path: '/civic-education', label: 'Civic Education', icon: GraduationCap },
    ]
  },
  {
    id: 'community',
    title: 'Community & Services',
    icon: ShoppingBag,
    links: [
      { path: '/jobs', label: 'Jobs Portal', icon: Briefcase },
      { path: '/marketplace', label: 'Marketplace', icon: ShoppingBag },
      { path: '/music', label: 'Music Platform', icon: Music },
      { path: '/auth', label: 'Sign In / Register', icon: UserCheck },
      { path: '/help', label: 'Help Center', icon: HelpCircle },
      { path: '/contact', label: 'Contact Us', icon: Mail },
      { path: '/about', label: 'About', icon: Book },
    ]
  }
] as const;

const SOCIAL_LINKS = [
  { href: "https://facebook.com/camerpulse", icon: Facebook, label: "Follow us on Facebook" },
  { href: "https://twitter.com/camerpulse", icon: Twitter, label: "Follow us on Twitter" },
  { href: "https://instagram.com/camerpulse", icon: Instagram, label: "Follow us on Instagram" },
  { href: "https://github.com/camerpulse", icon: Github, label: "View our code on GitHub" },
] as const;

const LEGAL_LINKS = [
  { path: '/privacy', label: 'Privacy Policy', icon: Lock },
  { path: '/terms', label: 'Terms of Service', icon: Gavel },
  { path: '/cookies', label: 'Cookie Policy', icon: Settings },
] as const;

/**
 * Optimized Footer Component
 * 
 * Performance improvements:
 * - Memoized sections and links
 * - Reduced component re-renders
 * - Optimized for mobile and desktop
 */
export const OptimizedFooter: React.FC = React.memo(() => {
  // Memoized footer sections with plain paths
  const footerSections = useMemo(() => 
    FOOTER_SECTIONS.map(section => ({
      ...section,
      links: section.links.map(link => ({
        ...link,
        localizedPath: link.path
      }))
    })), []
  );

  // Memoized legal links with plain paths
  const legalLinks = useMemo(() => 
    LEGAL_LINKS.map(link => ({
      ...link,
      localizedPath: link.path
    })), []
  );

  return (
    <footer className="bg-gradient-to-br from-muted/30 to-background mt-16 py-12 px-4 border-t border-border/50">
      <div className="container mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-8">
          {/* Brand Section */}
          <BrandSection />

          {/* Footer Sections */}
          {footerSections.map((section) => (
            <FooterSection 
              key={section.id}
              section={section}
            />
          ))}
        </div>

        {/* Bottom Section */}
        <div className="border-t mt-8 pt-8">
          <LegalLinksSection links={legalLinks} />
          <BottomCopyright />
        </div>
      </div>
    </footer>
  );
});

OptimizedFooter.displayName = 'OptimizedFooter';

// Memoized sub-components
const BrandSection: React.FC = React.memo(() => (
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
      {SOCIAL_LINKS.map(({ href, icon: Icon, label }) => (
        <a 
          key={href}
          href={href} 
          target="_blank" 
          rel="noopener noreferrer" 
          className="text-muted-foreground hover:text-primary transition-colors" 
          aria-label={label}
        >
          <Icon className="w-5 h-5" />
        </a>
      ))}
    </div>
  </div>
));

BrandSection.displayName = 'BrandSection';

const FooterSection: React.FC<{
  section: {
    id: string;
    title: string;
    icon: React.ComponentType<{ className?: string }>;
    links: Array<{
      path: string;
      label: string;
      icon: React.ComponentType<{ className?: string }>;
      localizedPath: string;
    }>;
  };
}> = React.memo(({ section }) => {
  const { title, icon: SectionIcon, links } = section;
  
  return (
    <div className="space-y-4">
      <h3 className="font-semibold flex items-center gap-2">
        <SectionIcon className="w-4 h-4 text-primary" />
        {title}
      </h3>
      <div className="space-y-2 text-sm">
        {links.map(({ localizedPath, label, icon: LinkIcon }) => (
          <Link 
            key={localizedPath}
            to={localizedPath} 
            className="flex items-center gap-2 text-muted-foreground hover:text-primary transition-colors"
          >
            <LinkIcon className="w-3 h-3" />
            {label}
          </Link>
        ))}
      </div>
    </div>
  );
});

FooterSection.displayName = 'FooterSection';

const LegalLinksSection: React.FC<{
  links: Array<{
    localizedPath: string;
    label: string;
    icon: React.ComponentType<{ className?: string }>;
  }>;
}> = React.memo(({ links }) => (
  <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-4">
    <div className="flex flex-col sm:flex-row gap-4 text-sm">
      {links.map(({ localizedPath, label, icon: Icon }) => (
        <Link 
          key={localizedPath}
          to={localizedPath} 
          className="flex items-center gap-2 text-muted-foreground hover:text-primary transition-colors"
        >
          <Icon className="w-3 h-3" />
          {label}
        </Link>
      ))}
    </div>
  </div>
));

LegalLinksSection.displayName = 'LegalLinksSection';

const BottomCopyright: React.FC = React.memo(() => (
  <div className="flex flex-col md:flex-row justify-between items-center gap-4">
    <p className="text-sm text-muted-foreground">
      © {new Date().getFullYear()} CamerPulse. All rights reserved.
    </p>
    <div className="flex items-center gap-2 text-sm text-muted-foreground">
      <span>Made with</span>
      <Heart className="w-4 h-4 text-red-500" />
      <span>for Cameroonian civic engagement</span>
    </div>
  </div>
));

BottomCopyright.displayName = 'BottomCopyright';