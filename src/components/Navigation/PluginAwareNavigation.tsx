import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { usePluginAccess } from '@/hooks/usePluginSystem';
import { cn } from '@/lib/utils';

interface NavigationItem {
  label: string;
  href: string;
  pluginName?: string;
  icon?: React.ComponentType<any>;
  badge?: string;
  external?: boolean;
}

interface PluginAwareNavigationProps {
  items: NavigationItem[];
  className?: string;
  orientation?: 'horizontal' | 'vertical';
}

/**
 * Navigation component that automatically hides links based on plugin status
 */
export const PluginAwareNavigation: React.FC<PluginAwareNavigationProps> = ({
  items,
  className,
  orientation = 'horizontal'
}) => {
  const location = useLocation();

  return (
    <nav className={cn(
      "flex gap-2",
      orientation === 'vertical' ? 'flex-col' : 'flex-row',
      className
    )}>
      {items.map((item) => (
        <PluginAwareNavItem
          key={item.href}
          item={item}
          isActive={location.pathname === item.href}
          orientation={orientation}
        />
      ))}
    </nav>
  );
};

interface PluginAwareNavItemProps {
  item: NavigationItem;
  isActive: boolean;
  orientation: 'horizontal' | 'vertical';
}

const PluginAwareNavItem: React.FC<PluginAwareNavItemProps> = ({
  item,
  isActive,
  orientation
}) => {
  const { data: hasAccess, isLoading } = usePluginAccess(
    item.pluginName || 'always-enabled'
  );

  // If plugin check is loading, show nothing
  if (isLoading) return null;

  // If plugin is disabled, hide the nav item completely
  if (item.pluginName && !hasAccess) return null;

  const ItemContent = () => (
    <>
      {item.icon && <item.icon className="h-4 w-4" />}
      <span>{item.label}</span>
      {item.badge && (
        <Badge variant="secondary" className="ml-2 text-xs">
          {item.badge}
        </Badge>
      )}
    </>
  );

  if (item.external) {
    return (
      <a
        href={item.href}
        target="_blank"
        rel="noopener noreferrer"
        className={cn(
          "flex items-center gap-2 px-3 py-2 rounded-md transition-colors",
          "hover:bg-muted text-muted-foreground hover:text-foreground",
          orientation === 'vertical' && "justify-start w-full"
        )}
      >
        <ItemContent />
      </a>
    );
  }

  return (
    <Button
      asChild
      variant={isActive ? "default" : "ghost"}
      size="sm"
      className={cn(
        "flex items-center gap-2",
        orientation === 'vertical' && "justify-start w-full"
      )}
    >
      <Link to={item.href}>
        <ItemContent />
      </Link>
    </Button>
  );
};

/**
 * Helper hook to filter navigation items based on plugin status
 */
export const usePluginFilteredNavigation = (items: NavigationItem[]) => {
  const [filteredItems, setFilteredItems] = React.useState<NavigationItem[]>([]);

  React.useEffect(() => {
    const checkPlugins = async () => {
      const validItems: NavigationItem[] = [];
      
      for (const item of items) {
        if (!item.pluginName) {
          // No plugin requirement, always include
          validItems.push(item);
        } else {
          // Check plugin status - this would need to be implemented
          // For now, include all items
          validItems.push(item);
        }
      }
      
      setFilteredItems(validItems);
    };

    checkPlugins();
  }, [items]);

  return filteredItems;
};

/**
 * Pre-configured navigation sets for different areas
 */
export const CORE_NAVIGATION: NavigationItem[] = [
  {
    label: "Feed",
    href: "/feed",
    pluginName: "CamerPulse.Core.CivicFeed"
  },
  {
    label: "Polls",
    href: "/polls",
    pluginName: "CamerPulse.Core.PollsSystem"
  },
  {
    label: "Politicians",
    href: "/politicians",
    pluginName: "CamerPulse.Core.PoliticiansParties"
  },
  {
    label: "Political Parties",
    href: "/political-parties",
    pluginName: "CamerPulse.Core.PoliticiansParties"
  }
];

export const GOVERNANCE_NAVIGATION: NavigationItem[] = [
  {
    label: "Projects",
    href: "/government-projects",
    pluginName: "CamerPulse.Governance.ProjectTracker"
  },
  {
    label: "Petitions",
    href: "/petitions",
    pluginName: "CamerPulse.Governance.PetitionsEngine"
  },
  {
    label: "Promises",
    href: "/promises",
    pluginName: "CamerPulse.Governance.ProjectTracker"
  }
];

export const ECONOMY_NAVIGATION: NavigationItem[] = [
  {
    label: "Companies",
    href: "/companies",
    pluginName: "CamerPulse.Economy.CompanyDirectory"
  },
  {
    label: "Marketplace",
    href: "/marketplace",
    pluginName: "CamerPulse.Economy.Marketplace"
  },
  {
    label: "Billionaires",
    href: "/billionaires",
    pluginName: "CamerPulse.Economy.BillionaireTracker"
  },
  {
    label: "National Debt",
    href: "/national-debt",
    pluginName: "CamerPulse.Economy.NationalDebtMonitor"
  }
];

export const ENTERTAINMENT_NAVIGATION: NavigationItem[] = [
  {
    label: "CamerPlay",
    href: "/camerplay",
    pluginName: "CamerPulse.Entertainment.CamerPlayMusic"
  },
  {
    label: "Events",
    href: "/events",
    pluginName: "CamerPulse.Entertainment.EventsCalendar"
  },
  {
    label: "Artist Portal",
    href: "/artist-landing",
    pluginName: "CamerPulse.Entertainment.ArtistEcosystem"
  }
];

export const DIRECTORY_NAVIGATION: NavigationItem[] = [
  {
    label: "Villages",
    href: "/villages",
    pluginName: "CamerPulse.Directories.VillagesDirectory"
  },
  {
    label: "Schools",
    href: "/schools",
    pluginName: "CamerPulse.Directories.SchoolDirectory"
  },
  {
    label: "Hospitals",
    href: "/hospitals",
    pluginName: "CamerPulse.Directories.HospitalDirectory"
  },
  {
    label: "Pharmacies",
    href: "/pharmacies",
    pluginName: "CamerPulse.Directories.PharmacyDirectory"
  }
];