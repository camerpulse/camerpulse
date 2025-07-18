import React from 'react';
import { AppLayout } from '@/components/Layout/AppLayout';
import { CertificateVerification } from '@/components/certificates/CertificateVerification';

const CertificateVerificationPage = () => {
  return (
    <AppLayout>
      <div className="container mx-auto px-4 py-8">
        <CertificateVerification />
      </div>
    </AppLayout>
  );
};

export default CertificateVerificationPage;