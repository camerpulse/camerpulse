import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { 
  CheckCircle, 
  AlertTriangle, 
  XCircle, 
  MapPin, 
  Users, 
  FileText, 
  Phone,
  Calendar,
  Info,
  Shield,
  ArrowRight,
  Clock,
  MessageSquare
} from 'lucide-react';

interface VoterProfile {
  region: string;
  currentLocation: string;
  age: number;
  hasElecamCard: boolean;
  hasValidId: boolean;
  isDisplaced: boolean;
}

interface VoterStatus {
  eligible: boolean;
  status: 'ready' | 'partially_ready' | 'not_ready';
  message: string;
  requiredActions: string[];
  elecamInfo: {
    office: string;
    address: string;
    phone: string;
    hours: string;
  };
}

const VoterReadinessScanner = () => {
  const [currentStep, setCurrentStep] = useState<'form' | 'result' | 'guidance'>('form');
  const [voterProfile, setVoterProfile] = useState<VoterProfile>({
    region: '',
    currentLocation: '',
    age: 0,
    hasElecamCard: false,
    hasValidId: false,
    isDisplaced: false
  });
  const [voterStatus, setVoterStatus] = useState<VoterStatus | null>(null);
  const [misinfoCheck, setMisinfoCheck] = useState('');
  const [misinfoResult, setMisinfoResult] = useState<string | null>(null);
  const [reminderEmail, setReminderEmail] = useState('');
  const [reminderPhone, setReminderPhone] = useState('');

  const cameroonRegions = [
    'Adamawa', 'Centre', 'East', 'Far North', 'Littoral',
    'North', 'Northwest', 'South', 'Southwest', 'West'
  ];

  const elecamOffices = {
    'Adamawa': {
      office: 'ELECAM Adamawa Regional Office',
      address: 'Ngaoundere, Adamawa Region',
      phone: '+237 699 123 456',
      hours: 'Mon-Fri: 8:00-16:00'
    },
    'Centre': {
      office: 'ELECAM Centre Regional Office',
      address: 'Yaounde, Centre Region',
      phone: '+237 699 234 567',
      hours: 'Mon-Fri: 8:00-16:00'
    },
    'East': {
      office: 'ELECAM East Regional Office',
      address: 'Bertoua, East Region',
      phone: '+237 699 345 678',
      hours: 'Mon-Fri: 8:00-16:00'
    },
    'Far North': {
      office: 'ELECAM Far North Regional Office',
      address: 'Maroua, Far North Region',
      phone: '+237 699 456 789',
      hours: 'Mon-Fri: 8:00-16:00'
    },
    'Littoral': {
      office: 'ELECAM Littoral Regional Office',
      address: 'Douala, Littoral Region',
      phone: '+237 699 567 890',
      hours: 'Mon-Fri: 8:00-16:00'
    },
    'North': {
      office: 'ELECAM North Regional Office',
      address: 'Garoua, North Region',
      phone: '+237 699 678 901',
      hours: 'Mon-Fri: 8:00-16:00'
    },
    'Northwest': {
      office: 'ELECAM Northwest Regional Office',
      address: 'Bamenda, Northwest Region',
      phone: '+237 699 789 012',
      hours: 'Mon-Fri: 8:00-16:00'
    },
    'South': {
      office: 'ELECAM South Regional Office',
      address: 'Ebolowa, South Region',
      phone: '+237 699 890 123',
      hours: 'Mon-Fri: 8:00-16:00'
    },
    'Southwest': {
      office: 'ELECAM Southwest Regional Office',
      address: 'Buea, Southwest Region',
      phone: '+237 699 901 234',
      hours: 'Mon-Fri: 8:00-16:00'
    },
    'West': {
      office: 'ELECAM West Regional Office',
      address: 'Bafoussam, West Region',
      phone: '+237 699 012 345',
      hours: 'Mon-Fri: 8:00-16:00'
    }
  };

  const checkVoterReadiness = () => {
    const { region, age, hasElecamCard, hasValidId, isDisplaced } = voterProfile;
    
    let status: VoterStatus = {
      eligible: false,
      status: 'not_ready',
      message: '',
      requiredActions: [],
      elecamInfo: elecamOffices[region as keyof typeof elecamOffices] || elecamOffices['Centre']
    };

    // Check age eligibility
    if (age < 18) {
      status = {
        ...status,
        status: 'not_ready',
        message: '🔴 You are currently not eligible to vote.',
        requiredActions: [
          'You must be at least 18 years old to vote in Cameroon',
          'You can pre-register once you turn 17 years and 6 months',
          'Prepare your documents in advance: National ID card or Passport',
          'Contact ELECAM when you turn 18 to complete registration'
        ]
      };
    }
    // Check if fully ready
    else if (age >= 18 && hasElecamCard && hasValidId && !isDisplaced) {
      status = {
        ...status,
        eligible: true,
        status: 'ready',
        message: '🟢 You are eligible and ready to vote!',
        requiredActions: [
          'Verify your polling station location on your voter card',
          'Bring your voter card and valid ID on election day',
          'Check election date and time announcements',
          'Arrive early to avoid queues'
        ]
      };
    }
    // Check if partially ready
    else if (age >= 18) {
      const actions = [];
      let message = '🟡 You may be eligible but need to complete some steps.';
      
      if (!hasElecamCard) {
        actions.push('Register with ELECAM to get your voter card');
        actions.push('Visit the nearest ELECAM office with required documents');
        actions.push('Bring: National ID card, birth certificate, and recent photo');
      }
      
      if (!hasValidId) {
        actions.push('Obtain a valid National ID card or Passport');
        actions.push('Visit the nearest civil registration office');
        actions.push('Bring birth certificate and other required documents');
      }
      
      if (isDisplaced) {
        actions.push('Request voter registration transfer to your current location');
        actions.push('Contact ELECAM to update your registration details');
        actions.push('Provide proof of current residence');
        message = '🟡 As a displaced person, you can still vote with proper registration transfer.';
      }
      
      status = {
        ...status,
        status: 'partially_ready',
        message,
        requiredActions: actions
      };
    }

    setVoterStatus(status);
    setCurrentStep('result');
  };

  const checkMisinformation = () => {
    const commonMisinfo = [
      {
        keywords: ['election postponed', 'delayed', 'cancelled'],
        correction: 'Always verify election dates through official ELECAM announcements. Do not trust social media rumors.'
      },
      {
        keywords: ['pay', 'money', 'fee', 'bribe'],
        correction: 'Voter registration is FREE. Never pay money to register or vote. Report anyone asking for payment.'
      },
      {
        keywords: ['only for', 'restricted to', 'certain tribes'],
        correction: 'All Cameroonian citizens aged 18+ can register and vote regardless of region, tribe, or religion.'
      },
      {
        keywords: ['soldiers', 'military', 'police check'],
        correction: 'While security may be present, voting is private and secure. No one can force you to vote for anyone.'
      },
      {
        keywords: ['photo required', 'certificate needed'],
        correction: 'Only valid ID (National ID or Passport) and voter card are required on election day.'
      }
    ];

    const lowerInput = misinfoCheck.toLowerCase();
    const detectedMisinfo = commonMisinfo.find(item =>
      item.keywords.some(keyword => lowerInput.includes(keyword))
    );

    if (detectedMisinfo) {
      setMisinfoResult(`⚠️ Warning: This may be misinformation. ${detectedMisinfo.correction}`);
    } else {
      setMisinfoResult('✅ No obvious misinformation detected, but always verify through official ELECAM channels.');
    }
  };

  const setReminder = () => {
    // In a real implementation, this would integrate with notification services
    console.log('Setting reminder for:', { email: reminderEmail, phone: reminderPhone });
    alert('Reminder set successfully! You will receive updates about voter registration deadlines.');
  };

  if (currentStep === 'form') {
    return (
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Users className="h-5 w-5 text-primary" />
              <span>Voter Readiness Scanner</span>
            </CardTitle>
            <CardDescription>
              Check if you're ready to vote and get personalized guidance for your region
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="region">Region of Residence</Label>
                <Select value={voterProfile.region} onValueChange={(value) => 
                  setVoterProfile({...voterProfile, region: value})
                }>
                  <SelectTrigger>
                    <SelectValue placeholder="Select your region" />
                  </SelectTrigger>
                  <SelectContent>
                    {cameroonRegions.map(region => (
                      <SelectItem key={region} value={region}>{region}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="currentLocation">Current Location (if different)</Label>
                <Input
                  id="currentLocation"
                  value={voterProfile.currentLocation}
                  onChange={(e) => setVoterProfile({...voterProfile, currentLocation: e.target.value})}
                  placeholder="Enter current location"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="age">Age</Label>
                <Input
                  id="age"
                  type="number"
                  value={voterProfile.age || ''}
                  onChange={(e) => setVoterProfile({...voterProfile, age: parseInt(e.target.value) || 0})}
                  placeholder="Enter your age"
                />
              </div>

              <div className="space-y-4">
                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="hasElecamCard"
                    checked={voterProfile.hasElecamCard}
                    onChange={(e) => setVoterProfile({...voterProfile, hasElecamCard: e.target.checked})}
                    className="rounded"
                  />
                  <Label htmlFor="hasElecamCard">I have a voter card from ELECAM</Label>
                </div>

                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="hasValidId"
                    checked={voterProfile.hasValidId}
                    onChange={(e) => setVoterProfile({...voterProfile, hasValidId: e.target.checked})}
                    className="rounded"
                  />
                  <Label htmlFor="hasValidId">I have a valid National ID or Passport</Label>
                </div>

                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="isDisplaced"
                    checked={voterProfile.isDisplaced}
                    onChange={(e) => setVoterProfile({...voterProfile, isDisplaced: e.target.checked})}
                    className="rounded"
                  />
                  <Label htmlFor="isDisplaced">I am currently displaced from my region</Label>
                </div>
              </div>
            </div>

            <Button 
              onClick={checkVoterReadiness}
              className="w-full"
              disabled={!voterProfile.region || !voterProfile.age}
            >
              <ArrowRight className="h-4 w-4 mr-2" />
              Check My Voter Readiness
            </Button>
          </CardContent>
        </Card>

        {/* Misinformation Checker */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Shield className="h-5 w-5 text-blue-600" />
              <span>Election Information Checker</span>
            </CardTitle>
            <CardDescription>
              Check if what you've heard about the elections is accurate
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="misinfoCheck">What have you heard about the elections?</Label>
              <Textarea
                id="misinfoCheck"
                value={misinfoCheck}
                onChange={(e) => setMisinfoCheck(e.target.value)}
                placeholder="e.g., 'I heard the election was postponed' or 'Someone said I need to pay to register'"
              />
            </div>
            
            <Button onClick={checkMisinformation} disabled={!misinfoCheck.trim()}>
              <Info className="h-4 w-4 mr-2" />
              Check Information
            </Button>

            {misinfoResult && (
              <Alert>
                <Info className="h-4 w-4" />
                <AlertDescription>{misinfoResult}</AlertDescription>
              </Alert>
            )}
          </CardContent>
        </Card>
      </div>
    );
  }

  if (currentStep === 'result' && voterStatus) {
    return (
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              {voterStatus.status === 'ready' && <CheckCircle className="h-5 w-5 text-green-600" />}
              {voterStatus.status === 'partially_ready' && <AlertTriangle className="h-5 w-5 text-yellow-600" />}
              {voterStatus.status === 'not_ready' && <XCircle className="h-5 w-5 text-red-600" />}
              <span>Your Voter Readiness Status</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <Alert>
              <AlertDescription className="text-lg font-medium">
                {voterStatus.message}
              </AlertDescription>
            </Alert>

            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Required Actions:</h3>
              <ul className="space-y-2">
                {voterStatus.requiredActions.map((action, index) => (
                  <li key={index} className="flex items-start space-x-2">
                    <ArrowRight className="h-4 w-4 mt-1 text-primary" />
                    <span>{action}</span>
                  </li>
                ))}
              </ul>
            </div>

            <Separator />

            <div className="space-y-4">
              <h3 className="text-lg font-semibold flex items-center space-x-2">
                <MapPin className="h-5 w-5" />
                <span>Your ELECAM Office</span>
              </h3>
              <div className="bg-muted p-4 rounded-lg space-y-2">
                <p className="font-medium">{voterStatus.elecamInfo.office}</p>
                <p className="text-sm text-muted-foreground">{voterStatus.elecamInfo.address}</p>
                <div className="flex items-center space-x-4 text-sm">
                  <div className="flex items-center space-x-1">
                    <Phone className="h-4 w-4" />
                    <span>{voterStatus.elecamInfo.phone}</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <Clock className="h-4 w-4" />
                    <span>{voterStatus.elecamInfo.hours}</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-2">
              <Button onClick={() => setCurrentStep('guidance')} className="flex-1">
                <FileText className="h-4 w-4 mr-2" />
                Get Detailed Guidance
              </Button>
              <Button variant="outline" onClick={() => setCurrentStep('form')} className="flex-1">
                Check Another Person
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Reminder System */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Calendar className="h-5 w-5 text-blue-600" />
              <span>Set Reminders</span>
            </CardTitle>
            <CardDescription>
              Get notified about registration deadlines and election updates
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="reminderEmail">Email (optional)</Label>
                <Input
                  id="reminderEmail"
                  type="email"
                  value={reminderEmail}
                  onChange={(e) => setReminderEmail(e.target.value)}
                  placeholder="your.email@example.com"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="reminderPhone">WhatsApp/SMS (optional)</Label>
                <Input
                  id="reminderPhone"
                  type="tel"
                  value={reminderPhone}
                  onChange={(e) => setReminderPhone(e.target.value)}
                  placeholder="+237 6XX XXX XXX"
                />
              </div>
            </div>
            <Button 
              onClick={setReminder}
              disabled={!reminderEmail && !reminderPhone}
              className="w-full"
            >
              <MessageSquare className="h-4 w-4 mr-2" />
              Set Reminder
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (currentStep === 'guidance') {
    return (
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <FileText className="h-5 w-5 text-blue-600" />
              <span>Detailed Voting Guidance</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-4">
              <div className="bg-blue-50 p-4 rounded-lg">
                <h3 className="font-semibold text-blue-900 mb-2">Step 1: Document Preparation</h3>
                <ul className="text-sm text-blue-800 space-y-1">
                  <li>• National ID card or valid passport</li>
                  <li>• Birth certificate (for first registration)</li>
                  <li>• Recent passport-size photo</li>
                  <li>• Proof of residence (utility bill, etc.)</li>
                </ul>
              </div>

              <div className="bg-green-50 p-4 rounded-lg">
                <h3 className="font-semibold text-green-900 mb-2">Step 2: ELECAM Registration</h3>
                <ul className="text-sm text-green-800 space-y-1">
                  <li>• Visit your regional ELECAM office</li>
                  <li>• Complete registration form</li>
                  <li>• Provide biometric data (fingerprints)</li>
                  <li>• Collect temporary receipt</li>
                </ul>
              </div>

              <div className="bg-purple-50 p-4 rounded-lg">
                <h3 className="font-semibold text-purple-900 mb-2">Step 3: Voter Card Collection</h3>
                <ul className="text-sm text-purple-800 space-y-1">
                  <li>• Return to ELECAM office after processing period</li>
                  <li>• Bring your temporary receipt and ID</li>
                  <li>• Verify your polling station information</li>
                  <li>• Keep your voter card safe</li>
                </ul>
              </div>

              <div className="bg-orange-50 p-4 rounded-lg">
                <h3 className="font-semibold text-orange-900 mb-2">Step 4: Election Day</h3>
                <ul className="text-sm text-orange-800 space-y-1">
                  <li>• Arrive at your designated polling station</li>
                  <li>• Bring voter card and valid ID</li>
                  <li>• Vote privately and mark ballot clearly</li>
                  <li>• Deposit ballot in designated box</li>
                </ul>
              </div>
            </div>

            <Alert>
              <Info className="h-4 w-4" />
              <AlertDescription>
                <strong>Remember:</strong> Voting is free, private, and your right as a Cameroonian citizen. 
                Report any irregularities to election observers or ELECAM officials.
              </AlertDescription>
            </Alert>

            <div className="flex flex-col sm:flex-row gap-2">
              <Button onClick={() => setCurrentStep('result')} variant="outline" className="flex-1">
                Back to Results
              </Button>
              <Button onClick={() => setCurrentStep('form')} className="flex-1">
                Start New Check
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return null;
};

export default VoterReadinessScanner;