import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Checkbox } from '@/components/ui/checkbox';
import { usePluginMarketplace } from '@/hooks/usePluginMarketplace';
import { 
  Upload, 
  Github, 
  Code, 
  Shield, 
  Package, 
  AlertTriangle,
  CheckCircle,
  FileText,
  Globe
} from 'lucide-react';
import { toast } from 'sonner';

interface PluginManifest {
  name: string;
  version: string;
  description: string;
  author: string;
  main: string;
  dependencies?: Record<string, string>;
  permissions?: string[];
  category: string;
  tags?: string[];
}

export const PluginSubmissionForm: React.FC = () => {
  const { submitPlugin, isSubmitting } = usePluginMarketplace();
  const [submissionType, setSubmissionType] = useState<'upload' | 'github' | 'remote'>('upload');
  const [manifest, setManifest] = useState<PluginManifest>({
    name: '',
    version: '1.0.0',
    description: '',
    author: '',
    main: 'index.js',
    category: '',
    tags: [],
    permissions: []
  });
  
  const [sourceData, setSourceData] = useState({
    githubRepo: '',
    remoteUrl: '',
    bundleFile: null as File | null
  });

  const [agreedToTerms, setAgreedToTerms] = useState(false);
  const [manifestValid, setManifestValid] = useState(false);

  const categories = [
    'analytics', 'authentication', 'communication', 'content',
    'data-visualization', 'integration', 'productivity', 'security',
    'social', 'tools', 'ui-components', 'utilities'
  ];

  const availablePermissions = [
    'storage.read', 'storage.write', 'network.fetch', 'notifications.send',
    'user.profile.read', 'admin.access', 'database.read', 'database.write'
  ];

  const validateManifest = () => {
    const required = ['name', 'version', 'description', 'author', 'main', 'category'];
    const isValid = required.every(field => manifest[field as keyof PluginManifest]?.toString().trim());
    setManifestValid(isValid);
    return isValid;
  };

  const handleManifestChange = (field: keyof PluginManifest, value: any) => {
    setManifest(prev => ({ ...prev, [field]: value }));
    setTimeout(validateManifest, 100);
  };

  const handleTagsChange = (tagsText: string) => {
    const tags = tagsText.split(',').map(tag => tag.trim()).filter(Boolean);
    handleManifestChange('tags', tags);
  };

  const togglePermission = (permission: string) => {
    const current = manifest.permissions || [];
    const updated = current.includes(permission)
      ? current.filter(p => p !== permission)
      : [...current, permission];
    handleManifestChange('permissions', updated);
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      if (file.size > 10 * 1024 * 1024) { // 10MB limit
        toast.error('File size must be under 10MB');
        return;
      }
      setSourceData(prev => ({ ...prev, bundleFile: file }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateManifest()) {
      toast.error('Please complete all required fields');
      return;
    }

    if (!agreedToTerms) {
      toast.error('Please agree to the terms and conditions');
      return;
    }

    // Prepare submission data based on type
    let pluginData: any = {
      manifest,
      submissionType,
      sourceType: submissionType === 'upload' ? 'local' : submissionType === 'github' ? 'github' : 'remote'
    };

    if (submissionType === 'github') {
      if (!sourceData.githubRepo) {
        toast.error('GitHub repository URL is required');
        return;
      }
      pluginData.githubRepo = sourceData.githubRepo;
    } else if (submissionType === 'remote') {
      if (!sourceData.remoteUrl) {
        toast.error('Remote bundle URL is required');
        return;
      }
      pluginData.bundleUrl = sourceData.remoteUrl;
    } else if (submissionType === 'upload') {
      if (!sourceData.bundleFile) {
        toast.error('Plugin bundle file is required');
        return;
      }
      // In a real implementation, you'd upload the file to storage first
      pluginData.bundleSize = sourceData.bundleFile.size;
      pluginData.bundleName = sourceData.bundleFile.name;
    }

    try {
      await submitPlugin({
        plugin_id: manifest.name.toLowerCase().replace(/[^a-z0-9]/g, '-'),
        plugin_data: pluginData,
        manifest_data: manifest,
        submission_type: 'new'
      });
      
      // Reset form
      setManifest({
        name: '',
        version: '1.0.0',
        description: '',
        author: '',
        main: 'index.js',
        category: '',
        tags: [],
        permissions: []
      });
      setSourceData({
        githubRepo: '',
        remoteUrl: '',
        bundleFile: null
      });
      setAgreedToTerms(false);
    } catch (error) {
      console.error('Submission failed:', error);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="text-center">
        <h1 className="text-3xl font-bold flex items-center justify-center">
          <Package className="h-8 w-8 mr-3" />
          Submit Plugin
        </h1>
        <p className="text-muted-foreground mt-2">
          Share your plugin with the CamerPulse community
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Source Type Selection */}
        <Card>
          <CardHeader>
            <CardTitle>Plugin Source</CardTitle>
            <CardDescription>Choose how you want to submit your plugin</CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs value={submissionType} onValueChange={(value: any) => setSubmissionType(value)}>
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="upload" className="flex items-center">
                  <Upload className="h-4 w-4 mr-2" />
                  Upload ZIP
                </TabsTrigger>
                <TabsTrigger value="github" className="flex items-center">
                  <Github className="h-4 w-4 mr-2" />
                  GitHub Repo
                </TabsTrigger>
                <TabsTrigger value="remote" className="flex items-center">
                  <Globe className="h-4 w-4 mr-2" />
                  Remote URL
                </TabsTrigger>
              </TabsList>

              <TabsContent value="upload" className="mt-4">
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">Plugin Bundle (ZIP)</label>
                    <input
                      type="file"
                      accept=".zip"
                      onChange={handleFileUpload}
                      className="w-full p-2 border rounded-md"
                    />
                    <p className="text-sm text-muted-foreground mt-1">
                      Upload a ZIP file containing your plugin code and manifest.json (max 10MB)
                    </p>
                  </div>
                  {sourceData.bundleFile && (
                    <div className="p-3 bg-green-50 border border-green-200 rounded-md">
                      <div className="flex items-center">
                        <CheckCircle className="h-4 w-4 text-green-600 mr-2" />
                        <span className="text-sm">
                          {sourceData.bundleFile.name} ({(sourceData.bundleFile.size / 1024 / 1024).toFixed(2)} MB)
                        </span>
                      </div>
                    </div>
                  )}
                </div>
              </TabsContent>

              <TabsContent value="github" className="mt-4">
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">GitHub Repository URL</label>
                    <Input
                      placeholder="https://github.com/username/plugin-repo"
                      value={sourceData.githubRepo}
                      onChange={(e) => setSourceData(prev => ({ ...prev, githubRepo: e.target.value }))}
                    />
                    <p className="text-sm text-muted-foreground mt-1">
                      Repository must be public and contain a manifest.json file
                    </p>
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="remote" className="mt-4">
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">Remote Bundle URL</label>
                    <Input
                      placeholder="https://cdn.example.com/my-plugin.js"
                      value={sourceData.remoteUrl}
                      onChange={(e) => setSourceData(prev => ({ ...prev, remoteUrl: e.target.value }))}
                    />
                    <p className="text-sm text-muted-foreground mt-1">
                      Direct URL to your plugin bundle (JS/ESM format)
                    </p>
                  </div>
                </div>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>

        {/* Plugin Manifest */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <FileText className="h-5 w-5 mr-2" />
              Plugin Manifest
              {manifestValid && <CheckCircle className="h-4 w-4 text-green-600 ml-2" />}
            </CardTitle>
            <CardDescription>Define your plugin's metadata and configuration</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2">Plugin Name *</label>
                <Input
                  value={manifest.name}
                  onChange={(e) => handleManifestChange('name', e.target.value)}
                  placeholder="my-awesome-plugin"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Version *</label>
                <Input
                  value={manifest.version}
                  onChange={(e) => handleManifestChange('version', e.target.value)}
                  placeholder="1.0.0"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Description *</label>
              <Textarea
                value={manifest.description}
                onChange={(e) => handleManifestChange('description', e.target.value)}
                placeholder="Brief description of what your plugin does..."
                rows={3}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2">Author *</label>
                <Input
                  value={manifest.author}
                  onChange={(e) => handleManifestChange('author', e.target.value)}
                  placeholder="Your Name"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Category *</label>
                <Select value={manifest.category} onValueChange={(value) => handleManifestChange('category', value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map(category => (
                      <SelectItem key={category} value={category}>
                        {category.charAt(0).toUpperCase() + category.slice(1).replace('-', ' ')}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Tags</label>
              <Input
                placeholder="civic, analytics, dashboard (comma-separated)"
                onChange={(e) => handleTagsChange(e.target.value)}
              />
              {manifest.tags && manifest.tags.length > 0 && (
                <div className="flex flex-wrap gap-1 mt-2">
                  {manifest.tags.map(tag => (
                    <Badge key={tag} variant="secondary">{tag}</Badge>
                  ))}
                </div>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Entry Point</label>
              <Input
                value={manifest.main}
                onChange={(e) => handleManifestChange('main', e.target.value)}
                placeholder="index.js"
              />
            </div>
          </CardContent>
        </Card>

        {/* Permissions */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Shield className="h-5 w-5 mr-2" />
              Permissions
            </CardTitle>
            <CardDescription>Select the permissions your plugin requires</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {availablePermissions.map(permission => (
                <div key={permission} className="flex items-center space-x-2">
                  <Checkbox
                    id={permission}
                    checked={manifest.permissions?.includes(permission)}
                    onCheckedChange={() => togglePermission(permission)}
                  />
                  <label htmlFor={permission} className="text-sm">
                    {permission}
                  </label>
                </div>
              ))}
            </div>
            {manifest.permissions && manifest.permissions.length > 0 && (
              <div className="mt-4 p-3 bg-orange-50 border border-orange-200 rounded-md">
                <div className="flex items-start">
                  <AlertTriangle className="h-4 w-4 text-orange-600 mr-2 mt-0.5" />
                  <div className="text-sm">
                    <strong>Security Review Required</strong>
                    <p className="text-orange-700 mt-1">
                      Plugins requesting sensitive permissions require manual security review.
                    </p>
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Terms and Conditions */}
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-start space-x-2">
                  <Checkbox
                    id="terms"
                    checked={agreedToTerms}
                    onCheckedChange={(checked) => setAgreedToTerms(checked === true)}
                  />
              <div className="text-sm">
                <label htmlFor="terms" className="font-medium">
                  I agree to the CamerPulse Plugin Terms and Conditions
                </label>
                <p className="text-muted-foreground mt-1">
                  By submitting, you agree that your plugin will be reviewed for security and quality.
                  Approved plugins will be made available in the marketplace under the specified license.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Submit Button */}
        <div className="flex justify-center">
          <Button 
            type="submit" 
            size="lg" 
            disabled={!manifestValid || !agreedToTerms || isSubmitting}
            className="px-8"
          >
            {isSubmitting ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                Submitting...
              </>
            ) : (
              <>
                <Package className="h-4 w-4 mr-2" />
                Submit Plugin
              </>
            )}
          </Button>
        </div>
      </form>
    </div>
  );
};