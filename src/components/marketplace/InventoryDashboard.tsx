import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { ScrollArea } from '@/components/ui/scroll-area';
import { supabase } from '@/integrations/supabase/client';
import { useRealtimeUpdates } from '@/hooks/useRealtimeUpdates';
import { 
  Package, 
  AlertTriangle, 
  TrendingDown, 
  TrendingUp, 
  RefreshCw,
  Eye,
  BarChart3
} from 'lucide-react';
import { toast } from 'sonner';

interface Product {
  id: string;
  title: string;
  stock_quantity: number;
  price: number;
  category: string;
  created_at: string;
  updated_at: string;
}

interface InventoryDashboardProps {
  vendorId: string;
  userId: string;
}

export const InventoryDashboard: React.FC<InventoryDashboardProps> = ({ 
  vendorId, 
  userId 
}) => {
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedPeriod, setSelectedPeriod] = useState<'24h' | '7d' | '30d'>('24h');
  
  const { productUpdates, inventoryAlerts } = useRealtimeUpdates(userId);

  // Filter alerts for this vendor
  const vendorAlerts = inventoryAlerts.filter(alert => alert.vendor_id === vendorId);

  useEffect(() => {
    fetchProducts();
  }, [vendorId]);

  useEffect(() => {
    // Update products when real-time updates come in
    productUpdates.forEach(update => {
      setProducts(prev => 
        prev.map(product => 
          product.id === update.id 
            ? { ...product, ...update }
            : product
        )
      );
    });
  }, [productUpdates]);

  const fetchProducts = async () => {
    try {
      setIsLoading(true);
      const { data, error } = await supabase
        .from('marketplace_products')
        .select('*')
        .eq('vendor_id', vendorId)
        .order('updated_at', { ascending: false });

      if (error) throw error;
      setProducts(data || []);
    } catch (error) {
      console.error('Error fetching products:', error);
      toast.error('Failed to load inventory');
    } finally {
      setIsLoading(false);
    }
  };

  const runInventoryCheck = async () => {
    try {
      await supabase.rpc('check_inventory_levels');
      toast.success('Inventory check completed');
    } catch (error) {
      console.error('Error running inventory check:', error);
      toast.error('Failed to run inventory check');
    }
  };

  // Calculate inventory metrics
  const totalProducts = products.length;
  const lowStockProducts = products.filter(p => p.stock_quantity <= 5 && p.stock_quantity > 0);
  const outOfStockProducts = products.filter(p => p.stock_quantity === 0);
  const wellStockedProducts = products.filter(p => p.stock_quantity > 5);

  const totalValue = products.reduce((sum, product) => 
    sum + (product.price * product.stock_quantity), 0
  );

  const getStockStatus = (quantity: number) => {
    if (quantity === 0) return { status: 'Out of Stock', color: 'bg-red-500', variant: 'destructive' as const };
    if (quantity <= 5) return { status: 'Low Stock', color: 'bg-yellow-500', variant: 'secondary' as const };
    if (quantity <= 20) return { status: 'Normal', color: 'bg-blue-500', variant: 'secondary' as const };
    return { status: 'Well Stocked', color: 'bg-green-500', variant: 'secondary' as const };
  };

  const getStockPercentage = (quantity: number) => {
    const maxStock = Math.max(...products.map(p => p.stock_quantity), 100);
    return (quantity / maxStock) * 100;
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <Card key={i}>
              <CardContent className="p-6">
                <div className="animate-pulse space-y-2">
                  <div className="h-4 bg-muted rounded w-1/2"></div>
                  <div className="h-8 bg-muted rounded w-3/4"></div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Inventory Dashboard</h2>
        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={runInventoryCheck}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Check Inventory
          </Button>
        </div>
      </div>

      {/* Metrics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Products</p>
                <p className="text-2xl font-bold">{totalProducts}</p>
              </div>
              <Package className="h-8 w-8 text-primary" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Low Stock</p>
                <p className="text-2xl font-bold text-yellow-600">{lowStockProducts.length}</p>
              </div>
              <AlertTriangle className="h-8 w-8 text-yellow-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Out of Stock</p>
                <p className="text-2xl font-bold text-red-600">{outOfStockProducts.length}</p>
              </div>
              <TrendingDown className="h-8 w-8 text-red-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Value</p>
                <p className="text-2xl font-bold">
                  {new Intl.NumberFormat('en-US', {
                    style: 'currency',
                    currency: 'XAF',
                    minimumFractionDigits: 0
                  }).format(totalValue)}
                </p>
              </div>
              <BarChart3 className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Alerts */}
      {vendorAlerts.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5" />
              Recent Inventory Alerts
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-40">
              <div className="space-y-2">
                {vendorAlerts.slice(0, 5).map((alert) => (
                  <div key={alert.id} className="flex items-center justify-between p-2 border rounded">
                    <div className="flex-1">
                      <p className="text-sm font-medium">{alert.message}</p>
                      <p className="text-xs text-muted-foreground">
                        {new Date(alert.created_at).toLocaleString()}
                      </p>
                    </div>
                    <Badge variant={alert.alert_type === 'out_of_stock' ? 'destructive' : 'secondary'}>
                      {alert.alert_type.replace('_', ' ')}
                    </Badge>
                  </div>
                ))}
              </div>
            </ScrollArea>
          </CardContent>
        </Card>
      )}

      {/* Products List */}
      <Card>
        <CardHeader>
          <CardTitle>Product Inventory</CardTitle>
        </CardHeader>
        <CardContent>
          <ScrollArea className="h-96">
            <div className="space-y-3">
              {products.map((product) => {
                const stockStatus = getStockStatus(product.stock_quantity);
                const stockPercentage = getStockPercentage(product.stock_quantity);
                
                return (
                  <div key={product.id} className="border rounded-lg p-4">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex-1">
                        <h4 className="font-medium">{product.title}</h4>
                        <p className="text-sm text-muted-foreground">{product.category}</p>
                      </div>
                      <div className="text-right">
                        <p className="font-bold">
                          {new Intl.NumberFormat('en-US', {
                            style: 'currency',
                            currency: 'XAF'
                          }).format(product.price)}
                        </p>
                        <Badge variant={stockStatus.variant}>
                          {stockStatus.status}
                        </Badge>
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <div className="flex items-center justify-between text-sm">
                        <span>Stock: {product.stock_quantity} units</span>
                        <span>
                          Value: {new Intl.NumberFormat('en-US', {
                            style: 'currency',
                            currency: 'XAF'
                          }).format(product.price * product.stock_quantity)}
                        </span>
                      </div>
                      
                      <Progress 
                        value={stockPercentage} 
                        className="h-2"
                      />
                      
                      <p className="text-xs text-muted-foreground">
                        Last updated: {new Date(product.updated_at).toLocaleString()}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </ScrollArea>
        </CardContent>
      </Card>
    </div>
  );
};