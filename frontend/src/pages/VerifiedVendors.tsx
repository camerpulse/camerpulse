import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { AppLayout } from "@/components/Layout/AppLayout";
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';
import { mockMarketplaceVendors } from '@/data/mockData';
import { 
  Search, 
  Shield, 
  Star, 
  MapPin, 
  Store, 
  Users,
  Award,
  TrendingUp,
  Filter,
  ChevronDown
} from 'lucide-react';

const VerifiedVendors = () => {
  const [vendors, setVendors] = useState([]);
  const [filteredVendors, setFilteredVendors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');

  useEffect(() => {
    fetchVendors();
  }, []);

  useEffect(() => {
    filterVendors();
  }, [searchTerm, selectedCategory, vendors]);

  const fetchVendors = async () => {
    try {
      setLoading(true);
      const { data: vendorsData } = await supabase
        .from('marketplace_vendors')
        .select('*')
        .eq('verification_status', 'verified')
        .order('rating', { ascending: false });

      setVendors(vendorsData || mockMarketplaceVendors);
    } catch (error) {
      console.error('Error fetching vendors:', error);
      setVendors(mockMarketplaceVendors);
    } finally {
      setLoading(false);
    }
  };

  const filterVendors = () => {
    let filtered = [...vendors];

    if (searchTerm) {
      filtered = filtered.filter(vendor =>
        vendor.business_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        vendor.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        vendor.location.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (selectedCategory !== 'all') {
      filtered = filtered.filter(vendor => vendor.category === selectedCategory);
    }

    setFilteredVendors(filtered);
  };

  const categories = [
    { value: 'all', label: 'All Categories' },
    { value: 'electronics', label: 'Electronics' },
    { value: 'fashion', label: 'Fashion' },
    { value: 'crafts', label: 'Art & Crafts' },
    { value: 'food', label: 'Food & Agriculture' },
    { value: 'beauty', label: 'Health & Beauty' }
  ];

  const topVendors = filteredVendors.filter(v => v.rating >= 4.8).slice(0, 3);
  const featuredVendors = filteredVendors.filter(v => v.featured).slice(0, 6);

  return (
    <AppLayout>
      <div className="min-h-screen bg-slate-50">
        {/* Hero Section */}
        <section className="bg-gradient-to-r from-green-600 to-blue-600 text-white py-16">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto text-center">
              <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm rounded-full px-4 py-2 mb-6">
                <Shield className="w-4 h-4" />
                <span className="text-sm font-medium">1,247 Verified Vendors</span>
              </div>
              
              <h1 className="text-4xl md:text-6xl font-bold mb-6">
                Verified Vendors
              </h1>
              <p className="text-xl md:text-2xl text-green-100 mb-8 max-w-3xl mx-auto">
                Connect with KYC-verified Cameroonian vendors. Every seller on our platform 
                goes through rigorous verification to ensure authenticity and quality.
              </p>

              {/* Search */}
              <div className="max-w-2xl mx-auto">
                <div className="relative bg-white rounded-xl shadow-lg p-2">
                  <div className="flex">
                    <div className="relative flex-1">
                      <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-slate-400 w-5 h-5" />
                      <Input 
                        placeholder="Search verified vendors..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-12 pr-4 py-3 border-0 focus:ring-0 bg-transparent text-slate-900"
                      />
                    </div>
                    <Button className="bg-green-600 hover:bg-green-700 px-6 rounded-lg">
                      Search
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Stats */}
        <section className="py-12 bg-white">
          <div className="container mx-auto px-4">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              {[
                { label: 'Verified Vendors', value: '1,247', icon: Shield, color: 'text-green-600' },
                { label: 'Average Rating', value: '4.8★', icon: Star, color: 'text-yellow-600' },
                { label: 'Cities Covered', value: '184', icon: MapPin, color: 'text-blue-600' },
                { label: 'Products Listed', value: '25,000+', icon: Store, color: 'text-purple-600' }
              ].map((stat, index) => (
                <Card key={index} className="text-center border-0 shadow-md">
                  <CardContent className="p-6">
                    <stat.icon className={`w-8 h-8 ${stat.color} mx-auto mb-3`} />
                    <div className="text-2xl font-bold text-slate-900 mb-1">{stat.value}</div>
                    <div className="text-sm text-slate-600">{stat.label}</div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* Top Performers */}
        {topVendors.length > 0 && (
          <section className="py-16 bg-slate-50">
            <div className="container mx-auto px-4">
              <div className="text-center mb-12">
                <h2 className="text-3xl font-bold text-slate-900 mb-4">Top Performing Vendors</h2>
                <p className="text-xl text-slate-600">Our highest-rated verified sellers</p>
              </div>
              
              <div className="grid md:grid-cols-3 gap-8 mb-12">
                {topVendors.map((vendor, index) => (
                  <Card key={vendor.id} className="relative border-0 shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden">
                    {index === 0 && (
                      <div className="absolute top-0 left-0 bg-gradient-to-r from-yellow-400 to-orange-400 text-white px-3 py-1 text-xs font-bold">
                        #1 VENDOR
                      </div>
                    )}
                    <CardContent className="p-8 text-center">
                      <img 
                        src={vendor.profile.avatar_url} 
                        alt={vendor.business_name}
                        className="w-20 h-20 rounded-full object-cover mx-auto mb-4 border-4 border-green-100"
                      />
                      <Badge className="bg-green-500 text-white mb-3">
                        <Award className="w-3 h-3 mr-1" />
                        Top Rated
                      </Badge>
                      <h3 className="text-xl font-bold text-slate-900 mb-2">{vendor.business_name}</h3>
                      <p className="text-slate-600 mb-4 line-clamp-2">{vendor.description}</p>
                      
                      <div className="space-y-2 mb-6">
                        <div className="flex items-center justify-center gap-1">
                          <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                          <span className="font-bold">{vendor.rating}</span>
                          <span className="text-slate-500">({vendor.total_reviews} reviews)</span>
                        </div>
                        <div className="flex items-center justify-center gap-1 text-sm text-slate-600">
                          <MapPin className="w-3 h-3" />
                          {vendor.location}
                        </div>
                      </div>
                      
                      <Button className="w-full" asChild>
                        <Link to={`/vendor/${vendor.id}`}>View Store</Link>
                      </Button>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          </section>
        )}

        {/* All Vendors */}
        <section className="py-16">
          <div className="container mx-auto px-4">
            <div className="flex items-center justify-between mb-8">
              <div>
                <h2 className="text-3xl font-bold text-slate-900 mb-2">All Verified Vendors</h2>
                <p className="text-xl text-slate-600">Browse our complete directory</p>
              </div>
              
              <div className="flex items-center gap-4">
                <select 
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                >
                  {categories.map(category => (
                    <option key={category.value} value={category.value}>
                      {category.label}
                    </option>
                  ))}
                </select>
                <Button variant="outline" className="flex items-center gap-2">
                  <Filter className="w-4 h-4" />
                  More Filters
                </Button>
              </div>
            </div>

            {loading ? (
              <div className="text-center py-20">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto mb-4"></div>
                <p className="text-slate-600">Loading verified vendors...</p>
              </div>
            ) : (
              <div className="grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {filteredVendors.map((vendor) => (
                  <Card key={vendor.id} className="border-0 shadow-md hover:shadow-lg transition-all duration-300">
                    <CardContent className="p-6">
                      <div className="text-center mb-4">
                        <img 
                          src={vendor.profile.avatar_url} 
                          alt={vendor.business_name}
                          className="w-16 h-16 rounded-full object-cover mx-auto mb-3"
                        />
                        <Badge className="bg-green-100 text-green-700 text-xs mb-2">
                          <Shield className="w-3 h-3 mr-1" />
                          Verified
                        </Badge>
                        <Badge variant="outline" className="text-xs font-mono">
                          {vendor.vendor_id}
                        </Badge>
                      </div>
                      
                      <h3 className="font-bold text-slate-900 mb-2 text-center">{vendor.business_name}</h3>
                      <p className="text-sm text-slate-600 mb-4 line-clamp-2 text-center">{vendor.description}</p>
                      
                      <div className="space-y-2 mb-4">
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-slate-500">Rating</span>
                          <div className="flex items-center gap-1">
                            <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                            <span className="font-medium">{vendor.rating}</span>
                          </div>
                        </div>
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-slate-500">Location</span>
                          <span className="font-medium">{vendor.location}</span>
                        </div>
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-slate-500">Products</span>
                          <span className="font-medium">{vendor.total_sales}</span>
                        </div>
                      </div>
                      
                      <Button className="w-full" size="sm" asChild>
                        <Link to={`/vendor/${vendor.id}`}>Visit Store</Link>
                      </Button>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}

            {filteredVendors.length === 0 && !loading && (
              <div className="text-center py-20">
                <Users className="w-20 h-20 text-slate-400 mx-auto mb-6" />
                <h3 className="text-2xl font-semibold text-slate-900 mb-3">No vendors found</h3>
                <p className="text-slate-600">Try adjusting your search or filters</p>
              </div>
            )}
          </div>
        </section>

        {/* CTA */}
        <section className="py-16 bg-gradient-to-r from-green-600 to-blue-600 text-white">
          <div className="container mx-auto px-4 text-center">
            <h2 className="text-3xl font-bold mb-4">Become a Verified Vendor</h2>
            <p className="text-xl text-green-100 mb-8 max-w-2xl mx-auto">
              Join our exclusive network of verified sellers and grow your business with Africa's most trusted marketplace.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button size="lg" variant="secondary" asChild>
                <Link to="/vendor-onboarding">Start Verification</Link>
              </Button>
              <Button size="lg" variant="outline" className="text-white border-white hover:bg-white hover:text-green-600" asChild>
                <Link to="/vendor-requirements">View Requirements</Link>
              </Button>
            </div>
          </div>
        </section>
      </div>
    </AppLayout>
  );
};

export default VerifiedVendors;