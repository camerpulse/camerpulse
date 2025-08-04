-- Phase 7: Administrative Features Database Schema

-- Admin activity logging
CREATE TABLE IF NOT EXISTS public.admin_activity_logs (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    admin_user_id UUID NOT NULL,
    action_type TEXT NOT NULL,
    target_type TEXT NOT NULL,
    target_id UUID,
    action_details JSONB DEFAULT '{}',
    ip_address INET,
    user_agent TEXT,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Dispute resolution system
CREATE TABLE IF NOT EXISTS public.marketplace_disputes (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    dispute_number TEXT UNIQUE NOT NULL,
    customer_id UUID NOT NULL,
    vendor_id UUID NOT NULL REFERENCES public.marketplace_vendors(id) ON DELETE CASCADE,
    order_id UUID REFERENCES public.marketplace_orders(id) ON DELETE SET NULL,
    product_id UUID REFERENCES public.marketplace_products(id) ON DELETE SET NULL,
    dispute_type TEXT NOT NULL,
    dispute_category TEXT NOT NULL,
    dispute_reason TEXT NOT NULL,
    customer_evidence JSONB DEFAULT '{}',
    vendor_response JSONB DEFAULT '{}',
    admin_notes TEXT,
    priority_level TEXT NOT NULL DEFAULT 'medium',
    status TEXT NOT NULL DEFAULT 'open',
    assigned_admin_id UUID,
    resolution_details TEXT,
    compensation_amount NUMERIC DEFAULT 0,
    resolved_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Financial reporting and commission tracking
CREATE TABLE IF NOT EXISTS public.financial_reports (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    report_type TEXT NOT NULL,
    report_period_start DATE NOT NULL,
    report_period_end DATE NOT NULL,
    total_revenue NUMERIC NOT NULL DEFAULT 0,
    total_commission NUMERIC NOT NULL DEFAULT 0,
    total_vendor_payouts NUMERIC NOT NULL DEFAULT 0,
    transaction_count INTEGER NOT NULL DEFAULT 0,
    vendor_count INTEGER NOT NULL DEFAULT 0,
    customer_count INTEGER NOT NULL DEFAULT 0,
    report_data JSONB DEFAULT '{}',
    generated_by_admin_id UUID NOT NULL,
    generated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.commission_tracking (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    transaction_id UUID NOT NULL REFERENCES public.payment_transactions(id) ON DELETE CASCADE,
    vendor_id UUID NOT NULL REFERENCES public.marketplace_vendors(id) ON DELETE CASCADE,
    order_id UUID REFERENCES public.marketplace_orders(id) ON DELETE SET NULL,
    gross_amount NUMERIC NOT NULL,
    commission_rate NUMERIC NOT NULL,
    commission_amount NUMERIC NOT NULL,
    vendor_payout NUMERIC NOT NULL,
    payment_processing_fee NUMERIC DEFAULT 0,
    net_revenue NUMERIC NOT NULL,
    status TEXT NOT NULL DEFAULT 'pending',
    paid_out_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Vendor performance analytics
CREATE TABLE IF NOT EXISTS public.vendor_performance_metrics (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    vendor_id UUID NOT NULL REFERENCES public.marketplace_vendors(id) ON DELETE CASCADE,
    metric_type TEXT NOT NULL,
    metric_period TEXT NOT NULL,
    period_start DATE NOT NULL,
    period_end DATE NOT NULL,
    metric_value NUMERIC NOT NULL DEFAULT 0,
    metric_data JSONB DEFAULT '{}',
    calculated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.vendor_ratings_summary (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    vendor_id UUID NOT NULL REFERENCES public.marketplace_vendors(id) ON DELETE CASCADE,
    total_reviews INTEGER NOT NULL DEFAULT 0,
    average_rating NUMERIC NOT NULL DEFAULT 0,
    five_star_count INTEGER NOT NULL DEFAULT 0,
    four_star_count INTEGER NOT NULL DEFAULT 0,
    three_star_count INTEGER NOT NULL DEFAULT 0,
    two_star_count INTEGER NOT NULL DEFAULT 0,
    one_star_count INTEGER NOT NULL DEFAULT 0,
    response_rate NUMERIC DEFAULT 0,
    average_response_time_hours NUMERIC DEFAULT 0,
    last_calculated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Admin notifications and alerts
CREATE TABLE IF NOT EXISTS public.admin_alerts (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    alert_type TEXT NOT NULL,
    alert_category TEXT NOT NULL,
    severity TEXT NOT NULL DEFAULT 'medium',
    title TEXT NOT NULL,
    message TEXT NOT NULL,
    related_entity_type TEXT,
    related_entity_id UUID,
    alert_data JSONB DEFAULT '{}',
    is_read BOOLEAN NOT NULL DEFAULT false,
    assigned_admin_id UUID,
    auto_generated BOOLEAN NOT NULL DEFAULT false,
    expires_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    read_at TIMESTAMP WITH TIME ZONE
);

-- Vendor compliance tracking
CREATE TABLE IF NOT EXISTS public.vendor_compliance_checks (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    vendor_id UUID NOT NULL REFERENCES public.marketplace_vendors(id) ON DELETE CASCADE,
    check_type TEXT NOT NULL,
    check_status TEXT NOT NULL DEFAULT 'pending',
    compliance_score NUMERIC DEFAULT 0,
    issues_found JSONB DEFAULT '[]',
    recommendations JSONB DEFAULT '[]',
    checked_by_admin_id UUID,
    next_check_due DATE,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_admin_activity_logs_admin ON public.admin_activity_logs(admin_user_id);
CREATE INDEX IF NOT EXISTS idx_admin_activity_logs_created ON public.admin_activity_logs(created_at);
CREATE INDEX IF NOT EXISTS idx_marketplace_disputes_customer ON public.marketplace_disputes(customer_id);
CREATE INDEX IF NOT EXISTS idx_marketplace_disputes_vendor ON public.marketplace_disputes(vendor_id);
CREATE INDEX IF NOT EXISTS idx_marketplace_disputes_status ON public.marketplace_disputes(status);
CREATE INDEX IF NOT EXISTS idx_marketplace_disputes_assigned ON public.marketplace_disputes(assigned_admin_id);
CREATE INDEX IF NOT EXISTS idx_financial_reports_period ON public.financial_reports(report_period_start, report_period_end);
CREATE INDEX IF NOT EXISTS idx_commission_tracking_vendor ON public.commission_tracking(vendor_id);
CREATE INDEX IF NOT EXISTS idx_commission_tracking_status ON public.commission_tracking(status);
CREATE INDEX IF NOT EXISTS idx_vendor_performance_vendor ON public.vendor_performance_metrics(vendor_id);
CREATE INDEX IF NOT EXISTS idx_vendor_performance_period ON public.vendor_performance_metrics(period_start, period_end);
CREATE INDEX IF NOT EXISTS idx_admin_alerts_assigned ON public.admin_alerts(assigned_admin_id);
CREATE INDEX IF NOT EXISTS idx_admin_alerts_unread ON public.admin_alerts(is_read, created_at);
CREATE INDEX IF NOT EXISTS idx_vendor_compliance_vendor ON public.vendor_compliance_checks(vendor_id);

-- Generate dispute number function
CREATE OR REPLACE FUNCTION public.generate_dispute_number()
RETURNS TEXT AS $$
DECLARE
    new_number TEXT;
    counter INTEGER := 0;
BEGIN
    LOOP
        new_number := 'DISP-' || TO_CHAR(NOW(), 'YYYYMMDD') || '-' || LPAD((RANDOM() * 99999)::INTEGER::TEXT, 5, '0');
        
        IF NOT EXISTS (SELECT 1 FROM public.marketplace_disputes WHERE dispute_number = new_number) THEN
            EXIT;
        END IF;
        
        counter := counter + 1;
        IF counter > 100 THEN
            RAISE EXCEPTION 'Unable to generate unique dispute number';
        END IF;
    END LOOP;
    
    RETURN new_number;
END;
$$ LANGUAGE plpgsql;

-- Trigger to set dispute number
CREATE OR REPLACE FUNCTION public.set_dispute_number()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.dispute_number IS NULL THEN
        NEW.dispute_number := generate_dispute_number();
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER set_dispute_number_trigger
    BEFORE INSERT ON public.marketplace_disputes
    FOR EACH ROW
    EXECUTE FUNCTION public.set_dispute_number();

-- Add triggers for updated_at columns
CREATE TRIGGER update_marketplace_disputes_updated_at
    BEFORE UPDATE ON public.marketplace_disputes
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_commission_tracking_updated_at
    BEFORE UPDATE ON public.commission_tracking
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_vendor_ratings_summary_updated_at
    BEFORE UPDATE ON public.vendor_ratings_summary
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_vendor_compliance_checks_updated_at
    BEFORE UPDATE ON public.vendor_compliance_checks
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

-- Calculate vendor performance metrics function
CREATE OR REPLACE FUNCTION public.calculate_vendor_performance_metrics(p_vendor_id UUID, p_period_start DATE, p_period_end DATE)
RETURNS VOID AS $$
DECLARE
    v_total_orders INTEGER := 0;
    v_total_revenue NUMERIC := 0;
    v_avg_order_value NUMERIC := 0;
    v_fulfillment_rate NUMERIC := 0;
    v_customer_satisfaction NUMERIC := 0;
BEGIN
    -- Calculate total orders
    SELECT COUNT(*) INTO v_total_orders
    FROM public.marketplace_orders mo
    WHERE mo.vendor_id = p_vendor_id
    AND mo.created_at::date BETWEEN p_period_start AND p_period_end;
    
    -- Calculate total revenue
    SELECT COALESCE(SUM(mo.total_amount), 0) INTO v_total_revenue
    FROM public.marketplace_orders mo
    WHERE mo.vendor_id = p_vendor_id
    AND mo.status = 'completed'
    AND mo.created_at::date BETWEEN p_period_start AND p_period_end;
    
    -- Calculate average order value
    IF v_total_orders > 0 THEN
        v_avg_order_value := v_total_revenue / v_total_orders;
    END IF;
    
    -- Calculate fulfillment rate
    SELECT 
        CASE 
            WHEN COUNT(*) > 0 THEN 
                (COUNT(*) FILTER (WHERE status IN ('completed', 'shipped')))::NUMERIC / COUNT(*) * 100
            ELSE 0 
        END INTO v_fulfillment_rate
    FROM public.marketplace_orders mo
    WHERE mo.vendor_id = p_vendor_id
    AND mo.created_at::date BETWEEN p_period_start AND p_period_end;
    
    -- Insert/update performance metrics
    INSERT INTO public.vendor_performance_metrics (
        vendor_id, metric_type, metric_period, period_start, period_end, metric_value, metric_data
    ) VALUES 
    (p_vendor_id, 'total_orders', 'custom', p_period_start, p_period_end, v_total_orders, '{}'),
    (p_vendor_id, 'total_revenue', 'custom', p_period_start, p_period_end, v_total_revenue, '{}'),
    (p_vendor_id, 'avg_order_value', 'custom', p_period_start, p_period_end, v_avg_order_value, '{}'),
    (p_vendor_id, 'fulfillment_rate', 'custom', p_period_start, p_period_end, v_fulfillment_rate, '{}')
    ON CONFLICT (vendor_id, metric_type, period_start, period_end) DO UPDATE SET
        metric_value = EXCLUDED.metric_value,
        calculated_at = now();
END;
$$ LANGUAGE plpgsql;

-- RLS Policies
ALTER TABLE public.admin_activity_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.marketplace_disputes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.financial_reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.commission_tracking ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.vendor_performance_metrics ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.vendor_ratings_summary ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.admin_alerts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.vendor_compliance_checks ENABLE ROW LEVEL SECURITY;

-- Admin activity logs policies
CREATE POLICY "Admins can view all activity logs" ON public.admin_activity_logs
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.user_roles
            WHERE user_id = auth.uid() AND role = 'admin'
        )
    );

CREATE POLICY "System can log admin activities" ON public.admin_activity_logs
    FOR INSERT WITH CHECK (true);

-- Marketplace disputes policies
CREATE POLICY "Admins can manage all disputes" ON public.marketplace_disputes
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM public.user_roles
            WHERE user_id = auth.uid() AND role = 'admin'
        )
    );

CREATE POLICY "Customers can view their disputes" ON public.marketplace_disputes
    FOR SELECT USING (customer_id = auth.uid());

CREATE POLICY "Vendors can view their disputes" ON public.marketplace_disputes
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.marketplace_vendors mv
            WHERE mv.id = marketplace_disputes.vendor_id
            AND mv.user_id = auth.uid()
        )
    );

-- Financial reports policies
CREATE POLICY "Admins can manage financial reports" ON public.financial_reports
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM public.user_roles
            WHERE user_id = auth.uid() AND role = 'admin'
        )
    );

