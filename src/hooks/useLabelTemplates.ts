import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface LabelTemplate {
  id: string;
  template_name: string;
  template_type: 'shipping_label' | 'invoice_label' | 'warehouse_label';
  agency_id?: string | null;
  created_by: string;
  is_default: boolean | null;
  is_active: boolean | null;
  label_size: string;
  orientation: 'portrait' | 'landscape';
  template_config: any;
  branding_config: any;
  fields_config: any;
  created_at: string | null;
  updated_at: string | null;
}

export interface AgencyBrandingSettings {
  id: string;
  agency_id: string;
  logo_url?: string | null;
  header_logo_url?: string | null;
  watermark_url?: string | null;
  primary_color: string;
  secondary_color: string;
  accent_color: string;
  text_color: string;
  background_color: string;
  primary_font: string;
  secondary_font: string;
  font_sizes: any;
  default_label_size: string;
  default_orientation: string;
  enable_thermal_printing: boolean;
  enable_watermark: boolean;
  contact_info: any;
  created_at: string | null;
  updated_at: string | null;
}

export const useLabelTemplates = () => {
  const [templates, setTemplates] = useState<LabelTemplate[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  const fetchTemplates = async (agencyId?: string) => {
    setLoading(true);
    setError(null);

    try {
      let query = supabase
        .from('label_templates')
        .select('*')
        .eq('is_active', true)
        .order('created_at', { ascending: false });

      if (agencyId) {
        query = query.eq('agency_id', agencyId);
      }

      const { data, error } = await query;

      if (error) {
        throw error;
      }

      setTemplates((data || []) as LabelTemplate[]);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch templates';
      setError(errorMessage);
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const createTemplate = async (templateData: Partial<LabelTemplate>) => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('label_templates')
        .insert(templateData)
        .select()
        .single();

      if (error) {
        throw error;
      }

      setTemplates(prev => [data as LabelTemplate, ...prev]);
      toast({
        title: "Success",
        description: "Template created successfully",
      });

      return data as LabelTemplate;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to create template';
      setError(errorMessage);
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const updateTemplate = async (id: string, updates: Partial<LabelTemplate>) => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('label_templates')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) {
        throw error;
      }

      setTemplates(prev => 
        prev.map(template => 
          template.id === id ? { ...template, ...(data as LabelTemplate) } : template
        )
      );

      toast({
        title: "Success",
        description: "Template updated successfully",
      });

      return data as LabelTemplate;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to update template';
      setError(errorMessage);
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const deleteTemplate = async (id: string) => {
    setLoading(true);
    try {
      const { error } = await supabase
        .from('label_templates')
        .update({ is_active: false })
        .eq('id', id);

      if (error) {
        throw error;
      }

      setTemplates(prev => prev.filter(template => template.id !== id));
      toast({
        title: "Success",
        description: "Template deleted successfully",
      });
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to delete template';
      setError(errorMessage);
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const duplicateTemplate = async (templateId: string, newName: string) => {
    setLoading(true);
    try {
      const template = templates.find(t => t.id === templateId);
      if (!template) {
        throw new Error('Template not found');
      }

      const duplicateData = {
        template_name: newName,
        template_type: template.template_type,
        agency_id: template.agency_id,
        created_by: template.created_by,
        label_size: template.label_size,
        orientation: template.orientation,
        template_config: template.template_config,
        branding_config: template.branding_config,
        fields_config: template.fields_config,
        is_default: false,
        is_active: true,
      };

      const newTemplate = await createTemplate(duplicateData);
      return newTemplate;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to duplicate template';
      setError(errorMessage);
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return {
    templates,
    loading,
    error,
    fetchTemplates,
    createTemplate,
    updateTemplate,
    deleteTemplate,
    duplicateTemplate,
  };
};

export const useAgencyBranding = () => {
  const [branding, setBranding] = useState<AgencyBrandingSettings | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  const fetchBranding = async (agencyId: string) => {
    setLoading(true);
    setError(null);

    try {
      const { data, error } = await supabase
        .from('agency_branding_settings')
        .select('*')
        .eq('agency_id', agencyId)
        .maybeSingle();

      if (error) {
        throw error;
      }

      setBranding(data as AgencyBrandingSettings);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch branding settings';
      setError(errorMessage);
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const updateBranding = async (agencyId: string, updates: Partial<AgencyBrandingSettings>) => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('agency_branding_settings')
        .upsert({ agency_id: agencyId, ...updates })
        .select()
        .single();

      if (error) {
        throw error;
      }

      setBranding(data as AgencyBrandingSettings);
      toast({
        title: "Success",
        description: "Branding settings updated successfully",
      });

      return data as AgencyBrandingSettings;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to update branding settings';
      setError(errorMessage);
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return {
    branding,
    loading,
    error,
    fetchBranding,
    updateBranding,
  };
};