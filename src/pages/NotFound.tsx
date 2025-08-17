import { useLocation, Link } from "react-router-dom";
import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { MainLayout } from "@/components/layout/MainLayout";
import { Home, Search, FileText, Users, Building, MapPin, ArrowRight } from "lucide-react";

const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    console.error(
      "404 Error: User attempted to access non-existent route:",
      location.pathname
    );
  }, [location.pathname]);

  const popularPages = [
    { title: "Civic Dashboard", href: "/civic-dashboard", icon: FileText, description: "Monitor civic activities" },
    { title: "Politicians Directory", href: "/politicians", icon: Users, description: "Find your representatives" },
    { title: "Villages Directory", href: "/villages", icon: MapPin, description: "Explore communities" },
    { title: "Marketplace", href: "/marketplace", icon: Building, description: "Local businesses & products" },
  ];

  const handleSearch = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const query = formData.get('search') as string;
    if (query.trim()) {
      window.location.href = `/search?q=${encodeURIComponent(query.trim())}`;
    }
  };

  return (
    <MainLayout>
      <div className="min-h-screen bg-gradient-to-br from-background via-muted/20 to-background">
        <div className="container mx-auto px-4 py-16">
          <div className="max-w-2xl mx-auto text-center">
            {/* 404 Hero Section */}
            <div className="mb-8">
              <div className="text-8xl font-bold text-primary mb-4">404</div>
              <h1 className="text-3xl font-bold text-foreground mb-4">Page Not Found</h1>
              <p className="text-lg text-muted-foreground mb-6">
                Sorry, the page you're looking for doesn't exist or has been moved.
              </p>
              <Badge variant="outline" className="mb-8">
                {location.pathname}
              </Badge>
            </div>

            {/* Search Section */}
            <Card className="mb-8">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Search className="w-5 h-5" />
                  Search CamerPulse
                </CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSearch} className="flex gap-2">
                  <Input 
                    name="search"
                    placeholder="Search for politicians, villages, policies..." 
                    className="flex-1"
                  />
                  <Button type="submit">
                    <Search className="w-4 h-4 mr-2" />
                    Search
                  </Button>
                </form>
              </CardContent>
            </Card>

            {/* Quick Actions */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
              {popularPages.map((page) => (
                <Card key={page.href} className="hover:shadow-md transition-shadow">
                  <CardContent className="p-4">
                    <Link to={page.href} className="block group">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                          <page.icon className="w-5 h-5 text-primary" />
                        </div>
                        <div className="flex-1 text-left">
                          <h3 className="font-semibold text-foreground group-hover:text-primary transition-colors">
                            {page.title}
                          </h3>
                          <p className="text-sm text-muted-foreground">
                            {page.description}
                          </p>
                        </div>
                        <ArrowRight className="w-4 h-4 text-muted-foreground group-hover:text-primary transition-colors" />
                      </div>
                    </Link>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Return Home */}
            <div className="space-x-4">
              <Button asChild>
                <Link to="/">
                  <Home className="w-4 h-4 mr-2" />
                  Return Home
                </Link>
              </Button>
              <Button variant="outline" asChild>
                <Link to="/civic-dashboard">
                  Go to Dashboard
                </Link>
              </Button>
            </div>

            {/* Help Text */}
            <div className="mt-8 text-sm text-muted-foreground">
              <p>Need help? Contact us at support@camerpulse.com</p>
            </div>
          </div>
        </div>
      </div>
    </MainLayout>
  );
};

export default NotFound;
