import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';

interface PulseModalProps {
  open: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
}

export const PulseModal: React.FC<PulseModalProps> = ({ open, onClose, title, children }) => (
  <Dialog open={open} onOpenChange={onClose}>
    <DialogContent>
      <DialogHeader>
        <DialogTitle>{title}</DialogTitle>
      </DialogHeader>
      {children}
    </DialogContent>
  </Dialog>
);