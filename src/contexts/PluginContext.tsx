import React, { createContext, useContext, useEffect, useState } from 'react';
import { useEnabledPlugins, Plugin } from '@/hooks/usePluginSystem';

interface PluginContextType {
  enabledPlugins: Plugin[];
  isPluginEnabled: (pluginName: string) => boolean;
  getPluginConfig: (pluginName: string) => Record<string, any> | null;
  isLoading: boolean;
}

const PluginContext = createContext<PluginContextType | undefined>(undefined);

export const PluginProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { data: enabledPlugins = [], isLoading } = useEnabledPlugins();

  const isPluginEnabled = (pluginName: string): boolean => {
    return enabledPlugins.some(plugin => plugin.plugin_name === pluginName);
  };

  const getPluginConfig = (pluginName: string): Record<string, any> | null => {
    const plugin = enabledPlugins.find(p => p.plugin_name === pluginName);
    return plugin?.configuration || null;
  };

  const value: PluginContextType = {
    enabledPlugins,
    isPluginEnabled,
    getPluginConfig,
    isLoading
  };

  return (
    <PluginContext.Provider value={value}>
      {children}
    </PluginContext.Provider>
  );
};

export const usePlugin = () => {
  const context = useContext(PluginContext);
  if (context === undefined) {
    throw new Error('usePlugin must be used within a PluginProvider');
  }
  return context;
};

// Hook for conditional rendering based on plugin status
export const useConditionalPlugin = (pluginName: string) => {
  const { isPluginEnabled, getPluginConfig } = usePlugin();
  
  return {
    enabled: isPluginEnabled(pluginName),
    config: getPluginConfig(pluginName),
    render: (component: React.ReactNode) => isPluginEnabled(pluginName) ? component : null
  };
};