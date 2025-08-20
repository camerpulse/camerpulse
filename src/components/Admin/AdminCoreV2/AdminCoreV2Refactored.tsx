import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { AdminCoreProvider, useAdminCore } from './core/AdminCoreProvider';
import { AdminLayout } from './layout/AdminLayout';
import { ModuleRenderer } from './components/ModuleRenderer';
import { getAllowedModules } from './config/adminModules';

const AdminCoreContent: React.FC = () => {
  const { hasPermission } = useAdminCore();
  const [activeModule, setActiveModule] = useState('dashboard');
  const location = useLocation();

  const adminModules = getAllowedModules(hasPermission);

  useEffect(() => {
    const path = location.pathname || '';
    if (path.startsWith('/admin/')) {
      const mod = path.split('/')[2];
      if (mod) {
        const exists = adminModules.find(m => m.id === mod);
        if (exists) setActiveModule(mod);
      }
    }
  }, [location.pathname, adminModules.length]);

  return (
    <AdminLayout>
      <ModuleRenderer 
        activeModule={activeModule} 
        setActiveModule={setActiveModule}
      />
    </AdminLayout>
  );
};

export const AdminCoreV2: React.FC = () => {
  return (
    <AdminCoreProvider>
      <AdminCoreContent />
    </AdminCoreProvider>
  );
};