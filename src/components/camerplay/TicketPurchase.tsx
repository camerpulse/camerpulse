import React, { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { 
  ArrowLeft, Calendar, MapPin, Users, Ticket, 
  CreditCard, Check, Download, Share2, QrCode,
  Star, Clock, Shield, AlertCircle
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Textarea } from '@/components/ui/textarea';
import { Progress } from '@/components/ui/progress';
import { useToast } from '@/hooks/use-toast';

interface TicketType {
  id: string;
  name: string;
  price: number;
  description: string;
  benefits: string[];
  available: number;
  total: number;
  color: string;
}

interface EventDetails {
  id: string;
  title: string;
  artist: string;
  date: string;
  venue: string;
  location: string;
  description: string;
  image_url: string;
  duration: string;
  age_restriction: string;
  organizer: string;
}

const TicketPurchase = () => {
  const { eventId } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();

  const [currentStep, setCurrentStep] = useState<'select' | 'details' | 'payment' | 'confirmation'>('select');
  const [selectedTicketType, setSelectedTicketType] = useState<string>('');
  const [ticketQuantity, setTicketQuantity] = useState(1);
  const [purchaseDetails, setPurchaseDetails] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    specialRequests: ''
  });
  const [paymentMethod, setPaymentMethod] = useState('mobile_money');
  const [processing, setProcessing] = useState(false);
  const [purchaseComplete, setPurchaseComplete] = useState(false);
  const [ticketNumbers, setTicketNumbers] = useState<string[]>([]);

  // Mock event data
  const eventDetails: EventDetails = {
    id: eventId || '1',
    title: 'Cameroon Unity Concert',
    artist: 'Boy Takunda',
    date: '2024-08-15T19:00:00',
    venue: 'Buea Mountain Hotel',
    location: 'Buea, Southwest Region',
    description: 'Join us for an unforgettable evening celebrating Cameroonian music and unity.',
    image_url: 'https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?w=600',
    duration: '4 hours',
    age_restriction: '16+',
    organizer: 'CamerPlay Events'
  };

  const ticketTypes: TicketType[] = [
    {
      id: 'general',
      name: 'General Admission',
      price: 5000,
      description: 'Standing room access to the main event area',
      benefits: ['Event access', 'Commemorative wristband', 'Access to food vendors'],
      available: 245,
      total: 500,
      color: 'bg-blue-500'
    },
    {
      id: 'vip',
      name: 'VIP Experience',
      price: 15000,
      description: 'Premium seating with exclusive perks',
      benefits: [
        'Reserved seating area', 'Complimentary drinks', 'Meet & greet opportunity',
        'VIP entrance', 'Event merchandise', 'Premium parking'
      ],
      available: 48,
      total: 100,
      color: 'bg-purple-500'
    },
    {
      id: 'premium',
      name: 'Premium Package',
      price: 25000,
      description: 'Ultimate concert experience with backstage access',
      benefits: [
        'Front row reserved seating', 'Backstage tour', 'Photo with artist',
        'Signed merchandise', 'Exclusive after-party', 'Personal concierge',
        'Gourmet catering', 'VIP transportation'
      ],
      available: 12,
      total: 25,
      color: 'bg-gold-500'
    }
  ];

  const handleTicketSelection = () => {
    if (!selectedTicketType) {
      toast({
        title: "Please select a ticket type",
        variant: "destructive"
      });
      return;
    }
    setCurrentStep('details');
  };

  const handleDetailsSubmit = () => {
    if (!purchaseDetails.firstName || !purchaseDetails.lastName || !purchaseDetails.email) {
      toast({
        title: "Please fill in all required fields",
        variant: "destructive"
      });
      return;
    }
    setCurrentStep('payment');
  };

  const generateTicketNumbers = (quantity: number): string[] => {
    return Array.from({ length: quantity }, (_, i) => 
      `TKT-${new Date().getFullYear()}-${Math.random().toString().substr(2, 8)}`
    );
  };

  const handlePayment = async () => {
    setProcessing(true);
    
    // Simulate payment processing
    setTimeout(() => {
      const newTicketNumbers = generateTicketNumbers(ticketQuantity);
      setTicketNumbers(newTicketNumbers);
      setPurchaseComplete(true);
      setCurrentStep('confirmation');
      setProcessing(false);
      
      toast({
        title: "Payment Successful!",
        description: `Your ${ticketQuantity} ticket(s) have been confirmed.`,
      });
    }, 3000);
  };

  const selectedTicket = ticketTypes.find(t => t.id === selectedTicketType);
  const totalAmount = selectedTicket ? selectedTicket.price * ticketQuantity : 0;

  const renderTicketSelection = () => (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-2xl font-bold mb-2">Select Your Tickets</h2>
        <p className="text-muted-foreground">Choose your preferred ticket type for the event</p>
      </div>

      <div className="grid gap-4">
        {ticketTypes.map((ticket) => {
          const availabilityPercentage = (ticket.available / ticket.total) * 100;
          const isLowStock = availabilityPercentage < 20;
          
          return (
            <Card 
              key={ticket.id} 
              className={`cursor-pointer transition-all hover:shadow-lg ${
                selectedTicketType === ticket.id ? 'ring-2 ring-primary' : ''
              }`}
              onClick={() => setSelectedTicketType(ticket.id)}
            >
              <CardContent className="p-6">
                <div className="flex justify-between items-start mb-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <div className={`w-4 h-4 rounded-full ${ticket.color}`} />
                      <h3 className="text-xl font-semibold">{ticket.name}</h3>
                      {isLowStock && (
                        <Badge variant="destructive" className="text-xs">
                          <AlertCircle className="h-3 w-3 mr-1" />
                          Low Stock
                        </Badge>
                      )}
                    </div>
                    <p className="text-muted-foreground mb-3">{ticket.description}</p>
                    
                    <div className="space-y-1">
                      {ticket.benefits.map((benefit, index) => (
                        <div key={index} className="flex items-center gap-2 text-sm">
                          <Check className="h-3 w-3 text-green-500" />
                          <span>{benefit}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                  
                  <div className="text-right">
                    <div className="text-2xl font-bold text-primary mb-1">
                      {ticket.price.toLocaleString()} FCFA
                    </div>
                    <div className="text-sm text-muted-foreground mb-2">
                      {ticket.available} of {ticket.total} left
                    </div>
                    <Progress value={availabilityPercentage} className="w-20 h-2" />
                  </div>
                </div>
                
                <RadioGroup value={selectedTicketType} onValueChange={setSelectedTicketType}>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value={ticket.id} id={ticket.id} />
                    <Label htmlFor={ticket.id} className="text-sm font-medium">
                      Select this ticket type
                    </Label>
                  </div>
                </RadioGroup>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {selectedTicketType && (
        <Card className="bg-muted/30">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="quantity">Number of tickets</Label>
                <div className="flex items-center gap-2 mt-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setTicketQuantity(Math.max(1, ticketQuantity - 1))}
                    disabled={ticketQuantity <= 1}
                  >
                    -
                  </Button>
                  <Input
                    id="quantity"
                    type="number"
                    value={ticketQuantity}
                    onChange={(e) => setTicketQuantity(Math.max(1, parseInt(e.target.value) || 1))}
                    className="w-20 text-center"
                    min="1"
                    max="10"
                  />
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setTicketQuantity(Math.min(10, ticketQuantity + 1))}
                    disabled={ticketQuantity >= 10}
                  >
                    +
                  </Button>
                </div>
              </div>
              <div className="text-right">
                <div className="text-sm text-muted-foreground">Total Amount</div>
                <div className="text-2xl font-bold text-primary">
                  {totalAmount.toLocaleString()} FCFA
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      <Button 
        onClick={handleTicketSelection} 
        className="w-full" 
        size="lg"
        disabled={!selectedTicketType}
      >
        Continue to Details
      </Button>
    </div>
  );

  const renderDetailsForm = () => (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-2xl font-bold mb-2">Your Information</h2>
        <p className="text-muted-foreground">Please provide your details for ticket delivery</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <Label htmlFor="firstName">First Name *</Label>
          <Input
            id="firstName"
            value={purchaseDetails.firstName}
            onChange={(e) => setPurchaseDetails(prev => ({...prev, firstName: e.target.value}))}
            placeholder="Enter your first name"
          />
        </div>
        <div>
          <Label htmlFor="lastName">Last Name *</Label>
          <Input
            id="lastName"
            value={purchaseDetails.lastName}
            onChange={(e) => setPurchaseDetails(prev => ({...prev, lastName: e.target.value}))}
            placeholder="Enter your last name"
          />
        </div>
      </div>

      <div>
        <Label htmlFor="email">Email Address *</Label>
        <Input
          id="email"
          type="email"
          value={purchaseDetails.email}
          onChange={(e) => setPurchaseDetails(prev => ({...prev, email: e.target.value}))}
          placeholder="Enter your email address"
        />
      </div>

      <div>
        <Label htmlFor="phone">Phone Number</Label>
        <Input
          id="phone"
          type="tel"
          value={purchaseDetails.phone}
          onChange={(e) => setPurchaseDetails(prev => ({...prev, phone: e.target.value}))}
          placeholder="+237 XXX XXX XXX"
        />
      </div>

      <div>
        <Label htmlFor="specialRequests">Special Requests (Optional)</Label>
        <Textarea
          id="specialRequests"
          value={purchaseDetails.specialRequests}
          onChange={(e) => setPurchaseDetails(prev => ({...prev, specialRequests: e.target.value}))}
          placeholder="Any special requirements or accessibility needs?"
          rows={3}
        />
      </div>

      <div className="flex gap-3">
        <Button variant="outline" onClick={() => setCurrentStep('select')} className="flex-1">
          Back
        </Button>
        <Button onClick={handleDetailsSubmit} className="flex-1">
          Continue to Payment
        </Button>
      </div>
    </div>
  );

  const renderPaymentForm = () => (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-2xl font-bold mb-2">Payment Method</h2>
        <p className="text-muted-foreground">Choose your preferred payment option</p>
      </div>

      {/* Order Summary */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Order Summary</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="flex justify-between">
              <span>Ticket Type:</span>
              <span className="font-medium">{selectedTicket?.name}</span>
            </div>
            <div className="flex justify-between">
              <span>Quantity:</span>
              <span className="font-medium">{ticketQuantity}</span>
            </div>
            <div className="flex justify-between">
              <span>Price per ticket:</span>
              <span className="font-medium">{selectedTicket?.price.toLocaleString()} FCFA</span>
            </div>
            <Separator />
            <div className="flex justify-between text-lg font-bold">
              <span>Total Amount:</span>
              <span className="text-primary">{totalAmount.toLocaleString()} FCFA</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Payment Methods */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Select Payment Method</CardTitle>
        </CardHeader>
        <CardContent>
          <RadioGroup value={paymentMethod} onValueChange={setPaymentMethod}>
            <div className="space-y-3">
              <div className="flex items-center space-x-3 p-3 border rounded-lg">
                <RadioGroupItem value="mobile_money" id="mobile_money" />
                <Label htmlFor="mobile_money" className="flex-1 cursor-pointer">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-orange-500 rounded flex items-center justify-center">
                      <span className="text-white text-xs font-bold">MTN</span>
                    </div>
                    <div>
                      <div className="font-medium">Mobile Money</div>
                      <div className="text-sm text-muted-foreground">MTN Mobile Money, Orange Money</div>
                    </div>
                  </div>
                </Label>
              </div>

              <div className="flex items-center space-x-3 p-3 border rounded-lg">
                <RadioGroupItem value="bank_transfer" id="bank_transfer" />
                <Label htmlFor="bank_transfer" className="flex-1 cursor-pointer">
                  <div className="flex items-center gap-3">
                    <CreditCard className="w-8 h-8 text-blue-500" />
                    <div>
                      <div className="font-medium">Bank Transfer</div>
                      <div className="text-sm text-muted-foreground">Direct bank transfer</div>
                    </div>
                  </div>
                </Label>
              </div>

              <div className="flex items-center space-x-3 p-3 border rounded-lg">
                <RadioGroupItem value="cash_on_delivery" id="cash_on_delivery" />
                <Label htmlFor="cash_on_delivery" className="flex-1 cursor-pointer">
                  <div className="flex items-center gap-3">
                    <Shield className="w-8 h-8 text-green-500" />
                    <div>
                      <div className="font-medium">Pay at Venue</div>
                      <div className="text-sm text-muted-foreground">Pay cash at the event entrance</div>
                    </div>
                  </div>
                </Label>
              </div>
            </div>
          </RadioGroup>
        </CardContent>
      </Card>

      <div className="flex gap-3">
        <Button variant="outline" onClick={() => setCurrentStep('details')} className="flex-1">
          Back
        </Button>
        <Button 
          onClick={handlePayment} 
          className="flex-1" 
          disabled={processing}
        >
          {processing ? (
            <>
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
              Processing...
            </>
          ) : (
            <>
              <CreditCard className="h-4 w-4 mr-2" />
              Complete Purchase
            </>
          )}
        </Button>
      </div>
    </div>
  );

  const renderConfirmation = () => (
    <div className="space-y-6 text-center">
      <div className="text-center">
        <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <Check className="h-10 w-10 text-green-600" />
        </div>
        <h2 className="text-2xl font-bold mb-2 text-green-600">Payment Successful!</h2>
        <p className="text-muted-foreground">Your tickets have been confirmed and sent to your email</p>
      </div>

      {/* Ticket Details */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Ticket className="h-5 w-5" />
            Your Tickets
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {ticketNumbers.map((ticketNumber, index) => (
              <div key={ticketNumber} className="flex items-center justify-between p-3 border rounded-lg">
                <div className="flex items-center gap-3">
                  <QrCode className="h-6 w-6 text-primary" />
                  <div className="text-left">
                    <div className="font-medium">Ticket #{index + 1}</div>
                    <div className="text-sm text-muted-foreground">{ticketNumber}</div>
                  </div>
                </div>
                <Button variant="outline" size="sm">
                  <Download className="h-4 w-4 mr-2" />
                  Download
                </Button>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Event Details Summary */}
      <Card>
        <CardContent className="p-4">
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <div className="text-muted-foreground">Event</div>
              <div className="font-medium">{eventDetails.title}</div>
            </div>
            <div>
              <div className="text-muted-foreground">Artist</div>
              <div className="font-medium">{eventDetails.artist}</div>
            </div>
            <div>
              <div className="text-muted-foreground">Date & Time</div>
              <div className="font-medium">
                {new Date(eventDetails.date).toLocaleDateString('en-US', {
                  weekday: 'short',
                  year: 'numeric',
                  month: 'short',
                  day: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit'
                })}
              </div>
            </div>
            <div>
              <div className="text-muted-foreground">Venue</div>
              <div className="font-medium">{eventDetails.venue}</div>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="flex gap-3">
        <Button variant="outline" className="flex-1">
          <Share2 className="h-4 w-4 mr-2" />
          Share Tickets
        </Button>
        <Button onClick={() => navigate('/camerplay')} className="flex-1">
          Back to CamerPlay
        </Button>
      </div>

      <div className="text-sm text-muted-foreground">
        <Shield className="h-4 w-4 inline mr-1" />
        Your tickets are protected by CamerPlay's secure ticketing system
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20">
      {/* Header */}
      <div className="sticky top-0 bg-background/95 backdrop-blur border-b z-40">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <Button 
              variant="ghost" 
              onClick={() => navigate('/camerplay/events')}
              className="flex items-center gap-2"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to Events
            </Button>
            
            {/* Progress Indicator */}
            <div className="flex items-center gap-2">
              {['select', 'details', 'payment', 'confirmation'].map((step, index) => (
                <div 
                  key={step}
                  className={`w-3 h-3 rounded-full ${
                    currentStep === step ? 'bg-primary' : 
                    ['select', 'details', 'payment', 'confirmation'].indexOf(currentStep) > index ? 'bg-green-500' : 'bg-muted'
                  }`}
                />
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Event Header */}
      <div className="relative bg-gradient-to-r from-primary/10 to-accent/10">
        <div className="max-w-4xl mx-auto px-4 py-8">
          <div className="flex items-start gap-6">
            <img 
              src={eventDetails.image_url}
              alt={eventDetails.title}
              className="w-24 h-24 md:w-32 md:h-32 rounded-xl object-cover shadow-lg"
            />
            <div className="flex-1">
              <h1 className="text-2xl md:text-3xl font-bold mb-2">{eventDetails.title}</h1>
              <p className="text-lg text-muted-foreground mb-3">by {eventDetails.artist}</p>
              <div className="flex flex-wrap gap-4 text-sm">
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4" />
                  <span>{new Date(eventDetails.date).toLocaleDateString('en-US', {
                    weekday: 'short',
                    year: 'numeric', 
                    month: 'short',
                    day: 'numeric'
                  })}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4" />
                  <span>{new Date(eventDetails.date).toLocaleTimeString('en-US', {
                    hour: '2-digit',
                    minute: '2-digit'
                  })}</span>
                </div>
                <div className="flex items-center gap-2">
                  <MapPin className="h-4 w-4" />
                  <span>{eventDetails.venue}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-4xl mx-auto px-4 py-8">
        {currentStep === 'select' && renderTicketSelection()}
        {currentStep === 'details' && renderDetailsForm()}
        {currentStep === 'payment' && renderPaymentForm()}
        {currentStep === 'confirmation' && renderConfirmation()}
      </div>
    </div>
  );
};

export default TicketPurchase;