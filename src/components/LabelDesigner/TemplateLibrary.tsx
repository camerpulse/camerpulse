import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { useLabelTemplates } from '@/hooks/useLabelTemplates';

interface TemplateLibraryProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSelectTemplate: (template: any) => void;
  agencyId?: string;
}

export const TemplateLibrary: React.FC<TemplateLibraryProps> = ({
  open,
  onOpenChange,
  onSelectTemplate,
  agencyId
}) => {
  const { templates, loading } = useLabelTemplates();

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl">
        <DialogHeader>
          <DialogTitle>Template Library</DialogTitle>
        </DialogHeader>
        <div className="grid grid-cols-3 gap-4">
          {templates.map((template) => (
            <div key={template.id} className="border rounded p-4">
              <h3 className="font-medium">{template.template_name}</h3>
              <p className="text-sm text-muted-foreground">{template.label_size}</p>
              <Button 
                className="mt-2 w-full" 
                onClick={() => onSelectTemplate(template)}
              >
                Use Template
              </Button>
            </div>
          ))}
        </div>
      </DialogContent>
    </Dialog>
  );
};