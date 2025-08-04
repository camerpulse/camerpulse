import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  const { headers } = req;
  const upgradeHeader = headers.get("upgrade") || "";

  if (upgradeHeader.toLowerCase() !== "websocket") {
    return new Response("Expected WebSocket connection", { 
      status: 400,
      headers: corsHeaders 
    });
  }

  const { socket, response } = Deno.upgradeWebSocket(req);
  
  // Parse URL for village ID
  const url = new URL(req.url);
  const villageId = url.searchParams.get('village_id');
  const userId = url.searchParams.get('user_id');
  
  if (!villageId || !userId) {
    socket.close(1000, "Missing village_id or user_id");
    return response;
  }

  // Store connection info
  const connectionInfo = {
    villageId,
    userId,
    joinedAt: new Date().toISOString()
  };

  socket.onopen = () => {
    console.log(`User ${userId} connected to village ${villageId}`);
    
    // Send welcome message
    socket.send(JSON.stringify({
      type: 'welcome',
      message: 'Connected to village chat',
      villageId,
      timestamp: new Date().toISOString()
    }));

    // Broadcast user joined
    broadcastToVillage(villageId, {
      type: 'user_joined',
      userId,
      timestamp: new Date().toISOString()
    }, userId);
  };

  socket.onmessage = async (event) => {
    try {
      const message = JSON.parse(event.data);
      
      switch (message.type) {
        case 'chat_message':
          await handleChatMessage(socket, message, connectionInfo);
          break;
        case 'typing_start':
          broadcastToVillage(villageId, {
            type: 'user_typing',
            userId,
            typing: true,
            timestamp: new Date().toISOString()
          }, userId);
          break;
        case 'typing_stop':
          broadcastToVillage(villageId, {
            type: 'user_typing',
            userId,
            typing: false,
            timestamp: new Date().toISOString()
          }, userId);
          break;
        case 'get_recent_messages':
          await sendRecentMessages(socket, villageId);
          break;
      }
    } catch (error) {
      console.error('Error handling message:', error);
      socket.send(JSON.stringify({
        type: 'error',
        message: 'Invalid message format'
      }));
    }
  };

  socket.onclose = () => {
    console.log(`User ${userId} disconnected from village ${villageId}`);
    
    // Broadcast user left
    broadcastToVillage(villageId, {
      type: 'user_left',
      userId,
      timestamp: new Date().toISOString()
    }, userId);
  };

  socket.onerror = (error) => {
    console.error('WebSocket error:', error);
  };

  return response;
});

// Store active connections (in a real implementation, use Redis)
const activeConnections = new Map<string, Set<WebSocket>>();

function broadcastToVillage(villageId: string, message: any, excludeUserId?: string) {
  const connections = activeConnections.get(villageId);
  if (connections) {
    const messageStr = JSON.stringify(message);
    connections.forEach(ws => {
      if (ws.readyState === WebSocket.OPEN) {
        ws.send(messageStr);
      }
    });
  }
}

async function handleChatMessage(socket: WebSocket, message: any, connectionInfo: any) {
  const { villageId, userId } = connectionInfo;
  
  // Validate message
  if (!message.content || message.content.trim().length === 0) {
    socket.send(JSON.stringify({
      type: 'error',
      message: 'Message content cannot be empty'
    }));
    return;
  }

  const chatMessage = {
    id: crypto.randomUUID(),
    villageId,
    userId,
    content: message.content.trim(),
    timestamp: new Date().toISOString(),
    type: 'chat_message'
  };

  // Store message (in a real implementation, save to database)
  console.log('Storing message:', chatMessage);

  // Broadcast to all users in village
  broadcastToVillage(villageId, {
    type: 'new_message',
    message: chatMessage,
    timestamp: chatMessage.timestamp
  });
}

async function sendRecentMessages(socket: WebSocket, villageId: string) {
  // In a real implementation, fetch from database
  const recentMessages = [
    {
      id: '1',
      villageId,
      userId: 'system',
      content: 'Welcome to the village chat!',
      timestamp: new Date(Date.now() - 3600000).toISOString(),
      type: 'chat_message'
    }
  ];

  socket.send(JSON.stringify({
    type: 'recent_messages',
    messages: recentMessages
  }));
}