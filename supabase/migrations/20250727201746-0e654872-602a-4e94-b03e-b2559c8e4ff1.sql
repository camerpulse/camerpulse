-- Phase 6: Advanced Marketplace Features Database Schema (Fixed)

-- Multi-vendor order management
CREATE TABLE IF NOT EXISTS public.multi_vendor_orders (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    customer_id UUID NOT NULL,
    customer_email TEXT NOT NULL,
    order_number TEXT NOT NULL UNIQUE,
    total_amount NUMERIC NOT NULL DEFAULT 0,
    currency TEXT NOT NULL DEFAULT 'XAF',
    order_status TEXT NOT NULL DEFAULT 'pending',
    payment_status TEXT NOT NULL DEFAULT 'pending',
    shipping_address JSONB,
    billing_address JSONB,
    order_notes TEXT,
    coordination_status TEXT NOT NULL DEFAULT 'pending',
    estimated_delivery_date DATE,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.multi_vendor_order_vendors (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    multi_vendor_order_id UUID NOT NULL REFERENCES public.multi_vendor_orders(id) ON DELETE CASCADE,
    vendor_id UUID NOT NULL REFERENCES public.marketplace_vendors(id) ON DELETE CASCADE,
    vendor_order_number TEXT NOT NULL,
    vendor_subtotal NUMERIC NOT NULL DEFAULT 0,
    vendor_status TEXT NOT NULL DEFAULT 'pending',
    vendor_notes TEXT,
    estimated_fulfillment_date DATE,
    actual_fulfillment_date DATE,
    tracking_number TEXT,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    UNIQUE(multi_vendor_order_id, vendor_id)
);

-- Bulk operations tracking
CREATE TABLE IF NOT EXISTS public.vendor_bulk_operations (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    vendor_id UUID NOT NULL REFERENCES public.marketplace_vendors(id) ON DELETE CASCADE,
    user_id UUID NOT NULL,
    operation_type TEXT NOT NULL,
    operation_name TEXT NOT NULL,
    target_products UUID[] NOT NULL DEFAULT '{}',
    operation_params JSONB NOT NULL DEFAULT '{}',
    status TEXT NOT NULL DEFAULT 'pending',
    progress_percentage INTEGER NOT NULL DEFAULT 0,
    total_items INTEGER NOT NULL DEFAULT 0,
    processed_items INTEGER NOT NULL DEFAULT 0,
    failed_items INTEGER NOT NULL DEFAULT 0,
    success_items INTEGER NOT NULL DEFAULT 0,
    error_log JSONB DEFAULT '[]',
    result_summary JSONB DEFAULT '{}',
    started_at TIMESTAMP WITH TIME ZONE,
    completed_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Analytics tables
CREATE TABLE IF NOT EXISTS public.marketplace_analytics_metrics (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    metric_type TEXT NOT NULL,
    metric_name TEXT NOT NULL,
    entity_type TEXT NOT NULL,
    entity_id UUID,
    period_type TEXT NOT NULL DEFAULT 'daily',
    period_start DATE NOT NULL,
    period_end DATE NOT NULL,
    metric_value NUMERIC NOT NULL DEFAULT 0,
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    UNIQUE(metric_type, entity_type, entity_id, period_type, period_start)
);

CREATE TABLE IF NOT EXISTS public.revenue_analytics (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    vendor_id UUID REFERENCES public.marketplace_vendors(id) ON DELETE CASCADE,
    period_type TEXT NOT NULL DEFAULT 'daily',
    period_start DATE NOT NULL,
    period_end DATE NOT NULL,
    gross_revenue NUMERIC NOT NULL DEFAULT 0,
    net_revenue NUMERIC NOT NULL DEFAULT 0,
    commission_amount NUMERIC NOT NULL DEFAULT 0,
    transaction_count INTEGER NOT NULL DEFAULT 0,
    average_order_value NUMERIC NOT NULL DEFAULT 0,
    refund_amount NUMERIC NOT NULL DEFAULT 0,
    currency TEXT NOT NULL DEFAULT 'XAF',
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    UNIQUE(vendor_id, period_type, period_start)
);

-- Inventory management
CREATE TABLE IF NOT EXISTS public.inventory_items (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    product_id UUID NOT NULL REFERENCES public.marketplace_products(id) ON DELETE CASCADE,
    vendor_id UUID NOT NULL REFERENCES public.marketplace_vendors(id) ON DELETE CASCADE,
    sku TEXT NOT NULL,
    current_stock INTEGER NOT NULL DEFAULT 0,
    reserved_stock INTEGER NOT NULL DEFAULT 0,
    available_stock INTEGER GENERATED ALWAYS AS (current_stock - reserved_stock) STORED,
    reorder_point INTEGER NOT NULL DEFAULT 10,
    max_stock_level INTEGER NOT NULL DEFAULT 1000,
    cost_per_unit NUMERIC NOT NULL DEFAULT 0,
    supplier_info JSONB DEFAULT '{}',
    location_info JSONB DEFAULT '{}',
    last_restock_date DATE,
    last_sold_date DATE,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    UNIQUE(product_id, vendor_id)
);

CREATE TABLE IF NOT EXISTS public.inventory_movements (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    inventory_item_id UUID NOT NULL REFERENCES public.inventory_items(id) ON DELETE CASCADE,
    movement_type TEXT NOT NULL,
    quantity_change INTEGER NOT NULL,
    reference_type TEXT,
    reference_id UUID,
    reason TEXT,
    unit_cost NUMERIC DEFAULT 0,
    total_cost NUMERIC DEFAULT 0,
    performed_by UUID NOT NULL,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.low_stock_alerts (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    inventory_item_id UUID NOT NULL REFERENCES public.inventory_items(id) ON DELETE CASCADE,
    vendor_id UUID NOT NULL REFERENCES public.marketplace_vendors(id) ON DELETE CASCADE,
    alert_type TEXT NOT NULL DEFAULT 'low_stock',
    alert_threshold INTEGER NOT NULL,
    current_stock INTEGER NOT NULL,
    is_acknowledged BOOLEAN NOT NULL DEFAULT false,
    acknowledged_by UUID,
    acknowledged_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    resolved_at TIMESTAMP WITH TIME ZONE
);

CREATE TABLE IF NOT EXISTS public.supplier_management (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    vendor_id UUID NOT NULL REFERENCES public.marketplace_vendors(id) ON DELETE CASCADE,
    supplier_name TEXT NOT NULL,
    supplier_contact_email TEXT,
    supplier_contact_phone TEXT,
    supplier_address JSONB,
    supplier_rating NUMERIC DEFAULT 0,
    supplier_status TEXT NOT NULL DEFAULT 'active',
    payment_terms TEXT,
    delivery_terms TEXT,
    minimum_order_quantity INTEGER DEFAULT 1,
    lead_time_days INTEGER DEFAULT 7,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_multi_vendor_orders_customer ON public.multi_vendor_orders(customer_id);
CREATE INDEX IF NOT EXISTS idx_multi_vendor_orders_status ON public.multi_vendor_orders(order_status);
CREATE INDEX IF NOT EXISTS idx_multi_vendor_order_vendors_order ON public.multi_vendor_order_vendors(multi_vendor_order_id);
CREATE INDEX IF NOT EXISTS idx_vendor_bulk_operations_vendor ON public.vendor_bulk_operations(vendor_id);
CREATE INDEX IF NOT EXISTS idx_vendor_bulk_operations_status ON public.vendor_bulk_operations(status);
CREATE INDEX IF NOT EXISTS idx_analytics_metrics_entity ON public.marketplace_analytics_metrics(entity_type, entity_id);
CREATE INDEX IF NOT EXISTS idx_analytics_metrics_period ON public.marketplace_analytics_metrics(period_type, period_start);
CREATE INDEX IF NOT EXISTS idx_revenue_analytics_vendor ON public.revenue_analytics(vendor_id);
CREATE INDEX IF NOT EXISTS idx_inventory_items_product ON public.inventory_items(product_id);
CREATE INDEX IF NOT EXISTS idx_inventory_items_vendor ON public.inventory_items(vendor_id);
CREATE INDEX IF NOT EXISTS idx_inventory_movements_item ON public.inventory_movements(inventory_item_id);
CREATE INDEX IF NOT EXISTS idx_low_stock_alerts_vendor ON public.low_stock_alerts(vendor_id);
CREATE INDEX IF NOT EXISTS idx_low_stock_alerts_acknowledged ON public.low_stock_alerts(is_acknowledged);

-- Add triggers for updated_at columns
CREATE TRIGGER update_multi_vendor_orders_updated_at
    BEFORE UPDATE ON public.multi_vendor_orders
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_multi_vendor_order_vendors_updated_at
    BEFORE UPDATE ON public.multi_vendor_order_vendors
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_vendor_bulk_operations_updated_at
    BEFORE UPDATE ON public.vendor_bulk_operations
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_marketplace_analytics_metrics_updated_at
    BEFORE UPDATE ON public.marketplace_analytics_metrics
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_revenue_analytics_updated_at
    BEFORE UPDATE ON public.revenue_analytics
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_inventory_items_updated_at
    BEFORE UPDATE ON public.inventory_items
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_supplier_management_updated_at
    BEFORE UPDATE ON public.supplier_management
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

-- RLS Policies
ALTER TABLE public.multi_vendor_orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.multi_vendor_order_vendors ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.vendor_bulk_operations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.marketplace_analytics_metrics ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.revenue_analytics ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.inventory_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.inventory_movements ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.low_stock_alerts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.supplier_management ENABLE ROW LEVEL SECURITY;

-- Multi-vendor orders policies
CREATE POLICY "Customers can view their multi-vendor orders" ON public.multi_vendor_orders
    FOR SELECT USING (auth.uid()::text = customer_id::text);

CREATE POLICY "Vendors can view orders containing their products" ON public.multi_vendor_orders
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.multi_vendor_order_vendors mvov
            JOIN public.marketplace_vendors mv ON mvov.vendor_id = mv.id
            WHERE mvov.multi_vendor_order_id = multi_vendor_orders.id
            AND mv.user_id = auth.uid()
        )
    );

CREATE POLICY "System can manage multi-vendor orders" ON public.multi_vendor_orders
    FOR ALL USING (true) WITH CHECK (true);

-- Multi-vendor order vendors policies
CREATE POLICY "Vendors can manage their order segments" ON public.multi_vendor_order_vendors
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM public.marketplace_vendors mv
            WHERE mv.id = multi_vendor_order_vendors.vendor_id
            AND mv.user_id = auth.uid()
        )
    );

