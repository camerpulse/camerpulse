import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.50.5";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Initialize Supabase client
const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
const supabase = createClient(supabaseUrl, supabaseServiceKey);

// Bot API credentials
const telegramBotToken = Deno.env.get('TELEGRAM_BOT_TOKEN');
const whatsappToken = Deno.env.get('WHATSAPP_ACCESS_TOKEN');
const whatsappPhoneNumberId = Deno.env.get('WHATSAPP_PHONE_NUMBER_ID');

interface AlertBotConfig {
  enabled: boolean;
  telegram_enabled: boolean;
  whatsapp_enabled: boolean;
  telegram_bot_token: string;
  telegram_admin_chat_id: string;
  telegram_public_chat_id: string;
  whatsapp_admin_groups: string[];
  alert_frequency: 'immediate' | 'hourly' | 'daily';
  danger_threshold: number;
  voice_alerts_enabled: boolean;
  message_templates: {
    danger_alert: string;
    mood_shift: string;
    disinformation: string;
    unrest_prediction: string;
  };
}

interface BroadcastResult {
  platform: string;
  success_count: number;
  failure_count: number;
  recipient_count: number;
  errors: string[];
}

// Send Telegram message
async function sendTelegramMessage(botToken: string, chatId: string, message: string): Promise<boolean> {
  try {
    const response = await fetch(`https://api.telegram.org/bot${botToken}/sendMessage`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        chat_id: chatId,
        text: message,
        parse_mode: 'HTML',
        disable_web_page_preview: true
      })
    });

    const result = await response.json();
    return result.ok;
  } catch (error) {
    console.error('Telegram send error:', error);
    return false;
  }
}

// Send WhatsApp message
async function sendWhatsAppMessage(groupId: string, message: string): Promise<boolean> {
  if (!whatsappToken || !whatsappPhoneNumberId) return false;

  try {
    const response = await fetch(`https://graph.facebook.com/v18.0/${whatsappPhoneNumberId}/messages`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${whatsappToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        messaging_product: 'whatsapp',
        to: groupId,
        type: 'text',
        text: { body: message }
      })
    });

    return response.ok;
  } catch (error) {
    console.error('WhatsApp send error:', error);
    return false;
  }
}

// Generate voice message using CivicVoiceAgent
async function generateVoiceMessage(text: string): Promise<string | null> {
  try {
    // In a real implementation, this would integrate with the voice synthesis
    // For now, return a placeholder
    return null;
  } catch (error) {
    console.error('Voice generation error:', error);
    return null;
  }
}

// Format alert message using template
function formatAlertMessage(template: string, alertData: any): string {
  let message = template;
  
  // Replace template variables
  const variables = {
    '{region}': alertData.affected_regions?.join(', ') || 'Multiple Regions',
    '{severity}': alertData.severity?.toUpperCase() || 'UNKNOWN',
    '{danger_score}': '75', // Would be calculated from alert data
    '{emotion}': alertData.emotional_tone || 'Tension',
    '{topic}': alertData.title || 'Civic Alert',
    '{timestamp}': new Date(alertData.created_at).toLocaleString(),
    '{dashboard_url}': `${supabaseUrl.replace('.supabase.co', '.vercel.app')}/camerpulse`,
    '{from_emotion}': 'Calm',
    '{to_emotion}': 'Agitated',
    '{spread_rate}': '250%',
    '{platforms}': 'WhatsApp, Facebook',
    '{risk_level}': '75',
    '{timeframe}': 'Next 6 hours',
    '{triggers}': 'Economic concerns, Political tensions'
  };

  for (const [variable, value] of Object.entries(variables)) {
    message = message.replace(new RegExp(variable.replace(/[{}]/g, '\\$&'), 'g'), value);
  }

  return message;
}

