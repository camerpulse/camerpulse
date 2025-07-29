import React from 'react';
import { Link } from 'react-router-dom';
import { Truck, Package, MapPin, Building, Phone, Mail, Facebook, Instagram, Twitter, Linkedin } from 'lucide-react';

export const CamerLogisticsFooter = () => {
  return (
    <footer className="bg-primary text-primary-foreground py-12">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Brand Section */}
          <div className="space-y-4">
            <Link to="/logistics" className="flex items-center space-x-2">
              <div className="h-8 w-8 bg-secondary rounded-lg flex items-center justify-center">
                <Truck className="h-5 w-5 text-secondary-foreground" />
              </div>
              <span className="text-xl font-bold">CamerLogistics</span>
            </Link>
            <p className="text-primary-foreground/80 text-sm leading-relaxed">
              Cameroon's premier logistics platform connecting businesses and individuals with reliable delivery services across all regions.
            </p>
            <div className="flex space-x-4">
              <Link to="#" className="text-primary-foreground/70 hover:text-secondary transition-colors">
                <Facebook className="h-5 w-5" />
              </Link>
              <Link to="#" className="text-primary-foreground/70 hover:text-secondary transition-colors">
                <Instagram className="h-5 w-5" />
              </Link>
              <Link to="#" className="text-primary-foreground/70 hover:text-secondary transition-colors">
                <Twitter className="h-5 w-5" />
              </Link>
              <Link to="#" className="text-primary-foreground/70 hover:text-secondary transition-colors">
                <Linkedin className="h-5 w-5" />
              </Link>
            </div>
          </div>

          {/* Services */}
          <div>
            <h3 className="text-lg font-semibold mb-4 text-primary-foreground">Services</h3>
            <ul className="space-y-3">
              <li>
                <Link to="/logistics/tracking" className="text-gray-400 hover:text-white transition-colors flex items-center space-x-2">
                  <MapPin className="h-4 w-4" />
                  <span>Package Tracking</span>
                </Link>
              </li>
              <li>
                <Link to="/logistics/ship" className="text-gray-400 hover:text-white transition-colors flex items-center space-x-2">
                  <Package className="h-4 w-4" />
                  <span>Ship Packages</span>
                </Link>
              </li>
              <li>
                <Link to="/logistics/express" className="text-gray-400 hover:text-white transition-colors flex items-center space-x-2">
                  <Truck className="h-4 w-4" />
                  <span>Express Delivery</span>
                </Link>
              </li>
              <li>
                <Link to="/logistics/business" className="text-gray-400 hover:text-white transition-colors flex items-center space-x-2">
                  <Building className="h-4 w-4" />
                  <span>Business Solutions</span>
                </Link>
              </li>
            </ul>
          </div>

          {/* For Partners */}
          <div>
            <h3 className="text-lg font-semibold mb-4 text-white">For Partners</h3>
            <ul className="space-y-3">
              <li>
                <Link to="/logistics/join-company" className="text-gray-400 hover:text-white transition-colors">
                  Become a Partner
                </Link>
              </li>
              <li>
                <Link to="/logistics/company-portal" className="text-gray-400 hover:text-white transition-colors">
                  Company Portal
                </Link>
              </li>
              <li>
                <Link to="/logistics/companies" className="text-gray-400 hover:text-white transition-colors">
                  Find Companies
                </Link>
              </li>
              <li>
                <Link to="/logistics/api" className="text-gray-400 hover:text-white transition-colors">
                  API Integration
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact & Support */}
          <div>
            <h3 className="text-lg font-semibold mb-4 text-white">Contact & Support</h3>
            <ul className="space-y-3">
              <li className="flex items-center space-x-2 text-gray-400">
                <Phone className="h-4 w-4" />
                <span>+237 6XX XXX XXX</span>
              </li>
              <li className="flex items-center space-x-2 text-gray-400">
                <Mail className="h-4 w-4" />
                <span>support@camerlogistics.cm</span>
              </li>
              <li>
                <Link to="/logistics/help" className="text-gray-400 hover:text-white transition-colors">
                  Help Center
                </Link>
              </li>
              <li>
                <Link to="/logistics/contact" className="text-gray-400 hover:text-white transition-colors">
                  Contact Us
                </Link>
              </li>
              <li>
                <Link to="/logistics/support" className="text-gray-400 hover:text-white transition-colors">
                  Customer Support
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Section */}
        <div className="border-t border-gray-800 mt-8 pt-8">
          <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
            <div className="text-gray-400 text-sm">
              © 2024 CamerLogistics. All rights reserved. | Powered by{' '}
              <Link to="/public" className="text-blue-400 hover:text-blue-300">
                CamerPulse
              </Link>
            </div>
            <div className="flex space-x-6 text-sm">
              <Link to="/logistics/privacy" className="text-gray-400 hover:text-white transition-colors">
                Privacy Policy
              </Link>
              <Link to="/logistics/terms" className="text-gray-400 hover:text-white transition-colors">
                Terms of Service
              </Link>
              <Link to="/logistics/security" className="text-gray-400 hover:text-white transition-colors">
                Security
              </Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};