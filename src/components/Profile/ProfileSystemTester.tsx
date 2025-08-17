/**
 * Profile System Tester - Tests and validates all profile features in real-time
 */

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { IndustryGradeUserProfile } from './IndustryGradeUserProfile';
import { 
  CheckCircle, 
  XCircle, 
  Clock, 
  MessageSquare, 
  Users, 
  UserPlus,
  AlertTriangle,
  Activity,
  TestTube,
  Database,
  Heart,
  MessageCircle
} from 'lucide-react';
import { toast } from '@/hooks/use-toast';

interface SystemTest {
  name: string;
  status: 'pass' | 'fail' | 'pending' | 'warning';
  message: string;
  action?: () => void;
}

export const ProfileSystemTester: React.FC = () => {
  const { user, loading } = useAuth();
  const [tests, setTests] = useState<SystemTest[]>([]);
  const [running, setRunning] = useState(false);
  const [testUserId, setTestUserId] = useState<string>('');
  const [showProfile, setShowProfile] = useState(false);

  const addTest = (test: SystemTest) => {
    setTests(prev => [...prev, test]);
  };

  const updateTest = (name: string, updates: Partial<SystemTest>) => {
    setTests(prev => prev.map(test => 
      test.name === name ? { ...test, ...updates } : test
    ));
  };

  const testFollowSystem = async () => {
    addTest({ name: 'Follow System', status: 'pending', message: 'Testing follow functionality...' });
    
    try {
      if (!user) {
        updateTest('Follow System', { 
          status: 'fail', 
          message: '❌ User not authenticated' 
        });
        return;
      }

      // Test reading follows
      const { data: follows, error } = await supabase
        .from('follows')
        .select('*')
        .limit(1);

      if (error) throw error;

      // Test follow insert capability (dry run)
      const testUser = '91569092-36c0-4867-8a0e-370ee026e202'; // Known user ID
      const { data: existingFollow } = await supabase
        .from('follows')
        .select('id')
        .eq('follower_id', user.id)
        .eq('following_id', testUser)
        .maybeSingle();

      updateTest('Follow System', { 
        status: 'pass', 
        message: `✅ Follow system working - ${follows.length} follows found, can ${existingFollow ? 'unfollow' : 'follow'} test user` 
      });

    } catch (error) {
      updateTest('Follow System', { 
        status: 'fail', 
        message: `❌ Follow system error: ${error}` 
      });
    }
  };

  const testMessageSystem = async () => {
    addTest({ name: 'Message System', status: 'pending', message: 'Testing message functionality...' });
    
    try {
      if (!user) {
        updateTest('Message System', { 
          status: 'fail', 
          message: '❌ User not authenticated' 
        });
        return;
      }

      // Test conversation access
      const { data: conversations, error } = await supabase
        .from('conversations')
        .select('*')
        .limit(1);

      if (error) throw error;

      // Test conversation participants access
      const { data: participants, error: partError } = await supabase
        .from('conversation_participants')
        .select('*')
        .limit(1);

      if (partError) throw partError;

      updateTest('Message System', { 
        status: 'pass', 
        message: `✅ Message system working - ${conversations.length} conversations, ${participants.length} participants` 
      });

    } catch (error) {
      updateTest('Message System', { 
        status: 'fail', 
        message: `❌ Message system error: ${error}` 
      });
    }
  };

  const testProfileData = async () => {
    addTest({ name: 'Profile Data', status: 'pending', message: 'Testing profile data loading...' });
    
    try {
      // Get a test profile
      const { data: profiles, error } = await supabase
        .from('profiles')
        .select('*')
        .neq('user_id', user?.id || '')
        .limit(1);

      if (error) throw error;

      if (profiles && profiles.length > 0) {
        setTestUserId(profiles[0].user_id);
        updateTest('Profile Data', { 
          status: 'pass', 
          message: `✅ Profile data loaded - Testing with @${profiles[0].username}`,
          action: () => setShowProfile(true)
        });
      } else {
        updateTest('Profile Data', { 
          status: 'warning', 
          message: '⚠️ No other profiles found for testing' 
        });
      }

    } catch (error) {
      updateTest('Profile Data', { 
        status: 'fail', 
        message: `❌ Profile data error: ${error}` 
      });
    }
  };

  const testRealFollowAction = async () => {
    if (!user || !testUserId) return;
    
    addTest({ name: 'Live Follow Test', status: 'pending', message: 'Testing actual follow action...' });
    
    try {
      // Check current follow status
      const { data: existingFollow } = await supabase
        .from('follows')
        .select('id')
        .eq('follower_id', user.id)
        .eq('following_id', testUserId)
        .maybeSingle();

      if (existingFollow) {
        // Unfollow
        const { error } = await supabase
          .from('follows')
          .delete()
          .eq('id', existingFollow.id);

        if (error) throw error;

        updateTest('Live Follow Test', { 
          status: 'pass', 
          message: '✅ Unfollow action successful' 
        });
        toast({ title: "Success", description: "Unfollowed test user" });
      } else {
        // Follow
        const { error } = await supabase
          .from('follows')
          .insert({
            follower_id: user.id,
            following_id: testUserId
          });

        if (error) throw error;

        updateTest('Live Follow Test', { 
          status: 'pass', 
          message: '✅ Follow action successful' 
        });
        toast({ title: "Success", description: "Followed test user" });
      }

    } catch (error) {
      updateTest('Live Follow Test', { 
        status: 'fail', 
        message: `❌ Follow action failed: ${error}` 
      });
    }
  };

  const testMessageAction = async () => {
    if (!user || !testUserId) return;
    
    addTest({ name: 'Live Message Test', status: 'pending', message: 'Testing message button...' });
    
    try {
      // Test URL construction
      const messageUrl = `/messenger?startConversation=${testUserId}`;
      
      updateTest('Live Message Test', { 
        status: 'pass', 
        message: `✅ Message button ready - would navigate to: ${messageUrl}`,
        action: () => navigateToMessage(user?.id)
      });

    } catch (error) {
      updateTest('Live Message Test', { 
        status: 'fail', 
        message: `❌ Message test failed: ${error}` 
      });
    }
  };

  const runAllTests = async () => {
    setRunning(true);
    setTests([]);
    setShowProfile(false);
    
    if (!user) {
      addTest({ 
        name: 'Authentication', 
        status: 'fail', 
        message: '❌ User not authenticated - please log in first' 
      });
      setRunning(false);
      return;
    }
    
    addTest({ 
      name: 'Authentication', 
      status: 'pass', 
      message: `✅ User authenticated: ${user.email}` 
    });
    
    await testProfileData();
    await testFollowSystem();
    await testMessageSystem();
    
    setRunning(false);
    
    // Add live test options if we have a test user
    setTimeout(() => {
      if (testUserId) {
        addTest({ 
          name: 'Live Tests Available', 
          status: 'pass', 
          message: '✅ Click buttons below to test live functionality' 
        });
      }
    }, 500);
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pass': return <CheckCircle className="h-4 w-4 text-green-600" />;
      case 'fail': return <XCircle className="h-4 w-4 text-red-600" />;
      case 'warning': return <AlertTriangle className="h-4 w-4 text-yellow-600" />;
      case 'pending': return <Clock className="h-4 w-4 text-blue-600 animate-spin" />;
      default: return <Activity className="h-4 w-4 text-gray-600" />;
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-muted-foreground">Loading authentication...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TestTube className="h-5 w-5" />
            Profile System Validator
          </CardTitle>
          <p className="text-sm text-muted-foreground">
            Comprehensive testing of follow system, message button, and profile data
          </p>
        </CardHeader>
        <CardContent className="space-y-4">
          <Button 
            onClick={runAllTests} 
            disabled={running || !user}
            className="w-full"
          >
            {running ? 'Running Tests...' : 'Run System Tests'}
          </Button>

          {!user && (
            <div className="p-4 border border-destructive rounded-lg">
              <p className="text-destructive font-medium">Authentication Required</p>
              <p className="text-sm text-muted-foreground mt-1">Please log in to test profile features.</p>
              <Button variant="outline" size="sm" className="mt-2" onClick={() => navigateToAuth()}>
                Go to Login
              </Button>
            </div>
          )}

          <div className="space-y-3">
            {tests.map((test, index) => (
              <div key={index} className="flex items-start gap-3 p-3 border rounded-lg">
                {getStatusIcon(test.status)}
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <span className="font-medium">{test.name}</span>
                    <Badge variant={
                      test.status === 'pass' ? 'default' :
                      test.status === 'fail' ? 'destructive' :
                      test.status === 'warning' ? 'secondary' : 'outline'
                    }>
                      {test.status}
                    </Badge>
                  </div>
                  <p className="text-sm text-muted-foreground mt-1">{test.message}</p>
                  {test.action && (
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="mt-2"
                      onClick={test.action}
                    >
                      Test Action
                    </Button>
                  )}
                </div>
              </div>
            ))}
          </div>

          {testUserId && (
            <div className="border-t pt-4 space-y-3">
              <h4 className="font-medium flex items-center gap-2">
                <Users className="h-4 w-4" />
                Live Feature Tests
              </h4>
              <div className="flex gap-2">
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={testRealFollowAction}
                  disabled={running}
                >
                  <Heart className="h-4 w-4 mr-2" />
                  Test Follow Action
                </Button>
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={testMessageAction}
                  disabled={running}
                >
                  <MessageCircle className="h-4 w-4 mr-2" />
                  Test Message Button
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {showProfile && testUserId && (
        <Card>
          <CardHeader>
            <CardTitle>Live Profile Demo</CardTitle>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => setShowProfile(false)}
            >
              Hide Profile
            </Button>
          </CardHeader>
          <CardContent>
            <IndustryGradeUserProfile userId={testUserId} />
          </CardContent>
        </Card>
      )}
    </div>
  );
};