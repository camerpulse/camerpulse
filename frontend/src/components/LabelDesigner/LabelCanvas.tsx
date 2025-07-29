import React, { useRef, useEffect, useState } from 'react';
import { LabelField } from '@/types/labelTypes';
import { generateQRCode, generateBarcode, generateTrackingQRCode } from '@/utils/labelGeneration';

interface LabelCanvasProps {
  fields: LabelField[];
  dimensions: { width: number; height: number };
  selectedField: string | null;
  onFieldSelect: (fieldId: string | null) => void;
  onFieldUpdate: (fieldId: string, updates: Partial<LabelField>) => void;
  shipmentData?: any;
  mode?: 'design' | 'preview';
}

export const LabelCanvas: React.FC<LabelCanvasProps> = ({
  fields,
  dimensions,
  selectedField,
  onFieldSelect,
  onFieldUpdate,
  shipmentData,
  mode = 'design'
}) => {
  const canvasRef = useRef<HTMLDivElement>(null);
  const [dragging, setDragging] = useState<{ field: LabelField; offset: { x: number; y: number } } | null>(null);
  const [qrCodes, setQrCodes] = useState<{ [key: string]: string }>({});
  const [barcodes, setBarcodes] = useState<{ [key: string]: string }>({});

  // Generate QR codes and barcodes
  useEffect(() => {
    const generateCodes = async () => {
      const newQrCodes: { [key: string]: string } = {};
      const newBarcodes: { [key: string]: string } = {};

      for (const field of fields) {
        if (field.field_type === 'qr_code') {
          try {
            let qrData = 'Sample QR Data';
            if (shipmentData?.tracking_number) {
              qrData = await generateQRCode(
                shipmentData.tracking_number,
                { size: field.size.width }
              );
            } else {
              qrData = await generateQRCode('SAMPLE-TRACKING-123', { size: field.size.width });
            }
            newQrCodes[field.id] = qrData;
          } catch (error) {
            console.error('Error generating QR code:', error);
          }
        }

        if (field.field_type === 'barcode') {
          try {
            const barcodeData = shipmentData?.tracking_number || 'SAMPLE123';
            const barcodeImage = generateBarcode(barcodeData, {
              format: 'CODE128',
              width: 2,
              height: field.size.height,
              displayValue: true,
            });
            newBarcodes[field.id] = barcodeImage;
          } catch (error) {
            console.error('Error generating barcode:', error);
          }
        }
      }

      setQrCodes(newQrCodes);
      setBarcodes(newBarcodes);
    };

    generateCodes();
  }, [fields, shipmentData]);

  const handleMouseDown = (e: React.MouseEvent, field: LabelField) => {
    if (mode === 'preview') return;
    
    e.preventDefault();
    const rect = canvasRef.current?.getBoundingClientRect();
    if (!rect) return;

    const offset = {
      x: e.clientX - rect.left - field.position.x,
      y: e.clientY - rect.top - field.position.y,
    };

    setDragging({ field, offset });
    onFieldSelect(field.id);
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!dragging || mode === 'preview') return;

    const rect = canvasRef.current?.getBoundingClientRect();
    if (!rect) return;

    const newPosition = {
      x: Math.max(0, Math.min(dimensions.width - dragging.field.size.width, e.clientX - rect.left - dragging.offset.x)),
      y: Math.max(0, Math.min(dimensions.height - dragging.field.size.height, e.clientY - rect.top - dragging.offset.y)),
    };

    onFieldUpdate(dragging.field.id, { position: newPosition });
  };

  const handleMouseUp = () => {
    setDragging(null);
  };

  const renderField = (field: LabelField) => {
    const isSelected = selectedField === field.id;
    const style: React.CSSProperties = {
      position: 'absolute',
      left: field.position.x,
      top: field.position.y,
      width: field.size.width,
      height: field.size.height,
      border: mode === 'design' ? (isSelected ? '2px solid #3b82f6' : '1px dashed #9ca3af') : 'none',
      cursor: mode === 'design' ? 'move' : 'default',
      display: 'flex',
      alignItems: 'center',
      justifyContent: field.style?.textAlign === 'center' ? 'center' : field.style?.textAlign === 'right' ? 'flex-end' : 'flex-start',
      padding: '2px',
      boxSizing: 'border-box',
    };

    const textStyle: React.CSSProperties = {
      fontSize: field.style?.fontSize || 12,
      fontWeight: field.style?.fontWeight || 'normal',
      color: field.style?.color || '#000000',
      wordWrap: 'break-word',
      overflow: 'hidden',
      textAlign: (field.style?.textAlign as 'left' | 'center' | 'right') || 'left',
      lineHeight: 1.2,
    };

    let content: React.ReactNode = null;

    switch (field.field_type) {
      case 'text':
        content = (
          <div style={textStyle}>
            {getFieldData(field)}
          </div>
        );
        break;

      case 'qr_code':
        content = qrCodes[field.id] ? (
          <img 
            src={qrCodes[field.id]} 
            alt="QR Code" 
            style={{ width: '100%', height: '100%', objectFit: 'contain' }}
          />
        ) : (
          <div style={{ ...textStyle, fontSize: 10 }}>QR Code</div>
        );
        break;

      case 'barcode':
        content = barcodes[field.id] ? (
          <img 
            src={barcodes[field.id]} 
            alt="Barcode" 
            style={{ width: '100%', height: '100%', objectFit: 'contain' }}
          />
        ) : (
          <div style={{ ...textStyle, fontSize: 10 }}>Barcode</div>
        );
        break;

      case 'image':
        content = (
          <div style={{ ...textStyle, fontSize: 10, backgroundColor: '#f3f4f6' }}>
            Image Placeholder
          </div>
        );
        break;

      default:
        content = <div style={textStyle}>{field.label}</div>;
    }

    return (
      <div
        key={field.id}
        style={style}
        onMouseDown={(e) => handleMouseDown(e, field)}
        onClick={() => mode === 'design' && onFieldSelect(field.id)}
      >
        {content}
        {mode === 'design' && isSelected && (
          <div
            style={{
              position: 'absolute',
              top: -8,
              left: -1,
              fontSize: 10,
              backgroundColor: '#3b82f6',
              color: 'white',
              padding: '1px 4px',
              borderRadius: '2px',
              whiteSpace: 'nowrap',
              pointerEvents: 'none',
            }}
          >
            {field.label}
          </div>
        )}
      </div>
    );
  };

  const getFieldData = (field: LabelField): string => {
    if (!shipmentData) {
      return getSampleData(field.id);
    }

    switch (field.id) {
      case 'sender':
        return formatSenderInfo(shipmentData.sender);
      case 'receiver':
        return formatReceiverInfo(shipmentData.receiver);
      case 'tracking_number':
        return shipmentData.tracking_number || 'N/A';
      case 'service_level':
        return shipmentData.shipping?.service || 'Standard';
      case 'weight':
        return shipmentData.package?.weight || '0 kg';
      case 'description':
        return shipmentData.package?.description || 'Package';
      default:
        return field.default_value || field.label;
    }
  };

  const getSampleData = (fieldId: string): string => {
    switch (fieldId) {
      case 'sender':
        return 'CamerPulse Warehouse\nRue de la République\nDouala, Littoral\n+237-677-123-456';
      case 'receiver':
        return 'Marie Douala\n45 Avenue Kennedy\nYaoundé, Centre\n+237-690-987-654';
      case 'tracking_number':
        return 'TRK-20250128-DEMO001';
      case 'service_level':
        return 'Priority Express';
      case 'weight':
        return '2.5 kg';
      case 'description':
        return 'Sample Package';
      default:
        return 'Sample Text';
    }
  };

  const formatSenderInfo = (senderInfo: any): string => {
    if (!senderInfo) return 'Sender Information';
    return [
      senderInfo.name,
      senderInfo.address,
    ].filter(Boolean).join('\n');
  };

  const formatReceiverInfo = (receiverInfo: any): string => {
    if (!receiverInfo) return 'Receiver Information';
    return [
      receiverInfo.name,
      receiverInfo.address,
    ].filter(Boolean).join('\n');
  };

  return (
    <div className="flex flex-col h-full">
      <div className="flex-1 flex items-center justify-center p-4 bg-gray-50">
        <div
          ref={canvasRef}
          className="bg-white shadow-lg relative"
          style={{
            width: `${dimensions.width}px`,
            height: `${dimensions.height}px`,
            transform: `scale(${Math.min(1, 800 / dimensions.width, 600 / dimensions.height)})`,
            transformOrigin: 'center',
          }}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseUp}
        >
          {fields.map(renderField)}
          
          {/* Canvas grid (design mode only) */}
          {mode === 'design' && (
            <div
              style={{
                position: 'absolute',
                top: 0,
                left: 0,
                width: '100%',
                height: '100%',
                backgroundImage: `
                  linear-gradient(to right, #e5e7eb 1px, transparent 1px),
                  linear-gradient(to bottom, #e5e7eb 1px, transparent 1px)
                `,
                backgroundSize: '20px 20px',
                pointerEvents: 'none',
                opacity: 0.3,
              }}
            />
          )}
        </div>
      </div>
      
      {mode === 'design' && (
        <div className="p-2 bg-muted text-xs text-muted-foreground border-t">
          Canvas: {dimensions.width}×{dimensions.height}px • 
          Fields: {fields.length} • 
          {selectedField ? `Selected: ${fields.find(f => f.id === selectedField)?.label || 'Unknown'}` : 'Click to select field'}
        </div>
      )}
    </div>
  );
};