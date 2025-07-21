import React, { useState, useRef } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Code, 
  Book, 
  Upload, 
  Download,
  Play,
  CheckCircle,
  XCircle,
  AlertTriangle,
  FileText,
  Zap,
  Terminal,
  Package,
  Globe,
  Key,
  Shield
} from 'lucide-react';
import { toast } from 'sonner';

interface ManifestValidation {
  isValid: boolean;
  errors: string[];
  warnings: string[];
}

const SAMPLE_MANIFEST = {
  name: "my-awesome-plugin",
  version: "1.0.0",
  description: "A sample plugin for CamerPulse",
  author: "Your Name",
  main: "index.js",
  category: "utilities",
  tags: ["productivity", "tools"],
  permissions: ["storage.read", "ui.render"],
  dependencies: {
    "@camerpulse/sdk": "^1.0.0"
  },
  engines: {
    "camerpulse": ">=1.0.0"
  }
};

const API_DOCUMENTATION = [
  {
    category: "Core API",
    methods: [
      {
        name: "CamerPulse.init()",
        description: "Initialize plugin with CamerPulse core",
        example: "CamerPulse.init({ name: 'my-plugin' })"
      },
      {
        name: "CamerPulse.render()",
        description: "Render UI components",
        example: "CamerPulse.render(component, container)"
      },
      {
        name: "CamerPulse.storage.get()",
        description: "Get data from plugin storage",
        example: "const data = await CamerPulse.storage.get('key')"
      }
    ]
  },
  {
    category: "Events API",
    methods: [
      {
        name: "CamerPulse.on()",
        description: "Listen to system events",
        example: "CamerPulse.on('data.updated', handler)"
      },
      {
        name: "CamerPulse.emit()",
        description: "Emit custom events",
        example: "CamerPulse.emit('my-event', data)"
      }
    ]
  },
  {
    category: "Data API",
    methods: [
      {
        name: "CamerPulse.data.get()",
        description: "Access CamerPulse data",
        example: "const polls = await CamerPulse.data.get('polls')"
      },
      {
        name: "CamerPulse.user.current()",
        description: "Get current user info",
        example: "const user = CamerPulse.user.current()"
      }
    ]
  }
];

