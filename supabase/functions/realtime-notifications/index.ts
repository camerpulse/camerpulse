import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.50.5";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface NotificationEvent {
  type: 'bid_submitted' | 'tender_updated' | 'deadline_warning' | 'award_announced' | 'system_alert';
  tenderId?: string;
  userId?: string;
  data: any;
  timestamp: string;
}

interface ClientConnection {
  socket: WebSocket;
  userId?: string;
  subscribedTenders: Set<string>;
  subscribedChannels: Set<string>;
}

const connections = new Map<string, ClientConnection>();

const supabase = createClient(
  "https://wsiorhtiovwcajiarydw.supabase.co",
  Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") || ""
);

async function broadcastToChannel(channel: string, event: NotificationEvent) {
  console.log(`Broadcasting to channel: ${channel}`, event);
  
  for (const [connectionId, connection] of connections) {
    if (connection.subscribedChannels.has(channel)) {
      try {
        connection.socket.send(JSON.stringify({
          type: 'notification',
          channel,
          event
        }));
      } catch (error) {
        console.error(`Failed to send to connection ${connectionId}:`, error);
        connections.delete(connectionId);
      }
    }
  }
}

async function broadcastToTender(tenderId: string, event: NotificationEvent) {
  console.log(`Broadcasting to tender: ${tenderId}`, event);
  
  for (const [connectionId, connection] of connections) {
    if (connection.subscribedTenders.has(tenderId)) {
      try {
        connection.socket.send(JSON.stringify({
          type: 'tender_update',
          tenderId,
          event
        }));
      } catch (error) {
        console.error(`Failed to send to connection ${connectionId}:`, error);
        connections.delete(connectionId);
      }
    }
  }
}

async function broadcastToUser(userId: string, event: NotificationEvent) {
  console.log(`Broadcasting to user: ${userId}`, event);
  
  for (const [connectionId, connection] of connections) {
    if (connection.userId === userId) {
      try {
        connection.socket.send(JSON.stringify({
          type: 'user_notification',
          userId,
          event
        }));
      } catch (error) {
        console.error(`Failed to send to connection ${connectionId}:`, error);
        connections.delete(connectionId);
      }
    }
  }
}

async function handleNewBid(payload: any) {
  const { tender_id, bidder_name, bid_amount, currency } = payload.new;
  
  const event: NotificationEvent = {
    type: 'bid_submitted',
    tenderId: tender_id,
    data: {
      bidderName: bidder_name,
      bidAmount: bid_amount,
      currency,
      totalBids: payload.new.total_bids || 0
    },
    timestamp: new Date().toISOString()
  };
  
  await broadcastToTender(tender_id, event);
  await broadcastToChannel('public_feed', event);
  
  // Send notification to tender issuer
  const { data: tender } = await supabase
    .from('tenders')
    .select('issuer_id')
    .eq('id', tender_id)
    .single();
    
  if (tender?.issuer_id) {
    await broadcastToUser(tender.issuer_id, event);
  }
}

async function handleTenderUpdate(payload: any) {
  const { id, status, deadline_extended, new_deadline } = payload.new;
  
  const event: NotificationEvent = {
    type: 'tender_updated',
    tenderId: id,
    data: {
      status,
      deadlineExtended: deadline_extended,
      newDeadline: new_deadline
    },
    timestamp: new Date().toISOString()
  };
  
  await broadcastToTender(id, event);
  await broadcastToChannel('public_feed', event);
}

async function handleDeadlineWarning(tenderId: string, hoursRemaining: number) {
  const event: NotificationEvent = {
    type: 'deadline_warning',
    tenderId,
    data: {
      hoursRemaining,
      message: `Only ${hoursRemaining} hours remaining to submit bids`
    },
    timestamp: new Date().toISOString()
  };
  
  await broadcastToTender(tenderId, event);
  await broadcastToChannel('urgent_alerts', event);
}

