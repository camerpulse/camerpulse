import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Progress } from "@/components/ui/progress";
import { useToast } from "@/hooks/use-toast";
import { 
  Download, 
  RefreshCcw, 
  CheckCircle, 
  XCircle, 
  AlertTriangle, 
  Users, 
  Database, 
  ExternalLink,
  Eye,
  RefreshCw,
  Building2,
  Star
} from "lucide-react";

interface MinatParty {
  name: string;
  acronym?: string;
  president?: string;
  email?: string;
  website?: string;
  founded?: string;
  region?: string;
  city?: string;
  description?: string;
  logoUrl?: string;
}

interface SyncStats {
  total: number;
  newParties: number;
  updatedParties: number;
  duplicatesFound: number;
  errors: number;
}

const PartyDirectorySync = () => {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [syncProgress, setSyncProgress] = useState(0);
  const [syncStats, setSyncStats] = useState<SyncStats>({
    total: 0,
    newParties: 0,
    updatedParties: 0,
    duplicatesFound: 0,
    errors: 0
  });
  const [currentParties, setCurrentParties] = useState<any[]>([]);
  const [scrapedParties, setScrapedParties] = useState<MinatParty[]>([]);
  const [syncLog, setSyncLog] = useState<string[]>([]);
  const [isPreviewMode, setIsPreviewMode] = useState(false);

  useEffect(() => {
    fetchCurrentParties();
  }, []);

  const fetchCurrentParties = async () => {
    try {
      const { data, error } = await supabase
        .from('political_parties')
        .select('*')
        .order('name');
      
      if (error) throw error;
      setCurrentParties(data || []);
    } catch (error) {
      console.error('Error fetching current parties:', error);
      toast({
        title: "Error fetching current parties",
        description: "Failed to load existing party data",
        variant: "destructive"
      });
    }
  };

  const scrapeMinatData = async () => {
    setSyncLog(prev => [...prev, "🔄 Starting MINAT website scraping..."]);
    
    try {
      // Call edge function to scrape MINAT data
      const { data, error } = await supabase.functions.invoke('minat-party-scraper', {
        body: { 
          startPage: 1,
          maxPages: 50, // Enough to get all 330 parties
          entriesPerPage: 100
        }
      });

      if (error) throw error;

      const parties: MinatParty[] = data.parties || [];
      setScrapedParties(parties);
      setSyncLog(prev => [...prev, `✅ Scraped ${parties.length} parties from MINAT`]);
      
      return parties;
    } catch (error) {
      setSyncLog(prev => [...prev, `❌ Failed to scrape MINAT: ${error.message}`]);
      throw error;
    }
  };

  const findDuplicates = (newParties: MinatParty[]) => {
    const duplicates: { existing: any, scraped: MinatParty }[] = [];
    
    newParties.forEach(scrapedParty => {
      const existingParty = currentParties.find(existing => 
        existing.name.toLowerCase() === scrapedParty.name.toLowerCase() ||
        (existing.acronym && scrapedParty.acronym && 
         existing.acronym.toLowerCase() === scrapedParty.acronym.toLowerCase()) ||
        (existing.contact_email && scrapedParty.email && 
         existing.contact_email.toLowerCase() === scrapedParty.email.toLowerCase())
      );
      
      if (existingParty) {
        duplicates.push({ existing: existingParty, scraped: scrapedParty });
      }
    });
    
    setSyncLog(prev => [...prev, `🔍 Found ${duplicates.length} potential duplicates`]);
    return duplicates;
  };

  const updateExistingParty = async (existing: any, scraped: MinatParty) => {
    const updates: any = {};
    
    // Update missing fields
    if (!existing.contact_email && scraped.email) updates.contact_email = scraped.email;
    if (!existing.official_website && scraped.website) updates.official_website = scraped.website;
    if (!existing.logo_url && scraped.logoUrl) updates.logo_url = scraped.logoUrl;
    if (!existing.party_president && scraped.president) updates.party_president = scraped.president;
    if (!existing.founding_date && scraped.founded) updates.founding_date = scraped.founded;
    if (!existing.headquarters_region && scraped.region) updates.headquarters_region = scraped.region;
    if (!existing.headquarters_city && scraped.city) updates.headquarters_city = scraped.city;
    if (!existing.mission_statement && scraped.description) updates.mission_statement = scraped.description;
    
    if (Object.keys(updates).length > 0) {
      const { error } = await supabase
        .from('political_parties')
        .update({
          ...updates,
          updated_at: new Date().toISOString()
        })
        .eq('id', existing.id);
        
      if (error) throw error;
      return true;
    }
    
    return false;
  };

  const createNewParty = async (party: MinatParty) => {
    const { error } = await supabase
      .from('political_parties')
      .insert({
        name: party.name,
        acronym: party.acronym || null,
        party_president: party.president || null,
        contact_email: party.email || null,
        official_website: party.website || null,
        founding_date: party.founded || null,
        headquarters_region: party.region || null,
        headquarters_city: party.city || null,
        mission_statement: party.description || null,
        logo_url: party.logoUrl || '/api/placeholder/100/100',
        auto_imported: true,
        is_active: true,
        is_claimable: true,
        is_claimed: false,
        approval_rating: 0,
        transparency_rating: 0,
        development_rating: 0,
        trust_rating: 0,
        total_ratings: 0,
        mps_count: 0,
        senators_count: 0,
        mayors_count: 0,
        promises_fulfilled: 0,
        promises_ongoing: 0,
        promises_failed: 0
      });
      
    if (error) throw error;
  };

  const syncParties = async (preview = false) => {
    setIsLoading(true);
    setIsPreviewMode(preview);
    setSyncProgress(0);
    setSyncLog([]);
    setSyncStats({
      total: 0,
      newParties: 0,
      updatedParties: 0,
      duplicatesFound: 0,
      errors: 0
    });

    try {
      // Step 1: Scrape MINAT data
      setSyncProgress(10);
      const scrapedParties = await scrapeMinatData();
      
      // Step 2: Find duplicates
      setSyncProgress(30);
      const duplicates = findDuplicates(scrapedParties);
      
      // Step 3: Process parties
      setSyncProgress(50);
      let newCount = 0;
      let updatedCount = 0;
      let errorCount = 0;
      
      const newParties = scrapedParties.filter(scraped => 
        !duplicates.some(dup => dup.scraped.name === scraped.name)
      );

      if (!preview) {
        // Update existing parties
        for (const duplicate of duplicates) {
          try {
            const wasUpdated = await updateExistingParty(duplicate.existing, duplicate.scraped);
            if (wasUpdated) {
              updatedCount++;
              setSyncLog(prev => [...prev, `🔄 Updated: ${duplicate.existing.name}`]);
            }
          } catch (error) {
            errorCount++;
            setSyncLog(prev => [...prev, `❌ Failed to update: ${duplicate.existing.name}`]);
          }
        }
        
        setSyncProgress(70);
        
        // Create new parties
        for (const party of newParties) {
          try {
            await createNewParty(party);
            newCount++;
            setSyncLog(prev => [...prev, `✅ Created: ${party.name}`]);
          } catch (error) {
            errorCount++;
            setSyncLog(prev => [...prev, `❌ Failed to create: ${party.name}`]);
          }
        }
      }
      
      setSyncProgress(100);
      
      const finalStats = {
        total: scrapedParties.length,
        newParties: preview ? newParties.length : newCount,
        updatedParties: preview ? duplicates.length : updatedCount,
        duplicatesFound: duplicates.length,
        errors: errorCount
      };
      
      setSyncStats(finalStats);
      
      if (preview) {
        setSyncLog(prev => [...prev, "📋 Preview completed - no changes made to database"]);
      } else {
        setSyncLog(prev => [...prev, "🎉 Sync completed successfully!"]);
        await fetchCurrentParties(); // Refresh current parties
      }
      
      toast({
        title: preview ? "Preview completed" : "Sync completed",
        description: `${finalStats.newParties} new parties, ${finalStats.updatedParties} updated`,
      });
      
    } catch (error) {
      setSyncLog(prev => [...prev, `❌ Sync failed: ${error.message}`]);
      toast({
        title: "Sync failed",
        description: error.message,
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-primary flex items-center gap-2">
            <Building2 className="h-6 w-6" />
            Party Directory Sync
          </h2>
          <p className="text-muted-foreground">
            Sync political party data from MINAT official registry
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            onClick={() => syncParties(true)}
            disabled={isLoading}
            variant="outline"
            className="gap-2"
          >
            <Eye className="h-4 w-4" />
            Preview Sync
          </Button>
          <Button
            onClick={() => syncParties(false)}
            disabled={isLoading}
            className="gap-2"
          >
            <RefreshCcw className="h-4 w-4" />
            {isLoading ? "Syncing..." : "Start Sync"}
          </Button>
        </div>
      </div>

      {/* Current Status */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Current Parties</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <Database className="h-4 w-4 text-primary" />
              <span className="text-2xl font-bold">{currentParties.length}</span>
            </div>
            <p className="text-xs text-muted-foreground">In database</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Target Count</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <ExternalLink className="h-4 w-4 text-primary" />
              <span className="text-2xl font-bold">330</span>
            </div>
            <p className="text-xs text-muted-foreground">MINAT registry</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Auto-imported</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <RefreshCw className="h-4 w-4 text-primary" />
              <span className="text-2xl font-bold">
                {currentParties.filter(p => p.auto_imported).length}
              </span>
            </div>
            <p className="text-xs text-muted-foreground">Automated entries</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">With Ratings</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <Star className="h-4 w-4 text-primary" />
              <span className="text-2xl font-bold">
                {currentParties.filter(p => p.total_ratings > 0).length}
              </span>
            </div>
            <p className="text-xs text-muted-foreground">Citizen rated</p>
          </CardContent>
        </Card>
      </div>

      {/* Progress */}
      {isLoading && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <RefreshCw className="h-5 w-5 animate-spin" />
              {isPreviewMode ? "Preview" : "Sync"} in Progress
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Progress value={syncProgress} className="mb-2" />
            <p className="text-sm text-muted-foreground">
              {syncProgress}% complete
            </p>
          </CardContent>
        </Card>
      )}

      {/* Sync Statistics */}
      {(syncStats.total > 0 || isLoading) && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              Sync Statistics
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-primary">{syncStats.total}</div>
                <p className="text-sm text-muted-foreground">Scraped</p>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">{syncStats.newParties}</div>
                <p className="text-sm text-muted-foreground">New</p>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">{syncStats.updatedParties}</div>
                <p className="text-sm text-muted-foreground">Updated</p>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-yellow-600">{syncStats.duplicatesFound}</div>
                <p className="text-sm text-muted-foreground">Duplicates</p>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-red-600">{syncStats.errors}</div>
                <p className="text-sm text-muted-foreground">Errors</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Sync Log */}
      {syncLog.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Sync Log</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-1 max-h-64 overflow-y-auto bg-muted p-3 rounded-md">
              {syncLog.map((log, index) => (
                <div key={index} className="text-sm font-mono">
                  {log}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Information Alert */}
      <Alert>
        <AlertTriangle className="h-4 w-4" />
        <AlertDescription>
          This sync will connect to the official MINAT website (minat.gov.cm) to retrieve 
          the complete list of 330 registered political parties. The process will:
          <ul className="list-disc list-inside mt-2 space-y-1">
            <li>Scrape party names, presidents, contact info, and founding dates</li>
            <li>Match existing parties to avoid duplicates</li>
            <li>Update missing information for existing parties</li>
            <li>Create new party entries with rating support</li>
            <li>Link politicians to their respective parties</li>
          </ul>
        </AlertDescription>
      </Alert>
    </div>
  );
};

export default PartyDirectorySync;