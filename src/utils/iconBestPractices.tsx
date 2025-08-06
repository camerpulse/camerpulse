import React from 'react';
import { LucideProps } from 'lucide-react';
import * as Icons from 'lucide-react';

/**
 * Best Practices for Lucide React Icons
 * Provides type-safe icon components and dynamic icon loading
 */

// Type-safe icon name mapping
export type IconName = keyof typeof Icons;

// Helper type for icon components
export type LucideIcon = React.ForwardRefExoticComponent<
  Omit<LucideProps, "ref"> & React.RefAttributes<SVGSVGElement>
>;

/**
 * Dynamic Icon Component - Type Safe Approach
 * Use this instead of accessing icons array directly
 */
interface DynamicIconProps extends Omit<LucideProps, 'ref'> {
  name: IconName;
  fallback?: LucideIcon;
}

export const DynamicIcon: React.FC<DynamicIconProps> = ({ 
  name, 
  fallback: FallbackIcon = Icons.HelpCircle,
  ...props 
}) => {
  // Type-safe icon access
  const IconComponent = Icons[name] as LucideIcon;
  
  // Validate the icon exists and is a valid component
  if (!IconComponent || typeof IconComponent !== 'function') {
    console.warn(`Icon "${name}" not found in lucide-react`);
    return <FallbackIcon {...props} />;
  }
  
  return <IconComponent {...props} />;
};

/**
 * Icon Mapping Helper - For when you need icon objects
 * This provides better type safety than raw object access
 */
export function getIconComponent(iconName: string): LucideIcon | null {
  // Type guard to ensure iconName is a valid key
  if (iconName in Icons) {
    const IconComponent = Icons[iconName as IconName] as LucideIcon;
    
    // Verify it's actually a component
    if (typeof IconComponent === 'function') {
      return IconComponent;
    }
  }
  
  console.warn(`Icon "${iconName}" not found or invalid`);
  return null;
}

/**
 * Safe Icon Renderer - For mapping over icon arrays
 */
interface SafeIconProps extends Omit<LucideProps, 'ref'> {
  iconName: string;
  fallback?: LucideIcon;
}

export const SafeIcon: React.FC<SafeIconProps> = ({
  iconName,
  fallback: FallbackIcon = Icons.Square,
  ...props
}) => {
  const IconComponent = getIconComponent(iconName);
  
  if (!IconComponent) {
    return <FallbackIcon {...props} />;
  }
  
  return <IconComponent {...props} />;
};

/**
 * Common Icon Sets - Pre-defined type-safe collections
 */
export const CommonIcons = {
  // Navigation
  navigation: {
    home: Icons.Home,
    search: Icons.Search,
    settings: Icons.Settings,
    user: Icons.User,
    menu: Icons.Menu,
    close: Icons.X,
  },
  
  // Actions
  actions: {
    edit: Icons.Edit,
    delete: Icons.Trash2,
    save: Icons.Save,
    cancel: Icons.X,
    confirm: Icons.Check,
    add: Icons.Plus,
  },
  
  // Status
  status: {
    success: Icons.CheckCircle,
    error: Icons.XCircle,
    warning: Icons.AlertTriangle,
    info: Icons.Info,
    loading: Icons.Loader,
  },
  
  // Social/Platform
  social: {
    facebook: Icons.Facebook,
    twitter: Icons.Twitter,
    linkedin: Icons.Linkedin,
    instagram: Icons.Instagram,
    youtube: Icons.Youtube,
    github: Icons.Github,
  },
  
  // Civic/Government
  civic: {
    government: Icons.Building2,
    politics: Icons.Users,
    voting: Icons.CheckSquare,
    petition: Icons.FileText,
    law: Icons.Scale,
    courthouse: Icons.Landmark,
  }
} as const;

/**
 * Institution Type Icons - Type-safe mapping
 */
export const InstitutionIcons = {
  hospital: Icons.Hospital,
  school: Icons.GraduationCap,
  pharmacy: Icons.Pill,
  government: Icons.Building2,
  police: Icons.Shield,
  court: Icons.Landmark,
} as const;

/**
 * Platform Icons - For external platforms
 */
export const PlatformIcons = {
  twitter: Icons.Twitter,
  facebook: Icons.Facebook,
  instagram: Icons.Instagram,
  linkedin: Icons.Linkedin,
  youtube: Icons.Youtube,
  tiktok: Icons.Music, // TikTok icon not in lucide, use music as fallback
  whatsapp: Icons.MessageCircle,
  telegram: Icons.Send,
} as const;

/**
 * Validation helper for icon names
 */
export function isValidIconName(name: string): name is IconName {
  return name in Icons;
}

/**
 * Get icon with fallback
 */
export function getIconWithFallback(
  iconName: string, 
  fallback: LucideIcon = Icons.Square
): LucideIcon {
  return getIconComponent(iconName) || fallback;
}

export default {
  DynamicIcon,
  SafeIcon,
  getIconComponent,
  getIconWithFallback,
  CommonIcons,
  InstitutionIcons,
  PlatformIcons,
  isValidIconName
};