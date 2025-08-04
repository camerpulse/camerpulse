import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.50.5";

const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
const supabase = createClient(supabaseUrl, supabaseKey);


// Rate limiting configuration
const RATE_LIMITS = {
  per_user_per_minute: 10,
  per_ip_per_minute: 50,
  per_user_per_hour: 100
};

// In-memory rate limiting (for production, use Redis)
const rateLimitStore = new Map<string, { count: number; resetTime: number }>();

function checkRateLimit(key: string, limit: number, windowMs: number): boolean {
  const now = Date.now();
  const entry = rateLimitStore.get(key);
  
  if (!entry || now > entry.resetTime) {
    rateLimitStore.set(key, { count: 1, resetTime: now + windowMs });
    return true;
  }
  
  if (entry.count >= limit) {
    return false;
  }
  
  entry.count++;
  return true;
}

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface NotificationPayload {
  type: string;
  title: string;
  body: string;
  recipient_id?: string;
  recipients?: string[]; // For bulk notifications
  sender_id?: string;
  data?: Record<string, any>;
  source_module: string;
  category?: string;
  priority?: number;
  delivery_channels?: string[];
  action_url?: string;
  requires_action?: boolean;
  expires_at?: string;
  template_key?: string;
  template_variables?: Record<string, any>;
  target_criteria?: Record<string, any>; // For bulk targeting
  batch_name?: string;
  region_specific?: string[];
  user_type_specific?: string[];
  language?: string;
}

interface ProcessedTemplate {
  title: string;
  body: string;
  email_content?: string;
  push_content?: string;
}

// Template processing function
function processTemplate(template: any, variables: Record<string, any>): ProcessedTemplate {
  let title = template.title_template;
  let body = template.body_template;
  let email_content = template.email_template;
  let push_content = template.push_template;

  // Replace template variables
  Object.entries(variables).forEach(([key, value]) => {
    const placeholder = new RegExp(`{{${key}}}`, 'g');
    title = title.replace(placeholder, String(value));
    body = body.replace(placeholder, String(value));
    if (email_content) email_content = email_content.replace(placeholder, String(value));
    if (push_content) push_content = push_content.replace(placeholder, String(value));
  });

  return { title, body, email_content, push_content };
}

// Check user preferences
async function checkUserPreferences(userId: string, notificationType: string, channel: string): Promise<boolean> {
  try {
    const { data: prefs } = await supabase
      .from('user_notification_preferences')
      .select('*')
      .eq('user_id', userId)
      .single();

    if (!prefs) return true; // Default to enabled if no preferences found

    // Check channel preferences
    switch (channel) {
      case 'email':
        if (!prefs.email_enabled) return false;
        break;
      case 'push':
        if (!prefs.push_enabled) return false;
        break;
      case 'sms':
        if (!prefs.sms_enabled) return false;
        break;
      case 'in-app':
        if (!prefs.in_app_enabled) return false;
        break;
    }

    // Check type preferences
    const typeMap: Record<string, string> = {
      'civic_alert': 'civic_alerts',
      'political_update': 'political_updates',
      'village_update': 'village_updates',
      'petition_update': 'petition_updates',
      'job_notification': 'job_notifications',
      'marketplace_update': 'marketplace_updates',
      'community_message': 'community_messages',
      'admin_notice': 'admin_notices',
      'security_alert': 'security_alerts',
    };

    const prefKey = typeMap[notificationType];
    if (prefKey && prefs[prefKey] === false) return false;

    return true;
  } catch (error) {
    console.error('Error checking user preferences:', error);
    return true; // Default to enabled on error
  }
}

// Create notification record
async function createNotification(payload: NotificationPayload, recipientId: string): Promise<string | null> {
  try {
    const notificationData = {
      type: payload.type,
      title: payload.title,
      body: payload.body,
      data: payload.data || {},
      recipient_id: recipientId,
      sender_id: payload.sender_id,
      source_module: payload.source_module,
      category: payload.category || 'general',
      priority: payload.priority || 3,
      delivery_channels: payload.delivery_channels || ['in-app'],
      language: payload.language || 'en',
      region_specific: payload.region_specific || [],
      user_type_specific: payload.user_type_specific || [],
      action_url: payload.action_url,
      requires_action: payload.requires_action || false,
      expires_at: payload.expires_at,
      template_id: payload.template_key ? null : undefined, // Will be set if template is used
    };

    const { data, error } = await supabase
      .from('unified_notifications')
      .insert(notificationData)
      .select('id')
      .single();

    if (error) throw error;
    return data.id;
  } catch (error) {
    console.error('Error creating notification:', error);
    return null;
  }
}

