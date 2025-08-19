import React, { useState, useEffect } from 'react';
import { Navigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Checkbox } from '@/components/ui/checkbox';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { Star, Shield, Users } from 'lucide-react';

const Auth = () => {
  const { user, signIn, signUp, loading } = useAuth();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  
  // Login form
  const [loginData, setLoginData] = useState({
    email: '',
    password: ''
  });

  // Signup form
  const [signupData, setSignupData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    username: '',
    displayName: '',
    isDiaspora: false,
    location: ''
  });

  // Redirect if already authenticated
  if (user && !loading) {
    return <Navigate to="/" replace />;
  }

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    const { error } = await signIn(loginData.email, loginData.password);

    if (error) {
      toast({
        title: "Login error",
        description: error.message,
        variant: "destructive"
      });
    } else {
      toast({
        title: "Login successful",
        description: "Welcome to CamerPulse!"
      });
    }
    setIsLoading(false);
  };

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();

    if (signupData.password !== signupData.confirmPassword) {
      toast({
        title: "Error",
        description: "Passwords do not match",
        variant: "destructive"
      });
      return;
    }

    if (signupData.password.length < 6) {
      toast({
        title: "Error",
        description: "Password must contain at least 6 characters",
        variant: "destructive"
      });
      return;
    }

    setIsLoading(true);

    const { error } = await signUp(
      signupData.email,
      signupData.password,
      {
        username: signupData.username,
        full_name: signupData.displayName,
        is_diaspora: signupData.isDiaspora,
        location: signupData.location
      }
    );

    if (error) {
      toast({
        title: "Registration Error",
        description: error.message,
        variant: "destructive"
      });
    } else {
      toast({
        title: "Registration successful",
        description: "Check your email to confirm your account"
      });
    }
    setIsLoading(false);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-cameroon">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-cameroon-primary"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-cameroon flex items-center justify-center p-4 safe-area-padding">
      <div className="w-full max-w-md">
        {/* CamerPulse Branding */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center mb-4">
            <Star className="h-8 w-8 text-cameroon-yellow mr-2" />
            <h1 className="text-3xl font-bold text-white">CamerPulse</h1>
          </div>
          <p className="text-cameroon-yellow">The pulse of Cameroon 🇨🇲</p>
        </div>

        <Card className="border-cameroon-yellow/20 backdrop-blur-sm bg-white/95">
          <CardHeader>
            <CardTitle className="text-center text-cameroon-primary">
              Join the Community
            </CardTitle>
            <CardDescription className="text-center">
              Your voice. Your power. Your market.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="login" className="w-full">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="login">Login</TabsTrigger>
                <TabsTrigger value="signup">Sign Up</TabsTrigger>
              </TabsList>
              
              <TabsContent value="login">
                <form onSubmit={handleLogin} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="login-email">Email</Label>
                    <Input
                      id="login-email"
                      type="email"
                      placeholder="your@email.com"
                      value={loginData.email}
                      onChange={(e) => setLoginData({...loginData, email: e.target.value})}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="login-password">Password</Label>
                    <Input
                      id="login-password"
                      type="password"
                      value={loginData.password}
                      onChange={(e) => setLoginData({...loginData, password: e.target.value})}
                      required
                    />
                  </div>
                  <Button
                    type="submit"
                    className="w-full bg-cameroon-primary hover:bg-cameroon-primary/90"
                    disabled={isLoading}
                  >
                    {isLoading ? 'Signing in...' : 'Sign In'}
                  </Button>
                </form>
              </TabsContent>
              
              <TabsContent value="signup">
                <form onSubmit={handleSignup} className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="signup-username">Username</Label>
                      <Input
                        id="signup-username"
                        placeholder="@username"
                        value={signupData.username}
                        onChange={(e) => setSignupData({...signupData, username: e.target.value})}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="signup-displayName">Full Name</Label>
                      <Input
                        id="signup-displayName"
                        placeholder="Your name"
                        value={signupData.displayName}
                        onChange={(e) => setSignupData({...signupData, displayName: e.target.value})}
                        required
                      />
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="signup-email">Email</Label>
                    <Input
                      id="signup-email"
                      type="email"
                      placeholder="your@email.com"
                      value={signupData.email}
                      onChange={(e) => setSignupData({...signupData, email: e.target.value})}
                      required
                    />
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="signup-password">Password</Label>
                      <Input
                        id="signup-password"
                        type="password"
                        value={signupData.password}
                        onChange={(e) => setSignupData({...signupData, password: e.target.value})}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="signup-confirm">Confirm</Label>
                      <Input
                        id="signup-confirm"
                        type="password"
                        value={signupData.confirmPassword}
                        onChange={(e) => setSignupData({...signupData, confirmPassword: e.target.value})}
                        required
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="signup-location">Location (optional)</Label>
                    <Input
                      id="signup-location"
                      placeholder="Yaoundé, Douala, Paris..."
                      value={signupData.location}
                      onChange={(e) => setSignupData({...signupData, location: e.target.value})}
                    />
                  </div>

                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="diaspora"
                      checked={signupData.isDiaspora}
                      onCheckedChange={(checked) => 
                        setSignupData({...signupData, isDiaspora: checked as boolean})
                      }
                    />
                    <Label htmlFor="diaspora" className="text-sm">
                      I am a member of the Cameroonian diaspora 🌍
                    </Label>
                  </div>

                  <Button
                    type="submit"
                    className="w-full bg-cameroon-red hover:bg-cameroon-red/90"
                    disabled={isLoading}
                  >
                    {isLoading ? 'Creating...' : "Create my account"}
                  </Button>
                </form>
              </TabsContent>
            </Tabs>

            {/* Features */}
            <div className="mt-6 pt-6 border-t border-gray-200">
              <div className="grid grid-cols-3 gap-4 text-center">
                <div className="flex flex-col items-center">
                  <Users className="h-5 w-5 text-cameroon-primary mb-1" />
                  <span className="text-xs text-gray-600">Pulse Feed</span>
                </div>
                <div className="flex flex-col items-center">
                  <Shield className="h-5 w-5 text-cameroon-red mb-1" />
                  <span className="text-xs text-gray-600">Marketplace</span>
                </div>
                <div className="flex flex-col items-center">
                  <Star className="h-5 w-5 text-cameroon-yellow mb-1" />
                  <span className="text-xs text-gray-600">Civic Pulse</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Auth;