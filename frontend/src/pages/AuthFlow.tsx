import React, { useState, useEffect } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Checkbox } from '@/components/ui/checkbox';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';
import { 
  Eye, 
  EyeOff, 
  Star, 
  Shield, 
  Users, 
  Globe, 
  MessageCircle,
  ArrowRight,
  Loader2,
  Vote
} from 'lucide-react';

const AuthFlow = () => {
  const navigate = useNavigate();
  const { user, signIn, signUp, loading } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
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
  useEffect(() => {
    if (user && !loading) {
      navigate('/');
    }
  }, [user, loading, navigate]);

  const validateSignup = () => {
    if (!signupData.email || !signupData.password || !signupData.username) {
      setError('Please fill in all required fields');
      return false;
    }

    if (signupData.password !== signupData.confirmPassword) {
      setError('Passwords do not match');
      return false;
    }

    if (signupData.password.length < 6) {
      setError('Password must be at least 6 characters');
      return false;
    }

    if (signupData.username.length < 3) {
      setError('Username must be at least 3 characters');
      return false;
    }

    return true;
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      const { error } = await signIn(loginData.email, loginData.password);

      if (error) {
        if (error.message.includes('Invalid login credentials')) {
          setError('Invalid email or password. Please check your credentials.');
        } else if (error.message.includes('Email not confirmed')) {
          setError('Please check your email and click the confirmation link before signing in.');
        } else {
          setError(error.message);
        }
      } else {
        toast.success('Welcome back!');
        navigate('/');
      }
    } catch (err) {
      console.error('Login error:', err);
      setError('An unexpected error occurred. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!validateSignup()) return;

    setIsLoading(true);

    try {
      const { error } = await signUp(
        signupData.email,
        signupData.password,
        {
          username: signupData.username,
          display_name: signupData.displayName || signupData.username,
          is_diaspora: signupData.isDiaspora,
          location: signupData.location
        }
      );

      if (error) {
        if (error.message.includes('already registered')) {
          setError('An account with this email already exists. Please sign in instead.');
        } else if (error.message.includes('username')) {
          setError('This username is already taken. Please choose another one.');
        } else {
          setError(error.message);
        }
      } else {
        toast.success('Account created! Please check your email to verify your account.');
      }
    } catch (err) {
      console.error('Signup error:', err);
      setError('An unexpected error occurred. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary/5 via-background to-secondary/5">
        <Loader2 className="w-8 h-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-secondary/5 flex items-center justify-center p-2 sm:p-4">
      <div className="w-full max-w-6xl grid lg:grid-cols-2 gap-4 lg:gap-8 items-center">
        
        {/* Branding & Features - Hidden on mobile */}
        <div className="hidden lg:block space-y-6">
          <div className="space-y-2">
            <div className="flex items-center gap-2 mb-4">
              <Star className="h-8 w-8 text-primary" />
              <h1 className="text-3xl font-bold">CamerPulse</h1>
            </div>
            <h2 className="text-xl font-semibold text-muted-foreground">
              Le pouls du Cameroun 🇨🇲
            </h2>
            <p className="text-lg">
              Your voice. Your power. Your marketplace.
            </p>
          </div>

          {/* Feature highlights */}
          <div className="grid grid-cols-2 gap-4">
            <div className="flex items-center gap-3 p-4 bg-card rounded-lg border">
              <MessageCircle className="w-8 h-8 text-primary" />
              <div>
                <h3 className="font-semibold">Pulse Feed</h3>
                <p className="text-sm text-muted-foreground">Stay connected</p>
              </div>
            </div>
            
            <div className="flex items-center gap-3 p-4 bg-card rounded-lg border">
              <Shield className="w-8 h-8 text-primary" />
              <div>
                <h3 className="font-semibold">Marketplace</h3>
                <p className="text-sm text-muted-foreground">Trade safely</p>
              </div>
            </div>
            
            <div className="flex items-center gap-3 p-4 bg-card rounded-lg border">
              <Users className="w-8 h-8 text-primary" />
              <div>
                <h3 className="font-semibold">Community</h3>
                <p className="text-sm text-muted-foreground">Build networks</p>
              </div>
            </div>
            
            <div className="flex items-center gap-3 p-4 bg-card rounded-lg border">
              <Globe className="w-8 h-8 text-primary" />
              <div>
                <h3 className="font-semibold">Civic Pulse</h3>
                <p className="text-sm text-muted-foreground">Make impact</p>
              </div>
            </div>
          </div>

          <div className="p-4 bg-primary/10 rounded-lg border border-primary/20">
            <p className="text-sm text-primary font-medium">
              🌍 Join the Pan-African community connecting Cameroonians worldwide
            </p>
          </div>
        </div>

        {/* Auth Form - Mobile Optimized */}
        <div className="w-full max-w-md mx-auto lg:max-w-none">
          {/* Mobile Header */}
          <div className="lg:hidden text-center mb-6 px-4">
            <div className="flex items-center justify-center gap-2 mb-3">
              <Star className="h-6 w-6 text-primary" />
              <h1 className="text-2xl font-bold">CamerPulse</h1>
            </div>
            <p className="text-sm text-muted-foreground">
              Le pouls du Cameroun 🇨🇲
            </p>
          </div>

          <Card className="w-full border-0 shadow-xl lg:border lg:shadow-lg">
            <CardHeader className="text-center px-4 lg:px-6 pt-6 pb-4 lg:pt-6 lg:pb-6">
              <CardTitle className="text-xl lg:text-2xl">Join CamerPulse</CardTitle>
              <CardDescription className="text-sm lg:text-base">
                Connect with your community and make your voice heard
              </CardDescription>
            </CardHeader>
            
            <CardContent className="px-4 lg:px-6 pb-6">
              <Tabs defaultValue="signin" className="w-full">
                <TabsList className="grid w-full grid-cols-2 mb-4 lg:mb-6 h-10 lg:h-11">
                  <TabsTrigger value="signin" className="text-sm lg:text-base">Sign In</TabsTrigger>
                  <TabsTrigger value="signup" className="text-sm lg:text-base">Sign Up</TabsTrigger>
                </TabsList>

                {error && (
                  <Alert className="mb-4 border-destructive/50">
                    <AlertDescription className="text-destructive text-sm">
                      {error}
                    </AlertDescription>
                  </Alert>
                )}

                <TabsContent value="signin">
                  <form onSubmit={handleLogin} className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="signin-email" className="text-sm font-medium">Email</Label>
                      <Input
                        id="signin-email"
                        type="email"
                        placeholder="your@email.com"
                        value={loginData.email}
                        onChange={(e) => {
                          setLoginData({...loginData, email: e.target.value});
                          setError(null);
                        }}
                        className="h-11 lg:h-10"
                        required
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="signin-password" className="text-sm font-medium">Password</Label>
                      <div className="relative">
                        <Input
                          id="signin-password"
                          type={showPassword ? 'text' : 'password'}
                          value={loginData.password}
                          onChange={(e) => {
                            setLoginData({...loginData, password: e.target.value});
                            setError(null);
                          }}
                          className="h-11 lg:h-10 pr-10"
                          required
                        />
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          className="absolute right-0 top-0 h-full px-3 hover:bg-transparent"
                          onClick={() => setShowPassword(!showPassword)}
                        >
                          {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                        </Button>
                      </div>
                    </div>

                    <Button
                      type="submit"
                      className="w-full h-11 lg:h-10 text-base lg:text-sm"
                      disabled={isLoading}
                    >
                      {isLoading ? (
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      ) : (
                        <ArrowRight className="w-4 h-4 mr-2" />
                      )}
                      {isLoading ? 'Signing In...' : 'Sign In'}
                    </Button>
                  </form>
                </TabsContent>

                <TabsContent value="signup">
                  <form onSubmit={handleSignup} className="space-y-4">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="signup-username" className="text-sm font-medium">Username *</Label>
                        <Input
                          id="signup-username"
                          placeholder="@username"
                          value={signupData.username}
                          onChange={(e) => {
                            setSignupData({...signupData, username: e.target.value});
                            setError(null);
                          }}
                          className="h-11 lg:h-10"
                          required
                        />
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="signup-displayName" className="text-sm font-medium">Display Name</Label>
                        <Input
                          id="signup-displayName"
                          placeholder="Your name"
                          value={signupData.displayName}
                          onChange={(e) => setSignupData({...signupData, displayName: e.target.value})}
                          className="h-11 lg:h-10"
                        />
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="signup-email" className="text-sm font-medium">Email *</Label>
                      <Input
                        id="signup-email"
                        type="email"
                        placeholder="your@email.com"
                        value={signupData.email}
                        onChange={(e) => {
                          setSignupData({...signupData, email: e.target.value});
                          setError(null);
                        }}
                        className="h-11 lg:h-10"
                        required
                      />
                    </div>
                    
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="signup-password" className="text-sm font-medium">Password *</Label>
                        <Input
                          id="signup-password"
                          type="password"
                          placeholder="Min. 6 characters"
                          value={signupData.password}
                          onChange={(e) => {
                            setSignupData({...signupData, password: e.target.value});
                            setError(null);
                          }}
                          className="h-11 lg:h-10"
                          required
                        />
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="signup-confirm" className="text-sm font-medium">Confirm *</Label>
                        <Input
                          id="signup-confirm"
                          type="password"
                          placeholder="Repeat password"
                          value={signupData.confirmPassword}
                          onChange={(e) => {
                            setSignupData({...signupData, confirmPassword: e.target.value});
                            setError(null);
                          }}
                          className="h-11 lg:h-10"
                          required
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="signup-location" className="text-sm font-medium">Location (optional)</Label>
                      <Input
                        id="signup-location"
                        placeholder="Yaoundé, Douala, Paris..."
                        value={signupData.location}
                        onChange={(e) => setSignupData({...signupData, location: e.target.value})}
                        className="h-11 lg:h-10"
                      />
                    </div>

                    <div className="flex items-start space-x-3 py-2">
                      <Checkbox
                        id="diaspora"
                        checked={signupData.isDiaspora}
                        onCheckedChange={(checked) => 
                          setSignupData({...signupData, isDiaspora: checked as boolean})
                        }
                        className="mt-0.5"
                      />
                      <Label htmlFor="diaspora" className="text-sm leading-5 cursor-pointer">
                        I am a member of the Cameroonian diaspora 🌍
                      </Label>
                    </div>

                    <Button
                      type="submit"
                      className="w-full h-11 lg:h-10 text-base lg:text-sm"
                      disabled={isLoading}
                    >
                      {isLoading ? (
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      ) : (
                        <ArrowRight className="w-4 h-4 mr-2" />
                      )}
                      {isLoading ? 'Creating Account...' : 'Create Account'}
                    </Button>
                  </form>
                </TabsContent>
              </Tabs>

              <div className="mt-6 text-center text-xs text-muted-foreground">
                By continuing, you agree to our{' '}
                <a href="#" className="text-primary hover:underline">Terms of Service</a>{' '}
                and{' '}
                <a href="#" className="text-primary hover:underline">Privacy Policy</a>
              </div>

              {/* Mobile Feature Preview */}
              <div className="lg:hidden mt-6 pt-6 border-t border-border/50">
                <div className="grid grid-cols-2 gap-3">
                  <div className="flex items-center gap-2 p-3 bg-primary/5 rounded-lg">
                    <Vote className="w-5 h-5 text-primary" />
                    <span className="text-sm font-medium">Civic Polls</span>
                  </div>
                  <div className="flex items-center gap-2 p-3 bg-primary/5 rounded-lg">
                    <Users className="w-5 h-5 text-primary" />
                    <span className="text-sm font-medium">Community</span>
                  </div>
                </div>
                <p className="text-xs text-center text-muted-foreground mt-3">
                  🇨🇲 Join thousands of Cameroonians worldwide
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default AuthFlow;