import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useToast } from '@/hooks/use-toast';
import { Eye, EyeOff, Users, Shield, Globe, AlertTriangle } from 'lucide-react';
import { validatePasswordStrength } from '@/utils/authSecurity';
import { advancedSanitizeInput } from '@/utils/security';

export const AuthPage: React.FC = () => {
  const navigate = useNavigate();
  const { user, signUp, signIn, loading } = useAuth();
  const { toast } = useToast();
  
  const [activeTab, setActiveTab] = useState<'signin' | 'signup'>('signin');
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    username: '',
    displayName: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [passwordStrength, setPasswordStrength] = useState<{isValid: boolean; errors: string[]}>({isValid: false, errors: []});

  // Redirect if already logged in
  useEffect(() => {
    if (user && !loading) {
      navigate('/');
    }
  }, [user, loading, navigate]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    
    // Sanitize input to prevent XSS
    const sanitizedValue = advancedSanitizeInput(value);
    setFormData(prev => ({ ...prev, [name]: sanitizedValue }));
    setError(null);
    
    // Validate password strength in real-time for signup
    if (name === 'password' && activeTab === 'signup') {
      const strength = validatePasswordStrength(value);
      setPasswordStrength(strength);
    }
  };

  const validateForm = () => {
    if (!formData.email || !formData.password) {
      setError('Email and password are required');
      return false;
    }

    // Enhanced email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      setError('Please enter a valid email address');
      return false;
    }

    if (activeTab === 'signup') {
      if (formData.password !== formData.confirmPassword) {
        setError('Passwords do not match');
        return false;
      }
      
      // Use enhanced password validation
      const passwordValidation = validatePasswordStrength(formData.password);
      if (!passwordValidation.isValid) {
        setError(`Password requirements not met: ${passwordValidation.errors.join(', ')}`);
        return false;
      }
      
      if (!formData.username || formData.username.length < 3) {
        setError('Username must be at least 3 characters');
        return false;
      }
      
      // Validate username format (alphanumeric and underscores only)
      const usernameRegex = /^[a-zA-Z0-9_]+$/;
      if (!usernameRegex.test(formData.username)) {
        setError('Username can only contain letters, numbers, and underscores');
        return false;
      }
    }

    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    setIsSubmitting(true);
    setError(null);

    try {
      if (activeTab === 'signup') {
        const { error } = await signUp(formData.email, formData.password, {
          username: formData.username,
          display_name: formData.displayName || formData.username
        });

        if (error) {
          if (error.message.includes('already registered')) {
            setError('An account with this email already exists. Please sign in instead.');
          } else {
            setError(error.message);
          }
        } else {
          toast({
            title: "Account created successfully!",
            description: "Please check your email to verify your account.",
          });
        }
      } else {
        const { error } = await signIn(formData.email, formData.password);

        if (error) {
          // Dispatch security event for failed login
          const event = new CustomEvent('auth-error', { detail: { error: error.message } });
          window.dispatchEvent(event);
          
          if (error.message.includes('Invalid login credentials')) {
            setError('Invalid email or password. Please try again.');
          } else {
            setError(error.message);
          }
        } else {
          toast({
            title: "Welcome back!",
            description: "You have been signed in successfully.",
          });
          navigate('/');
        }
      }
    } catch (err) {
      console.error('Auth error:', err);
      setError('An unexpected error occurred. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary/5 via-background to-secondary/5">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary/5 via-background to-secondary/5 p-4">
      <div className="w-full max-w-md space-y-6">
        {/* Header */}
        <div className="text-center space-y-2">
          <div className="flex items-center justify-center space-x-2 mb-4">
            <Globe className="w-8 h-8 text-primary" />
            <h1 className="text-2xl font-bold text-primary">CamerPulse</h1>
          </div>
          <h2 className="text-xl font-semibold">Join the Pan-African Community</h2>
          <p className="text-muted-foreground text-sm">
            Connect, engage, and make your voice heard across Africa
          </p>
        </div>

        {/* Features Preview */}
        <div className="grid grid-cols-3 gap-4 mb-6">
          <div className="text-center space-y-2">
            <Users className="w-6 h-6 mx-auto text-primary" />
            <p className="text-xs text-muted-foreground">Connect</p>
          </div>
          <div className="text-center space-y-2">
            <Shield className="w-6 h-6 mx-auto text-primary" />
            <p className="text-xs text-muted-foreground">Verified</p>
          </div>
          <div className="text-center space-y-2">
            <Globe className="w-6 h-6 mx-auto text-primary" />
            <p className="text-xs text-muted-foreground">Global</p>
          </div>
        </div>

        {/* Auth Form */}
        <Card className="border-0 shadow-lg">
          <CardContent className="p-6">
            <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as 'signin' | 'signup')}>
              <TabsList className="grid w-full grid-cols-2 mb-6">
                <TabsTrigger value="signin">Sign In</TabsTrigger>
                <TabsTrigger value="signup">Sign Up</TabsTrigger>
              </TabsList>

              {error && (
                <Alert className="mb-4 border-destructive/50">
                  <AlertDescription className="text-destructive">{error}</AlertDescription>
                </Alert>
              )}

              <form onSubmit={handleSubmit} className="space-y-4">
                <TabsContent value="signin" className="space-y-4 mt-0">
                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      name="email"
                      type="email"
                      placeholder="Enter your email"
                      value={formData.email}
                      onChange={handleInputChange}
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="password">Password</Label>
                    <div className="relative">
                      <Input
                        id="password"
                        name="password"
                        type={showPassword ? 'text' : 'password'}
                        placeholder="Enter your password"
                        value={formData.password}
                        onChange={handleInputChange}
                        required
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                        onClick={() => setShowPassword(!showPassword)}
                      >
                        {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </Button>
                    </div>
                  </div>

                  <Button 
                    type="submit" 
                    className="w-full" 
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? 'Signing In...' : 'Sign In'}
                  </Button>
                </TabsContent>

                <TabsContent value="signup" className="space-y-4 mt-0">
                  <div className="space-y-2">
                    <Label htmlFor="signup-email">Email</Label>
                    <Input
                      id="signup-email"
                      name="email"
                      type="email"
                      placeholder="Enter your email"
                      value={formData.email}
                      onChange={handleInputChange}
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="username">Username</Label>
                    <Input
                      id="username"
                      name="username"
                      type="text"
                      placeholder="Choose a username"
                      value={formData.username}
                      onChange={handleInputChange}
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="displayName">Display Name (Optional)</Label>
                    <Input
                      id="displayName"
                      name="displayName"
                      type="text"
                      placeholder="Your display name"
                      value={formData.displayName}
                      onChange={handleInputChange}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="signup-password">Password</Label>
                    <div className="relative">
                      <Input
                        id="signup-password"
                        name="password"
                        type={showPassword ? 'text' : 'password'}
                        placeholder="Create a password"
                        value={formData.password}
                        onChange={handleInputChange}
                        required
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                        onClick={() => setShowPassword(!showPassword)}
                      >
                        {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </Button>
                    </div>
                    
                    {/* Password Strength Indicator */}
                    {activeTab === 'signup' && formData.password && (
                      <div className="mt-2">
                        <div className="flex items-center space-x-2 text-xs">
                          {passwordStrength.isValid ? (
                            <Shield className="w-3 h-3 text-green-500" />
                          ) : (
                            <AlertTriangle className="w-3 h-3 text-yellow-500" />
                          )}
                          <span className={passwordStrength.isValid ? 'text-green-600' : 'text-yellow-600'}>
                            {passwordStrength.isValid ? 'Strong password' : 'Password requirements'}
                          </span>
                        </div>
                        {!passwordStrength.isValid && passwordStrength.errors.length > 0 && (
                          <ul className="mt-1 text-xs text-muted-foreground space-y-1">
                            {passwordStrength.errors.map((error, index) => (
                              <li key={index} className="flex items-center space-x-1">
                                <span className="w-1 h-1 bg-muted-foreground rounded-full"></span>
                                <span>{error}</span>
                              </li>
                            ))}
                          </ul>
                        )}
                      </div>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="confirmPassword">Confirm Password</Label>
                    <Input
                      id="confirmPassword"
                      name="confirmPassword"
                      type="password"
                      placeholder="Confirm your password"
                      value={formData.confirmPassword}
                      onChange={handleInputChange}
                      required
                    />
                  </div>

                  <Button 
                    type="submit" 
                    className="w-full" 
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? 'Creating Account...' : 'Create Account'}
                  </Button>
                </TabsContent>
              </form>
            </Tabs>
          </CardContent>
        </Card>

        {/* Footer */}
        <div className="text-center text-sm text-muted-foreground">
          <p>
            By continuing, you agree to our{' '}
            <Link to="/terms" className="text-primary hover:underline">Terms of Service</Link>{' '}
            and{' '}
            <Link to="/privacy" className="text-primary hover:underline">Privacy Policy</Link>
          </p>
        </div>
      </div>
    </div>
  );
};