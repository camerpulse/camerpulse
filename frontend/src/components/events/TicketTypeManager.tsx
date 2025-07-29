import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Plus, Trash2, Ticket, DollarSign, Users } from 'lucide-react';
import { toast } from 'sonner';

export interface TicketType {
  id?: string;
  name: string;
  description: string;
  price: number;
  currency: string;
  max_quantity: number;
  sold_quantity: number;
  type: 'regular' | 'vip' | 'early_bird' | 'student' | 'vvip';
  is_active: boolean;
}

interface TicketTypeManagerProps {
  ticketTypes: TicketType[];
  onTicketTypesChange: (ticketTypes: TicketType[]) => void;
  allowTicketSales: boolean;
  onAllowTicketSalesChange: (allow: boolean) => void;
}

const TICKET_TYPES = [
  { value: 'regular', label: 'Regular', color: 'bg-blue-500' },
  { value: 'vip', label: 'VIP', color: 'bg-purple-500' },
  { value: 'early_bird', label: 'Early Bird', color: 'bg-green-500' },
  { value: 'student', label: 'Student', color: 'bg-orange-500' },
  { value: 'vvip', label: 'VVIP', color: 'bg-pink-500' }
];

const CURRENCIES = [
  { value: 'XAF', label: 'XAF (CFA Franc)' },
  { value: 'USD', label: 'USD (US Dollar)' },
  { value: 'EUR', label: 'EUR (Euro)' }
];

