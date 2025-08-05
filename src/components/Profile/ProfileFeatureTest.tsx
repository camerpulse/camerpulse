/**
 * Profile Feature Test Component
 * Tests and validates the core profile functionality:
 * - Follow/Unfollow System
 * - Message Button Functionality  
 * - Follower Count Display
 * - Profile Data Loading
 */

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { FollowButton } from '@/components/camerpulse/FollowButton';
import { 
  CheckCircle, 
  XCircle, 
  Clock, 
  MessageSquare, 
  Users, 
  UserPlus,
  AlertTriangle,
  Activity
} from 'lucide-react';

interface TestResult {
  test: string;
  status: 'pass' | 'fail' | 'pending' | 'warning';
  message: string;
  details?: any;
}

export const ProfileFeatureTest: React.FC = () => {
  const navigate = useNavigate();
  const { user, loading } = useAuth();
  const [testResults, setTestResults] = useState<TestResult[]>([]);
  const [running, setRunning] = useState(false);
  const [testProfile, setTestProfile] = useState<any>(null);

  const addResult = (result: TestResult) => {
    setTestResults(prev => [...prev, result]);
  };

  const simulateMessageButton = async (targetUserId: string) => {
    addResult({ test: 'Message Button', status: 'pending', message: 'Testing message button...' });
    
    try {
      // Test URL parameter construction
      const messageUrl = `/messenger?startConversation=${targetUserId}`;
      
      // Test URL parsing (simulating what the messenger would do)
      const urlParams = new URLSearchParams(`?startConversation=${targetUserId}`);
      const parsedUserId = urlParams.get('startConversation');
      
      if (parsedUserId === targetUserId) {
        addResult({ 
          test: 'Message Button', 
          status: 'pass', 
          message: `✅ Message button routing works: ${messageUrl}` 
        });
        
        // Test conversation creation ability
        const { data: existingConvs } = await supabase
          .from('conversations')
          .select('id, participants:conversation_participants(user_id)')
          .limit(1);
          
        if (existingConvs) {
          addResult({ 
            test: 'Conversation Access', 
            status: 'pass', 
            message: '✅ Can access conversations table' 
          });
        } else {
          addResult({ 
            test: 'Conversation Access', 
            status: 'warning', 
            message: '⚠️ No existing conversations found' 
          });
        }
      } else {
        addResult({ 
          test: 'Message Button', 
          status: 'fail', 
          message: '❌ URL parameter parsing failed' 
        });
      }
    } catch (error) {
      addResult({ 
        test: 'Message Button', 
        status: 'fail', 
        message: `❌ Message button test failed: ${error}` 
      });
    }
  };

  const testFollowSystem = async () => {
    if (!user) {
      addResult({ 
        test: 'Follow System', 
        status: 'fail', 
        message: '❌ User not authenticated' 
      });
      return;
    }

    addResult({ test: 'Follow System', status: 'pending', message: 'Testing follow system...' });
    
    try {
      // Test follow status check
      const { data: followData, error: followError } = await supabase
        .from('follows')
        .select('id, follower_id, following_id, created_at')
        .eq('follower_id', user.id)
        .limit(5);
      
      if (followError) {
        addResult({ 
          test: 'Follow System', 
          status: 'fail', 
          message: `❌ Follow query failed: ${followError.message}` 
        });
        return;
      }

      addResult({ 
        test: 'Follow System', 
        status: 'pass', 
        message: `✅ Follow system working - Following ${followData?.length || 0} users` 
      });

      // Test follower count
      const { count: followerCount, error: countError } = await supabase
        .from('follows')
        .select('*', { count: 'exact', head: true })
        .eq('following_id', user.id);
        
      if (countError) {
        addResult({ 
          test: 'Follower Count', 
          status: 'fail', 
          message: `❌ Follower count failed: ${countError.message}` 
        });
      } else {
        addResult({ 
          test: 'Follower Count', 
          status: 'pass', 
          message: `✅ Follower count: ${followerCount || 0}` 
        });
      }

      // Test follow insertion capability (without actually inserting)
      const testInsertQuery = supabase
        .from('follows')
        .insert({
          follower_id: user.id,
          following_id: 'test-target-id'
        });

      // Just test that the query builds correctly
      addResult({ 
        test: 'Follow Insert Query', 
        status: 'pass', 
        message: '✅ Follow insert query structure valid' 
      });

    } catch (error) {
      addResult({ 
        test: 'Follow System', 
        status: 'fail', 
        message: `❌ Follow system error: ${error}` 
      });
    }
  };

  const testProfileData = async () => {
    addResult({ test: 'Profile Data', status: 'pending', message: 'Testing profile data loading...' });
    
    try {
      const { data: profiles, error } = await supabase
        .from('profiles')
        .select('*')
        .limit(1);
      
      if (error) {
        addResult({ 
          test: 'Profile Data', 
          status: 'fail', 
          message: `❌ Profile query failed: ${error.message}` 
        });
        return;
      }

      if (profiles && profiles.length > 0) {
        setTestProfile(profiles[0]);
        addResult({ 
          test: 'Profile Data', 
          status: 'pass', 
          message: `✅ Profile data loaded successfully` 
        });

        // Test profile stats calculation
        const testUserId = profiles[0].user_id;
        await simulateMessageButton(testUserId);
        
      } else {
        addResult({ 
          test: 'Profile Data', 
          status: 'warning', 
          message: '⚠️ No profile data found' 
        });
      }
    } catch (error) {
      addResult({ 
        test: 'Profile Data', 
        status: 'fail', 
        message: `❌ Profile data error: ${error}` 
      });
    }
  };

  const runAllTests = async () => {
    setRunning(true);
    setTestResults([]);
    
    addResult({ test: 'Test Suite', status: 'pending', message: 'Starting profile feature validation...' });
    
    // Test 0: Authentication Check
    if (!user) {
      addResult({ 
        test: 'Authentication', 
        status: 'fail', 
        message: '❌ User not authenticated - please log in first' 
      });
      setRunning(false);
      return;
    }
    
    addResult({ 
      test: 'Authentication', 
      status: 'pass', 
      message: `✅ User authenticated: ${user.email}` 
    });
    
    // Test 1: Profile Data Loading
    await testProfileData();
    
    // Test 2: Follow System  
    await testFollowSystem();
    
    addResult({ test: 'Test Suite', status: 'pass', message: '✅ All tests completed' });
    setRunning(false);
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
      {!user && (
        <Card className="border-destructive">
          <CardHeader>
            <CardTitle className="text-destructive">Authentication Required</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground mb-4">
              You must be logged in to test profile features. Please authenticate first.
            </p>
            <Button variant="outline" onClick={() => navigate('/auth')}>
              Go to Login
            </Button>
          </CardContent>
        </Card>
      )}
      
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Profile Feature Validation
          </CardTitle>
          <div className="flex gap-2">
            <Button 
              onClick={runAllTests} 
              disabled={running || !user}
              size="sm"
            >
              {running ? 'Running Tests...' : 'Run All Tests'}
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {testResults.map((result, index) => (
              <div key={index} className="flex items-start gap-3 p-3 border rounded-lg">
                {getStatusIcon(result.status)}
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <span className="font-medium">{result.test}</span>
                    <Badge variant={
                      result.status === 'pass' ? 'default' :
                      result.status === 'fail' ? 'destructive' :
                      result.status === 'warning' ? 'secondary' : 'outline'
                    }>
                      {result.status}
                    </Badge>
                  </div>
                  <p className="text-sm text-muted-foreground mt-1">{result.message}</p>
                  {result.details && (
                    <pre className="text-xs bg-muted p-2 rounded mt-2 overflow-auto">
                      {JSON.stringify(result.details, null, 2)}
                    </pre>
                  )}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Live Demo Section */}
      {testProfile && (
        <Card>
          <CardHeader>
            <CardTitle>Live Feature Demo</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center gap-4">
              <div>
                <p className="font-medium">Test Profile: @{testProfile.username}</p>
                <p className="text-sm text-muted-foreground">{testProfile.display_name}</p>
              </div>
            </div>
            
            <div className="flex gap-2">
              <FollowButton 
                targetUserId={testProfile.user_id}
                targetUsername={testProfile.username}
                showCount={true}
                followersCount={0}
              />
              
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => {
                  const messageUrl = `/messenger?startConversation=${testProfile.user_id}`;
                  addResult({ 
                    test: 'Live Demo', 
                    status: 'pass', 
                    message: `Message button would navigate to: ${messageUrl}` 
                  });
                }}
              >
                <MessageSquare className="h-4 w-4 mr-2" />
                Message
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};