-- Bulk operations policies
CREATE POLICY "Vendors can manage their bulk operations" ON public.vendor_bulk_operations
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM public.marketplace_vendors mv
            WHERE mv.id = vendor_bulk_operations.vendor_id
            AND mv.user_id = auth.uid()
        )
    );

-- Analytics policies
CREATE POLICY "Vendors can view their analytics" ON public.marketplace_analytics_metrics
    FOR SELECT USING (
        entity_type = 'vendor' AND EXISTS (
            SELECT 1 FROM public.marketplace_vendors mv
            WHERE mv.id = marketplace_analytics_metrics.entity_id
            AND mv.user_id = auth.uid()
        )
    );

CREATE POLICY "Admins can view all analytics" ON public.marketplace_analytics_metrics
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM public.user_roles
            WHERE user_roles.user_id = auth.uid()
            AND user_roles.role = 'admin'
        )
    );

-- Revenue analytics policies
CREATE POLICY "Vendors can view their revenue analytics" ON public.revenue_analytics
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.marketplace_vendors mv
            WHERE mv.id = revenue_analytics.vendor_id
            AND mv.user_id = auth.uid()
        )
    );

-- Inventory policies
CREATE POLICY "Vendors can manage their inventory" ON public.inventory_items
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM public.marketplace_vendors mv
            WHERE mv.id = inventory_items.vendor_id
            AND mv.user_id = auth.uid()
        )
    );

