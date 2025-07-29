import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Textarea } from '@/components/ui/textarea';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Download, 
  FileText, 
  Shield, 
  Eye, 
  Star,
  Flag,
  Share2,
  BookmarkPlus,
  MessageSquare,
  ExternalLink,
  Calendar,
  Building,
  MapPin,
  User,
  ThumbsUp,
  ThumbsDown,
  BarChart3,
  Lock,
  Unlock,
  AlertTriangle,
  CheckCircle,
  Clock,
  ArrowLeft
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface AuditDetailViewProps {
  auditId: string;
  onBack?: () => void;
}

// Mock audit data
const mockAuditDetail = {
  id: '1',
  document_title: 'Ministry of Health Financial Audit 2023',
  entity_audited: 'Ministry of Health',
  fiscal_year: 2023,
  audit_summary: 'Comprehensive financial audit revealing budget allocation discrepancies and procurement irregularities. The audit found significant variances in budget execution, particularly in the procurement of medical equipment and pharmaceuticals. Several contracts were awarded without proper competitive bidding processes, resulting in inflated costs estimated at 2.4 billion FCFA.',
  detailed_findings: `
    Key Findings:
    • Procurement irregularities: 15 contracts totaling 2.4 billion FCFA awarded without competitive bidding
    • Budget variance: 18% deviation from approved allocations
    • Missing documentation: 234 transactions lacking proper supporting documents
    • Inventory discrepancies: Medical equipment worth 890 million FCFA unaccounted for
    
    Recommendations:
    • Implement robust procurement oversight mechanisms
    • Establish independent audit committee
    • Digitize procurement processes for transparency
    • Conduct quarterly inventory reconciliations
  `,
  audit_score: 65,
  source_type: 'government_audit',
  document_status: 'approved',
  authenticity_rating: 'officially_verified',
  region: 'Centre',
  download_count: 245,
  flag_count: 2,
  view_count: 1834,
  bookmark_count: 89,
  tags: ['healthcare', 'budget', 'procurement', 'corruption'],
  created_at: '2024-01-15',
  submitted_by: 'Audit Authority',
  verification_details: {
    verified_by: 'System Administrator',
    verification_date: '2024-01-16',
    verification_notes: 'Official government audit report verified through ministry channels.'
  },
  documents: [
    { name: 'health_audit_2023.pdf', size: '2.4 MB', type: 'PDF', downloads: 156 },
    { name: 'appendix_a.xlsx', size: '890 KB', type: 'Excel', downloads: 89 },
    { name: 'evidence_photos.zip', size: '12.3 MB', type: 'ZIP', downloads: 67 }
  ],
  comments: [
    {
      id: '1',
      user: 'Dr. Emmanuel K.',
      timestamp: '2024-01-20',
      comment: 'This audit confirms what healthcare workers have been reporting. The procurement issues have directly impacted patient care.',
      is_verified: true
    },
    {
      id: '2',
      user: 'Journalist_CameroonToday',
      timestamp: '2024-01-19',
      comment: 'Working on a follow-up investigation. Would appreciate if anyone has additional information.',
      is_verified: false
    }
  ],
  related_audits: [
    {
      id: '2',
      title: 'Regional Hospital Infrastructure Review',
      entity: 'Douala General Hospital',
      score: 58,
      date: '2024-01-10'
    },
    {
      id: '3',
      title: 'Pharmaceutical Supply Chain Analysis',
      entity: 'Ministry of Health',
      score: 42,
      date: '2023-12-15'
    }
  ]
};

