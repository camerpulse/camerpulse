import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Shield, UserPlus, LogIn } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';

interface AuthGuardProps {
  open: boolean;
  onClose: () => void;
  onLogin: () => void;
  onSignup: () => void;
  action: string; // e.g., "claim this profile", "rate this politician"
}

export const AuthGuard: React.FC<AuthGuardProps> = ({
  open,
  onClose,
  onLogin,
  onSignup,
  action
}) => {
  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5 text-primary" />
            Login Required
          </DialogTitle>
          <DialogDescription>
            You need to be logged in to {action}. Join CamerPulse to participate in civic engagement.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <Card className="bg-muted/30">
            <CardContent className="p-4">
              <div className="flex items-start gap-3">
                <Shield className="h-5 w-5 text-primary mt-0.5" />
                <div className="text-sm">
                  <p className="font-medium mb-1">Why create an account?</p>
                  <ul className="text-muted-foreground space-y-1 text-xs">
                    <li>• Claim and verify official profiles</li>
                    <li>• Rate politicians and parties</li>
                    <li>• Submit civic suggestions</li>
                    <li>• Participate in polls and discussions</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="flex flex-col gap-3">
            <Button onClick={onSignup} className="w-full">
              <UserPlus className="h-4 w-4 mr-2" />
              Create Free Account
            </Button>
            
            <Button variant="outline" onClick={onLogin} className="w-full">
              <LogIn className="h-4 w-4 mr-2" />
              Login to Existing Account
            </Button>
          </div>

          <p className="text-xs text-center text-muted-foreground">
            Free to join • No spam • Secure verification
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
};