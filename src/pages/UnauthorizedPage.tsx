import React from 'react';
import { Link } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Lock, Home, LogIn, Shield, AlertTriangle } from 'lucide-react';
import { ROUTES } from '@/config/routes';

interface UnauthorizedPageProps {
  requiredAccess?: string;
  message?: string;
}

const UnauthorizedPage: React.FC<UnauthorizedPageProps> = ({ 
  requiredAccess = 'special permissions',
  message
}) => {
  const defaultMessage = `You need ${requiredAccess} to access this page.`;
  
  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-destructive/5 via-background to-muted/5">
      <Card className="w-full max-w-md border-destructive/20 shadow-lg">
        <CardHeader className="text-center pb-4">
          <div className="mx-auto w-16 h-16 bg-destructive/10 rounded-full flex items-center justify-center mb-4">
            <Lock className="h-8 w-8 text-destructive" />
          </div>
          <CardTitle className="flex items-center justify-center gap-2 text-destructive">
            <Shield className="h-5 w-5" />
            Access Restricted
          </CardTitle>
        </CardHeader>
        
        <CardContent className="space-y-6 text-center">
          <div className="space-y-2">
            <p className="text-muted-foreground">
              {message || defaultMessage}
            </p>
            
            {requiredAccess.includes('admin') && (
              <div className="bg-destructive/5 p-3 rounded-lg border border-destructive/20">
                <div className="flex items-center justify-center gap-2 text-destructive text-sm">
                  <AlertTriangle className="h-4 w-4" />
                  Administrator access required
                </div>
              </div>
            )}
          </div>
          
          <div className="text-xs text-muted-foreground bg-muted/50 p-3 rounded-lg">
            This area requires special permissions. Please contact an administrator 
            if you believe you should have access to this section.
          </div>
          
          <div className="space-y-3">
            <Button asChild className="w-full">
              <Link to={ROUTES.AUTH}>
                <LogIn className="h-4 w-4 mr-2" />
                Sign In / Register
              </Link>
            </Button>
            
            <Button asChild variant="outline" className="w-full">
              <Link to={ROUTES.HOME}>
                <Home className="h-4 w-4 mr-2" />
                Return to Home
              </Link>
            </Button>
          </div>
          
          <div className="pt-4 border-t">
            <p className="text-xs text-muted-foreground">
              Need help? <Link to={ROUTES.UTILITY.CONTACT} className="text-primary hover:underline">Contact support</Link>
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default UnauthorizedPage;