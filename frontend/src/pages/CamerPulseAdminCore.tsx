import React, { useEffect } from 'react';
import { AdminCoreV2 } from '@/components/Admin/AdminCoreV2/AdminCoreV2';

const CamerPulseAdminCore = () => {
  // Set welcome as default if coming from main admin
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get('welcome') === 'true') {
      // AdminCoreV2 will handle this internally
    }
  }, []);

  return <AdminCoreV2 />;
};

export default CamerPulseAdminCore;