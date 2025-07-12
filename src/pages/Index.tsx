import { Header } from '@/components/Layout/Header';
import { HeroSection } from '@/components/Homepage/HeroSection';
import { PulseCard } from '@/components/PulseFeed/PulseCard';
import { PoliticianCard } from '@/components/Politicians/PoliticianCard';
import { VendorCard } from '@/components/Marketplace/VendorCard';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { mockPulses, mockPoliticians, mockVendors, mockNews, mockStats } from '@/data/mockData';
import { 
  TrendingUp, 
  Users, 
  MessageCircle, 
  ShoppingBag, 
  Globe,
  Heart,
  Star,
  ArrowRight,
  BarChart3,
  Newspaper
} from 'lucide-react';

const Index = () => {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main>
        <HeroSection />
        
        {/* Stats Dashboard */}
        <section className="py-16 bg-muted/30">
          <div className="container mx-auto px-4">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold text-foreground mb-4">
                Live Platform Metrics
              </h2>
              <p className="text-lg text-muted-foreground">
                Real-time insights into Cameroon&apos;s civic engagement
              </p>
            </div>
            
            <div className="grid grid-cols-2 lg:grid-cols-6 gap-6 mb-8">
              <Card className="text-center border-0 shadow-elegant">
                <CardContent className="p-6">
                  <Users className="w-8 h-8 text-primary mx-auto mb-3" />
                  <div className="text-2xl font-bold text-foreground mb-1">
                    {mockStats.totalUsers.toLocaleString()}
                  </div>
                  <div className="text-xs text-muted-foreground">Active Citizens</div>
                </CardContent>
              </Card>
              
              <Card className="text-center border-0 shadow-elegant">
                <CardContent className="p-6">
                  <MessageCircle className="w-8 h-8 text-cm-red mx-auto mb-3" />
                  <div className="text-2xl font-bold text-foreground mb-1">
                    {mockStats.dailyPulses.toLocaleString()}
                  </div>
                  <div className="text-xs text-muted-foreground">Daily Pulses</div>
                </CardContent>
              </Card>
              
              <Card className="text-center border-0 shadow-elegant">
                <CardContent className="p-6">
                  <ShoppingBag className="w-8 h-8 text-cm-yellow mx-auto mb-3" />
                  <div className="text-2xl font-bold text-foreground mb-1">
                    {mockStats.verifiedVendors.toLocaleString()}
                  </div>
                  <div className="text-xs text-muted-foreground">Verified Vendors</div>
                </CardContent>
              </Card>
              
              <Card className="text-center border-0 shadow-elegant">
                <CardContent className="p-6">
                  <Globe className="w-8 h-8 text-primary mx-auto mb-3" />
                  <div className="text-2xl font-bold text-foreground mb-1">
                    {mockStats.diasporaUsers.toLocaleString()}
                  </div>
                  <div className="text-xs text-muted-foreground">Diaspora Users</div>
                </CardContent>
              </Card>
              
              <Card className="text-center border-0 shadow-elegant">
                <CardContent className="p-6">
                  <Star className="w-8 h-8 text-accent mx-auto mb-3" />
                  <div className="text-2xl font-bold text-foreground mb-1">
                    {mockStats.activePoliticians}
                  </div>
                  <div className="text-xs text-muted-foreground">Politicians</div>
                </CardContent>
              </Card>
              
              <Card className="text-center border-0 shadow-elegant">
                <CardContent className="p-6">
                  <TrendingUp className="w-8 h-8 text-cm-green mx-auto mb-3" />
                  <div className="text-2xl font-bold text-foreground mb-1">
                    {mockStats.sentimentScore}%
                  </div>
                  <div className="text-xs text-muted-foreground">Positive Sentiment</div>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>

        {/* Featured Pulse Feed */}
        <section className="py-16">
          <div className="container mx-auto px-4">
            <div className="flex items-center justify-between mb-8">
              <div>
                <h2 className="text-3xl font-bold text-foreground mb-2">Trending Pulses</h2>
                <p className="text-muted-foreground">What Cameroonians are talking about</p>
              </div>
              <Button variant="outline">
                View All Pulses
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </div>
            
            <div className="grid lg:grid-cols-2 gap-6">
              {mockPulses.slice(0, 4).map((pulse) => (
                <PulseCard key={pulse.id} pulse={pulse} />
              ))}
            </div>
          </div>
        </section>

        {/* Politicians Section */}
        <section className="py-16 bg-muted/30">
          <div className="container mx-auto px-4">
            <div className="flex items-center justify-between mb-8">
              <div>
                <h2 className="text-3xl font-bold text-foreground mb-2">Top Rated Politicians</h2>
                <p className="text-muted-foreground">Transparent approval ratings and civic scores</p>
              </div>
              <Button variant="outline">
                View All Politicians
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </div>
            
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {mockPoliticians.map((politician) => (
                <PoliticianCard key={politician.id} politician={politician} />
              ))}
            </div>
          </div>
        </section>

        {/* Marketplace Section */}
        <section className="py-16">
          <div className="container mx-auto px-4">
            <div className="flex items-center justify-between mb-8">
              <div>
                <h2 className="text-3xl font-bold text-foreground mb-2">Verified Marketplace</h2>
                <p className="text-muted-foreground">Secure commerce with KYC-verified vendors</p>
              </div>
              <Button variant="outline">
                Browse Marketplace
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </div>
            
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {mockVendors.map((vendor) => (
                <VendorCard key={vendor.id} vendor={vendor} />
              ))}
            </div>
          </div>
        </section>

        {/* News Section */}
        <section className="py-16 bg-muted/30">
          <div className="container mx-auto px-4">
            <div className="flex items-center justify-between mb-8">
              <div>
                <h2 className="text-3xl font-bold text-foreground mb-2">Latest Civic News</h2>
                <p className="text-muted-foreground">Auto-curated news from verified sources</p>
              </div>
              <Button variant="outline">
                Read All News
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </div>
            
            <div className="grid md:grid-cols-2 gap-6">
              {mockNews.map((article) => (
                <Card key={article.id} className="border-0 shadow-elegant hover:shadow-lg transition-all duration-300">
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between mb-4">
                      <Badge className={`${
                        article.sentiment === 'positive' ? 'bg-cm-green text-white' : 'bg-muted text-muted-foreground'
                      }`}>
                        <BarChart3 className="w-3 h-3 mr-1" />
                        {article.sentiment}
                      </Badge>
                      <span className="text-sm text-muted-foreground">{article.timestamp}</span>
                    </div>
                    
                    <h3 className="text-lg font-bold text-foreground mb-2">{article.title}</h3>
                    <p className="text-sm text-muted-foreground italic mb-3">{article.title_fr}</p>
                    <p className="text-muted-foreground mb-4">{article.excerpt}</p>
                    
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Newspaper className="w-4 h-4" />
                        <span>{article.source}</span>
                      </div>
                      <Button variant="ghost" size="sm">
                        Read More
                        <ArrowRight className="w-4 h-4 ml-2" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* Call to Action */}
        <section className="py-16 bg-gradient-civic">
          <div className="container mx-auto px-4 text-center">
            <div className="max-w-3xl mx-auto">
              <h2 className="text-3xl font-bold text-primary-foreground mb-4">
                Join the Democratic Movement
              </h2>
              <p className="text-lg text-primary-foreground/90 mb-8">
                Your voice matters. Your vote counts. Your marketplace thrives.
                <br />
                Be part of Cameroon&apos;s transparent digital future.
              </p>
              
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button size="lg" variant="secondary" className="px-8 py-3">
                  <Heart className="w-5 h-5 mr-2" />
                  Donate to CamerPulse
                </Button>
                <Button size="lg" variant="outline" className="border-white text-white hover:bg-white/10 px-8 py-3">
                  <Users className="w-5 h-5 mr-2" />
                  Create Account
                </Button>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="bg-foreground text-background py-12">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center gap-3 mb-4">
                <div className="w-8 h-8 bg-gradient-flag rounded-full flex items-center justify-center">
                  <Star className="w-4 h-4 text-white" />
                </div>
                <span className="text-lg font-bold">CamerPulse</span>
              </div>
              <p className="text-sm opacity-80">
                Tracking the heartbeat of Cameroon through civic intelligence and secure commerce.
              </p>
            </div>
            
            <div>
              <h4 className="font-semibold mb-4">Platform</h4>
              <div className="space-y-2 text-sm opacity-80">
                <div>Pulse Feed</div>
                <div>Politicians</div>
                <div>Marketplace</div>
                <div>News</div>
              </div>
            </div>
            
            <div>
              <h4 className="font-semibold mb-4">Community</h4>
              <div className="space-y-2 text-sm opacity-80">
                <div>Diaspora</div>
                <div>Vendors</div>
                <div>Donate</div>
                <div>Security</div>
              </div>
            </div>
            
            <div>
              <h4 className="font-semibold mb-4">Support</h4>
              <div className="space-y-2 text-sm opacity-80">
                <div>Help Center</div>
                <div>API Docs</div>
                <div>Privacy</div>
                <div>Terms</div>
              </div>
            </div>
          </div>
          
          <div className="border-t border-background/20 mt-8 pt-8 text-center">
            <p className="text-sm opacity-80">
              © 2024 CamerPulse. Built with 🇨🇲 for Cameroon&apos;s democratic future.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Index;