CREATE POLICY "Vendors can view their inventory movements" ON public.inventory_movements
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.inventory_items ii
            JOIN public.marketplace_vendors mv ON ii.vendor_id = mv.id
            WHERE ii.id = inventory_movements.inventory_item_id
            AND mv.user_id = auth.uid()
        )
    );

CREATE POLICY "Vendors can create inventory movements" ON public.inventory_movements
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.inventory_items ii
            JOIN public.marketplace_vendors mv ON ii.vendor_id = mv.id
            WHERE ii.id = inventory_movements.inventory_item_id
            AND mv.user_id = auth.uid()
        )
    );

-- Low stock alerts policies
CREATE POLICY "Vendors can manage their low stock alerts" ON public.low_stock_alerts
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM public.marketplace_vendors mv
            WHERE mv.id = low_stock_alerts.vendor_id
            AND mv.user_id = auth.uid()
        )
    );

-- Supplier management policies
CREATE POLICY "Vendors can manage their suppliers" ON public.supplier_management
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM public.marketplace_vendors mv
            WHERE mv.id = supplier_management.vendor_id
            AND mv.user_id = auth.uid()
        )
    );

-- Enable realtime for key tables
ALTER PUBLICATION supabase_realtime ADD TABLE public.vendor_bulk_operations;
ALTER PUBLICATION supabase_realtime ADD TABLE public.low_stock_alerts;
ALTER PUBLICATION supabase_realtime ADD TABLE public.inventory_movements;