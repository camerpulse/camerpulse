import React from 'react';
import { AppLayout } from '@/components/Layout/AppLayout';
import { CamerPulseMasterCore } from '@/components/Integration/CamerPulseMasterCore';

const CamerPulseMaster = () => {
  return (
    <AppLayout showMobileNav={false}>
      <CamerPulseMasterCore />
    </AppLayout>
  );
};

export default CamerPulseMaster;