export const AuditDetailView: React.FC<AuditDetailViewProps> = ({
  auditId,
  onBack
}) => {
  const { toast } = useToast();
  const [newComment, setNewComment] = useState('');
  const [isBookmarked, setIsBookmarked] = useState(false);
  const [userRating, setUserRating] = useState<'up' | 'down' | null>(null);

  const audit = mockAuditDetail; // In real app, fetch by auditId

  const handleDownload = (fileName: string) => {
    toast({
      title: "Download Started",
      description: `Downloading ${fileName}...`,
    });
  };

  const handleBookmark = () => {
    setIsBookmarked(!isBookmarked);
    toast({
      title: isBookmarked ? "Removed from Watchlist" : "Added to Watchlist",
      description: isBookmarked 
        ? "You will no longer receive updates about this audit."
        : "You will receive notifications about updates to this audit.",
    });
  };

  const handleFlag = () => {
    toast({
      title: "Content Flagged",
      description: "Thank you for reporting. Our moderators will review this content.",
    });
  };

  const handleShare = () => {
    navigator.clipboard.writeText(window.location.href);
    toast({
      title: "Link Copied",
      description: "The audit link has been copied to your clipboard.",
    });
  };

  const handleRating = (rating: 'up' | 'down') => {
    setUserRating(rating);
    toast({
      title: "Rating Submitted",
      description: `Thank you for rating this audit as ${rating === 'up' ? 'helpful' : 'not helpful'}.`,
    });
  };

  const handleCommentSubmit = () => {
    if (newComment.trim()) {
      toast({
        title: "Comment Submitted",
        description: "Your comment has been posted and is pending moderation.",
      });
      setNewComment('');
    }
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

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        {onBack && (
          <Button variant="outline" onClick={onBack}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Registry
          </Button>
        )}
        <div className="flex-1">
          <h1 className="text-3xl font-bold">{audit.document_title}</h1>
          <p className="text-muted-foreground">
            Audit of {audit.entity_audited} • {audit.region} Region • FY {audit.fiscal_year}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Audit Overview */}
          <Card>
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="space-y-2">
                  <div className="flex flex-wrap items-center gap-2">
                    <Badge className={getSourceTypeColor(audit.source_type)}>
                      {audit.source_type.replace('_', ' ')}
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
                
                <div className="text-center">
                  <div className={`text-4xl font-bold ${getScoreColor(audit.audit_score)}`}>
                    {audit.audit_score}
                  </div>
                  <div className="text-sm text-muted-foreground">Audit Score</div>
                </div>
              </div>
            </CardHeader>

            <CardContent>
              <Tabs defaultValue="summary" className="space-y-4">
                <TabsList>
                  <TabsTrigger value="summary">Summary</TabsTrigger>
                  <TabsTrigger value="findings">Detailed Findings</TabsTrigger>
                  <TabsTrigger value="verification">Verification</TabsTrigger>
                </TabsList>

                <TabsContent value="summary" className="space-y-4">
                  <div>
                    <h3 className="font-semibold mb-2">Audit Summary</h3>
                    <p className="text-muted-foreground leading-relaxed">
                      {audit.audit_summary}
                    </p>
                  </div>

                  <div>
                    <h3 className="font-semibold mb-2">Tags</h3>
                    <div className="flex flex-wrap gap-2">
                      {audit.tags.map((tag, index) => (
                        <Badge key={index} variant="secondary">
                          #{tag}
                        </Badge>
                      ))
                      }
                    </div>
                  </div>
                </TabsContent>

                <TabsContent value="findings" className="space-y-4">
                  <div>
                    <h3 className="font-semibold mb-2">Detailed Findings & Recommendations</h3>
                    <pre className="whitespace-pre-wrap text-sm text-muted-foreground leading-relaxed">
                      {audit.detailed_findings}
                    </pre>
                  </div>
                </TabsContent>

                <TabsContent value="verification" className="space-y-4">
                  <Alert>
                    <CheckCircle className="h-4 w-4" />
                    <AlertDescription>
                      This document has been verified as authentic through official channels.
                    </AlertDescription>
                  </Alert>

                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="font-medium">Verified by:</span>
                      <span>{audit.verification_details.verified_by}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="font-medium">Verification date:</span>
                      <span>{audit.verification_details.verification_date}</span>
                    </div>
                    <div className="space-y-1">
                      <span className="font-medium">Notes:</span>
                      <p className="text-sm text-muted-foreground">
                        {audit.verification_details.verification_notes}
                      </p>
                    </div>
                  </div>
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>

          {/* Documents */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                Audit Documents
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {audit.documents.map((doc, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between p-3 border rounded-lg hover:bg-muted/50"
                  >
                    <div className="flex items-center gap-3">
                      <FileText className="h-5 w-5 text-muted-foreground" />
                      <div>
                        <p className="font-medium">{doc.name}</p>
                        <p className="text-sm text-muted-foreground">
                          {doc.type} • {doc.size} • {doc.downloads} downloads
                        </p>
                      </div>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDownload(doc.name)}
                    >
                      <Download className="h-4 w-4 mr-2" />
                      Download
                    </Button>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Comments */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MessageSquare className="h-5 w-5" />
                Public Comments
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Add Comment */}
              <div className="space-y-2">
                <Textarea
                  placeholder="Share your thoughts about this audit..."
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  rows={3}
                />
                <Button onClick={handleCommentSubmit} disabled={!newComment.trim()}>
                  Post Comment
                </Button>
              </div>

              {/* Existing Comments */}
              <div className="space-y-4">
                {audit.comments.map((comment) => (
                  <div key={comment.id} className="border-l-2 border-muted pl-4">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-medium">{comment.user}</span>
                      {comment.is_verified && (
                        <Badge variant="secondary" className="text-xs">
                          <CheckCircle className="h-3 w-3 mr-1" />
                          Verified
                        </Badge>
                      )}
                      <span className="text-sm text-muted-foreground">
                        {comment.timestamp}
                      </span>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {comment.comment}
                    </p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Actions */}
          <Card>
            <CardHeader>
              <CardTitle>Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Button className="w-full" onClick={() => handleDownload('all_documents.zip')}>
                <Download className="h-4 w-4 mr-2" />
                Download All Documents
              </Button>
              
              <Button 
                variant="outline" 
                className="w-full"
                onClick={handleBookmark}
              >
                <BookmarkPlus className="h-4 w-4 mr-2" />
                {isBookmarked ? 'Remove from Watchlist' : 'Add to Watchlist'}
              </Button>
              
              <Button variant="outline" className="w-full" onClick={handleShare}>
                <Share2 className="h-4 w-4 mr-2" />
                Share Audit
              </Button>
              
              <Button variant="outline" className="w-full" onClick={handleFlag}>
                <Flag className="h-4 w-4 mr-2" />
                Report Issue
              </Button>
            </CardContent>
          </Card>

          {/* Rating */}
          <Card>
            <CardHeader>
              <CardTitle>Rate This Audit</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <p className="text-sm text-muted-foreground">
                Was this audit helpful for understanding the issues?
              </p>
              <div className="flex gap-2">
                <Button
                  variant={userRating === 'up' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => handleRating('up')}
                  className="flex-1"
                >
                  <ThumbsUp className="h-4 w-4 mr-2" />
                  Helpful
                </Button>
                <Button
                  variant={userRating === 'down' ? 'destructive' : 'outline'}
                  size="sm"
                  onClick={() => handleRating('down')}
                  className="flex-1"
                >
                  <ThumbsDown className="h-4 w-4 mr-2" />
                  Not Helpful
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Statistics */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="h-5 w-5" />
                Statistics
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex justify-between">
                <span className="text-sm">Views</span>
                <span className="font-medium">{audit.view_count.toLocaleString()}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm">Downloads</span>
                <span className="font-medium">{audit.download_count}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm">Bookmarks</span>
                <span className="font-medium">{audit.bookmark_count}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm">Comments</span>
                <span className="font-medium">{audit.comments.length}</span>
              </div>
            </CardContent>
          </Card>

          {/* Related Audits */}
          <Card>
            <CardHeader>
              <CardTitle>Related Audits</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {audit.related_audits.map((related) => (
                <div key={related.id} className="p-3 border rounded-lg hover:bg-muted/50 cursor-pointer">
                  <h4 className="font-medium text-sm mb-1">{related.title}</h4>
                  <p className="text-xs text-muted-foreground mb-2">{related.entity}</p>
                  <div className="flex justify-between items-center">
                    <span className="text-xs text-muted-foreground">{related.date}</span>
                    <span className={`text-sm font-medium ${getScoreColor(related.score)}`}>
                      {related.score}
                    </span>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};