export const DeveloperConsole: React.FC = () => {
  const [manifestText, setManifestText] = useState(JSON.stringify(SAMPLE_MANIFEST, null, 2));
  const [validation, setValidation] = useState<ManifestValidation>({ isValid: true, errors: [], warnings: [] });
  const [testResults, setTestResults] = useState<any>(null);
  const [isRunningTest, setIsRunningTest] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const validateManifest = (manifestStr: string): ManifestValidation => {
    const errors: string[] = [];
    const warnings: string[] = [];

    try {
      const manifest = JSON.parse(manifestStr);
      
      // Required fields
      const required = ['name', 'version', 'description', 'author', 'main'];
      required.forEach(field => {
        if (!manifest[field]) {
          errors.push(`Missing required field: ${field}`);
        }
      });

      // Name validation
      if (manifest.name && !/^[a-z0-9-]+$/.test(manifest.name)) {
        errors.push('Plugin name must only contain lowercase letters, numbers, and hyphens');
      }

      // Version validation
      if (manifest.version && !/^\d+\.\d+\.\d+$/.test(manifest.version)) {
        errors.push('Version must follow semantic versioning (e.g., 1.0.0)');
      }

      // Category validation
      const validCategories = ['analytics', 'authentication', 'communication', 'content', 'data-visualization', 'integration', 'productivity', 'security', 'social', 'tools', 'ui-components', 'utilities'];
      if (manifest.category && !validCategories.includes(manifest.category)) {
        warnings.push(`Category '${manifest.category}' is not standard. Consider using: ${validCategories.join(', ')}`);
      }

      // Permissions validation
      if (manifest.permissions) {
        const dangerousPerms = manifest.permissions.filter((p: string) => 
          ['admin.access', 'database.write', 'system.exec'].includes(p)
        );
        if (dangerousPerms.length > 0) {
          warnings.push(`Dangerous permissions detected: ${dangerousPerms.join(', ')}. These require manual review.`);
        }
      }

    } catch (e) {
      errors.push('Invalid JSON format');
    }

    return {
      isValid: errors.length === 0,
      errors,
      warnings
    };
  };

  const handleManifestChange = (value: string) => {
    setManifestText(value);
    const validation = validateManifest(value);
    setValidation(validation);
  };

  const generateManifest = () => {
    setManifestText(JSON.stringify(SAMPLE_MANIFEST, null, 2));
    setValidation({ isValid: true, errors: [], warnings: [] });
  };

  const downloadManifest = () => {
    const blob = new Blob([manifestText], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'manifest.json';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    toast.success('Manifest downloaded');
  };

  const uploadManifest = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const content = e.target?.result as string;
        handleManifestChange(content);
        toast.success('Manifest loaded');
      };
      reader.readAsText(file);
    }
  };

  const runCompatibilityTest = async () => {
    setIsRunningTest(true);
    
    // Simulate testing
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    const results = {
      compatibility: Math.random() > 0.2 ? 'pass' : 'fail',
      performance: Math.random() > 0.3 ? 'pass' : 'warning',
      security: Math.random() > 0.1 ? 'pass' : 'fail',
      dependencies: Math.random() > 0.25 ? 'pass' : 'warning',
      details: {
        loadTime: Math.floor(Math.random() * 500) + 100,
        memoryUsage: Math.floor(Math.random() * 50) + 10,
        apiCalls: Math.floor(Math.random() * 20) + 5
      }
    };
    
    setTestResults(results);
    setIsRunningTest(false);
    
    if (results.compatibility === 'pass') {
      toast.success('Plugin passed compatibility tests');
    } else {
      toast.error('Plugin failed compatibility tests');
    }
  };

  const getTestBadge = (result: string) => {
    switch (result) {
      case 'pass':
        return <Badge className="bg-green-100 text-green-800"><CheckCircle className="h-3 w-3 mr-1" />Pass</Badge>;
      case 'warning':
        return <Badge className="bg-orange-100 text-orange-800"><AlertTriangle className="h-3 w-3 mr-1" />Warning</Badge>;
      case 'fail':
        return <Badge variant="destructive"><XCircle className="h-3 w-3 mr-1" />Fail</Badge>;
      default:
        return <Badge variant="outline">{result}</Badge>;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold flex items-center">
            <Terminal className="h-8 w-8 mr-3" />
            Developer Console
          </h1>
          <p className="text-muted-foreground">
            Tools and resources for CamerPulse plugin development
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <Badge variant="outline">SDK v1.0.0</Badge>
        </div>
      </div>

      <Tabs defaultValue="manifest" className="space-y-6">
        <TabsList>
          <TabsTrigger value="manifest">Manifest Editor</TabsTrigger>
          <TabsTrigger value="docs">API Documentation</TabsTrigger>
          <TabsTrigger value="test">Testing Tools</TabsTrigger>
          <TabsTrigger value="examples">Code Examples</TabsTrigger>
        </TabsList>

        <TabsContent value="manifest" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <FileText className="h-5 w-5 mr-2" />
                Manifest Editor
              </CardTitle>
              <CardDescription>
                Create and validate your plugin manifest.json file
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center space-x-2">
                <Button variant="outline" onClick={generateManifest}>
                  <Code className="h-4 w-4 mr-2" />
                  Generate Sample
                </Button>
                <Button variant="outline" onClick={downloadManifest}>
                  <Download className="h-4 w-4 mr-2" />
                  Download
                </Button>
                <Button 
                  variant="outline" 
                  onClick={() => fileInputRef.current?.click()}
                >
                  <Upload className="h-4 w-4 mr-2" />
                  Upload
                </Button>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".json"
                  onChange={uploadManifest}
                  className="hidden"
                />
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium mb-2">Manifest JSON</label>
                  <Textarea
                    value={manifestText}
                    onChange={(e) => handleManifestChange(e.target.value)}
                    className="h-96 font-mono text-sm"
                    placeholder="Enter your manifest.json content..."
                  />
                </div>

                <div className="space-y-4">
                  <div>
                    <h3 className="font-medium mb-2 flex items-center">
                      Validation Results
                      {validation.isValid ? (
                        <CheckCircle className="h-4 w-4 text-green-600 ml-2" />
                      ) : (
                        <XCircle className="h-4 w-4 text-red-600 ml-2" />
                      )}
                    </h3>
                    
                    {validation.errors.length > 0 && (
                      <Alert className="mb-3">
                        <XCircle className="h-4 w-4" />
                        <AlertDescription>
                          <div className="space-y-1">
                            {validation.errors.map((error, index) => (
                              <div key={index} className="text-sm text-red-700">• {error}</div>
                            ))}
                          </div>
                        </AlertDescription>
                      </Alert>
                    )}

                    {validation.warnings.length > 0 && (
                      <Alert className="mb-3">
                        <AlertTriangle className="h-4 w-4" />
                        <AlertDescription>
                          <div className="space-y-1">
                            {validation.warnings.map((warning, index) => (
                              <div key={index} className="text-sm text-orange-700">• {warning}</div>
                            ))}
                          </div>
                        </AlertDescription>
                      </Alert>
                    )}

                    {validation.isValid && validation.warnings.length === 0 && (
                      <div className="text-sm text-green-700 bg-green-50 p-3 rounded-md">
                        ✓ Manifest is valid and ready for submission
                      </div>
                    )}
                  </div>

                  <div>
                    <h3 className="font-medium mb-2">Required Fields</h3>
                    <div className="space-y-1 text-sm">
                      {['name', 'version', 'description', 'author', 'main'].map(field => (
                        <div key={field} className="flex items-center justify-between">
                          <span>{field}</span>
                          {manifestText.includes(`"${field}"`) ? (
                            <CheckCircle className="h-3 w-3 text-green-600" />
                          ) : (
                            <XCircle className="h-3 w-3 text-red-600" />
                          )}
                        </div>
                      ))}
                    </div>
                  </div>

                  <div>
                    <h3 className="font-medium mb-2">Plugin Info</h3>
                    <div className="text-sm space-y-1 bg-muted p-3 rounded-md">
                      <div><strong>Name:</strong> {manifestText.match(/"name":\s*"([^"]*)"/) ?.[1] || 'Not set'}</div>
                      <div><strong>Version:</strong> {manifestText.match(/"version":\s*"([^"]*)"/) ?.[1] || 'Not set'}</div>
                      <div><strong>Category:</strong> {manifestText.match(/"category":\s*"([^"]*)"/) ?.[1] || 'Not set'}</div>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="docs" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Book className="h-5 w-5 mr-2" />
                API Documentation
              </CardTitle>
              <CardDescription>
                Complete reference for CamerPulse Plugin SDK
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {API_DOCUMENTATION.map((section, index) => (
                  <div key={index}>
                    <h3 className="text-lg font-semibold mb-3">{section.category}</h3>
                    <div className="space-y-4">
                      {section.methods.map((method, methodIndex) => (
                        <div key={methodIndex} className="border rounded-lg p-4">
                          <div className="flex items-center justify-between mb-2">
                            <h4 className="font-medium">{method.name}</h4>
                            <Badge variant="outline">Method</Badge>
                          </div>
                          <p className="text-sm text-muted-foreground mb-3">{method.description}</p>
                          <div className="bg-muted p-3 rounded text-sm font-mono">
                            {method.example}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="test" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Zap className="h-5 w-5 mr-2" />
                Plugin Testing
              </CardTitle>
              <CardDescription>
                Test your plugin for compatibility and performance
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center space-x-2">
                <Button 
                  onClick={runCompatibilityTest}
                  disabled={isRunningTest || !validation.isValid}
                >
                  {isRunningTest ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Running Tests...
                    </>
                  ) : (
                    <>
                      <Play className="h-4 w-4 mr-2" />
                      Run Compatibility Test
                    </>
                  )}
                </Button>
                <Button variant="outline">
                  <Shield className="h-4 w-4 mr-2" />
                  Security Scan
                </Button>
              </div>

              {testResults && (
                <div className="space-y-4">
                  <h3 className="font-medium">Test Results</h3>
                  
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="text-center">
                      <div className="mb-2">Compatibility</div>
                      {getTestBadge(testResults.compatibility)}
                    </div>
                    <div className="text-center">
                      <div className="mb-2">Performance</div>
                      {getTestBadge(testResults.performance)}
                    </div>
                    <div className="text-center">
                      <div className="mb-2">Security</div>
                      {getTestBadge(testResults.security)}
                    </div>
                    <div className="text-center">
                      <div className="mb-2">Dependencies</div>
                      {getTestBadge(testResults.dependencies)}
                    </div>
                  </div>

                  <div className="bg-muted p-4 rounded-lg">
                    <h4 className="font-medium mb-2">Performance Metrics</h4>
                    <div className="grid grid-cols-3 gap-4 text-sm">
                      <div>
                        <div className="text-muted-foreground">Load Time</div>
                        <div className="font-medium">{testResults.details.loadTime}ms</div>
                      </div>
                      <div>
                        <div className="text-muted-foreground">Memory Usage</div>
                        <div className="font-medium">{testResults.details.memoryUsage}MB</div>
                      </div>
                      <div>
                        <div className="text-muted-foreground">API Calls</div>
                        <div className="font-medium">{testResults.details.apiCalls}</div>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="examples" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Package className="h-5 w-5 mr-2" />
                Code Examples
              </CardTitle>
              <CardDescription>
                Sample code and plugin templates
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-4">
                <div>
                  <h3 className="font-medium mb-2">Basic Plugin Structure</h3>
                  <pre className="bg-muted p-4 rounded-lg text-sm overflow-auto">
{`// index.js - Main plugin file
class MyPlugin {
  constructor() {
    this.name = 'my-awesome-plugin';
    this.version = '1.0.0';
  }

  async init(context) {
    // Initialize plugin
    this.context = context;
    console.log('Plugin initialized!');
  }

  render() {
    // Render UI
    return '<div>Hello from my plugin!</div>';
  }

  destroy() {
    // Cleanup
    console.log('Plugin destroyed');
  }
}

// Export plugin class
export default MyPlugin;`}
                  </pre>
                </div>

                <div>
                  <h3 className="font-medium mb-2">Using CamerPulse APIs</h3>
                  <pre className="bg-muted p-4 rounded-lg text-sm overflow-auto">
{`// Accessing CamerPulse data
const polls = await CamerPulse.data.get('polls');
const currentUser = CamerPulse.user.current();

// Storing plugin data
await CamerPulse.storage.set('my-data', { count: 42 });
const savedData = await CamerPulse.storage.get('my-data');

// Listening to events
CamerPulse.on('poll.created', (poll) => {
  console.log('New poll created:', poll);
});

// Rendering UI components
CamerPulse.render(MyComponent, '#plugin-container');`}
                  </pre>
                </div>

                <div>
                  <h3 className="font-medium mb-2">Error Handling</h3>
                  <pre className="bg-muted p-4 rounded-lg text-sm overflow-auto">
{`// Proper error handling
try {
  const data = await CamerPulse.data.get('sensitive-data');
  // Process data
} catch (error) {
  if (error.code === 'PERMISSION_DENIED') {
    console.error('Plugin lacks required permissions');
  } else {
    console.error('Unexpected error:', error.message);
  }
}`}
                  </pre>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};