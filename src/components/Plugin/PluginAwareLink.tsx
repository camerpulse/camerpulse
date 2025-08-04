import React from 'react';
import { Link } from 'react-router-dom';
import { usePlugin } from '@/contexts/PluginContext';

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

  // If plugins are loading, show the children to prevent homepage being stuck
  if (isLoading) {
    return (
      <Link to={to} className={className}>
        {children}
      </Link>
    );
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