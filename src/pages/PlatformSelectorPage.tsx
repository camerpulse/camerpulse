import React from 'react';
import { Link } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Truck, Package, Tags, QrCode, ArrowRight, Zap, Shield, Globe } from 'lucide-react';

export const PlatformSelectorPage = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-orange-50">
      {/* Header */}
      <header className="border-b bg-white/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <div className="h-8 w-8 bg-gradient-to-br from-blue-600 to-orange-600 rounded-lg flex items-center justify-center">
                <Globe className="h-5 w-5 text-white" />
              </div>
              <span className="text-xl font-bold text-gray-900">CamerPulse</span>
              <Badge variant="secondary" className="ml-2">Platform Suite</Badge>
            </div>
            <Button variant="outline" asChild>
              <Link to="/auth">Sign In</Link>
            </Button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="py-20">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-5xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-blue-600 to-orange-600 bg-clip-text text-transparent">
            Choose Your Platform
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto mb-12">
            CamerPulse offers integrated solutions for logistics and shipping. Select the platform that best fits your needs.
          </p>
        </div>
      </section>

      {/* Platform Cards */}
      <section className="pb-20">
        <div className="container mx-auto px-4">
          <div className="grid lg:grid-cols-2 gap-8 max-w-6xl mx-auto">
            
            {/* CamerLogistics Platform */}
            <Card className="relative overflow-hidden border-2 hover:shadow-2xl transition-all duration-300 group">
              <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-blue-600/10"></div>
              <CardHeader className="relative z-10 pb-4">
                <div className="flex items-center space-x-3 mb-4">
                  <div className="h-12 w-12 bg-gradient-to-br from-blue-500 to-blue-700 rounded-xl flex items-center justify-center">
                    <Truck className="h-7 w-7 text-white" />
                  </div>
                  <div>
                    <CardTitle className="text-2xl text-blue-900">CamerLogistics</CardTitle>
                    <p className="text-blue-600 font-medium">Shipping & Delivery Platform</p>
                  </div>
                </div>
                <Badge className="bg-blue-100 text-blue-700 border-blue-200 w-fit">
                  For Customers & Companies
                </Badge>
              </CardHeader>
              
              <CardContent className="relative z-10 space-y-6">
                <p className="text-gray-600 leading-relaxed">
                  Complete logistics solution for shipping packages, tracking deliveries, and connecting with verified delivery companies across Cameroon.
                </p>
                
                <div className="space-y-3">
                  <div className="flex items-center space-x-3 text-sm">
                    <div className="h-2 w-2 bg-blue-500 rounded-full"></div>
                    <span>Ship packages nationwide</span>
                  </div>
                  <div className="flex items-center space-x-3 text-sm">
                    <div className="h-2 w-2 bg-blue-500 rounded-full"></div>
                    <span>Real-time package tracking</span>
                  </div>
                  <div className="flex items-center space-x-3 text-sm">
                    <div className="h-2 w-2 bg-blue-500 rounded-full"></div>
                    <span>Verified delivery companies</span>
                  </div>
                  <div className="flex items-center space-x-3 text-sm">
                    <div className="h-2 w-2 bg-blue-500 rounded-full"></div>
                    <span>Business logistics solutions</span>
                  </div>
                </div>

                <div className="flex items-center space-x-2 pt-4">
                  <Shield className="h-4 w-4 text-green-600" />
                  <span className="text-sm text-green-600 font-medium">Secure & Insured</span>
                </div>

                <div className="pt-4">
                  <Button className="w-full bg-blue-600 hover:bg-blue-700 text-white group-hover:scale-105 transition-transform" asChild>
                    <Link to="/logistics">
                      Access CamerLogistics
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Link>
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Label Designer Platform */}
            <Card className="relative overflow-hidden border-2 hover:shadow-2xl transition-all duration-300 group">
              <div className="absolute inset-0 bg-gradient-to-br from-orange-500/5 to-orange-600/10"></div>
              <CardHeader className="relative z-10 pb-4">
                <div className="flex items-center space-x-3 mb-4">
                  <div className="h-12 w-12 bg-gradient-to-br from-orange-500 to-orange-700 rounded-xl flex items-center justify-center">
                    <Tags className="h-7 w-7 text-white" />
                  </div>
                  <div>
                    <CardTitle className="text-2xl text-orange-900">Label Designer</CardTitle>
                    <p className="text-orange-600 font-medium">Professional Label Creation</p>
                  </div>
                </div>
                <Badge className="bg-orange-100 text-orange-700 border-orange-200 w-fit">
                  For Businesses & Professionals
                </Badge>
              </CardHeader>
              
              <CardContent className="relative z-10 space-y-6">
                <p className="text-gray-600 leading-relaxed">
                  Advanced label design and printing platform for creating professional shipping labels, QR codes, and tracking systems.
                </p>
                
                <div className="space-y-3">
                  <div className="flex items-center space-x-3 text-sm">
                    <div className="h-2 w-2 bg-orange-500 rounded-full"></div>
                    <span>Custom label design tools</span>
                  </div>
                  <div className="flex items-center space-x-3 text-sm">
                    <div className="h-2 w-2 bg-orange-500 rounded-full"></div>
                    <span>QR code & barcode generation</span>
                  </div>
                  <div className="flex items-center space-x-3 text-sm">
                    <div className="h-2 w-2 bg-orange-500 rounded-full"></div>
                    <span>Bulk label printing</span>
                  </div>
                  <div className="flex items-center space-x-3 text-sm">
                    <div className="h-2 w-2 bg-orange-500 rounded-full"></div>
                    <span>Template management</span>
                  </div>
                </div>

                <div className="flex items-center space-x-2 pt-4">
                  <Zap className="h-4 w-4 text-yellow-600" />
                  <span className="text-sm text-yellow-600 font-medium">Professional Tools</span>
                </div>

                <div className="pt-4">
                  <Button className="w-full bg-orange-600 hover:bg-orange-700 text-white group-hover:scale-105 transition-transform" asChild>
                    <Link to="/auth">
                      Access Label Designer
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Link>
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Quick Access Section */}
      <section className="py-16 bg-white/50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">Quick Access</h2>
            <p className="text-gray-600">Common actions across our platforms</p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-6 max-w-4xl mx-auto">
            <Card className="text-center hover:shadow-lg transition-shadow">
              <CardContent className="p-6">
                <Package className="h-12 w-12 text-blue-600 mx-auto mb-4" />
                <h3 className="font-semibold mb-2">Track Package</h3>
                <p className="text-sm text-gray-600 mb-4">Find your package anywhere in Cameroon</p>
                <Button variant="outline" size="sm" asChild>
                  <Link to="/logistics/tracking">Track Now</Link>
                </Button>
              </CardContent>
            </Card>

            <Card className="text-center hover:shadow-lg transition-shadow">
              <CardContent className="p-6">
                <Truck className="h-12 w-12 text-orange-600 mx-auto mb-4" />
                <h3 className="font-semibold mb-2">Find Companies</h3>
                <p className="text-sm text-gray-600 mb-4">Browse verified delivery partners</p>
                <Button variant="outline" size="sm" asChild>
                  <Link to="/logistics/companies">Browse</Link>
                </Button>
              </CardContent>
            </Card>

            <Card className="text-center hover:shadow-lg transition-shadow">
              <CardContent className="p-6">
                <QrCode className="h-12 w-12 text-green-600 mx-auto mb-4" />
                <h3 className="font-semibold mb-2">Create Labels</h3>
                <p className="text-sm text-gray-600 mb-4">Professional label design tools</p>
                <Button variant="outline" size="sm" asChild>
                  <Link to="/auth">Get Started</Link>
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="container mx-auto px-4">
          <div className="text-center">
            <div className="flex items-center justify-center space-x-2 mb-4">
              <div className="h-8 w-8 bg-gradient-to-br from-blue-600 to-orange-600 rounded-lg flex items-center justify-center">
                <Globe className="h-5 w-5 text-white" />
              </div>
              <span className="text-xl font-bold">CamerPulse</span>
            </div>
            <p className="text-gray-400 mb-6">
              Empowering Cameroon with integrated logistics and business solutions
            </p>
            <div className="flex justify-center space-x-6 text-sm">
              <Link to="/privacy" className="text-gray-400 hover:text-white transition-colors">
                Privacy Policy
              </Link>
              <Link to="/terms" className="text-gray-400 hover:text-white transition-colors">
                Terms of Service
              </Link>
              <Link to="/contact" className="text-gray-400 hover:text-white transition-colors">
                Contact Us
              </Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};