-- Commission tracking policies
CREATE POLICY "Admins can view all commission data" ON public.commission_tracking
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.user_roles
            WHERE user_id = auth.uid() AND role = 'admin'
        )
    );

CREATE POLICY "Vendors can view their commission data" ON public.commission_tracking
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.marketplace_vendors mv
            WHERE mv.id = commission_tracking.vendor_id
            AND mv.user_id = auth.uid()
        )
    );

-- Vendor performance metrics policies
CREATE POLICY "Admins can view all performance metrics" ON public.vendor_performance_metrics
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.user_roles
            WHERE user_id = auth.uid() AND role = 'admin'
        )
    );

CREATE POLICY "Vendors can view their performance metrics" ON public.vendor_performance_metrics
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.marketplace_vendors mv
            WHERE mv.id = vendor_performance_metrics.vendor_id
            AND mv.user_id = auth.uid()
        )
    );

-- Admin alerts policies
CREATE POLICY "Admins can manage alerts" ON public.admin_alerts
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM public.user_roles
            WHERE user_id = auth.uid() AND role = 'admin'
        )
    );

-- Vendor compliance policies
CREATE POLICY "Admins can manage compliance checks" ON public.vendor_compliance_checks
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM public.user_roles
            WHERE user_id = auth.uid() AND role = 'admin'
        )
    );

CREATE POLICY "Vendors can view their compliance status" ON public.vendor_compliance_checks
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.marketplace_vendors mv
            WHERE mv.id = vendor_compliance_checks.vendor_id
            AND mv.user_id = auth.uid()
        )
    );