import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Store, Package, Users, TrendingUp } from 'lucide-react';

interface MarketplaceManagerProps {
  hasPermission: (permission: string) => boolean;
  logActivity: (action: string, details: any) => void;
  stats?: any;
}

export const MarketplaceManager: React.FC<MarketplaceManagerProps> = ({
  hasPermission,
  logActivity,
  stats
}) => {
  // Mock data for marketplace
  const vendors = [
    {
      id: '1',
      name: 'Local Craft Store',
      status: 'active',
      products: 25,
      sales: 150000
    },
    {
      id: '2',
      name: 'Tech Solutions CM',
      status: 'pending',
      products: 12,
      sales: 0
    }
  ];

  const products = [
    {
      id: '1',
      name: 'Traditional Crafts Set',
      vendor: 'Local Craft Store',
      price: 15000,
      status: 'approved'
    },
    {
      id: '2',
      name: 'Laptop Repair Service',
      vendor: 'Tech Solutions CM',
      price: 25000,
      status: 'pending'
    }
  ];

  const handleApproveVendor = (vendorId: string) => {
    logActivity('vendor_approved', { vendor_id: vendorId });
  };

  const handleApproveProduct = (productId: string) => {
    logActivity('product_approved', { product_id: productId });
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold flex items-center">
          <Store className="h-6 w-6 mr-2 text-green-600" />
          Marketplace Management
        </h2>
        <p className="text-muted-foreground">Manage vendors, products, and marketplace operations</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-2">
              <Store className="h-5 w-5 text-green-600" />
              <div>
                <p className="text-2xl font-bold">{vendors.length}</p>
                <p className="text-sm text-muted-foreground">Total Vendors</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-2">
              <Package className="h-5 w-5 text-blue-600" />
              <div>
                <p className="text-2xl font-bold">{products.length}</p>
                <p className="text-sm text-muted-foreground">Total Products</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-2">
              <Users className="h-5 w-5 text-purple-600" />
              <div>
                <p className="text-2xl font-bold">
                  {vendors.filter(v => v.status === 'active').length}
                </p>
                <p className="text-sm text-muted-foreground">Active Vendors</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-2">
              <TrendingUp className="h-5 w-5 text-orange-600" />
              <div>
                <p className="text-2xl font-bold">
                  {vendors.reduce((sum, v) => sum + v.sales, 0).toLocaleString()} FCFA
                </p>
                <p className="text-sm text-muted-foreground">Total Sales</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Vendor Management</CardTitle>
            <CardDescription>Review and approve marketplace vendors</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {vendors.map((vendor) => (
                <div key={vendor.id} className="flex items-center justify-between p-4 border rounded-lg">
                  <div>
                    <h3 className="font-semibold">{vendor.name}</h3>
                    <p className="text-sm text-muted-foreground">
                      {vendor.products} products • {vendor.sales.toLocaleString()} FCFA sales
                    </p>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Badge variant={vendor.status === 'active' ? 'default' : 'secondary'}>
                      {vendor.status}
                    </Badge>
                    {vendor.status === 'pending' && (
                      <Button
                        size="sm"
                        onClick={() => handleApproveVendor(vendor.id)}
                      >
                        Approve
                      </Button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Product Management</CardTitle>
            <CardDescription>Review and approve marketplace products</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {products.map((product) => (
                <div key={product.id} className="flex items-center justify-between p-4 border rounded-lg">
                  <div>
                    <h3 className="font-semibold">{product.name}</h3>
                    <p className="text-sm text-muted-foreground">
                      {product.vendor} • {product.price.toLocaleString()} FCFA
                    </p>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Badge variant={product.status === 'approved' ? 'default' : 'secondary'}>
                      {product.status}
                    </Badge>
                    {product.status === 'pending' && (
                      <Button
                        size="sm"
                        onClick={() => handleApproveProduct(product.id)}
                      >
                        Approve
                      </Button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};