import React from 'react';
import { Link } from 'react-router-dom';
import { CamerLogisticsLayout } from '@/components/Layout/CamerLogisticsLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Truck, Package, MapPin, Clock, Shield, Users, CheckCircle, ArrowRight, Search } from 'lucide-react';

export const CamerLogisticsLandingPage = () => {
  return (
    <CamerLogisticsLayout>
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-blue-900 via-blue-800 to-blue-700 text-white py-20">
        <div className="absolute inset-0 bg-black/20"></div>
        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-4xl mx-auto text-center">
            <Badge className="mb-4 bg-white/20 text-white border-white/30">
              Cameroon's Leading Logistics Platform
            </Badge>
            <h1 className="text-5xl md:text-6xl font-bold mb-6">
              Fast, Reliable
              <span className="block text-orange-400">Package Delivery</span>
            </h1>
            <p className="text-xl md:text-2xl mb-8 text-blue-100">
              Connect with trusted delivery companies across Cameroon. Ship with confidence, track in real-time.
            </p>
            
            {/* Quick Track */}
            <div className="bg-white/10 backdrop-blur-sm rounded-lg p-6 mb-8 max-w-2xl mx-auto">
              <h3 className="text-lg font-semibold mb-4">Track Your Package</h3>
              <div className="flex gap-3">
                <Input 
                  placeholder="Enter tracking number..." 
                  className="bg-white text-black border-0 flex-1"
                />
                <Button className="bg-orange-500 hover:bg-orange-600 text-white">
                  <Search className="h-4 w-4 mr-2" />
                  Track
                </Button>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button size="lg" className="bg-orange-500 hover:bg-orange-600 text-white">
                <Package className="h-5 w-5 mr-2" />
                Ship a Package
              </Button>
              <Button size="lg" variant="outline" className="border-white text-white hover:bg-white hover:text-blue-900">
                Join as Company
                <ArrowRight className="h-5 w-5 ml-2" />
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-background">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-4">Why Choose CamerLogistics?</h2>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              We connect you with verified delivery companies across Cameroon, ensuring your packages reach their destination safely and on time.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <Card className="text-center border-2 hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="h-16 w-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Truck className="h-8 w-8 text-blue-600" />
                </div>
                <CardTitle>Verified Companies</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  All delivery partners are thoroughly vetted and verified for reliability and professionalism.
                </p>
              </CardContent>
            </Card>

            <Card className="text-center border-2 hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="h-16 w-16 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <MapPin className="h-8 w-8 text-orange-600" />
                </div>
                <CardTitle>Real-time Tracking</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  Track your packages in real-time from pickup to delivery with detailed status updates.
                </p>
              </CardContent>
            </Card>

            <Card className="text-center border-2 hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="h-16 w-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Shield className="h-8 w-8 text-green-600" />
                </div>
                <CardTitle>Secure & Insured</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  Your packages are protected with insurance coverage and secure handling protocols.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Services Section */}
      <section className="py-20 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-4xl font-bold mb-6">Complete Logistics Solutions</h2>
              <p className="text-xl text-muted-foreground mb-8">
                From small packages to large shipments, we provide comprehensive logistics services across all regions of Cameroon.
              </p>
              
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <CheckCircle className="h-6 w-6 text-green-600 flex-shrink-0" />
                  <span className="text-lg">Same-day delivery in major cities</span>
                </div>
                <div className="flex items-center gap-3">
                  <CheckCircle className="h-6 w-6 text-green-600 flex-shrink-0" />
                  <span className="text-lg">Inter-city shipping nationwide</span>
                </div>
                <div className="flex items-center gap-3">
                  <CheckCircle className="h-6 w-6 text-green-600 flex-shrink-0" />
                  <span className="text-lg">Business logistics solutions</span>
                </div>
                <div className="flex items-center gap-3">
                  <CheckCircle className="h-6 w-6 text-green-600 flex-shrink-0" />
                  <span className="text-lg">International shipping options</span>
                </div>
              </div>

              <Button className="mt-8 bg-blue-600 hover:bg-blue-700 text-white" size="lg">
                Explore Services
                <ArrowRight className="h-5 w-5 ml-2" />
              </Button>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
                <CardContent className="p-6 text-center">
                  <Clock className="h-12 w-12 text-blue-600 mx-auto mb-3" />
                  <h4 className="font-semibold text-blue-900">Express Delivery</h4>
                  <p className="text-sm text-blue-700 mt-2">Fast delivery when time matters</p>
                </CardContent>
              </Card>
              
              <Card className="bg-gradient-to-br from-orange-50 to-orange-100 border-orange-200">
                <CardContent className="p-6 text-center">
                  <Package className="h-12 w-12 text-orange-600 mx-auto mb-3" />
                  <h4 className="font-semibold text-orange-900">Bulk Shipping</h4>
                  <p className="text-sm text-orange-700 mt-2">Cost-effective for large orders</p>
                </CardContent>
              </Card>
              
              <Card className="bg-gradient-to-br from-green-50 to-green-100 border-green-200">
                <CardContent className="p-6 text-center">
                  <Shield className="h-12 w-12 text-green-600 mx-auto mb-3" />
                  <h4 className="font-semibold text-green-900">Secure Handling</h4>
                  <p className="text-sm text-green-700 mt-2">Premium protection for valuables</p>
                </CardContent>
              </Card>
              
              <Card className="bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200">
                <CardContent className="p-6 text-center">
                  <Users className="h-12 w-12 text-purple-600 mx-auto mb-3" />
                  <h4 className="font-semibold text-purple-900">Business Solutions</h4>
                  <p className="text-sm text-purple-700 mt-2">Tailored for enterprises</p>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-20 bg-blue-900 text-white">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-4 gap-8 text-center">
            <div>
              <div className="text-4xl font-bold text-orange-400 mb-2">50,000+</div>
              <div className="text-blue-200">Packages Delivered</div>
            </div>
            <div>
              <div className="text-4xl font-bold text-orange-400 mb-2">150+</div>
              <div className="text-blue-200">Partner Companies</div>
            </div>
            <div>
              <div className="text-4xl font-bold text-orange-400 mb-2">10</div>
              <div className="text-blue-200">Regions Covered</div>
            </div>
            <div>
              <div className="text-4xl font-bold text-orange-400 mb-2">99.5%</div>
              <div className="text-blue-200">On-time Delivery</div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-orange-500 to-orange-600 text-white">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-4xl font-bold mb-4">Ready to Ship with CamerLogistics?</h2>
          <p className="text-xl mb-8 text-orange-100">
            Join thousands of satisfied customers who trust us with their deliveries
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center max-w-md mx-auto">
            <Button size="lg" className="bg-white text-orange-600 hover:bg-orange-50">
              Get Started Today
            </Button>
            <Button size="lg" variant="outline" className="border-white text-white hover:bg-white hover:text-orange-600">
              Contact Sales
            </Button>
          </div>
        </div>
      </section>
    </CamerLogisticsLayout>
  );
};