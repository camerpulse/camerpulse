import React from 'react';
import { AppLayout } from '@/components/Layout/AppLayout';
import CamerPlayHub from '@/components/camerplay/CamerPlayHub';

const CamerPlayHome = () => {
  return (
    <AppLayout>
      <CamerPlayHub />
    </AppLayout>
  );
};

export default CamerPlayHome;