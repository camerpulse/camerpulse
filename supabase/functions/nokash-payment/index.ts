import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.45.0';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

interface PaymentRequest {
  order_id: string;
  amount: number;
  phone: string;
  payment_method: 'MTN' | 'ORANGE';
  user_id?: string;
  idempotency_key?: string;
}

interface RateLimitResult {
  allowed: boolean;
  remainingRequests?: number;
  retryAfter?: number;
  reason?: string;
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    const origin = req.headers.get('origin') || '*';
    const reqHeaders = req.headers.get('access-control-request-headers') || corsHeaders['Access-Control-Allow-Headers'];
    return new Response(null, { headers: { ...corsHeaders, 'Access-Control-Allow-Origin': origin, 'Access-Control-Allow-Headers': reqHeaders } });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
    );

    const url = new URL(req.url);
    const path = url.pathname.split('/').pop() || 'nokash-payment';

    // Get client information for rate limiting and security
    const clientIP = req.headers.get('x-forwarded-for') || req.headers.get('x-real-ip') || 'unknown';
    const userAgent = req.headers.get('user-agent') || 'unknown';

    // Handle POST requests (both subpath and SDK calls)
    if (req.method === 'POST') {
      if (path === 'pay') {
        return await handlePaymentRequest(req, supabaseClient, clientIP, userAgent);
      }
      if (path === 'retry') {
        return await handleRetryPayment(req, supabaseClient, clientIP, userAgent);
      }
      if (path === 'callback') {
        return await handleCallback(req, supabaseClient);
      }
      
      // Default POST handling (SDK invoke calls come here)
      // Body-based action routing for SDK calls
      let action = 'pay';
      let body: any = {};
      try {
        body = await req.clone().json();
        action = body?.action || 'pay';
      } catch (_) {
        // If no body, default to pay action
      }

      if (action === 'pay') {
        return await handlePaymentRequest(req, supabaseClient, clientIP, userAgent);
      }
      if (action === 'retry') {
        return await handleRetryPayment(req, supabaseClient, clientIP, userAgent);
      }
      if (action === 'status') {
        const orderId = body?.order_id;
        if (!orderId) {
          return new Response(JSON.stringify({ error: 'order_id required' }), { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
        }
        const statusUrl = new URL(req.url);
        statusUrl.searchParams.set('order_id', orderId);
        const statusReq = new Request(statusUrl.toString(), { method: 'GET', headers: req.headers });
        return await handleStatusCheck(statusReq, supabaseClient);
      }
    } else if (req.method === 'GET' && path === 'status') {
      return await handleStatusCheck(req, supabaseClient);
    }

    return new Response(
      JSON.stringify({ error: 'Route not found' }),
      { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error:', error);
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});

async function checkRateLimit(supabaseClient: any, clientIP: string, phone: string, userId?: string): Promise<RateLimitResult> {
  const maxRequestsPerHour = 10;
  const blockDuration = 3600; // 1 hour in seconds
  
  try {
    // Check existing rate limit record
    const { data: rateLimitData } = await supabaseClient
      .from('payment_rate_limits')
      .select('*')
      .or(`ip_address.eq.${clientIP},phone_number.eq.${phone}`)
      .gte('window_start', new Date(Date.now() - 3600000).toISOString())
      .single();

    if (rateLimitData) {
      // Check if currently blocked
      if (rateLimitData.blocked_until && new Date(rateLimitData.blocked_until) > new Date()) {
        return {
          allowed: false,
          retryAfter: Math.ceil((new Date(rateLimitData.blocked_until).getTime() - Date.now()) / 1000),
          reason: 'Rate limit exceeded - currently blocked'
        };
      }

      // Check if within rate limit
      if (rateLimitData.request_count >= maxRequestsPerHour) {
        // Block for 1 hour
        await supabaseClient
          .from('payment_rate_limits')
          .update({
            blocked_until: new Date(Date.now() + blockDuration * 1000).toISOString(),
            updated_at: new Date().toISOString()
          })
          .eq('id', rateLimitData.id);

        return {
          allowed: false,
          retryAfter: blockDuration,
          reason: 'Rate limit exceeded - blocking for 1 hour'
        };
      }

      // Increment request count
      await supabaseClient
        .from('payment_rate_limits')
        .update({
          request_count: rateLimitData.request_count + 1,
          updated_at: new Date().toISOString()
        })
        .eq('id', rateLimitData.id);

      return {
        allowed: true,
        remainingRequests: maxRequestsPerHour - rateLimitData.request_count - 1
      };
    } else {
      // Create new rate limit record
      await supabaseClient
        .from('payment_rate_limits')
        .insert({
          ip_address: clientIP,
          phone_number: phone,
          user_id: userId,
          request_count: 1,
          window_start: new Date().toISOString()
        });

      return {
        allowed: true,
        remainingRequests: maxRequestsPerHour - 1
      };
    }
  } catch (error) {
    console.error('Rate limit check error:', error);
    // Allow request if rate limit check fails
    return { allowed: true };
  }
}

async function checkDuplicatePayment(
  supabaseClient: any, 
  phone: string, 
  amount: number, 
  paymentMethod: string, 
  userId?: string,
  idempotencyKey?: string
): Promise<{ isDuplicate: boolean; orderId?: string }> {
  try {
    // Check by idempotency key if provided
    if (idempotencyKey) {
      const { data: existingIdempotency } = await supabaseClient
        .from('payment_idempotency')
        .select('order_id')
        .eq('idempotency_key', idempotencyKey)
        .gt('expires_at', new Date().toISOString())
        .single();

      if (existingIdempotency) {
        return { isDuplicate: true, orderId: existingIdempotency.order_id };
      }
    }

    // Check for recent identical payment (last 5 minutes)
    const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000).toISOString();
    const { data: recentPayment } = await supabaseClient
      .from('nokash_transactions')
      .select('order_id')
      .eq('phone_number', phone)
      .eq('amount', amount)
      .eq('payment_method', paymentMethod)
      .gte('created_at', fiveMinutesAgo)
      .in('status', ['PENDING', 'SUCCESS'])
      .single();

    if (recentPayment) {
      return { isDuplicate: true, orderId: recentPayment.order_id };
    }

    return { isDuplicate: false };
  } catch (error) {
    console.error('Duplicate check error:', error);
    return { isDuplicate: false };
  }
}

async function handlePaymentRequest(req: Request, supabaseClient: any, clientIP: string, userAgent: string) {
  try {
    const { order_id, amount, phone, payment_method, user_id, idempotency_key }: PaymentRequest = await req.json();

    console.log('Payment request received:', { order_id, amount, phone, payment_method, user_id, clientIP });

    // Validate input
    if (!order_id || !amount || !phone || !payment_method) {
      return new Response(
        JSON.stringify({ error: 'Missing required fields' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Validate amount
    if (amount < 100 || amount > 1000000) {
      return new Response(
        JSON.stringify({ error: 'Amount must be between 100 and 1,000,000 XAF' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Check rate limits
    const rateLimitResult = await checkRateLimit(supabaseClient, clientIP, phone, user_id);
    if (!rateLimitResult.allowed) {
      return new Response(
        JSON.stringify({ 
          error: 'Rate limit exceeded', 
          retryAfter: rateLimitResult.retryAfter,
          reason: rateLimitResult.reason
        }),
        { 
          status: 429, 
          headers: { 
            ...corsHeaders, 
            'Content-Type': 'application/json',
            'Retry-After': rateLimitResult.retryAfter?.toString() || '3600'
          } 
        }
      );
    }

    // Check for duplicate payments
    const duplicateCheck = await checkDuplicatePayment(
      supabaseClient, phone, amount, payment_method, user_id, idempotency_key
    );
    if (duplicateCheck.isDuplicate) {
      return new Response(
        JSON.stringify({ 
          success: true,
          message: 'Payment already processed',
          order_id: duplicateCheck.orderId,
          duplicate: true
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Store idempotency key if provided
    if (idempotency_key) {
      await supabaseClient
        .from('payment_idempotency')
        .insert({
          idempotency_key,
          user_id,
          phone_number: phone,
          amount,
          payment_method,
          order_id
        });
    }

    // Get Nokash configuration
    const { data: config, error: configError } = await supabaseClient
      .from('nokash_payment_config')
      .select('*')
      .eq('is_active', true)
      .single();

    if (configError || !config) {
      console.error('Config error:', configError);
      return new Response(
        JSON.stringify({ error: 'Payment service not configured' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Get secrets
    const iSpaceKey = Deno.env.get('NOKASH_I_SPACE_KEY');
    const appSpaceKey = config.app_space_key;

    if (!iSpaceKey || !appSpaceKey) {
      console.error('Missing required keys');
      return new Response(
        JSON.stringify({ error: 'Payment service configuration incomplete' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Generate HMAC signature
    const signatureData = `${order_id}:${amount}:${phone}:${appSpaceKey}`;
    const encoder = new TextEncoder();
    const keyData = encoder.encode(iSpaceKey);
    const messageData = encoder.encode(signatureData);
    
    const cryptoKey = await crypto.subtle.importKey(
      'raw',
      keyData,
      { name: 'HMAC', hash: 'SHA-256' },
      false,
      ['sign']
    );
    
    const signature = await crypto.subtle.sign('HMAC', cryptoKey, messageData);
    const signatureHex = Array.from(new Uint8Array(signature))
      .map(b => b.toString(16).padStart(2, '0'))
      .join('');

    // Create payment request payload
    const paymentPayload = {
      i_space_key: iSpaceKey,
      app_space_key: appSpaceKey,
      payment_type: "MOBILEMONEY",
      country: "CM",
      payment_method: payment_method,
      order_id: order_id,
      amount: amount,
      callback_url: `${Deno.env.get('SUPABASE_URL')}/functions/v1/nokash-payment/callback`,
      user_data: { user_phone: phone }
    };

    console.log('Payment request payload:', { ...paymentPayload, i_space_key: '[HIDDEN]' });

    // Store transaction in database with enhanced tracking
    const { error: dbError } = await supabaseClient
      .from('nokash_transactions')
      .insert({
        order_id,
        user_id,
        amount,
        phone_number: phone,
        payment_method,
        status: 'PENDING',
        ip_address: clientIP,
        user_agent: userAgent,
        expires_at: new Date(Date.now() + 3600000).toISOString() // 1 hour expiry
      });

    if (dbError) {
      console.error('Database error:', dbError);
      return new Response(
        JSON.stringify({ error: 'Failed to store transaction' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Make request to Nokash API with retry logic
    let nokashResponse;
    let responseData;
    let retryCount = 0;
    const maxRetries = 3;

    while (retryCount < maxRetries) {
      try {
        nokashResponse = await fetch('https://api.nokash.app/lapas-on-trans/trans/api-payin-request/407', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'hmac-signature': signatureHex
          },
          body: JSON.stringify(paymentPayload)
        });

        responseData = await nokashResponse.json();
        console.log(`Nokash response (attempt ${retryCount + 1}):`, responseData);

        if (nokashResponse.ok) break;

        retryCount++;
        if (retryCount < maxRetries) {
          await new Promise(resolve => setTimeout(resolve, 1000 * retryCount)); // Exponential backoff
        }
      } catch (error) {
        console.error(`Nokash API error (attempt ${retryCount + 1}):`, error);
        retryCount++;
        if (retryCount < maxRetries) {
          await new Promise(resolve => setTimeout(resolve, 1000 * retryCount));
        }
      }
    }

    // Update transaction with Nokash response and retry info
    await supabaseClient
      .from('nokash_transactions')
      .update({ 
        nokash_response: responseData,
        retry_count: retryCount,
        last_retry_at: retryCount > 1 ? new Date().toISOString() : null,
        failed_reason: !nokashResponse?.ok ? `API call failed after ${retryCount} attempts` : null
      })
      .eq('order_id', order_id);

    if (!nokashResponse?.ok) {
      // Create payment alert for failed payment
      await supabaseClient
        .from('payment_alerts')
        .insert({
          alert_type: 'failed_payment',
          severity: 'medium',
          title: `Payment Failed: ${order_id}`,
          description: `Payment of ${amount} XAF for phone ${phone} failed after ${retryCount} attempts`,
          metadata: {
            order_id,
            amount,
            phone,
            payment_method,
            retry_count: retryCount,
            error_details: responseData
          }
        });

      return new Response(
        JSON.stringify({ 
          error: 'Payment initiation failed', 
          details: responseData,
          retryCount 
        }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Schedule status check for pending transactions
    const statusCheckDelay = 30000; // 30 seconds
    setTimeout(async () => {
      await checkPendingTransactionStatus(supabaseClient, order_id);
    }, statusCheckDelay);

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: 'Payment initiated successfully',
        order_id,
        nokash_response: responseData,
        remainingRequests: rateLimitResult.remainingRequests
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Payment request error:', error);
    return new Response(
      JSON.stringify({ error: 'Payment processing failed' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
}

async function handleCallback(req: Request, supabaseClient: any) {
  try {
    const callbackData = await req.json();
    console.log('Nokash callback received:', callbackData);

    const { order_id, status } = callbackData;

    if (!order_id) {
      return new Response(
        JSON.stringify({ error: 'Missing order_id in callback' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Get transaction details
    const { data: transaction } = await supabaseClient
      .from('nokash_transactions')
      .select('*')
      .eq('order_id', order_id)
      .single();

    if (!transaction) {
      console.error('Transaction not found for order_id:', order_id);
      return new Response(
        JSON.stringify({ error: 'Transaction not found' }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Update transaction status
    const updateData: any = {
      status: status || 'UNKNOWN',
      callback_data: callbackData,
      updated_at: new Date().toISOString()
    };

    if (status === 'SUCCESS') {
      updateData.completed_at = new Date().toISOString();
    } else if (status === 'FAILED' || status === 'CANCELLED') {
      updateData.failed_reason = callbackData.reason || 'Payment failed via callback';
    }

    const { error } = await supabaseClient
      .from('nokash_transactions')
      .update(updateData)
      .eq('order_id', order_id);

    if (error) {
      console.error('Database update error:', error);
      return new Response(
        JSON.stringify({ error: 'Failed to update transaction' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Send notification for successful payment
    if (status === 'SUCCESS' && !transaction.notification_sent) {
      await sendPaymentNotification(supabaseClient, transaction);
    }

    // Update analytics
    await supabaseClient.rpc('check_payment_alerts');

    console.log(`Transaction ${order_id} updated to status: ${status}`);

    return new Response(
      JSON.stringify({ success: true, message: 'Callback processed' }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Callback error:', error);
    return new Response(
      JSON.stringify({ error: 'Callback processing failed' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
}

async function handleStatusCheck(req: Request, supabaseClient: any) {
  try {
    const url = new URL(req.url);
    const orderId = url.searchParams.get('order_id');

    if (!orderId) {
      return new Response(
        JSON.stringify({ error: 'order_id parameter required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const { data: transaction, error } = await supabaseClient
      .from('nokash_transactions')
      .select(`
        *,
        transaction_status_history (
          old_status,
          new_status,
          created_at,
          reason
        )
      `)
      .eq('order_id', orderId)
      .single();

    if (error || !transaction) {
      return new Response(
        JSON.stringify({ error: 'Transaction not found' }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    return new Response(
      JSON.stringify({
        success: true,
        transaction: {
          order_id: transaction.order_id,
          status: transaction.status,
          amount: transaction.amount,
          payment_method: transaction.payment_method,
          created_at: transaction.created_at,
          completed_at: transaction.completed_at,
          expires_at: transaction.expires_at,
          history: transaction.transaction_status_history || []
        }
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Status check error:', error);
    return new Response(
      JSON.stringify({ error: 'Status check failed' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
}

async function handleRetryPayment(req: Request, supabaseClient: any, clientIP: string, userAgent: string) {
  try {
    const { order_id } = await req.json();

    if (!order_id) {
      return new Response(
        JSON.stringify({ error: 'order_id required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Get transaction details
    const { data: transaction } = await supabaseClient
      .from('nokash_transactions')
      .select('*')
      .eq('order_id', order_id)
      .single();

    if (!transaction) {
      return new Response(
        JSON.stringify({ error: 'Transaction not found' }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (transaction.status === 'SUCCESS') {
      return new Response(
        JSON.stringify({ error: 'Transaction already successful' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (transaction.retry_count >= 5) {
      return new Response(
        JSON.stringify({ error: 'Maximum retry attempts exceeded' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Create new payment request with original data
    const retryRequest = {
      order_id: `${order_id}-RETRY-${Date.now()}`,
      amount: transaction.amount,
      phone: transaction.phone_number,
      payment_method: transaction.payment_method,
      user_id: transaction.user_id
    };

    return await handlePaymentRequest(
      new Request(req.url, {
        method: 'POST',
        headers: req.headers,
        body: JSON.stringify(retryRequest)
      }),
      supabaseClient,
      clientIP,
      userAgent
    );

  } catch (error) {
    console.error('Retry payment error:', error);
    return new Response(
      JSON.stringify({ error: 'Retry payment failed' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
}

async function checkPendingTransactionStatus(supabaseClient: any, orderId: string) {
  try {
    const { data: transaction } = await supabaseClient
      .from('nokash_transactions')
      .select('*')
      .eq('order_id', orderId)
      .single();

    if (!transaction || transaction.status !== 'PENDING') {
      return;
    }

    // Check if transaction has expired
    if (new Date(transaction.expires_at) < new Date()) {
      await supabaseClient
        .from('nokash_transactions')
        .update({
          status: 'EXPIRED',
          failed_reason: 'Transaction expired without confirmation',
          updated_at: new Date().toISOString()
        })
        .eq('order_id', orderId);

      console.log(`Transaction ${orderId} marked as expired`);
    }
  } catch (error) {
    console.error('Error checking pending transaction:', error);
  }
}

async function sendPaymentNotification(supabaseClient: any, transaction: any) {
  try {
    // Mark notification as sent to prevent duplicates
    await supabaseClient
      .from('nokash_transactions')
      .update({ notification_sent: true })
      .eq('id', transaction.id);

    // Here you would integrate with your email service
    // For now, just log the notification
    console.log('Payment notification sent for transaction:', transaction.order_id);
    
    // You could call a separate email function here
    // await supabaseClient.functions.invoke('send-payment-notification', {
    //   body: { transaction }
    // });

  } catch (error) {
    console.error('Error sending payment notification:', error);
  }
}