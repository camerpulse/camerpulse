import { Link, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { URLBuilder } from '@/utils/slugUtils';
import { useLanguage } from '@/contexts/LanguageContext';
import { 
  School, 
  Building2, 
  Pill, 
  MapPin, 
  Shield, 
  Star,
  Plus,
  Search
} from "lucide-react";

export const DirectoryNavigation = () => {
  const location = useLocation();
  const { getLocalizedPath } = useLanguage();

  const navigationItems = [
    {
      name: "Schools",
      href: URLBuilder.institutions.schools.list(),
      icon: School,
      description: "Educational institutions"
    },
    {
      name: "Hospitals", 
      href: URLBuilder.institutions.hospitals.list(),
      icon: Building2,
      description: "Healthcare facilities"
    },
    {
      name: "Pharmacies",
      href: URLBuilder.institutions.pharmacies.list(), 
      icon: Pill,
      description: "Medicine & health services"
    },
    {
      name: "Villages",
      href: URLBuilder.villages.list(),
      icon: MapPin,
      description: "Community directories"
    }
  ];

  const adminItems = [
    {
      name: "Moderation",
      href: getLocalizedPath('/admin/moderation'),
      icon: Shield,
      description: "Review & verify institutions"
    },
    {
      name: "Sponsored Listings",
      href: getLocalizedPath('/admin/sponsored'),
      icon: Star,
      description: "Manage promoted content"
    }
  ];

  const isActive = (href: string) => location.pathname === href;

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 to-blue-100 p-6">
      <div className="max-w-6xl mx-auto space-y-8">
        {/* Header */}
        <div className="text-center space-y-4">
          <h1 className="text-4xl font-bold text-gray-900">CamerPulse Directory</h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Discover and rate institutions across Cameroon. Find schools, hospitals, pharmacies, and villages in your area.
          </p>
        </div>

        {/* Main Directory Categories */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {navigationItems.map((item) => (
            <Link key={item.name} to={item.href}>
              <div className={`
                p-6 bg-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 
                border-2 hover:border-blue-300 group cursor-pointer
                ${isActive(item.href) ? 'border-blue-500 bg-blue-50' : 'border-gray-200'}
              `}>
                <div className="flex items-center gap-4 mb-3">
                  <div className={`
                    p-3 rounded-lg transition-colors
                    ${isActive(item.href) 
                      ? 'bg-blue-100 text-blue-600' 
                      : 'bg-gray-100 text-gray-600 group-hover:bg-blue-100 group-hover:text-blue-600'
                    }
                  `}>
                    <item.icon className="h-6 w-6" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-lg text-gray-900">{item.name}</h3>
                    <p className="text-sm text-gray-600">{item.description}</p>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-blue-600 font-medium">Explore →</span>
                </div>
              </div>
            </Link>
          ))}
        </div>

        {/* Quick Actions */}
        <div className="bg-white rounded-xl shadow-lg p-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Quick Actions</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Link to={getLocalizedPath('/directory/claim')}>
              <Button className="w-full h-16 bg-green-600 hover:bg-green-700 text-left justify-start">
                <Plus className="h-5 w-5 mr-3" />
                <div>
                  <div className="font-medium">Claim Institution</div>
                  <div className="text-sm opacity-90">Manage your listing</div>
                </div>
              </Button>
            </Link>
            
            <Link to={getLocalizedPath('/directory/search')}>
              <Button className="w-full h-16 bg-blue-600 hover:bg-blue-700 text-left justify-start">
                <Search className="h-5 w-5 mr-3" />
                <div>
                  <div className="font-medium">Search All</div>
                  <div className="text-sm opacity-90">Find any institution</div>
                </div>
              </Button>
            </Link>

            <Link to={getLocalizedPath('/admin/sponsored')}>
              <Button className="w-full h-16 bg-purple-600 hover:bg-purple-700 text-left justify-start">
                <Star className="h-5 w-5 mr-3" />
                <div>
                  <div className="font-medium">Promote Listing</div>
                  <div className="text-sm opacity-90">Boost visibility</div>
                </div>
              </Button>
            </Link>
          </div>
        </div>

        {/* Admin Section (conditionally shown) */}
        <div className="bg-white rounded-xl shadow-lg p-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Administration</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {adminItems.map((item) => (
              <Link key={item.name} to={item.href}>
                <div className={`
                  p-4 rounded-lg border-2 hover:border-blue-300 transition-all duration-300 group
                  ${isActive(item.href) ? 'border-blue-500 bg-blue-50' : 'border-gray-200 hover:bg-gray-50'}
                `}>
                  <div className="flex items-center gap-3">
                    <div className={`
                      p-2 rounded-lg
                      ${isActive(item.href) 
                        ? 'bg-blue-100 text-blue-600' 
                        : 'bg-gray-100 text-gray-600 group-hover:bg-blue-100 group-hover:text-blue-600'
                      }
                    `}>
                      <item.icon className="h-5 w-5" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900">{item.name}</h3>
                      <p className="text-sm text-gray-600">{item.description}</p>
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-white rounded-lg p-4 text-center shadow">
            <div className="text-2xl font-bold text-blue-600">250+</div>
            <div className="text-sm text-gray-600">Schools Listed</div>
          </div>
          <div className="bg-white rounded-lg p-4 text-center shadow">
            <div className="text-2xl font-bold text-green-600">120+</div>
            <div className="text-sm text-gray-600">Hospitals</div>
          </div>
          <div className="bg-white rounded-lg p-4 text-center shadow">
            <div className="text-2xl font-bold text-purple-600">80+</div>
            <div className="text-sm text-gray-600">Pharmacies</div>
          </div>
          <div className="bg-white rounded-lg p-4 text-center shadow">
            <div className="text-2xl font-bold text-orange-600">500+</div>
            <div className="text-sm text-gray-600">Villages</div>
          </div>
        </div>
      </div>
    </div>
  );
};