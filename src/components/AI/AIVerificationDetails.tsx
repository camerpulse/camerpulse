import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ExternalLink, RefreshCw, Shield, AlertTriangle } from "lucide-react";
import { VerificationBadge } from "./VerificationBadge";

interface Source {
  url: string;
  title?: string;
  verified_at?: string;
  checked_at?: string;
}

interface AIVerificationDetailsProps {
  status: "verified" | "unverified" | "disputed" | "pending";
  score?: number;
  lastVerified?: string;
  sourcesCount: number;
  sources?: Source[];
  outdatedFields?: string[];
  disputedFields?: string[];
  onRequestRescan?: () => void;
}

export const AIVerificationDetails = ({
  status,
  score,
  lastVerified,
  sourcesCount,
  sources = [],
  outdatedFields = [],
  disputedFields = [],
  onRequestRescan
}: AIVerificationDetailsProps) => {
  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Shield className="w-5 h-5" />
              Politica AI Verification
            </CardTitle>
            <CardDescription>
              Automated fact-checking and verification status
            </CardDescription>
          </div>
          <VerificationBadge 
            status={status} 
            score={score}
            lastVerified={lastVerified} 
          />
        </div>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {/* Verification Stats */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <p className="text-sm font-medium">Sources Verified</p>
            <p className="text-2xl font-bold">{sourcesCount}</p>
          </div>
          {score && (
            <div>
              <p className="text-sm font-medium">Confidence Score</p>
              <p className="text-2xl font-bold">{Math.round(score * 100)}%</p>
            </div>
          )}
        </div>

        {/* Last Verified */}
        {lastVerified && (
          <div>
            <p className="text-sm font-medium mb-1">Last Verified</p>
            <p className="text-sm text-muted-foreground">
              {new Date(lastVerified).toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
              })}
            </p>
          </div>
        )}

        {/* Issues */}
        {(outdatedFields.length > 0 || disputedFields.length > 0) && (
          <div className="space-y-2">
            {outdatedFields.length > 0 && (
              <div>
                <p className="text-sm font-medium mb-2 flex items-center gap-1">
                  <AlertTriangle className="w-4 h-4 text-yellow-600" />
                  Outdated Fields
                </p>
                <div className="flex flex-wrap gap-1">
                  {outdatedFields.map((field) => (
                    <Badge key={field} variant="secondary" className="text-xs">
                      {field}
                    </Badge>
                  ))}
                </div>
              </div>
            )}
            
            {disputedFields.length > 0 && (
              <div>
                <p className="text-sm font-medium mb-2 flex items-center gap-1">
                  <AlertTriangle className="w-4 h-4 text-red-600" />
                  Disputed Fields
                </p>
                <div className="flex flex-wrap gap-1">
                  {disputedFields.map((field) => (
                    <Badge key={field} variant="destructive" className="text-xs">
                      {field}
                    </Badge>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Sources */}
        {sources.length > 0 && (
          <div>
            <p className="text-sm font-medium mb-2">Verified Sources</p>
            <div className="space-y-2 max-h-32 overflow-y-auto">
              {sources.map((source, index) => (
                <div key={index} className="flex items-center justify-between text-xs p-2 bg-muted rounded">
                  <span className="truncate flex-1">{source.title || source.url}</span>
                  <Button variant="ghost" size="sm" asChild>
                    <a href={source.url} target="_blank" rel="noopener noreferrer">
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  </Button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Actions */}
        <div className="flex gap-2 pt-2">
          {onRequestRescan && (
            <Button variant="outline" size="sm" onClick={onRequestRescan}>
              <RefreshCw className="w-4 h-4 mr-2" />
              Request Re-scan
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
};