import React from 'react';
import { CamerPlayLayout } from '@/components/Layout/CamerPlayLayout';
import CamerPlayHub from '@/components/camerplay/CamerPlayHub';

const CamerPlayHome = () => {
  return (
    <CamerPlayLayout>
      <CamerPlayHub />
    </CamerPlayLayout>
  );
};

export default CamerPlayHome;