// Test bot connections
async function testBotConnection(platform: 'telegram' | 'whatsapp', config: any): Promise<{ success: boolean; error?: string; info?: any }> {
  if (platform === 'telegram') {
    try {
      const response = await fetch(`https://api.telegram.org/bot${config.bot_token}/getMe`);
      const result = await response.json();
      
      if (result.ok) {
        return { 
          success: true, 
          info: { 
            bot_username: result.result.username,
            bot_name: result.result.first_name 
          }
        };
      } else {
        return { success: false, error: result.description || 'Invalid bot token' };
      }
    } catch (error) {
      return { success: false, error: `Connection failed: ${error.message}` };
    }
  }

  if (platform === 'whatsapp') {
    if (!whatsappToken || !whatsappPhoneNumberId) {
      return { success: false, error: 'WhatsApp credentials not configured' };
    }

    try {
      // Test by checking phone number info
      const response = await fetch(`https://graph.facebook.com/v18.0/${whatsappPhoneNumberId}`, {
        headers: {
          'Authorization': `Bearer ${whatsappToken}`
        }
      });

      if (response.ok) {
        const result = await response.json();
        return { 
          success: true, 
          info: { 
            phone_number: result.display_phone_number || whatsappPhoneNumberId 
          }
        };
      } else {
        return { success: false, error: 'WhatsApp API connection failed' };
      }
    } catch (error) {
      return { success: false, error: `WhatsApp connection failed: ${error.message}` };
    }
  }

  return { success: false, error: 'Unknown platform' };
}

// Broadcast alert to all configured platforms
async function broadcastAlert(alertId: string, config: AlertBotConfig): Promise<BroadcastResult[]> {
  const results: BroadcastResult[] = [];

  try {
    // Get alert data
    const { data: alert } = await supabase
      .from('camerpulse_intelligence_alerts')
      .select('*')
      .eq('id', alertId)
      .single();

    if (!alert) {
      throw new Error('Alert not found');
    }

    // Determine message template based on alert type
    let template = config.message_templates.danger_alert;
    if (alert.alert_type.includes('mood')) {
      template = config.message_templates.mood_shift;
    } else if (alert.alert_type.includes('disinformation')) {
      template = config.message_templates.disinformation;
    } else if (alert.alert_type.includes('unrest') || alert.alert_type.includes('prediction')) {
      template = config.message_templates.unrest_prediction;
    }

    const message = formatAlertMessage(template, alert);

    // Broadcast to Telegram
    if (config.telegram_enabled && config.telegram_bot_token) {
      const telegramResult: BroadcastResult = {
        platform: 'telegram',
        success_count: 0,
        failure_count: 0,
        recipient_count: 0,
        errors: []
      };

      const recipients = [
        config.telegram_admin_chat_id,
        config.telegram_public_chat_id
      ].filter(id => id);

      telegramResult.recipient_count = recipients.length;

      for (const chatId of recipients) {
        const success = await sendTelegramMessage(config.telegram_bot_token, chatId, message);
        if (success) {
          telegramResult.success_count++;
        } else {
          telegramResult.failure_count++;
          telegramResult.errors.push(`Failed to send to chat ${chatId}`);
        }
      }

      results.push(telegramResult);
    }

    // Broadcast to WhatsApp
    if (config.whatsapp_enabled && config.whatsapp_admin_groups.length > 0) {
      const whatsappResult: BroadcastResult = {
        platform: 'whatsapp',
        success_count: 0,
        failure_count: 0,
        recipient_count: config.whatsapp_admin_groups.length,
        errors: []
      };

      for (const groupId of config.whatsapp_admin_groups) {
        const success = await sendWhatsAppMessage(groupId, message);
        if (success) {
          whatsappResult.success_count++;
        } else {
          whatsappResult.failure_count++;
          whatsappResult.errors.push(`Failed to send to group ${groupId}`);
        }

        // If voice alerts are enabled, also send voice message
        if (config.voice_alerts_enabled) {
          const voiceMessage = await generateVoiceMessage(message);
          if (voiceMessage) {
            // Would send voice message here
            console.log('Voice message generated for WhatsApp');
          }
        }
      }

      results.push(whatsappResult);
    }

    // Log broadcast results
    await logBroadcast(alertId, results);

    // Mark alert as broadcasted
    await supabase
      .from('camerpulse_intelligence_alerts')
      .update({ 
        acknowledged: true,
        acknowledged_at: new Date().toISOString(),
        acknowledged_by: 'civic-alert-bot'
      })
      .eq('id', alertId);

  } catch (error) {
    console.error('Broadcast error:', error);
    throw error;
  }

  return results;
}

