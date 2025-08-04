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
  const { isPluginEnabled } = usePlugin();

  if (!isPluginEnabled(pluginName)) {
    return fallback;
  }

  return (
    <Link to={to} className={className}>
      {children}
    </Link>
  );
}