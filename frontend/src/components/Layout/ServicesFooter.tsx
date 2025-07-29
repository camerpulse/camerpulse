import { Link } from 'react-router-dom';
import { Building2, GraduationCap, Hospital, Pill, MapPin, Search, Home } from 'lucide-react';

interface ServicesFooterProps {
  serviceType: 'villages' | 'hospitals' | 'schools' | 'pharmacies';
}

const serviceConfig = {
  villages: {
    icon: Building2,
    name: 'Villages Directory',
    color: 'text-green-600',
    description: 'Discover and connect with villages across Cameroon.',
    links: [
      { to: '/villages', label: 'Browse Villages', icon: Building2 },
      { to: '/villages/add', label: 'Add Village', icon: MapPin },
      { to: '/villages/leaderboards', label: 'Leaderboards', icon: Search }
    ]
  },
  hospitals: {
    icon: Hospital,
    name: 'Hospitals Directory',
    color: 'text-red-600',
    description: 'Find healthcare facilities and medical services.',
    links: [
      { to: '/hospitals', label: 'Browse Hospitals', icon: Hospital },
      { to: '/map', label: 'Map View', icon: MapPin },
      { to: '/services-search', label: 'Search Services', icon: Search }
    ]
  },
  schools: {
    icon: GraduationCap,
    name: 'Schools Directory',
    color: 'text-blue-600',
    description: 'Explore educational institutions and opportunities.',
    links: [
      { to: '/schools', label: 'Browse Schools', icon: GraduationCap },
      { to: '/map', label: 'Map View', icon: MapPin },
      { to: '/services-search', label: 'Search Schools', icon: Search }
    ]
  },
  pharmacies: {
    icon: Pill,
    name: 'Pharmacies Directory',
    color: 'text-purple-600',
    description: 'Locate pharmacies and pharmaceutical services.',
    links: [
      { to: '/pharmacies', label: 'Browse Pharmacies', icon: Pill },
      { to: '/map', label: 'Map View', icon: MapPin },
      { to: '/services-search', label: 'Search Pharmacies', icon: Search }
    ]
  }
};

export const ServicesFooter = ({ serviceType }: ServicesFooterProps) => {
  const config = serviceConfig[serviceType];
  const IconComponent = config.icon;

  return (
    <footer className="border-t bg-background">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand Section */}
          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <IconComponent className={`h-6 w-6 ${config.color}`} />
              <span className="font-bold text-xl">{config.name}</span>
            </div>
            <p className="text-sm text-muted-foreground">
              {config.description}
            </p>
          </div>

          {/* Service Links */}
          <div className="space-y-4">
            <h3 className="font-semibold">Browse & Search</h3>
            <ul className="space-y-2 text-sm">
              {config.links.map((link) => {
                const LinkIcon = link.icon;
                return (
                  <li key={link.to}>
                    <Link to={link.to} className="text-muted-foreground hover:text-primary flex items-center">
                      <LinkIcon className="mr-2 h-4 w-4" />
                      {link.label}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </div>

          {/* Other Services */}
          <div className="space-y-4">
            <h3 className="font-semibold">Other Services</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link to="/villages" className="text-muted-foreground hover:text-primary flex items-center">
                  <Building2 className="mr-2 h-4 w-4" />
                  Villages
                </Link>
              </li>
              <li>
                <Link to="/hospitals" className="text-muted-foreground hover:text-primary flex items-center">
                  <Hospital className="mr-2 h-4 w-4" />
                  Hospitals
                </Link>
              </li>
              <li>
                <Link to="/schools" className="text-muted-foreground hover:text-primary flex items-center">
                  <GraduationCap className="mr-2 h-4 w-4" />
                  Schools
                </Link>
              </li>
              <li>
                <Link to="/pharmacies" className="text-muted-foreground hover:text-primary flex items-center">
                  <Pill className="mr-2 h-4 w-4" />
                  Pharmacies
                </Link>
              </li>
            </ul>
          </div>

          {/* Navigation */}
          <div className="space-y-4">
            <h3 className="font-semibold">Navigation</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link to="/" className="text-muted-foreground hover:text-primary flex items-center">
                  <Home className="mr-2 h-4 w-4" />
                  CamerPulse Home
                </Link>
              </li>
              <li>
                <Link to="/map" className="text-muted-foreground hover:text-primary flex items-center">
                  <MapPin className="mr-2 h-4 w-4" />
                  Interactive Map
                </Link>
              </li>
              <li>
                <Link to="/services-search" className="text-muted-foreground hover:text-primary flex items-center">
                  <Search className="mr-2 h-4 w-4" />
                  Unified Search
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-8 border-t pt-8 flex flex-col md:flex-row justify-between items-center">
          <p className="text-sm text-muted-foreground">
            © 2024 {config.name}. Part of the CamerPulse ecosystem.
          </p>
          <div className="flex space-x-4 mt-4 md:mt-0">
            <Link to="/" className="text-sm text-muted-foreground hover:text-primary">
              Back to CamerPulse
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
};