// Send daily digest
async function sendDailyDigest(config: AlertBotConfig): Promise<BroadcastResult[]> {
  const results: BroadcastResult[] = [];

  try {
    // Get today's civic intelligence summary
    const today = new Date().toISOString().split('T')[0];
    
    const { data: sentimentData } = await supabase
      .from('camerpulse_intelligence_sentiment_logs')
      .select('sentiment_polarity, sentiment_score')
      .gte('created_at', `${today}T00:00:00Z`)
      .limit(1000);

    const { data: alertsData } = await supabase
      .from('camerpulse_intelligence_alerts')
      .select('severity, alert_type')
      .gte('created_at', `${today}T00:00:00Z`);

    const { data: trendingData } = await supabase
      .from('camerpulse_intelligence_trending_topics')
      .select('topic_text, volume_score')
      .order('volume_score', { ascending: false })
      .limit(5);

    // Generate digest message
    const totalSentiments = sentimentData?.length || 0;
    const positiveCount = sentimentData?.filter(s => s.sentiment_polarity === 'positive').length || 0;
    const negativeCount = sentimentData?.filter(s => s.sentiment_polarity === 'negative').length || 0;
    const alertCount = alertsData?.length || 0;
    const criticalAlerts = alertsData?.filter(a => a.severity === 'critical').length || 0;

    const digestMessage = `📊 CamerPulse Daily Civic Digest - ${new Date().toLocaleDateString()}

🌍 NATIONAL SENTIMENT OVERVIEW
📈 Total Conversations Monitored: ${totalSentiments.toLocaleString()}
😊 Positive Sentiment: ${positiveCount} (${Math.round((positiveCount/totalSentiments)*100)}%)
😠 Negative Sentiment: ${negativeCount} (${Math.round((negativeCount/totalSentiments)*100)}%)

🚨 ALERTS & INCIDENTS
📢 Total Alerts: ${alertCount}
⚠️ Critical Alerts: ${criticalAlerts}

📈 TOP TRENDING TOPICS
${trendingData?.map((topic, i) => `${i+1}. ${topic.topic_text} (Volume: ${topic.volume_score})`).join('\n') || 'No trending topics detected'}

🔗 Full Dashboard: ${supabaseUrl.replace('.supabase.co', '.vercel.app')}/camerpulse

Generated by CamerPulse Intelligence System`;

    // Send digest to all platforms
    if (config.telegram_enabled && config.telegram_bot_token) {
      const telegramResult: BroadcastResult = {
        platform: 'telegram',
        success_count: 0,
        failure_count: 0,
        recipient_count: 0,
        errors: []
      };

      const recipients = [
        config.telegram_admin_chat_id,
        config.telegram_public_chat_id
      ].filter(id => id);

      telegramResult.recipient_count = recipients.length;

      for (const chatId of recipients) {
        const success = await sendTelegramMessage(config.telegram_bot_token, chatId, digestMessage);
        if (success) {
          telegramResult.success_count++;
        } else {
          telegramResult.failure_count++;
        }
      }

      results.push(telegramResult);
    }

    if (config.whatsapp_enabled && config.whatsapp_admin_groups.length > 0) {
      const whatsappResult: BroadcastResult = {
        platform: 'whatsapp',
        success_count: 0,
        failure_count: 0,
        recipient_count: config.whatsapp_admin_groups.length,
        errors: []
      };

      for (const groupId of config.whatsapp_admin_groups) {
        const success = await sendWhatsAppMessage(groupId, digestMessage);
        if (success) {
          whatsappResult.success_count++;
        } else {
          whatsappResult.failure_count++;
        }
      }

      results.push(whatsappResult);
    }

    await logBroadcast('daily-digest', results);

  } catch (error) {
    console.error('Daily digest error:', error);
    throw error;
  }

  return results;
}

