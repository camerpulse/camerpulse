-- Add order_id column to shipments table for Phase 3 integration
ALTER TABLE public.shipments 
ADD COLUMN order_id UUID REFERENCES public.marketplace_orders(id);

-- Add index for faster lookups
CREATE INDEX idx_shipments_order_id ON public.shipments(order_id);

-- Create function to automatically update order status when shipment is created
CREATE OR REPLACE FUNCTION public.update_order_status_on_shipment()
RETURNS TRIGGER AS $$
BEGIN
  -- When a shipment is created, update the order status to 'shipped'
  IF TG_OP = 'INSERT' AND NEW.order_id IS NOT NULL THEN
    UPDATE public.marketplace_orders 
    SET order_status = 'shipped'
    WHERE id = NEW.order_id;
  END IF;
  
  -- When shipment is delivered, update order status to 'delivered'
  IF TG_OP = 'UPDATE' AND NEW.status = 'delivered' AND OLD.status != 'delivered' AND NEW.order_id IS NOT NULL THEN
    UPDATE public.marketplace_orders 
    SET order_status = 'delivered'
    WHERE id = NEW.order_id;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger
CREATE TRIGGER trigger_update_order_status_on_shipment
  AFTER INSERT OR UPDATE ON public.shipments
  FOR EACH ROW
  EXECUTE FUNCTION public.update_order_status_on_shipment();