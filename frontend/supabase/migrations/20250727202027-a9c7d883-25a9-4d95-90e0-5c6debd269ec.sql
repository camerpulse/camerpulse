-- Phase 6: Platform Enhancement Database Schema

-- Real-time chat system
CREATE TABLE IF NOT EXISTS public.chat_conversations (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    customer_id UUID NOT NULL,
    vendor_id UUID NOT NULL REFERENCES public.marketplace_vendors(id) ON DELETE CASCADE,
    conversation_type TEXT NOT NULL DEFAULT 'product_inquiry',
    related_product_id UUID REFERENCES public.marketplace_products(id) ON DELETE SET NULL,
    status TEXT NOT NULL DEFAULT 'active',
    last_message_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    UNIQUE(customer_id, vendor_id, related_product_id)
);

CREATE TABLE IF NOT EXISTS public.chat_messages (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    conversation_id UUID NOT NULL REFERENCES public.chat_conversations(id) ON DELETE CASCADE,
    sender_id UUID NOT NULL,
    sender_type TEXT NOT NULL CHECK (sender_type IN ('customer', 'vendor')),
    message_type TEXT NOT NULL DEFAULT 'text',
    content TEXT NOT NULL,
    metadata JSONB DEFAULT '{}',
    is_read BOOLEAN NOT NULL DEFAULT false,
    read_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.chat_attachments (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    message_id UUID NOT NULL REFERENCES public.chat_messages(id) ON DELETE CASCADE,
    file_url TEXT NOT NULL,
    file_name TEXT NOT NULL,
    file_type TEXT NOT NULL,
    file_size INTEGER,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Recommendation system
CREATE TABLE IF NOT EXISTS public.user_behavior_tracking (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL,
    action_type TEXT NOT NULL,
    target_type TEXT NOT NULL,
    target_id UUID NOT NULL,
    context_data JSONB DEFAULT '{}',
    session_id TEXT,
    user_agent TEXT,
    ip_address INET,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.product_recommendations (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL,
    product_id UUID NOT NULL REFERENCES public.marketplace_products(id) ON DELETE CASCADE,
    recommendation_type TEXT NOT NULL,
    confidence_score NUMERIC NOT NULL DEFAULT 0,
    reason_tags TEXT[] DEFAULT '{}',
    metadata JSONB DEFAULT '{}',
    is_clicked BOOLEAN NOT NULL DEFAULT false,
    is_purchased BOOLEAN NOT NULL DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    expires_at TIMESTAMP WITH TIME ZONE
);

CREATE TABLE IF NOT EXISTS public.recommendation_feedback (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL,
    recommendation_id UUID NOT NULL REFERENCES public.product_recommendations(id) ON DELETE CASCADE,
    feedback_type TEXT NOT NULL,
    rating INTEGER CHECK (rating >= 1 AND rating <= 5),
    feedback_text TEXT,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Payment transactions
CREATE TABLE IF NOT EXISTS public.payment_transactions (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    order_id UUID REFERENCES public.marketplace_orders(id) ON DELETE SET NULL,
    customer_id UUID NOT NULL,
    vendor_id UUID NOT NULL REFERENCES public.marketplace_vendors(id) ON DELETE CASCADE,
    stripe_payment_intent_id TEXT UNIQUE,
    stripe_session_id TEXT,
    amount NUMERIC NOT NULL,
    currency TEXT NOT NULL DEFAULT 'XAF',
    payment_status TEXT NOT NULL DEFAULT 'pending',
    payment_method TEXT,
    transaction_fee NUMERIC DEFAULT 0,
    platform_commission NUMERIC DEFAULT 0,
    vendor_payout NUMERIC DEFAULT 0,
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.payment_disputes (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    transaction_id UUID NOT NULL REFERENCES public.payment_transactions(id) ON DELETE CASCADE,
    customer_id UUID NOT NULL,
    vendor_id UUID NOT NULL REFERENCES public.marketplace_vendors(id) ON DELETE CASCADE,
    dispute_type TEXT NOT NULL,
    dispute_reason TEXT NOT NULL,
    dispute_amount NUMERIC NOT NULL,
    status TEXT NOT NULL DEFAULT 'open',
    customer_evidence JSONB DEFAULT '{}',
    vendor_response JSONB DEFAULT '{}',
    admin_notes TEXT,
    resolved_at TIMESTAMP WITH TIME ZONE,
    resolved_by UUID,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Mobile app optimization
CREATE TABLE IF NOT EXISTS public.device_tokens (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL,
    device_type TEXT NOT NULL,
    device_token TEXT NOT NULL UNIQUE,
    device_info JSONB DEFAULT '{}',
    is_active BOOLEAN NOT NULL DEFAULT true,
    last_used_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.push_notifications (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL,
    notification_type TEXT NOT NULL,
    title TEXT NOT NULL,
    message TEXT NOT NULL,
    data JSONB DEFAULT '{}',
    delivery_status TEXT NOT NULL DEFAULT 'pending',
    delivered_at TIMESTAMP WITH TIME ZONE,
    read_at TIMESTAMP WITH TIME ZONE,
    action_taken BOOLEAN NOT NULL DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Performance optimization tables
CREATE TABLE IF NOT EXISTS public.api_performance_logs (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    endpoint_path TEXT NOT NULL,
    http_method TEXT NOT NULL,
    response_time_ms INTEGER NOT NULL,
    status_code INTEGER NOT NULL,
    user_id UUID,
    request_size_bytes INTEGER,
    response_size_bytes INTEGER,
    user_agent TEXT,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_chat_conversations_customer ON public.chat_conversations(customer_id);
CREATE INDEX IF NOT EXISTS idx_chat_conversations_vendor ON public.chat_conversations(vendor_id);
CREATE INDEX IF NOT EXISTS idx_chat_conversations_product ON public.chat_conversations(related_product_id);
CREATE INDEX IF NOT EXISTS idx_chat_messages_conversation ON public.chat_messages(conversation_id);
CREATE INDEX IF NOT EXISTS idx_chat_messages_sender ON public.chat_messages(sender_id);
CREATE INDEX IF NOT EXISTS idx_chat_messages_created ON public.chat_messages(created_at);
CREATE INDEX IF NOT EXISTS idx_user_behavior_user ON public.user_behavior_tracking(user_id);
CREATE INDEX IF NOT EXISTS idx_user_behavior_action ON public.user_behavior_tracking(action_type);
CREATE INDEX IF NOT EXISTS idx_user_behavior_target ON public.user_behavior_tracking(target_type, target_id);
CREATE INDEX IF NOT EXISTS idx_product_recommendations_user ON public.product_recommendations(user_id);
CREATE INDEX IF NOT EXISTS idx_product_recommendations_product ON public.product_recommendations(product_id);
CREATE INDEX IF NOT EXISTS idx_product_recommendations_type ON public.product_recommendations(recommendation_type);
CREATE INDEX IF NOT EXISTS idx_payment_transactions_customer ON public.payment_transactions(customer_id);
CREATE INDEX IF NOT EXISTS idx_payment_transactions_vendor ON public.payment_transactions(vendor_id);
CREATE INDEX IF NOT EXISTS idx_payment_transactions_status ON public.payment_transactions(payment_status);
CREATE INDEX IF NOT EXISTS idx_device_tokens_user ON public.device_tokens(user_id);
CREATE INDEX IF NOT EXISTS idx_push_notifications_user ON public.push_notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_api_performance_endpoint ON public.api_performance_logs(endpoint_path);

-- Add triggers for updated_at columns
CREATE TRIGGER update_chat_conversations_updated_at
    BEFORE UPDATE ON public.chat_conversations
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_payment_transactions_updated_at
    BEFORE UPDATE ON public.payment_transactions
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_payment_disputes_updated_at
    BEFORE UPDATE ON public.payment_disputes
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_device_tokens_updated_at
    BEFORE UPDATE ON public.device_tokens
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

-- Update last_message_at trigger for conversations
CREATE OR REPLACE FUNCTION update_conversation_last_message()
RETURNS TRIGGER AS $$
BEGIN
    UPDATE public.chat_conversations 
    SET 
        last_message_at = NEW.created_at,
        updated_at = NEW.created_at
    WHERE id = NEW.conversation_id;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_conversation_last_message_trigger
    AFTER INSERT ON public.chat_messages
    FOR EACH ROW
    EXECUTE FUNCTION update_conversation_last_message();

-- RLS Policies
ALTER TABLE public.chat_conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.chat_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.chat_attachments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_behavior_tracking ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.product_recommendations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.recommendation_feedback ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payment_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payment_disputes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.device_tokens ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.push_notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.api_performance_logs ENABLE ROW LEVEL SECURITY;

-- Chat conversation policies
CREATE POLICY "Users can view their chat conversations" ON public.chat_conversations
    FOR SELECT USING (
        customer_id = auth.uid() OR 
        EXISTS (
            SELECT 1 FROM public.marketplace_vendors mv
            WHERE mv.id = chat_conversations.vendor_id
            AND mv.user_id = auth.uid()
        )
    );

CREATE POLICY "Users can create conversations" ON public.chat_conversations
    FOR INSERT WITH CHECK (
        customer_id = auth.uid() OR 
        EXISTS (
            SELECT 1 FROM public.marketplace_vendors mv
            WHERE mv.id = chat_conversations.vendor_id
            AND mv.user_id = auth.uid()
        )
    );

-- Chat message policies
CREATE POLICY "Users can view messages in their conversations" ON public.chat_messages
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.chat_conversations cc
            WHERE cc.id = chat_messages.conversation_id
            AND (
                cc.customer_id = auth.uid() OR 
                EXISTS (
                    SELECT 1 FROM public.marketplace_vendors mv
                    WHERE mv.id = cc.vendor_id
                    AND mv.user_id = auth.uid()
                )
            )
        )
    );

CREATE POLICY "Users can send messages" ON public.chat_messages
    FOR INSERT WITH CHECK (
        sender_id = auth.uid() AND
        EXISTS (
            SELECT 1 FROM public.chat_conversations cc
            WHERE cc.id = chat_messages.conversation_id
            AND (
                cc.customer_id = auth.uid() OR 
                EXISTS (
                    SELECT 1 FROM public.marketplace_vendors mv
                    WHERE mv.id = cc.vendor_id
                    AND mv.user_id = auth.uid()
                )
            )
        )
    );

-- Behavior tracking policies
CREATE POLICY "Users can create their own behavior tracking" ON public.user_behavior_tracking
    FOR INSERT WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can view their own behavior tracking" ON public.user_behavior_tracking
    FOR SELECT USING (user_id = auth.uid());

-- Recommendation policies
CREATE POLICY "Users can view their recommendations" ON public.product_recommendations
    FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "System can create recommendations" ON public.product_recommendations
    FOR INSERT WITH CHECK (true);

CREATE POLICY "Users can update their recommendations" ON public.product_recommendations
    FOR UPDATE USING (user_id = auth.uid());

-- Payment transaction policies
CREATE POLICY "Users can view their payment transactions" ON public.payment_transactions
    FOR SELECT USING (
        customer_id = auth.uid() OR 
        EXISTS (
            SELECT 1 FROM public.marketplace_vendors mv
            WHERE mv.id = payment_transactions.vendor_id
            AND mv.user_id = auth.uid()
        )
    );

-- Device token policies
CREATE POLICY "Users can manage their device tokens" ON public.device_tokens
    FOR ALL USING (user_id = auth.uid());

-- Push notification policies
CREATE POLICY "Users can view their notifications" ON public.push_notifications
    FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "System can create notifications" ON public.push_notifications
    FOR INSERT WITH CHECK (true);

-- Enable realtime for chat
ALTER PUBLICATION supabase_realtime ADD TABLE public.chat_conversations;
ALTER PUBLICATION supabase_realtime ADD TABLE public.chat_messages;
ALTER PUBLICATION supabase_realtime ADD TABLE public.push_notifications;