import React from 'react';
import { format } from 'date-fns';
import { Calendar, Award, CheckCircle } from 'lucide-react';

interface CertificateData {
  id: string;
  certificate_title: string;
  recipient_name: string;
  recipient_role: string;
  event_name: string;
  event_date: string;
  organizer_name: string;
  organizer_signature_url?: string;
  verification_code: string;
  template_design: 'modern' | 'classic' | 'official';
  custom_text?: string;
}

interface CertificateTemplateProps {
  certificate: CertificateData;
  isPreview?: boolean;
  className?: string;
}

export const CertificateTemplate: React.FC<CertificateTemplateProps> = ({
  certificate,
  isPreview = false,
  className = ""
}) => {
  const getTemplateStyles = () => {
    switch (certificate.template_design) {
      case 'modern':
        return {
          container: "bg-gradient-to-br from-green-50 to-green-100 border-2 border-green-500",
          header: "text-green-700",
          accent: "text-green-600",
          border: "border-green-500"
        };
      case 'classic':
        return {
          container: "bg-gradient-to-br from-gray-50 to-gray-100 border-4 border-gray-800",
          header: "text-gray-800",
          accent: "text-gray-600",
          border: "border-gray-800"
        };
      case 'official':
        return {
          container: "bg-gradient-to-br from-red-50 to-red-100 border-4 border-red-600",
          header: "text-red-800",
          accent: "text-red-600",
          border: "border-red-600"
        };
      default:
        return {
          container: "bg-white border-2 border-primary",
          header: "text-primary",
          accent: "text-secondary",
          border: "border-primary"
        };
    }
  };

  const styles = getTemplateStyles();
  const baseSize = isPreview ? 'scale-50' : 'scale-100';

  return (
    <div className={`${baseSize} transform origin-top-left ${className}`}>
      <div className={`
        relative w-[800px] h-[600px] p-12 mx-auto
        ${styles.container}
        shadow-2xl rounded-lg
        font-serif
      `}>
        {/* Decorative Border */}
        <div className={`absolute inset-4 ${styles.border} border-2 rounded-lg opacity-20`} />
        
        {/* Header */}
        <div className="text-center mb-8">
          <div className={`flex justify-center items-center gap-2 mb-4 ${styles.header}`}>
            <Award className="w-8 h-8" />
            <h1 className="text-3xl font-bold">CERTIFICATE</h1>
            <Award className="w-8 h-8" />
          </div>
          <div className={`text-lg ${styles.accent}`}>
            {certificate.certificate_title || "Certificate of Achievement"}
          </div>
        </div>

        {/* Content */}
        <div className="text-center space-y-6">
          <div className="text-lg text-gray-700">
            This is to certify that
          </div>
          
          <div className={`text-4xl font-bold ${styles.header} border-b-2 ${styles.border} pb-2 mx-16`}>
            {certificate.recipient_name || "Recipient Name"}
          </div>
          
          <div className="text-lg text-gray-700">
            has successfully participated as{" "}
            <span className={`font-semibold ${styles.accent}`}>
              {certificate.recipient_role || "Participant"}
            </span>
            {" "}in
          </div>
          
          <div className={`text-2xl font-bold ${styles.header} mx-8`}>
            {certificate.event_name || "Event Name"}
          </div>
          
          {certificate.custom_text && (
            <div className="text-base text-gray-600 italic mx-12">
              {certificate.custom_text}
            </div>
          )}
          
          <div className="flex justify-center items-center gap-2 text-gray-600">
            <Calendar className="w-4 h-4" />
            <span>
              {certificate.event_date ? format(new Date(certificate.event_date), 'MMMM dd, yyyy') : 'Event Date'}
            </span>
          </div>
        </div>

        {/* Footer */}
        <div className="absolute bottom-12 left-12 right-12 flex justify-between items-end">
          <div className="text-center">
            <div className={`border-t-2 ${styles.border} pt-2 px-8`}>
              <div className="text-sm text-gray-600">Organizer</div>
              <div className={`font-semibold ${styles.accent}`}>
                {certificate.organizer_name || "CamerPulse"}
              </div>
            </div>
            {certificate.organizer_signature_url && (
              <img 
                src={certificate.organizer_signature_url} 
                alt="Signature" 
                className="h-8 mt-2 mx-auto"
              />
            )}
          </div>
          
          <div className="text-center">
            <div className={`flex items-center gap-1 text-sm ${styles.accent}`}>
              <CheckCircle className="w-4 h-4" />
              <span>Verified</span>
            </div>
            <div className="text-xs text-gray-500 mt-1">
              {certificate.verification_code}
            </div>
          </div>
        </div>

        {/* CamerPulse Branding */}
        <div className="absolute top-4 right-4 opacity-30">
          <div className="text-xs text-gray-500">
            Powered by CamerPulse
          </div>
        </div>
      </div>
    </div>
  );
};