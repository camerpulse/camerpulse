import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { LabelField, LabelDimensions } from '@/types/labelTypes';

export interface DatabaseTemplate {
  id: string;
  created_by: string;
  template_name: string;
  template_type: string;
  label_size: string;
  orientation: string | null;
  template_config: any;
  fields_config: any;
  branding_config: any;
  agency_id: string | null;
  is_default: boolean | null;
  is_active: boolean | null;
  created_at: string | null;
  updated_at: string | null;
}

export function useTemplates() {
  const { user } = useAuth();
  const [templates, setTemplates] = useState<DatabaseTemplate[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchTemplates = async () => {
    if (!user) {
      setTemplates([]);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('label_templates')
        .select('*')
        .eq('created_by', user.id)
        .eq('is_active', true)
        .order('created_at', { ascending: false });

      if (error) throw error;

      setTemplates(data || []);
      setError(null);
    } catch (err: any) {
      setError(err.message);
      console.error('Error fetching templates:', err);
    } finally {
      setLoading(false);
    }
  };

  const createTemplate = async (templateData: {
    template_name: string;
    template_type?: string;
    label_size?: string;
    orientation?: string;
    template_config?: any;
    fields_config?: any;
    branding_config?: any;
    agency_id?: string;
    is_default?: boolean;
  }) => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('label_templates')
        .insert([{
          created_by: user.id,
          template_name: templateData.template_name,
          template_type: templateData.template_type || 'custom',
          label_size: templateData.label_size || 'A4',
          orientation: templateData.orientation,
          template_config: templateData.template_config || {},
          fields_config: templateData.fields_config || {},
          branding_config: templateData.branding_config,
          agency_id: templateData.agency_id,
          is_default: templateData.is_default || false,
        }])
        .select()
        .single();

      if (error) throw error;

      setTemplates(prev => [data, ...prev]);
      toast.success('Template created successfully');
      return { data, error: null };
    } catch (err: any) {
      toast.error('Failed to create template');
      return { data: null, error: err };
    }
  };

  const updateTemplate = async (id: string, updates: Partial<DatabaseTemplate>) => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('label_templates')
        .update(updates)
        .eq('id', id)
        .eq('created_by', user.id)
        .select()
        .single();

      if (error) throw error;

      setTemplates(prev => 
        prev.map(template => 
          template.id === id ? data : template
        )
      );
      toast.success('Template updated successfully');
      return { data, error: null };
    } catch (err: any) {
      toast.error('Failed to update template');
      return { data: null, error: err };
    }
  };

  const deleteTemplate = async (id: string) => {
    if (!user) return;

    try {
      const { error } = await supabase
        .from('label_templates')
        .update({ is_active: false })
        .eq('id', id)
        .eq('created_by', user.id);

      if (error) throw error;

      setTemplates(prev => prev.filter(template => template.id !== id));
      toast.success('Template deleted successfully');
      return { error: null };
    } catch (err: any) {
      toast.error('Failed to delete template');
      return { error: err };
    }
  };

  const duplicateTemplate = async (templateId: string, newName: string) => {
    const template = templates.find(t => t.id === templateId);
    if (!template) return;

    return createTemplate({
      template_name: newName,
      template_type: template.template_type,
      label_size: template.label_size,
      orientation: template.orientation,
      template_config: template.template_config,
      fields_config: template.fields_config,
      branding_config: template.branding_config,
      agency_id: template.agency_id,
      is_default: false,
    });
  };

  useEffect(() => {
    fetchTemplates();
  }, [user]);

  return {
    templates,
    loading,
    error,
    createTemplate,
    updateTemplate,
    deleteTemplate,
    duplicateTemplate,
    refreshTemplates: fetchTemplates,
  };
}