// Log delivery attempt
async function logDelivery(notificationId: string, channel: string, status: string, details?: any) {
  try {
    await supabase
      .from('notification_delivery_log')
      .insert({
        notification_id: notificationId,
        channel,
        status,
        provider_response: details || {},
      });
  } catch (error) {
    console.error('Error logging delivery:', error);
  }
}

// Send to specific delivery channels
async function deliverNotification(notificationId: string, payload: NotificationPayload, recipientId: string) {
  const channels = payload.delivery_channels || ['in-app'];

  for (const channel of channels) {
    // Check user preferences for this channel
    const canDeliver = await checkUserPreferences(recipientId, payload.type, channel);
    if (!canDeliver) {
      await logDelivery(notificationId, channel, 'skipped', { reason: 'user_preferences' });
      continue;
    }

    try {
      switch (channel) {
        case 'push':
          // Trigger push notification service
          await supabase.functions.invoke('push-notification-service', {
            body: {
              user_id: recipientId,
              title: payload.title,
              body: payload.body,
              data: payload.data || {},
              action_url: payload.action_url,
            }
          });
          await logDelivery(notificationId, channel, 'sent');
          break;

        case 'email':
          // Trigger email notification service
          await supabase.functions.invoke('email-notification-service', {
            body: {
              user_id: recipientId,
              subject: payload.title,
              content: payload.body,
              priority: payload.priority === 1 ? 'urgent' : payload.priority === 2 ? 'high' : 'medium',
              variables: payload.data || {}
            }
          });
          await logDelivery(notificationId, channel, 'sent');
          break;

        case 'in-app':
          // In-app notifications are handled by the database insert (realtime)
          await logDelivery(notificationId, channel, 'delivered');
          break;

        case 'sms':
          // SMS delivery would be implemented here
          await logDelivery(notificationId, channel, 'pending', { reason: 'sms_not_implemented' });
          break;

        default:
          console.warn(`Unknown delivery channel: ${channel}`);
      }
    } catch (error) {
      console.error(`Error delivering to ${channel}:`, error);
      await logDelivery(notificationId, channel, 'failed', { error: error.message });
    }
  }
}

// Process single notification
async function processSingleNotification(payload: NotificationPayload): Promise<{ success: boolean; notificationId?: string; error?: string }> {
  try {
    if (!payload.recipient_id) {
      throw new Error('recipient_id is required for single notifications');
    }

    // Process template if template_key is provided
    if (payload.template_key) {
      const { data: template, error: templateError } = await supabase
        .from('notification_templates')
        .select('*')
        .eq('template_key', payload.template_key)
        .eq('is_active', true)
        .single();

      if (templateError || !template) {
        throw new Error(`Template not found: ${payload.template_key}`);
      }

      const processed = processTemplate(template, payload.template_variables || {});
      payload.title = processed.title;
      payload.body = processed.body;
      payload.priority = payload.priority || template.default_priority;
      payload.delivery_channels = payload.delivery_channels || template.default_channels;
    }

    // Create notification record
    const notificationId = await createNotification(payload, payload.recipient_id);
    if (!notificationId) {
      throw new Error('Failed to create notification record');
    }

    // Deliver notification
    await deliverNotification(notificationId, payload, payload.recipient_id);

    return { success: true, notificationId };
  } catch (error) {
    console.error('Error processing single notification:', error);
    return { success: false, error: error.message };
  }
}

