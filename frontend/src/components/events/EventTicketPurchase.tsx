import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { 
  Ticket, 
  Plus, 
  Minus, 
  ShoppingCart,
  User,
  Mail,
  Phone
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

interface TicketType {
  id: string;
  name: string;
  description: string;
  price: number;
  currency: string;
  max_quantity: number;
  sold_quantity: number;
  type: string;
}

interface Event {
  id: string;
  name: string;
  start_date: string;
  venue_name?: string;
  venue_address?: string;
  ticket_types: TicketType[];
}

interface EventTicketPurchaseProps {
  event: Event;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onPurchaseComplete?: () => void;
}

export const EventTicketPurchase: React.FC<EventTicketPurchaseProps> = ({
  event,
  open,
  onOpenChange,
  onPurchaseComplete
}) => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [selectedTickets, setSelectedTickets] = useState<Record<string, number>>({});
  const [contactInfo, setContactInfo] = useState({
    full_name: '',
    email: user?.email || '',
    phone: ''
  });

  const updateTicketQuantity = (ticketId: string, quantity: number) => {
    const ticketType = event.ticket_types.find(t => t.id === ticketId);
    const availableTickets = ticketType ? ticketType.max_quantity - ticketType.sold_quantity : 0;
    
    if (quantity > availableTickets) {
      toast.error(`Only ${availableTickets} tickets available for this type`);
      return;
    }

    setSelectedTickets(prev => ({
      ...prev,
      [ticketId]: Math.max(0, quantity)
    }));
  };

  const getTotalAmount = () => {
    return Object.entries(selectedTickets).reduce((total, [ticketId, quantity]) => {
      const ticketType = event.ticket_types.find(t => t.id === ticketId);
      return total + (ticketType ? ticketType.price * quantity : 0);
    }, 0);
  };

  const getTotalTickets = () => {
    return Object.values(selectedTickets).reduce((total, quantity) => total + quantity, 0);
  };

  const handlePurchase = async () => {
    if (!user) {
      toast.error('Please sign in to purchase tickets');
      return;
    }

    if (getTotalTickets() === 0) {
      toast.error('Please select at least one ticket');
      return;
    }

    if (!contactInfo.full_name || !contactInfo.email) {
      toast.error('Please fill in your contact information');
      return;
    }

    setLoading(true);
    try {
      // Create ticket purchases for each selected ticket type
      const purchases = [];
      for (const [ticketId, quantity] of Object.entries(selectedTickets)) {
        if (quantity > 0) {
          for (let i = 0; i < quantity; i++) {
            purchases.push({
              event_id: event.id,
              ticket_type_id: ticketId,
              user_id: user.id,
              purchase_status: 'confirmed',
              contact_name: contactInfo.full_name,
              contact_email: contactInfo.email,
              contact_phone: contactInfo.phone
            });
          }
        }
      }

      const { error } = await supabase
        .from('ticket_purchases')
        .insert(purchases);

      if (error) throw error;

      // Update sold quantities
      for (const [ticketId, quantity] of Object.entries(selectedTickets)) {
        if (quantity > 0) {
          const { data: currentTicket } = await supabase
            .from('event_ticket_types')
            .select('sold_quantity')
            .eq('id', ticketId)
            .single();

          if (currentTicket) {
            const { error: updateError } = await supabase
              .from('event_ticket_types')
              .update({ 
                sold_quantity: currentTicket.sold_quantity + quantity
              })
              .eq('id', ticketId);

            if (updateError) {
              console.error('Error updating ticket quantity:', updateError);
            }
          }
        }
      }

      toast.success('Tickets purchased successfully!');
      onPurchaseComplete?.();
      onOpenChange(false);

      // Reset form
      setSelectedTickets({});
      setContactInfo({
        full_name: '',
        email: user?.email || '',
        phone: ''
      });

    } catch (error) {
      console.error('Error purchasing tickets:', error);
      toast.error('Failed to purchase tickets. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Ticket className="w-5 h-5" />
            Purchase Tickets - {event.name}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Event Info */}
          <Card>
            <CardContent className="p-4">
              <h3 className="font-medium mb-2">{event.name}</h3>
              <div className="text-sm text-muted-foreground space-y-1">
                <div>{new Date(event.start_date).toLocaleDateString()}</div>
                <div>{event.venue_name && `${event.venue_name}, `}{event.venue_address}</div>
              </div>
            </CardContent>
          </Card>

          {/* Ticket Selection */}
          <div className="space-y-4">
            <h3 className="font-medium">Select Tickets</h3>
            {event.ticket_types.map((ticketType) => {
              const availableTickets = ticketType.max_quantity - ticketType.sold_quantity;
              const selectedQuantity = selectedTickets[ticketType.id] || 0;

              return (
                <Card key={ticketType.id}>
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3">
                          <div>
                            <h4 className="font-medium">{ticketType.name}</h4>
                            <p className="text-sm text-muted-foreground">{ticketType.description}</p>
                            <div className="flex items-center gap-2 mt-1">
                              <Badge variant="outline">{ticketType.type.replace('_', ' ')}</Badge>
                              <span className="text-xs text-muted-foreground">
                                {availableTickets} available
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>
                      
                      <div className="text-right space-y-2">
                        <div className="text-lg font-bold">
                          {ticketType.price.toLocaleString()} {ticketType.currency}
                        </div>
                        
                        <div className="flex items-center gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => updateTicketQuantity(ticketType.id, selectedQuantity - 1)}
                            disabled={selectedQuantity === 0}
                          >
                            <Minus className="w-4 h-4" />
                          </Button>
                          <span className="w-8 text-center">{selectedQuantity}</span>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => updateTicketQuantity(ticketType.id, selectedQuantity + 1)}
                            disabled={availableTickets === 0 || selectedQuantity >= availableTickets}
                          >
                            <Plus className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>

          {/* Contact Information */}
          <div className="space-y-4">
            <h3 className="font-medium">Contact Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="full_name">Full Name *</Label>
                <div className="relative">
                  <User className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="full_name"
                    value={contactInfo.full_name}
                    onChange={(e) => setContactInfo(prev => ({ ...prev, full_name: e.target.value }))}
                    placeholder="Enter your full name"
                    className="pl-10"
                  />
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="email">Email *</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="email"
                    type="email"
                    value={contactInfo.email}
                    onChange={(e) => setContactInfo(prev => ({ ...prev, email: e.target.value }))}
                    placeholder="Enter your email"
                    className="pl-10"
                  />
                </div>
              </div>
              
              <div className="space-y-2 md:col-span-2">
                <Label htmlFor="phone">Phone Number</Label>
                <div className="relative">
                  <Phone className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="phone"
                    value={contactInfo.phone}
                    onChange={(e) => setContactInfo(prev => ({ ...prev, phone: e.target.value }))}
                    placeholder="Enter your phone number"
                    className="pl-10"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Order Summary */}
          {getTotalTickets() > 0 && (
            <Card>
              <CardContent className="p-4">
                <h3 className="font-medium mb-3">Order Summary</h3>
                <div className="space-y-2">
                  {Object.entries(selectedTickets).map(([ticketId, quantity]) => {
                    if (quantity === 0) return null;
                    const ticketType = event.ticket_types.find(t => t.id === ticketId);
                    if (!ticketType) return null;

                    return (
                      <div key={ticketId} className="flex justify-between text-sm">
                        <span>{quantity}x {ticketType.name}</span>
                        <span>{(ticketType.price * quantity).toLocaleString()} {ticketType.currency}</span>
                      </div>
                    );
                  })}
                  
                  <Separator className="my-2" />
                  
                  <div className="flex justify-between font-medium">
                    <span>Total ({getTotalTickets()} tickets)</span>
                    <span>{getTotalAmount().toLocaleString()} XAF</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Purchase Button */}
          <div className="flex gap-4">
            <Button variant="outline" onClick={() => onOpenChange(false)} className="flex-1">
              Cancel
            </Button>
            <Button 
              onClick={handlePurchase} 
              disabled={loading || getTotalTickets() === 0}
              className="flex-1"
            >
              <ShoppingCart className="w-4 h-4 mr-2" />
              {loading ? 'Processing...' : `Purchase ${getTotalTickets()} Ticket${getTotalTickets() !== 1 ? 's' : ''}`}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};