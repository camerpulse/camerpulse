import React, { useEffect } from 'react';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import { usePanAfricaFeatures } from '@/hooks/usePanAfricaConfig';
import { usePanAfrica } from '@/contexts/PanAfricaContext';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertTriangle } from 'lucide-react';

interface DynamicCountryRouterProps {
  children: React.ReactNode;
}

// Component to handle dynamic country routing /camerpulse/:countryCode
const DynamicCountryRouter: React.FC<DynamicCountryRouterProps> = ({ children }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { setSelectedCountry } = usePanAfrica();
  const { 
    isPanAfricaEnabled, 
    isCountryRoutingEnabled, 
    enabledCountries, 
    defaultCountry 
  } = usePanAfricaFeatures();

  useEffect(() => {
    if (!isPanAfricaEnabled || !isCountryRoutingEnabled) {
      return;
    }

    // Extract country code from URL path
    const pathMatch = location.pathname.match(/\/camerpulse\/([a-z]{2})/i);
    
    if (pathMatch && pathMatch[1]) {
      const countryCode = pathMatch[1].toUpperCase();
      
      // Check if country is enabled
      if (enabledCountries.includes(countryCode)) {
        setSelectedCountry(countryCode);
      } else {
        // Redirect to default country if invalid country code
        navigate(`/camerpulse/${defaultCountry.toLowerCase()}`, { replace: true });
      }
    } else if (location.pathname === '/camerpulse-intelligence') {
      // Redirect base path to default country
      navigate(`/camerpulse/${defaultCountry.toLowerCase()}`, { replace: true });
    }
  }, [location.pathname, isPanAfricaEnabled, isCountryRoutingEnabled, enabledCountries, defaultCountry, setSelectedCountry, navigate]);

  // Show warning if Pan-African mode is disabled
  if (!isPanAfricaEnabled) {
    return (
      <div className="p-6">
        <Alert className="border-yellow-200 bg-yellow-50">
          <AlertTriangle className="h-4 w-4 text-yellow-600" />
          <AlertDescription className="text-yellow-800">
            <strong>Pan-African Mode Disabled:</strong> This system is currently operating in Cameroon-only mode. 
            Contact your administrator to enable multi-country intelligence.
          </AlertDescription>
        </Alert>
        {children}
      </div>
    );
  }

  return <>{children}</>;
};

export default DynamicCountryRouter;