// Process bulk notifications
async function processBulkNotification(payload: NotificationPayload): Promise<{ success: boolean; batchId?: string; error?: string }> {
  try {
    let recipients: string[] = [];

    // Determine recipients
    if (payload.recipients) {
      recipients = payload.recipients;
    } else if (payload.target_criteria) {
      // Build query based on criteria
      let query = supabase.from('profiles').select('user_id');
      
      const criteria = payload.target_criteria;
      if (criteria.user_type) {
        query = query.eq('user_type', criteria.user_type);
      }
      if (criteria.region) {
        query = query.eq('region', criteria.region);
      }
      if (criteria.is_verified !== undefined) {
        query = query.eq('verified', criteria.is_verified);
      }

      const { data: profiles, error } = await query;
      if (error) throw error;
      
      recipients = profiles?.map(p => p.user_id) || [];
    } else {
      throw new Error('Either recipients array or target_criteria must be provided for bulk notifications');
    }

    if (recipients.length === 0) {
      throw new Error('No recipients found for bulk notification');
    }

    // Create batch record
    const { data: batch, error: batchError } = await supabase
      .from('notification_batches')
      .insert({
        batch_name: payload.batch_name || `Bulk notification - ${new Date().toISOString()}`,
        target_criteria: payload.target_criteria || {},
        estimated_recipients: recipients.length,
        actual_recipients: recipients.length,
        status: 'processing',
        created_by: payload.sender_id || 'system',
        started_at: new Date().toISOString(),
      })
      .select('id')
      .single();

    if (batchError || !batch) {
      throw new Error('Failed to create batch record');
    }

    // Process each recipient
    let successful = 0;
    let failed = 0;

    for (const recipientId of recipients) {
      try {
        const singlePayload = { ...payload, recipient_id: recipientId, batch_id: batch.id };
        const result = await processSingleNotification(singlePayload);
        
        if (result.success) {
          successful++;
        } else {
          failed++;
          console.error(`Failed to send to ${recipientId}:`, result.error);
        }
      } catch (error) {
        failed++;
        console.error(`Error processing recipient ${recipientId}:`, error);
      }
    }

    // Update batch with results
    await supabase
      .from('notification_batches')
      .update({
        status: 'completed',
        successful_deliveries: successful,
        failed_deliveries: failed,
        completed_at: new Date().toISOString(),
      })
      .eq('id', batch.id);

    return { success: true, batchId: batch.id };
  } catch (error) {
    console.error('Error processing bulk notification:', error);
    return { success: false, error: error.message };
  }
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Get client IP for rate limiting
    const clientIP = req.headers.get('x-forwarded-for') || req.headers.get('x-real-ip') || 'unknown';
    
    // Rate limiting checks
    if (!checkRateLimit(`ip:${clientIP}`, RATE_LIMITS.per_ip_per_minute, 60000)) {
      return new Response(JSON.stringify({ error: 'Rate limit exceeded for IP' }), {
        status: 429,
        headers: { 'Content-Type': 'application/json', ...corsHeaders },
      });
    }

    const payload: NotificationPayload = await req.json();
    
    // Additional rate limiting by sender
    if (payload.sender_id) {
      const userKey = `user:${payload.sender_id}`;
      if (!checkRateLimit(userKey, RATE_LIMITS.per_user_per_minute, 60000)) {
        return new Response(JSON.stringify({ error: 'Rate limit exceeded for user' }), {
          status: 429,
          headers: { 'Content-Type': 'application/json', ...corsHeaders },
        });
      }
      
      if (!checkRateLimit(`${userKey}:hour`, RATE_LIMITS.per_user_per_hour, 3600000)) {
        return new Response(JSON.stringify({ error: 'Hourly rate limit exceeded for user' }), {
          status: 429,
          headers: { 'Content-Type': 'application/json', ...corsHeaders },
        });
      }
    }

    console.log('Processing notification:', {
      type: payload.type,
      source_module: payload.source_module,
      recipients: payload.recipient_id ? 'single' : 'bulk',
    });

    // Validate required fields
    if (!payload.type || !payload.title || !payload.body || !payload.source_module) {
      throw new Error('Missing required fields: type, title, body, source_module');
    }

    let result;

    // Determine if this is a single or bulk notification
    if (payload.recipient_id) {
      result = await processSingleNotification(payload);
    } else if (payload.recipients || payload.target_criteria) {
      result = await processBulkNotification(payload);
    } else {
      throw new Error('Either recipient_id or recipients/target_criteria must be provided');
    }

    return new Response(JSON.stringify(result), {
      status: result.success ? 200 : 400,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });

  } catch (error) {
    console.error('Unified notification service error:', error);
    return new Response(JSON.stringify({ 
      success: false, 
      error: error.message 
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
});