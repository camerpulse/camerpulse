import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  Search, 
  FileText, 
  Download, 
  Flag, 
  Eye, 
  Star,
  Shield,
  AlertTriangle,
  ExternalLink,
  Filter,
  BookmarkPlus,
  Share2,
  Calendar,
  Building,
  MapPin,
  BarChart3
} from 'lucide-react';
import { AppLayout } from '@/components/Layout/AppLayout';

// Mock data for demonstration
const mockAudits = [
  {
    id: '1',
    document_title: 'Ministry of Health Financial Audit 2023',
    entity_audited: 'Ministry of Health',
    fiscal_year: 2023,
    audit_summary: 'Comprehensive financial audit revealing budget allocation discrepancies and procurement irregularities.',
    audit_score: 65,
    source_type: 'government_audit',
    document_status: 'approved',
    authenticity_rating: 'officially_verified',
    region: 'Centre',
    download_count: 245,
    flag_count: 2,
    view_count: 1834,
    tags: ['healthcare', 'budget', 'procurement'],
    created_at: '2024-01-15',
    documents: ['health_audit_2023.pdf', 'appendix_a.xlsx']
  },
  {
    id: '2',
    document_title: 'SONARA Oil Refinery Investigation',
    entity_audited: 'SONARA',
    fiscal_year: 2023,
    audit_summary: 'Independent investigation into alleged financial misconduct and operational inefficiencies.',
    audit_score: 42,
    source_type: 'media_investigation',
    document_status: 'approved',
    authenticity_rating: 'high_confidence',
    region: 'Littoral',
    download_count: 892,
    flag_count: 0,
    view_count: 3421,
    tags: ['oil', 'corruption', 'sonara'],
    created_at: '2024-02-03',
    documents: ['sonara_investigation.pdf']
  },
  {
    id: '3',
    document_title: 'Road Infrastructure Project - Far North',
    entity_audited: 'Ministry of Public Works',
    fiscal_year: 2022,
    audit_summary: 'Whistleblower report on inflated contract costs and substandard construction materials.',
    audit_score: 38,
    source_type: 'whistleblower_leak',
    document_status: 'approved',
    authenticity_rating: 'medium_confidence',
    region: 'Far North',
    download_count: 567,
    flag_count: 1,
    view_count: 2156,
    tags: ['infrastructure', 'roads', 'contracts'],
    created_at: '2024-01-28',
    documents: ['roads_report.pdf', 'evidence_photos.zip']
  }
];