export const TicketTypeManager: React.FC<TicketTypeManagerProps> = ({
  ticketTypes,
  onTicketTypesChange,
  allowTicketSales,
  onAllowTicketSalesChange
}) => {
  const [newTicketType, setNewTicketType] = useState<Partial<TicketType>>({
    name: '',
    description: '',
    price: 0,
    currency: 'XAF',
    max_quantity: 100,
    type: 'regular',
    is_active: true,
    sold_quantity: 0
  });

  const addTicketType = () => {
    if (!newTicketType.name || !newTicketType.description || newTicketType.price === undefined) {
      toast.error('Please fill in all ticket type fields');
      return;
    }

    if (newTicketType.price < 0) {
      toast.error('Price cannot be negative');
      return;
    }

    if (newTicketType.max_quantity <= 0) {
      toast.error('Max quantity must be greater than 0');
      return;
    }

    const ticketType: TicketType = {
      ...newTicketType as TicketType,
      id: `temp_${Date.now()}`
    };

    onTicketTypesChange([...ticketTypes, ticketType]);
    setNewTicketType({
      name: '',
      description: '',
      price: 0,
      currency: 'XAF',
      max_quantity: 100,
      type: 'regular',
      is_active: true,
      sold_quantity: 0
    });
    toast.success('Ticket type added');
  };

  const removeTicketType = (index: number) => {
    const updatedTypes = ticketTypes.filter((_, i) => i !== index);
    onTicketTypesChange(updatedTypes);
    toast.success('Ticket type removed');
  };

  const updateTicketType = (index: number, field: keyof TicketType, value: any) => {
    const updatedTypes = ticketTypes.map((type, i) => 
      i === index ? { ...type, [field]: value } : type
    );
    onTicketTypesChange(updatedTypes);
  };

  const getTicketTypeColor = (type: string) => {
    return TICKET_TYPES.find(t => t.value === type)?.color || 'bg-gray-500';
  };

  const getTotalTickets = () => {
    return ticketTypes.reduce((sum, type) => sum + type.max_quantity, 0);
  };

  const getTotalRevenue = () => {
    return ticketTypes.reduce((sum, type) => sum + (type.price * type.max_quantity), 0);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Ticket className="w-5 h-5" />
          Ticket Management
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Enable Ticket Sales Toggle */}
        <div className="flex items-center justify-between p-4 border rounded-lg">
          <div>
            <h3 className="font-medium">Enable Ticket Sales</h3>
            <p className="text-sm text-muted-foreground">
              Allow attendees to purchase tickets for this event
            </p>
          </div>
          <Button
            variant={allowTicketSales ? "default" : "outline"}
            onClick={() => onAllowTicketSalesChange(!allowTicketSales)}
          >
            {allowTicketSales ? 'Enabled' : 'Disabled'}
          </Button>
        </div>

        {allowTicketSales && (
          <>
            {/* Ticket Summary */}
            {ticketTypes.length > 0 && (
              <div className="grid grid-cols-3 gap-4 p-4 bg-muted/50 rounded-lg">
                <div className="text-center">
                  <div className="text-2xl font-bold text-primary">{ticketTypes.length}</div>
                  <div className="text-sm text-muted-foreground">Ticket Types</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-600">{getTotalTickets()}</div>
                  <div className="text-sm text-muted-foreground">Total Tickets</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-600">
                    {getTotalRevenue().toLocaleString()} XAF
                  </div>
                  <div className="text-sm text-muted-foreground">Potential Revenue</div>
                </div>
              </div>
            )}

            {/* Existing Ticket Types */}
            {ticketTypes.length > 0 && (
              <div className="space-y-4">
                <h3 className="font-medium">Configured Ticket Types</h3>
                {ticketTypes.map((type, index) => (
                  <Card key={index} className="relative">
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1 grid grid-cols-1 md:grid-cols-4 gap-4">
                          <div>
                            <Label>Name</Label>
                            <Input
                              value={type.name}
                              onChange={(e) => updateTicketType(index, 'name', e.target.value)}
                              placeholder="Ticket name"
                            />
                          </div>
                          <div>
                            <Label>Price</Label>
                            <div className="flex gap-2">
                              <Input
                                type="number"
                                value={type.price}
                                onChange={(e) => updateTicketType(index, 'price', parseFloat(e.target.value) || 0)}
                                placeholder="0"
                              />
                              <Select
                                value={type.currency}
                                onValueChange={(value) => updateTicketType(index, 'currency', value)}
                              >
                                <SelectTrigger className="w-20">
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  {CURRENCIES.map(currency => (
                                    <SelectItem key={currency.value} value={currency.value}>
                                      {currency.value}
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                            </div>
                          </div>
                          <div>
                            <Label>Quantity</Label>
                            <Input
                              type="number"
                              value={type.max_quantity}
                              onChange={(e) => updateTicketType(index, 'max_quantity', parseInt(e.target.value) || 0)}
                              placeholder="100"
                            />
                          </div>
                          <div>
                            <Label>Type</Label>
                            <Select
                              value={type.type}
                              onValueChange={(value: any) => updateTicketType(index, 'type', value)}
                            >
                              <SelectTrigger>
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                {TICKET_TYPES.map(ticketType => (
                                  <SelectItem key={ticketType.value} value={ticketType.value}>
                                    <div className="flex items-center gap-2">
                                      <div className={`w-3 h-3 rounded-full ${ticketType.color}`} />
                                      {ticketType.label}
                                    </div>
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>
                        </div>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => removeTicketType(index)}
                          className="text-red-600 hover:text-red-700"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                      <div className="mt-4">
                        <Label>Description</Label>
                        <Input
                          value={type.description}
                          onChange={(e) => updateTicketType(index, 'description', e.target.value)}
                          placeholder="Describe what's included with this ticket"
                        />
                      </div>
                      <div className="flex items-center gap-4 mt-4">
                        <Badge 
                          variant="outline" 
                          className={`${getTicketTypeColor(type.type)} text-white border-0`}
                        >
                          {TICKET_TYPES.find(t => t.value === type.type)?.label}
                        </Badge>
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <DollarSign className="w-4 h-4" />
                          {type.price.toLocaleString()} {type.currency}
                        </div>
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <Users className="w-4 h-4" />
                          {type.max_quantity} available
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}

            {/* Add New Ticket Type */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Add New Ticket Type</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label>Ticket Name</Label>
                    <Input
                      value={newTicketType.name}
                      onChange={(e) => setNewTicketType(prev => ({ ...prev, name: e.target.value }))}
                      placeholder="e.g., General Admission"
                    />
                  </div>
                  <div>
                    <Label>Ticket Type</Label>
                    <Select
                      value={newTicketType.type}
                      onValueChange={(value: any) => setNewTicketType(prev => ({ ...prev, type: value }))}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {TICKET_TYPES.map(type => (
                          <SelectItem key={type.value} value={type.value}>
                            <div className="flex items-center gap-2">
                              <div className={`w-3 h-3 rounded-full ${type.color}`} />
                              {type.label}
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label>Price</Label>
                    <div className="flex gap-2">
                      <Input
                        type="number"
                        value={newTicketType.price}
                        onChange={(e) => setNewTicketType(prev => ({ ...prev, price: parseFloat(e.target.value) || 0 }))}
                        placeholder="0"
                      />
                      <Select
                        value={newTicketType.currency}
                        onValueChange={(value) => setNewTicketType(prev => ({ ...prev, currency: value }))}
                      >
                        <SelectTrigger className="w-24">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {CURRENCIES.map(currency => (
                            <SelectItem key={currency.value} value={currency.value}>
                              {currency.value}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <div>
                    <Label>Max Quantity</Label>
                    <Input
                      type="number"
                      value={newTicketType.max_quantity}
                      onChange={(e) => setNewTicketType(prev => ({ ...prev, max_quantity: parseInt(e.target.value) || 100 }))}
                      placeholder="100"
                    />
                  </div>
                </div>
                <div>
                  <Label>Description</Label>
                  <Input
                    value={newTicketType.description}
                    onChange={(e) => setNewTicketType(prev => ({ ...prev, description: e.target.value }))}
                    placeholder="Describe what's included with this ticket"
                  />
                </div>
                <Button onClick={addTicketType} className="w-full">
                  <Plus className="w-4 h-4 mr-2" />
                  Add Ticket Type
                </Button>
              </CardContent>
            </Card>
          </>
        )}
      </CardContent>
    </Card>
  );
};
