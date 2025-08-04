import React, { useEffect, useState } from 'react';
import { loadImageFromUrl, removeBackground } from '@/utils/backgroundRemoval';

interface VillageAfricanMaskBackgroundProps {
  className?: string;
}

export const VillageAfricanMaskBackground: React.FC<VillageAfricanMaskBackgroundProps> = ({ 
  className = '' 
}) => {
  const [backgroundImageUrl, setBackgroundImageUrl] = useState<string>('');
  const [isProcessing, setIsProcessing] = useState(false);

  useEffect(() => {
    const processAfricanMasksImage = async () => {
      try {
        setIsProcessing(true);
        
        // Load the uploaded African masks image
        const originalImage = await loadImageFromUrl('/lovable-uploads/281a1c10-584a-4118-aff9-8e4e6230a604.png');
        
        // Remove background
        const processedBlob = await removeBackground(originalImage);
        
        // Create object URL for the processed image
        const processedUrl = URL.createObjectURL(processedBlob);
        setBackgroundImageUrl(processedUrl);
        
        console.log('African masks background processed successfully');
      } catch (error) {
        console.error('Error processing African masks background:', error);
        // Fallback to original image with some transparency
        setBackgroundImageUrl('/lovable-uploads/281a1c10-584a-4118-aff9-8e4e6230a604.png');
      } finally {
        setIsProcessing(false);
      }
    };

    processAfricanMasksImage();

    // Cleanup function
    return () => {
      if (backgroundImageUrl && backgroundImageUrl.startsWith('blob:')) {
        URL.revokeObjectURL(backgroundImageUrl);
      }
    };
  }, []);

  if (isProcessing) {
    return (
      <div className={`absolute inset-0 ${className}`}>
        {/* Loading placeholder with subtle pattern */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute inset-0 bg-[url('data:image/svg+xml;charset=utf-8,%3Csvg%20width%3D%22120%22%20height%3D%22120%22%20viewBox%3D%220%200%20120%20120%22%20xmlns%3D%22http%3A//www.w3.org/2000/svg%22%3E%3Cdefs%3E%3Cpattern%20id%3D%22mask-pattern%22%20x%3D%220%22%20y%3D%220%22%20width%3D%22120%22%20height%3D%22120%22%20patternUnits%3D%22userSpaceOnUse%22%3E%3Cg%20fill%3D%22%23000000%22%20fill-opacity%3D%220.3%22%3E%3Cellipse%20cx%3D%2260%22%20cy%3D%2240%22%20rx%3D%2225%22%20ry%3D%2235%22/%3E%3Cpolygon%20points%3D%2260%2C75%2040%2C85%2080%2C85%22/%3E%3Crect%20x%3D%2250%22%20y%3D%2220%22%20width%3D%2220%22%20height%3D%2210%22%20rx%3D%225%22/%3E%3Ccircle%20cx%3D%2250%22%20cy%3D%2235%22%20r%3D%223%22/%3E%3Ccircle%20cx%3D%2270%22%20cy%3D%2235%22%20r%3D%223%22/%3E%3Cpath%20d%3D%22M45%2050%20Q60%2060%2075%2050%22%20stroke%3D%22%23000%22%20stroke-width%3D%222%22%20fill%3D%22none%22/%3E%3C/g%3E%3C/pattern%3E%3C/defs%3E%3Crect%20width%3D%22100%25%22%20height%3D%22100%25%22%20fill%3D%22url(%23mask-pattern)%22/%3E%3C/svg%3E')]"></div>
        </div>
      </div>
    );
  }

  if (!backgroundImageUrl) {
    return null;
  }

  return (
    <div 
      className={`absolute inset-0 bg-no-repeat bg-center bg-contain opacity-15 ${className}`}
      style={{
        backgroundImage: `url(${backgroundImageUrl})`,
        backgroundSize: 'cover',
        filter: 'brightness(0.7) contrast(1.2)',
      }}
    />
  );
};