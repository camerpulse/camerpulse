import { useLocation, Link } from "react-router-dom";
import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AppLayout } from "@/components/Layout/AppLayout";
import { Home, ArrowLeft, Search, MapPin } from "lucide-react";

const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    console.error(
      "404 Error: User attempted to access non-existent route:",
      location.pathname
    );
  }, [location.pathname]);

  const suggestions = [
    { label: "Home", href: "/", icon: Home },
    { label: "Politicians", href: "/politicians", icon: MapPin },
    { label: "Feed", href: "/feed", icon: Search }
  ];

  return (
    <AppLayout>
      <div className="min-h-screen flex items-center justify-center bg-background safe-area-padding">
        <div className="container mx-auto px-4 py-8">
          <Card className="max-w-2xl mx-auto shadow-elegant text-center">
            <CardHeader className="space-y-6 pb-8">
              <div className="mx-auto w-32 h-32 bg-gradient-to-br from-primary/20 to-secondary/20 rounded-full flex items-center justify-center">
                <span className="text-6xl font-bold text-primary font-grotesk">404</span>
              </div>
              <CardTitle className="text-3xl sm:text-4xl font-bold text-foreground font-playfair">
                Page Not Found
              </CardTitle>
              <p className="text-lg text-muted-foreground font-inter max-w-md mx-auto">
                Sorry, we couldn't find the page you're looking for. The URL might be mistyped or the page may have been moved.
              </p>
              <div className="text-sm text-muted-foreground font-mono bg-muted/50 px-4 py-2 rounded-lg inline-block">
                Attempted URL: <span className="text-destructive">{location.pathname}</span>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Quick Navigation */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-foreground font-grotesk">Where would you like to go?</h3>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  {suggestions.map((suggestion) => (
                    <Button
                      key={suggestion.href}
                      asChild
                      variant="outline"
                      className="h-16 flex-col gap-2 hover:bg-primary/5 hover:border-primary/20 touch-manipulation"
                    >
                      <Link to={suggestion.href}>
                        <suggestion.icon className="w-5 h-5" />
                        <span className="font-medium">{suggestion.label}</span>
                      </Link>
                    </Button>
                  ))}
                </div>
              </div>

              {/* Main Actions */}
              <div className="flex flex-col sm:flex-row gap-4 justify-center items-center pt-4">
                <Button asChild className="w-full sm:w-auto h-12 touch-manipulation">
                  <Link to="/">
                    <Home className="w-4 h-4 mr-2" />
                    Return to Home
                  </Link>
                </Button>
                <Button 
                  asChild 
                  variant="outline" 
                  className="w-full sm:w-auto h-12 touch-manipulation"
                  onClick={() => window.history.back()}
                >
                  <button type="button">
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    Go Back
                  </button>
                </Button>
              </div>

              {/* Help Text */}
              <div className="text-center pt-6 border-t border-border">
                <p className="text-sm text-muted-foreground font-inter">
                  If you believe this is an error, please{" "}
                  <Link to="/contact" className="text-primary hover:underline font-medium">
                    contact support
                  </Link>{" "}
                  or try refreshing the page.
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </AppLayout>
  );
};

export default NotFound;
