import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Plus, Eye, Printer, Download, Package } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { ShippingLabelGenerator } from './ShippingLabelGenerator';

interface ShippingLabel {
  id: string;
  tracking_number: string;
  sender_name: string;
  recipient_name: string;
  recipient_address: any;
  package_details: any;
  status: string;
  created_at: string;
  printed_at: string | null;
}

export const ShippingLabelsManager: React.FC = () => {
  const [labels, setLabels] = useState<ShippingLabel[]>([]);
  const [loading, setLoading] = useState(true);
  const [showGenerator, setShowGenerator] = useState(false);

  useEffect(() => {
    fetchLabels();
  }, []);

  const fetchLabels = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('shipping_labels')
        .select(`
          id,
          tracking_number,
          sender_name,
          recipient_name,
          recipient_address,
          package_details,
          status,
          created_at,
          printed_at
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setLabels(data || []);
    } catch (error) {
      console.error('Error fetching labels:', error);
      toast({
        title: "Error",
        description: "Failed to fetch shipping labels",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const markAsPrinted = async (labelId: string) => {
    try {
      const { error } = await supabase
        .from('shipping_labels')
        .update({ 
          status: 'printed',
          printed_at: new Date().toISOString()
        })
        .eq('id', labelId);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Label marked as printed",
      });

      fetchLabels();
    } catch (error) {
      console.error('Error marking label as printed:', error);
      toast({
        title: "Error",
        description: "Failed to update label status",
        variant: "destructive",
      });
    }
  };

  const formatAddress = (address: any) => {
    if (!address) return 'N/A';
    return `${address.city}, ${address.region}`;
  };

  const getStatusBadge = (status: string) => {
    const statusColors = {
      'created': 'bg-blue-100 text-blue-800',
      'ready_to_print': 'bg-yellow-100 text-yellow-800',
      'printed': 'bg-green-100 text-green-800',
      'shipped': 'bg-purple-100 text-purple-800',
    };

    return (
      <Badge className={statusColors[status as keyof typeof statusColors] || 'bg-gray-100 text-gray-800'}>
        {status.replace('_', ' ').toUpperCase()}
      </Badge>
    );
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="py-12">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
            <p className="mt-4 text-muted-foreground">Loading shipping labels...</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <Package className="h-6 w-6 text-primary" />
            Shipping Labels
          </h2>
          <p className="text-muted-foreground">Manage and print shipping labels</p>
        </div>
        <Dialog open={showGenerator} onOpenChange={setShowGenerator}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Create Label
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-6xl">
            <DialogHeader>
              <DialogTitle>Create New Shipping Label</DialogTitle>
            </DialogHeader>
            <ShippingLabelGenerator />
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>All Labels</CardTitle>
        </CardHeader>
        <CardContent>
          {labels.length === 0 ? (
            <div className="text-center py-12">
              <Package className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">No Labels Found</h3>
              <p className="text-muted-foreground mb-4">
                Create your first shipping label to get started
              </p>
              <Button onClick={() => setShowGenerator(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Create First Label
              </Button>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Tracking Number</TableHead>
                  <TableHead>Recipient</TableHead>
                  <TableHead>Destination</TableHead>
                  <TableHead>Package</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Created</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {labels.map((label) => (
                  <TableRow key={label.id}>
                    <TableCell className="font-mono font-medium">
                      {label.tracking_number}
                    </TableCell>
                    <TableCell>{label.recipient_name}</TableCell>
                    <TableCell>{formatAddress(label.recipient_address)}</TableCell>
                    <TableCell>
                      {label.package_details?.contents || 'N/A'}
                      {label.package_details?.weight && (
                        <div className="text-sm text-muted-foreground">
                          {label.package_details.weight}
                        </div>
                      )}
                    </TableCell>
                    <TableCell>{getStatusBadge(label.status)}</TableCell>
                    <TableCell>
                      {new Date(label.created_at).toLocaleDateString()}
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        <Button size="sm" variant="outline">
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button 
                          size="sm" 
                          variant="outline"
                          onClick={() => markAsPrinted(label.id)}
                          disabled={label.status === 'printed'}
                        >
                          <Printer className="h-4 w-4" />
                        </Button>
                        <Button size="sm" variant="outline">
                          <Download className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
};