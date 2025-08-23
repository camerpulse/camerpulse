import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';

import { toast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Loader2, ArrowLeft, Eye, EyeOff } from 'lucide-react';
import { Helmet } from 'react-helmet-async';

export const UnifiedAuthPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams] = useSearchParams();
  const { signIn, signUp, user, loading } = useAuth();
  
  // Form states
  const [signInForm, setSignInForm] = useState({ email: '', password: '' });
  const [signUpForm, setSignUpForm] = useState({ 
    email: '', 
    password: '', 
    confirmPassword: '',
    firstName: '',
    lastName: ''
  });
  const [authLoading, setAuthLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [activeTab, setActiveTab] = useState('signin');


  // Set initial tab based on URL
  useEffect(() => {
    const path = location.pathname;
    if (path.includes('register') || path.includes('signup')) {
      setActiveTab('signup');
    } else {
      setActiveTab('signin');
    }
  }, [location.pathname]);

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!signInForm.email || !signInForm.password) {
      toast({
        variant: "destructive",
        title: "Missing Information",
        description: "Please fill in all fields."
      });
      return;
    }

    setAuthLoading(true);
    
    try {
      const { error } = await signIn(signInForm.email, signInForm.password);
      
      if (error) {
        console.error('Sign in error:', error);
        
        let errorMessage = "Failed to sign in. Please try again.";
        
        if (error.message?.includes('Invalid login credentials')) {
          errorMessage = "Invalid email or password. Please check your credentials.";
        } else if (error.message?.includes('Email not confirmed')) {
          errorMessage = "Please check your email and click the confirmation link before signing in.";
        } else if (error.message?.includes('Too many requests')) {
          errorMessage = "Too many login attempts. Please wait a moment and try again.";
        }
        
        toast({
          variant: "destructive",
          title: "Sign In Failed",
          description: errorMessage
        });
      } else {
        toast({
          title: "Welcome back!",
          description: "You have been successfully signed in."
        });
      }
    } catch (error) {
      console.error('Unexpected sign in error:', error);
      toast({
        variant: "destructive",
        title: "Sign In Failed",
        description: "An unexpected error occurred. Please try again."
      });
    } finally {
      setAuthLoading(false);
    }
  };

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!signUpForm.email || !signUpForm.password || !signUpForm.confirmPassword) {
      toast({
        variant: "destructive",
        title: "Missing Information",
        description: "Please fill in all required fields."
      });
      return;
    }

    if (signUpForm.password !== signUpForm.confirmPassword) {
      toast({
        variant: "destructive",
        title: "Password Mismatch",
        description: "Passwords do not match."
      });
      return;
    }

    if (signUpForm.password.length < 6) {
      toast({
        variant: "destructive",
        title: "Weak Password",
        description: "Password must be at least 6 characters long."
      });
      return;
    }

    setAuthLoading(true);

    try {
      const userData = {
        first_name: signUpForm.firstName,
        last_name: signUpForm.lastName,
        full_name: `${signUpForm.firstName} ${signUpForm.lastName}`.trim()
      };

      const { error } = await signUp(signUpForm.email, signUpForm.password, userData);
      
      if (error) {
        console.error('Sign up error:', error);
        
        let errorMessage = "Failed to create account. Please try again.";
        
        if (error.message?.includes('User already registered')) {
          errorMessage = "An account with this email already exists. Please sign in instead.";
        } else if (error.message?.includes('Password should be')) {
          errorMessage = "Password does not meet security requirements.";
        } else if (error.message?.includes('Invalid email')) {
          errorMessage = "Please enter a valid email address.";
        }
        
        toast({
          variant: "destructive",
          title: "Registration Failed",
          description: errorMessage
        });
      } else {
        toast({
          title: "Account Created!",
          description: "Please check your email to verify your account before signing in."
        });
        
        // Switch to sign in tab after successful registration
        setActiveTab('signin');
        setSignInForm({ email: signUpForm.email, password: '' });
      }
    } catch (error) {
      console.error('Unexpected sign up error:', error);
      toast({
        variant: "destructive",
        title: "Registration Failed",
        description: "An unexpected error occurred. Please try again."
      });
    } finally {
      setAuthLoading(false);
    }
  };

  const handleBackToHome = () => {
    navigate('/', { replace: true });
  };

  return (
    <>
      <Helmet>
        <title>{activeTab === 'signup' ? 'Create Account' : 'Sign In'} | CamerPulse</title>
        <meta name="description" content="Join CamerPulse - Connect with your community and engage in meaningful civic dialogue." />
      </Helmet>
      
      <div className="min-h-screen bg-gradient-to-br from-background to-secondary/20 flex items-center justify-center p-4">
        <div className="w-full max-w-md space-y-6">
          {/* Header */}
          <div className="text-center space-y-2">
            <Button
              variant="ghost"
              onClick={handleBackToHome}
              className="mb-4 gap-2"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to Home
            </Button>
            
            <h1 className="text-3xl font-bold tracking-tight">CamerPulse</h1>
            <p className="text-muted-foreground">
              Connect with your community and engage in meaningful civic dialogue
            </p>
          </div>

          {/* Auth Card */}
          <Card className="border-border/50 shadow-lg">
            <CardHeader className="space-y-1 text-center">
              <CardTitle className="text-2xl">
                {activeTab === 'signup' ? 'Create Account' : 'Welcome Back'}
              </CardTitle>
              <CardDescription>
                {activeTab === 'signup' 
                  ? 'Join the civic conversation today' 
                  : 'Sign in to your account to continue'
                }
              </CardDescription>
            </CardHeader>
            
            <CardContent>
              <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="signin">Sign In</TabsTrigger>
                  <TabsTrigger value="signup">Sign Up</TabsTrigger>
                </TabsList>
                
                {/* Sign In Form */}
                <TabsContent value="signin" className="space-y-4">
                  <form onSubmit={handleSignIn} className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="signin-email">Email</Label>
                      <Input
                        id="signin-email"
                        type="email"
                        placeholder="your@email.com"
                        value={signInForm.email}
                        onChange={(e) => setSignInForm(prev => ({ ...prev, email: e.target.value }))}
                        disabled={authLoading}
                        required
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="signin-password">Password</Label>
                      <div className="relative">
                        <Input
                          id="signin-password"
                          type={showPassword ? "text" : "password"}
                          placeholder="Enter your password"
                          value={signInForm.password}
                          onChange={(e) => setSignInForm(prev => ({ ...prev, password: e.target.value }))}
                          disabled={authLoading}
                          required
                        />
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          className="absolute right-2 top-1/2 -translate-y-1/2 h-7 w-7"
                          onClick={() => setShowPassword(!showPassword)}
                          disabled={authLoading}
                        >
                          {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                        </Button>
                      </div>
                    </div>

                    <Button 
                      type="submit" 
                      className="w-full" 
                      disabled={authLoading || loading}
                    >
                      {authLoading ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Signing In...
                        </>
                      ) : (
                        'Sign In'
                      )}
                    </Button>
                  </form>
                </TabsContent>
                
                {/* Sign Up Form */}
                <TabsContent value="signup" className="space-y-4">
                  <form onSubmit={handleSignUp} className="space-y-4">
                    <div className="grid grid-cols-2 gap-2">
                      <div className="space-y-2">
                        <Label htmlFor="signup-firstname">First Name</Label>
                        <Input
                          id="signup-firstname"
                          type="text"
                          placeholder="John"
                          value={signUpForm.firstName}
                          onChange={(e) => setSignUpForm(prev => ({ ...prev, firstName: e.target.value }))}
                          disabled={authLoading}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="signup-lastname">Last Name</Label>
                        <Input
                          id="signup-lastname"
                          type="text"
                          placeholder="Doe"
                          value={signUpForm.lastName}
                          onChange={(e) => setSignUpForm(prev => ({ ...prev, lastName: e.target.value }))}
                          disabled={authLoading}
                        />
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="signup-email">Email *</Label>
                      <Input
                        id="signup-email"
                        type="email"
                        placeholder="your@email.com"
                        value={signUpForm.email}
                        onChange={(e) => setSignUpForm(prev => ({ ...prev, email: e.target.value }))}
                        disabled={authLoading}
                        required
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="signup-password">Password *</Label>
                      <div className="relative">
                        <Input
                          id="signup-password"
                          type={showPassword ? "text" : "password"}
                          placeholder="Create a secure password"
                          value={signUpForm.password}
                          onChange={(e) => setSignUpForm(prev => ({ ...prev, password: e.target.value }))}
                          disabled={authLoading}
                          required
                        />
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          className="absolute right-2 top-1/2 -translate-y-1/2 h-7 w-7"
                          onClick={() => setShowPassword(!showPassword)}
                          disabled={authLoading}
                        >
                          {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                        </Button>
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="signup-confirm">Confirm Password *</Label>
                      <Input
                        id="signup-confirm"
                        type="password"
                        placeholder="Confirm your password"
                        value={signUpForm.confirmPassword}
                        onChange={(e) => setSignUpForm(prev => ({ ...prev, confirmPassword: e.target.value }))}
                        disabled={authLoading}
                        required
                      />
                    </div>

                    <Button 
                      type="submit" 
                      className="w-full" 
                      disabled={authLoading || loading}
                    >
                      {authLoading ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Creating Account...
                        </>
                      ) : (
                        'Create Account'
                      )}
                    </Button>
                  </form>
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        </div>
      </div>
    </>
  );
};