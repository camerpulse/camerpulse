import React from 'react';
import { Link } from 'react-router-dom';
import { usePlugin } from '@/contexts/PluginContext';
import { useFeatureFlags } from '@/hooks/useFeatureFlags';

interface PluginAwareLinkProps {
  pluginName: string;
  to: string;
  children: React.ReactNode;
  className?: string;
  fallback?: React.ReactNode;
}

export function PluginAwareLink({ 
  pluginName, 
  to, 
  children, 
  className,
  fallback = null 
}: PluginAwareLinkProps) {
  const { isPluginEnabled, isLoading } = usePlugin();
  const { isPluginInstallationDisabled, loading: flagsLoading } = useFeatureFlags();

  // If plugins or flags are loading, show the children to prevent homepage being stuck
  if (isLoading || flagsLoading) {
    return (
      <Link to={to} className={className}>
        {children}
      </Link>
    );
  }

  // If plugin installation is disabled system-wide, hide all plugin links
  if (isPluginInstallationDisabled()) {
    return fallback;
  }

  if (!isPluginEnabled(pluginName)) {
    return fallback;
  }

  return (
    <Link to={to} className={className}>
      {children}
    </Link>
  );
}