import { useState } from 'react';
import { Link } from 'react-router-dom';
import { AppLayout } from "@/components/Layout/AppLayout";
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { 
  Shield, 
  CheckCircle, 
  Clock, 
  FileText, 
  Camera, 
  MapPin, 
  Phone,
  Mail,
  Store,
  User,
  ArrowRight,
  ArrowLeft,
  Upload,
  AlertCircle,
  Star,
  Award
} from 'lucide-react';

const VendorOnboarding = () => {
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState({
    businessName: '',
    description: '',
    category: '',
    location: '',
    phone: '',
    email: '',
    businessType: '',
    experience: '',
    documents: []
  });

  const steps = [
    { id: 1, title: 'Business Information', icon: Store },
    { id: 2, title: 'Contact Details', icon: Phone },
    { id: 3, title: 'Documentation', icon: FileText },
    { id: 4, title: 'Verification', icon: Shield }
  ];

  const requirements = [
    {
      title: 'Valid Business Registration',
      description: 'Government-issued business registration certificate',
      icon: FileText,
      status: 'required'
    },
    {
      title: 'National ID or Passport',
      description: 'Clear copy of valid identification document',
      icon: User,
      status: 'required'
    },
    {
      title: 'Tax ID Number',
      description: 'Valid tax identification number (TIN)',
      icon: FileText,
      status: 'required'
    },
    {
      title: 'Bank Account Details',
      description: 'Business bank account for payment processing',
      icon: Shield,
      status: 'required'
    },
    {
      title: 'Business Photos',
      description: 'Clear photos of your business premises/products',
      icon: Camera,
      status: 'recommended'
    },
    {
      title: 'References',
      description: 'Business references or customer testimonials',
      icon: Star,
      status: 'optional'
    }
  ];

  const benefits = [
    {
      title: 'Verified Badge',
      description: 'Get the trusted verified vendor badge',
      icon: Shield,
      color: 'text-green-600'
    },
    {
      title: 'Priority Listing',
      description: 'Higher visibility in search results',
      icon: Star,
      color: 'text-yellow-600'
    },
    {
      title: 'Secure Payments',
      description: 'Protected escrow payment system',
      icon: CheckCircle,
      color: 'text-blue-600'
    },
    {
      title: 'Marketing Support',
      description: 'Featured in promotional campaigns',
      icon: Award,
      color: 'text-purple-600'
    }
  ];

  const nextStep = () => {
    if (currentStep < 4) setCurrentStep(currentStep + 1);
  };

  const prevStep = () => {
    if (currentStep > 1) setCurrentStep(currentStep - 1);
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <AppLayout>
      <div className="min-h-screen bg-slate-50">
        {/* Hero Section */}
        <section className="bg-gradient-to-r from-green-600 to-blue-600 text-white py-16">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto text-center">
              <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm rounded-full px-4 py-2 mb-6">
                <Shield className="w-4 h-4" />
                <span className="text-sm font-medium">Trusted Verification Process</span>
              </div>
              
              <h1 className="text-4xl md:text-6xl font-bold mb-6">
                Become a Verified Vendor
              </h1>
              <p className="text-xl md:text-2xl text-green-100 mb-8 max-w-3xl mx-auto">
                Join Africa's most trusted marketplace. Get verified in 24-48 hours 
                and start selling to 50,000+ verified customers.
              </p>

              {/* Quick Stats */}
              <div className="flex flex-wrap justify-center gap-8 text-sm">
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-5 h-5" />
                  <span>24-48 Hour Verification</span>
                </div>
                <div className="flex items-center gap-2">
                  <Shield className="w-5 h-5" />
                  <span>KYC Compliant</span>
                </div>
                <div className="flex items-center gap-2">
                  <Star className="w-5 h-5" />
                  <span>50,000+ Customers</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Benefits Section */}
        <section className="py-16 bg-white">
          <div className="container mx-auto px-4">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold text-slate-900 mb-4">Why Get Verified?</h2>
              <p className="text-xl text-slate-600">Unlock exclusive benefits for verified vendors</p>
            </div>
            
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
              {benefits.map((benefit, index) => (
                <Card key={index} className="text-center border-0 shadow-md hover:shadow-lg transition-all">
                  <CardContent className="p-6">
                    <benefit.icon className={`w-10 h-10 ${benefit.color} mx-auto mb-4`} />
                    <h3 className="font-bold text-slate-900 mb-2">{benefit.title}</h3>
                    <p className="text-sm text-slate-600">{benefit.description}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* Requirements Section */}
        <section className="py-16 bg-slate-50">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto">
              <div className="text-center mb-12">
                <h2 className="text-3xl font-bold text-slate-900 mb-4">Verification Requirements</h2>
                <p className="text-xl text-slate-600">What you'll need to get verified</p>
              </div>
              
              <div className="grid md:grid-cols-2 gap-6">
                {requirements.map((req, index) => (
                  <Card key={index} className="border-0 shadow-md">
                    <CardContent className="p-6">
                      <div className="flex items-start gap-4">
                        <req.icon className="w-8 h-8 text-green-600 mt-1" />
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <h3 className="font-bold text-slate-900">{req.title}</h3>
                            <Badge 
                              variant={req.status === 'required' ? 'default' : 'secondary'}
                              className={req.status === 'required' ? 'bg-red-100 text-red-700' : ''}
                            >
                              {req.status}
                            </Badge>
                          </div>
                          <p className="text-sm text-slate-600">{req.description}</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Application Form */}
        <section className="py-16 bg-white">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto">
              <div className="text-center mb-12">
                <h2 className="text-3xl font-bold text-slate-900 mb-4">Start Your Application</h2>
                <p className="text-xl text-slate-600">Complete the verification process step by step</p>
              </div>

              {/* Progress Steps */}
              <div className="flex items-center justify-center mb-12">
                {steps.map((step, index) => (
                  <div key={step.id} className="flex items-center">
                    <div className={`flex items-center justify-center w-12 h-12 rounded-full border-2 transition-all ${
                      currentStep >= step.id 
                        ? 'bg-green-600 border-green-600 text-white' 
                        : 'border-slate-300 text-slate-400'
                    }`}>
                      <step.icon className="w-5 h-5" />
                    </div>
                    <div className="ml-3 mr-8">
                      <p className={`text-sm font-medium ${
                        currentStep >= step.id ? 'text-green-600' : 'text-slate-400'
                      }`}>
                        Step {step.id}
                      </p>
                      <p className={`text-xs ${
                        currentStep >= step.id ? 'text-slate-900' : 'text-slate-400'
                      }`}>
                        {step.title}
                      </p>
                    </div>
                    {index < steps.length - 1 && (
                      <div className={`w-12 h-px ${
                        currentStep > step.id ? 'bg-green-600' : 'bg-slate-300'
                      }`} />
                    )}
                  </div>
                ))}
              </div>

              {/* Form Content */}
              <Card className="border-0 shadow-lg">
                <CardHeader>
                  <CardTitle className="text-center">
                    {steps.find(s => s.id === currentStep)?.title}
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-8">
                  {currentStep === 1 && (
                    <div className="space-y-6">
                      <div>
                        <label className="block text-sm font-medium text-slate-700 mb-2">Business Name</label>
                        <Input 
                          placeholder="Enter your business name"
                          value={formData.businessName}
                          onChange={(e) => handleInputChange('businessName', e.target.value)}
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-slate-700 mb-2">Business Description</label>
                        <Textarea 
                          placeholder="Describe your business and products"
                          value={formData.description}
                          onChange={(e) => handleInputChange('description', e.target.value)}
                          rows={4}
                        />
                      </div>
                      <div className="grid md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-slate-700 mb-2">Category</label>
                          <select 
                            className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                            value={formData.category}
                            onChange={(e) => handleInputChange('category', e.target.value)}
                          >
                            <option value="">Select category</option>
                            <option value="electronics">Electronics</option>
                            <option value="fashion">Fashion</option>
                            <option value="crafts">Art & Crafts</option>
                            <option value="food">Food & Agriculture</option>
                            <option value="beauty">Health & Beauty</option>
                          </select>
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-slate-700 mb-2">Business Type</label>
                          <select 
                            className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                            value={formData.businessType}
                            onChange={(e) => handleInputChange('businessType', e.target.value)}
                          >
                            <option value="">Select type</option>
                            <option value="manufacturer">Manufacturer</option>
                            <option value="retailer">Retailer</option>
                            <option value="wholesaler">Wholesaler</option>
                            <option value="artisan">Artisan/Craftsperson</option>
                          </select>
                        </div>
                      </div>
                    </div>
                  )}

                  {currentStep === 2 && (
                    <div className="space-y-6">
                      <div className="grid md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-slate-700 mb-2">Phone Number</label>
                          <Input 
                            placeholder="+237 6XX XXX XXX"
                            value={formData.phone}
                            onChange={(e) => handleInputChange('phone', e.target.value)}
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-slate-700 mb-2">Email Address</label>
                          <Input 
                            type="email"
                            placeholder="business@example.com"
                            value={formData.email}
                            onChange={(e) => handleInputChange('email', e.target.value)}
                          />
                        </div>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-slate-700 mb-2">Business Location</label>
                        <Input 
                          placeholder="City, Region"
                          value={formData.location}
                          onChange={(e) => handleInputChange('location', e.target.value)}
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-slate-700 mb-2">Years of Experience</label>
                        <Input 
                          placeholder="How long have you been in business?"
                          value={formData.experience}
                          onChange={(e) => handleInputChange('experience', e.target.value)}
                        />
                      </div>
                    </div>
                  )}

                  {currentStep === 3 && (
                    <div className="space-y-6">
                      <div className="text-center mb-6">
                        <AlertCircle className="w-12 h-12 text-yellow-500 mx-auto mb-4" />
                        <h3 className="text-lg font-semibold text-slate-900 mb-2">Document Upload</h3>
                        <p className="text-slate-600">Please upload clear, readable copies of your documents</p>
                      </div>
                      
                      {requirements.filter(r => r.status === 'required').map((req, index) => (
                        <div key={index} className="border-2 border-dashed border-slate-300 rounded-lg p-6 text-center hover:border-green-400 transition-colors">
                          <Upload className="w-8 h-8 text-slate-400 mx-auto mb-2" />
                          <p className="font-medium text-slate-700 mb-1">{req.title}</p>
                          <p className="text-sm text-slate-500 mb-3">{req.description}</p>
                          <Button variant="outline" size="sm">
                            Choose File
                          </Button>
                        </div>
                      ))}
                    </div>
                  )}

                  {currentStep === 4 && (
                    <div className="text-center space-y-6">
                      <CheckCircle className="w-16 h-16 text-green-600 mx-auto" />
                      <h3 className="text-2xl font-bold text-slate-900">Application Submitted!</h3>
                      <p className="text-slate-600 max-w-md mx-auto">
                        Your verification application has been submitted successfully. 
                        Our team will review your documents within 24-48 hours.
                      </p>
                      
                      <div className="bg-slate-50 rounded-lg p-6 max-w-md mx-auto">
                        <h4 className="font-semibold text-slate-900 mb-3">What happens next?</h4>
                        <div className="space-y-3 text-sm text-slate-600">
                          <div className="flex items-center gap-2">
                            <Clock className="w-4 h-4 text-blue-500" />
                            <span>Document review (24-48 hours)</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Phone className="w-4 h-4 text-blue-500" />
                            <span>Verification call (if needed)</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Shield className="w-4 h-4 text-green-500" />
                            <span>Account activation</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Navigation Buttons */}
                  <div className="flex justify-between mt-8">
                    <Button 
                      variant="outline" 
                      onClick={prevStep}
                      disabled={currentStep === 1}
                      className="flex items-center gap-2"
                    >
                      <ArrowLeft className="w-4 h-4" />
                      Previous
                    </Button>
                    
                    {currentStep < 4 ? (
                      <Button 
                        onClick={nextStep}
                        className="flex items-center gap-2"
                      >
                        Next
                        <ArrowRight className="w-4 h-4" />
                      </Button>
                    ) : (
                      <Button asChild>
                        <Link to="/vendor-dashboard">Go to Dashboard</Link>
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>

        {/* Support Section */}
        <section className="py-16 bg-slate-50">
          <div className="container mx-auto px-4 text-center">
            <h2 className="text-2xl font-bold text-slate-900 mb-4">Need Help?</h2>
            <p className="text-slate-600 mb-8 max-w-2xl mx-auto">
              Our vendor support team is here to help you through the verification process.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button variant="outline" className="flex items-center gap-2">
                <Mail className="w-4 h-4" />
                Email Support
              </Button>
              <Button variant="outline" className="flex items-center gap-2">
                <Phone className="w-4 h-4" />
                Call Us
              </Button>
            </div>
          </div>
        </section>
      </div>
    </AppLayout>
  );
};

export default VendorOnboarding;