export default function AuditRegistryPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedRegion, setSelectedRegion] = useState('all');
  const [selectedSource, setSelectedSource] = useState('all');
  const [selectedYear, setSelectedYear] = useState('all');
  const [sortBy, setSortBy] = useState('newest');

  const regions = ['All Regions', 'Centre', 'Littoral', 'West', 'Southwest', 'Northwest', 'North', 'Far North', 'Adamawa', 'East', 'South'];
  const sourceTypes = ['All Sources', 'government_audit', 'media_investigation', 'whistleblower_leak', 'third_party_review', 'ngo_report'];
  const years = ['All Years', '2024', '2023', '2022', '2021', '2020'];

  const getSourceTypeLabel = (type: string) => {
    const labels: Record<string, string> = {
      government_audit: 'Government Audit',
      media_investigation: 'Media Investigation',
      whistleblower_leak: 'Whistleblower Leak',
      third_party_review: 'Third Party Review',
      ngo_report: 'NGO Report'
    };
    return labels[type] || type;
  };

  const getSourceTypeColor = (type: string) => {
    const colors: Record<string, string> = {
      government_audit: 'bg-blue-100 text-blue-800',
      media_investigation: 'bg-purple-100 text-purple-800',
      whistleblower_leak: 'bg-red-100 text-red-800',
      third_party_review: 'bg-green-100 text-green-800',
      ngo_report: 'bg-orange-100 text-orange-800'
    };
    return colors[type] || 'bg-gray-100 text-gray-800';
  };

  const getAuthenticityColor = (rating: string) => {
    const colors: Record<string, string> = {
      officially_verified: 'bg-green-100 text-green-800',
      high_confidence: 'bg-blue-100 text-blue-800',
      medium_confidence: 'bg-yellow-100 text-yellow-800',
      low_confidence: 'bg-orange-100 text-orange-800',
      unverified: 'bg-gray-100 text-gray-800'
    };
    return colors[rating] || 'bg-gray-100 text-gray-800';
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-600';
    if (score >= 60) return 'text-yellow-600';
    if (score >= 40) return 'text-orange-600';
    return 'text-red-600';
  };

  const filteredAudits = mockAudits.filter(audit => {
    const matchesSearch = audit.document_title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         audit.entity_audited.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         audit.audit_summary.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRegion = selectedRegion === 'all' || audit.region === selectedRegion;
    const matchesSource = selectedSource === 'all' || audit.source_type === selectedSource;
    const matchesYear = selectedYear === 'all' || audit.fiscal_year.toString() === selectedYear;
    
    return matchesSearch && matchesRegion && matchesSource && matchesYear;
  });

  return (
    <AppLayout>
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-primary to-primary-foreground bg-clip-text text-transparent mb-2">
            Public Audits & Data Leaks Registry
          </h1>
          <p className="text-lg text-muted-foreground">
            Centralized access to government audits, whistleblower disclosures, and accountability documents
          </p>
        </div>

        {/* Stats Dashboard */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Total Documents</p>
                  <p className="text-2xl font-bold text-foreground">1,247</p>
                </div>
                <FileText className="h-8 w-8 text-primary" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Verified Sources</p>
                  <p className="text-2xl font-bold text-foreground">892</p>
                </div>
                <Shield className="h-8 w-8 text-green-500" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Active Investigations</p>
                  <p className="text-2xl font-bold text-foreground">156</p>
                </div>
                <Eye className="h-8 w-8 text-blue-500" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Total Downloads</p>
                  <p className="text-2xl font-bold text-foreground">45.2K</p>
                </div>
                <Download className="h-8 w-8 text-purple-500" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Search and Filters */}
        <Card className="p-6 mb-8">
          <div className="space-y-4">
            {/* Search Bar */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
              <Input
                placeholder="Search audits by title, entity, or content..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 text-base"
              />
            </div>

            {/* Filter Row */}
            <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
              <Select value={selectedRegion} onValueChange={setSelectedRegion}>
                <SelectTrigger>
                  <SelectValue placeholder="All Regions" />
                </SelectTrigger>
                <SelectContent>
                  {regions.map(region => (
                    <SelectItem key={region} value={region === 'All Regions' ? 'all' : region}>
                      {region}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select value={selectedSource} onValueChange={setSelectedSource}>
                <SelectTrigger>
                  <SelectValue placeholder="All Sources" />
                </SelectTrigger>
                <SelectContent>
                  {sourceTypes.map(source => (
                    <SelectItem key={source} value={source === 'All Sources' ? 'all' : source}>
                      {source === 'All Sources' ? source : getSourceTypeLabel(source)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select value={selectedYear} onValueChange={setSelectedYear}>
                <SelectTrigger>
                  <SelectValue placeholder="All Years" />
                </SelectTrigger>
                <SelectContent>
                  {years.map(year => (
                    <SelectItem key={year} value={year === 'All Years' ? 'all' : year}>
                      {year}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select value={sortBy} onValueChange={setSortBy}>
                <SelectTrigger>
                  <SelectValue placeholder="Sort by" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="newest">Newest First</SelectItem>
                  <SelectItem value="oldest">Oldest First</SelectItem>
                  <SelectItem value="most_downloaded">Most Downloaded</SelectItem>
                  <SelectItem value="highest_score">Highest Score</SelectItem>
                  <SelectItem value="lowest_score">Lowest Score</SelectItem>
                </SelectContent>
              </Select>

              <Button 
                variant="outline" 
                onClick={() => {
                  setSearchTerm('');
                  setSelectedRegion('all');
                  setSelectedSource('all');
                  setSelectedYear('all');
                }}
              >
                <Filter className="h-4 w-4 mr-2" />
                Clear Filters
              </Button>
            </div>
          </div>
        </Card>

        {/* Results */}
        <div className="space-y-6">
          {filteredAudits.map((audit) => (
            <Card key={audit.id} className="hover:shadow-lg transition-shadow">
              <CardContent className="p-6">
                <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4">
                  {/* Main Content */}
                  <div className="flex-1">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex-1">
                        <h3 className="text-xl font-bold text-foreground mb-2">
                          {audit.document_title}
                        </h3>
                        
                        <div className="flex flex-wrap items-center gap-2 mb-3">
                          <Badge className={getSourceTypeColor(audit.source_type)}>
                            {getSourceTypeLabel(audit.source_type)}
                          </Badge>
                          
                          <Badge className={getAuthenticityColor(audit.authenticity_rating)}>
                            <Shield className="h-3 w-3 mr-1" />
                            {audit.authenticity_rating.replace('_', ' ')}
                          </Badge>
                          
                          <Badge variant="outline">
                            <Building className="h-3 w-3 mr-1" />
                            {audit.entity_audited}
                          </Badge>
                          
                          <Badge variant="outline">
                            <MapPin className="h-3 w-3 mr-1" />
                            {audit.region}
                          </Badge>
                          
                          <Badge variant="outline">
                            <Calendar className="h-3 w-3 mr-1" />
                            {audit.fiscal_year}
                          </Badge>
                        </div>
                      </div>
                      
                      {/* Audit Score */}
                      <div className="text-center">
                        <div className={`text-3xl font-bold ${getScoreColor(audit.audit_score)}`}>
                          {audit.audit_score}
                        </div>
                        <div className="text-xs text-muted-foreground">Audit Score</div>
                      </div>
                    </div>

                    <p className="text-muted-foreground mb-4">
                      {audit.audit_summary}
                    </p>

                    {/* Tags */}
                    <div className="flex flex-wrap gap-1 mb-4">
                      {audit.tags.map((tag, index) => (
                        <Badge key={index} variant="secondary" className="text-xs">
                          #{tag}
                        </Badge>
                      ))}
                    </div>

                    {/* Stats */}
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <Eye className="h-4 w-4" />
                        {audit.view_count.toLocaleString()} views
                      </div>
                      <div className="flex items-center gap-1">
                        <Download className="h-4 w-4" />
                        {audit.download_count} downloads
                      </div>
                      <div className="flex items-center gap-1">
                        <FileText className="h-4 w-4" />
                        {audit.documents.length} document{audit.documents.length !== 1 ? 's' : ''}
                      </div>
                      {audit.flag_count > 0 && (
                        <div className="flex items-center gap-1 text-orange-600">
                          <Flag className="h-4 w-4" />
                          {audit.flag_count} flag{audit.flag_count !== 1 ? 's' : ''}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex flex-col gap-2 lg:w-48">
                    <Button className="w-full">
                      <Eye className="h-4 w-4 mr-2" />
                      View Details
                    </Button>
                    
                    <Button variant="outline" className="w-full">
                      <Download className="h-4 w-4 mr-2" />
                      Download All
                    </Button>
                    
                    <div className="flex gap-2">
                      <Button variant="outline" size="sm" className="flex-1">
                        <BookmarkPlus className="h-4 w-4 mr-1" />
                        Watch
                      </Button>
                      
                      <Button variant="outline" size="sm" className="flex-1">
                        <Share2 className="h-4 w-4 mr-1" />
                        Share
                      </Button>
                      
                      <Button variant="outline" size="sm">
                        <Flag className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Empty State */}
        {filteredAudits.length === 0 && (
          <div className="text-center py-12">
            <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-medium text-foreground mb-2">
              No audits found
            </h3>
            <p className="text-muted-foreground">
              Try adjusting your search criteria or clearing filters
            </p>
          </div>
        )}
      </div>
    </AppLayout>
  );
}