// Set up periodic deadline checks
setInterval(async () => {
  try {
    const { data: tenders } = await supabase
      .from('tenders')
      .select('id, title, submission_deadline')
      .eq('status', 'active')
      .gte('submission_deadline', new Date().toISOString())
      .lte('submission_deadline', new Date(Date.now() + 48 * 60 * 60 * 1000).toISOString());
    
    for (const tender of tenders || []) {
      const hoursRemaining = Math.ceil(
        (new Date(tender.submission_deadline).getTime() - Date.now()) / (1000 * 60 * 60)
      );
      
      if ([48, 24, 12, 6, 2, 1].includes(hoursRemaining)) {
        await handleDeadlineWarning(tender.id, hoursRemaining);
      }
    }
  } catch (error) {
    console.error('Error checking deadlines:', error);
  }
}, 60 * 60 * 1000); // Check every hour

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }
  
  const url = new URL(req.url);
  
  // Handle WebSocket upgrade
  if (req.headers.get('upgrade') === 'websocket') {
    const { socket, response } = Deno.upgradeWebSocket(req);
    const connectionId = crypto.randomUUID();
    
    const connection: ClientConnection = {
      socket,
      subscribedTenders: new Set(),
      subscribedChannels: new Set()
    };
    
    connections.set(connectionId, connection);
    console.log(`New WebSocket connection: ${connectionId}`);
    
    socket.onopen = () => {
      console.log(`WebSocket opened: ${connectionId}`);
      socket.send(JSON.stringify({
        type: 'connection_established',
        connectionId,
        timestamp: new Date().toISOString()
      }));
    };
    
    socket.onmessage = async (event) => {
      try {
        const message = JSON.parse(event.data);
        console.log(`Received message from ${connectionId}:`, message);
        
        switch (message.type) {
          case 'subscribe_tender':
            connection.subscribedTenders.add(message.tenderId);
            socket.send(JSON.stringify({
              type: 'subscribed',
              resource: 'tender',
              resourceId: message.tenderId
            }));
            break;
            
          case 'unsubscribe_tender':
            connection.subscribedTenders.delete(message.tenderId);
            socket.send(JSON.stringify({
              type: 'unsubscribed',
              resource: 'tender',
              resourceId: message.tenderId
            }));
            break;
            
          case 'subscribe_channel':
            connection.subscribedChannels.add(message.channel);
            socket.send(JSON.stringify({
              type: 'subscribed',
              resource: 'channel',
              resourceId: message.channel
            }));
            break;
            
          case 'authenticate':
            connection.userId = message.userId;
            socket.send(JSON.stringify({
              type: 'authenticated',
              userId: message.userId
            }));
            break;
            
          case 'ping':
            socket.send(JSON.stringify({
              type: 'pong',
              timestamp: new Date().toISOString()
            }));
            break;
        }
      } catch (error) {
        console.error(`Error handling message from ${connectionId}:`, error);
      }
    };
    
    socket.onclose = () => {
      console.log(`WebSocket closed: ${connectionId}`);
      connections.delete(connectionId);
    };
    
    socket.onerror = (error) => {
      console.error(`WebSocket error for ${connectionId}:`, error);
      connections.delete(connectionId);
    };
    
    return response;
  }
  
  // Handle HTTP API endpoints
  if (req.method === 'POST') {
    const body = await req.json();
    
    switch (url.pathname) {
      case '/broadcast':
        const { channel, event } = body;
        await broadcastToChannel(channel, event);
        return new Response(JSON.stringify({ success: true }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
        
      case '/tender-broadcast':
        const { tenderId, event: tenderEvent } = body;
        await broadcastToTender(tenderId, tenderEvent);
        return new Response(JSON.stringify({ success: true }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
        
      case '/user-notification':
        const { userId, event: userEvent } = body;
        await broadcastToUser(userId, userEvent);
        return new Response(JSON.stringify({ success: true }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
    }
  }
  
  // Health check
  if (req.method === 'GET' && url.pathname === '/health') {
    return new Response(JSON.stringify({
      status: 'healthy',
      connections: connections.size,
      timestamp: new Date().toISOString()
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
  
  return new Response('Not Found', { status: 404, headers: corsHeaders });
});