// Log broadcast activity
async function logBroadcast(alertId: string, results: BroadcastResult[]) {
  try {
    const logs = results.map(result => ({
      id: crypto.randomUUID(),
      platform: result.platform,
      message_type: alertId.includes('digest') ? 'daily_digest' : 'alert_broadcast',
      recipient_count: result.recipient_count,
      success_count: result.success_count,
      failure_count: result.failure_count,
      created_at: new Date().toISOString(),
      alert_id: alertId !== 'daily-digest' ? alertId : undefined
    }));

    // Store logs in config table for now (could be moved to separate logs table)
    const { data: existingLogs } = await supabase
      .from('camerpulse_intelligence_config')
      .select('config_value')
      .eq('config_key', 'alert_bot_broadcast_logs')
      .single();

    const currentLogs = existingLogs?.config_value ? (existingLogs.config_value as any).broadcasts || [] : [];
    const updatedLogs = [...logs, ...currentLogs].slice(0, 100); // Keep last 100 logs

    await supabase
      .from('camerpulse_intelligence_config')
      .upsert({
        config_key: 'alert_bot_broadcast_logs',
        config_type: 'system',
        config_value: { broadcasts: updatedLogs },
        description: 'Alert Bot Broadcast History'
      });

  } catch (error) {
    console.error('Error logging broadcast:', error);
  }
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { action, ...params } = await req.json();

    switch (action) {
      case 'status': {
        // Check bot status
        const telegramStatus = telegramBotToken ? 
          await testBotConnection('telegram', { bot_token: telegramBotToken }) : 
          { success: false, error: 'Token not configured' };

        const whatsappStatus = (whatsappToken && whatsappPhoneNumberId) ?
          await testBotConnection('whatsapp', {}) :
          { success: false, error: 'Credentials not configured' };

        return new Response(JSON.stringify({
          telegram: {
            connected: telegramStatus.success,
            bot_username: telegramStatus.info?.bot_username || '',
            error: telegramStatus.error
          },
          whatsapp: {
            connected: whatsappStatus.success,
            phone_number: whatsappStatus.info?.phone_number || '',
            error: whatsappStatus.error
          }
        }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      case 'test_connection': {
        const { platform, config } = params;
        const result = await testBotConnection(platform, config);
        
        return new Response(JSON.stringify(result), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      case 'broadcast_alert': {
        const { alert_id, config } = params;
        const results = await broadcastAlert(alert_id, config);
        
        const totalRecipients = results.reduce((sum, r) => sum + r.recipient_count, 0);
        const totalSuccess = results.reduce((sum, r) => sum + r.success_count, 0);
        
        return new Response(JSON.stringify({
          success: true,
          recipient_count: totalRecipients,
          success_count: totalSuccess,
          results
        }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      case 'send_digest': {
        const { config } = params;
        const results = await sendDailyDigest(config);
        
        const totalRecipients = results.reduce((sum, r) => sum + r.recipient_count, 0);
        const totalSuccess = results.reduce((sum, r) => sum + r.success_count, 0);
        
        return new Response(JSON.stringify({
          success: true,
          recipient_count: totalRecipients,
          success_count: totalSuccess,
          results
        }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      default:
        return new Response(JSON.stringify({ 
          error: 'Unknown action. Available: status, test_connection, broadcast_alert, send_digest' 
        }), {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
    }

  } catch (error) {
    console.error('Error in civic-alert-bot:', error);
    return new Response(JSON.stringify({ 
      error: error.message,
      success: false 
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});