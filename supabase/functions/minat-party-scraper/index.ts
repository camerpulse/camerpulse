import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

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

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { startPage = 1, maxPages = 50, entriesPerPage = 100 } = await req.json();
    
    console.log(`Starting MINAT scraper: pages ${startPage}-${maxPages}, ${entriesPerPage} entries per page`);
    
    const allParties: MinatParty[] = [];
    let currentPage = startPage;
    let hasMorePages = true;
    
    while (currentPage <= maxPages && hasMorePages) {
      try {
        console.log(`Scraping page ${currentPage}...`);
        
        // Construct MINAT URL with pagination
        const minatUrl = `https://minat.gov.cm/annuaires/partis-politiques/?per_page=${entriesPerPage}&page=${currentPage}`;
        
        // Fetch the page
        const response = await fetch(minatUrl, {
          headers: {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
            'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
            'Accept-Language': 'en-US,en;q=0.5',
            'Accept-Encoding': 'gzip, deflate, br',
            'Connection': 'keep-alive',
            'Upgrade-Insecure-Requests': '1'
          }
        });
        
        if (!response.ok) {
          console.error(`Failed to fetch page ${currentPage}: ${response.status}`);
          break;
        }
        
        const html = await response.text();
        
        // Parse party entries from the HTML
        const parties = parseMinatHTML(html);
        
        if (parties.length === 0) {
          console.log(`No parties found on page ${currentPage}, stopping`);
          hasMorePages = false;
          break;
        }
        
        allParties.push(...parties);
        console.log(`Found ${parties.length} parties on page ${currentPage}`);
        
        currentPage++;
        
        // Add a small delay to be respectful
        await new Promise(resolve => setTimeout(resolve, 1000));
        
      } catch (error) {
        console.error(`Error scraping page ${currentPage}:`, error);
        break;
      }
    }
    
    console.log(`Scraping completed. Total parties found: ${allParties.length}`);
    
    return new Response(
      JSON.stringify({ 
        parties: allParties,
        totalFound: allParties.length,
        pagesScraped: currentPage - startPage
      }),
      { 
        headers: { 
          ...corsHeaders, 
          'Content-Type': 'application/json' 
        } 
      }
    );
    
  } catch (error) {
    console.error('MINAT scraper error:', error);
    return new Response(
      JSON.stringify({ 
        error: 'Failed to scrape MINAT data',
        details: error.message,
        parties: []
      }),
      { 
        status: 500,
        headers: { 
          ...corsHeaders, 
          'Content-Type': 'application/json' 
        } 
      }
    );
  }
});

function parseMinatHTML(html: string): MinatParty[] {
  const parties: MinatParty[] = [];
  
  try {
    // Remove all script and style tags to clean up HTML
    const cleanHtml = html
      .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, '')
      .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, '');
    
    // Look for party entries in table rows or div containers
    // MINAT typically displays parties in a structured format
    
    // Pattern 1: Look for table rows with party data
    const tableRowPattern = /<tr[^>]*>([\s\S]*?)<\/tr>/gi;
    let match;
    
    while ((match = tableRowPattern.exec(cleanHtml)) !== null) {
      const rowHtml = match[1];
      const party = extractPartyFromRow(rowHtml);
      if (party && party.name) {
        parties.push(party);
      }
    }
    
    // Pattern 2: Look for div containers with party data if no table rows found
    if (parties.length === 0) {
      const divPattern = /<div[^>]*class[^>]*parti[^>]*>([\s\S]*?)<\/div>/gi;
      
      while ((match = divPattern.exec(cleanHtml)) !== null) {
        const divHtml = match[1];
        const party = extractPartyFromDiv(divHtml);
        if (party && party.name) {
          parties.push(party);
        }
      }
    }
    
    // Pattern 3: Look for specific MINAT directory structure
    if (parties.length === 0) {
      const entryPattern = /<(?:div|td|li)[^>]*>([\s\S]*?)(?:Président|President|Fondé|Founded|Contact)([\s\S]*?)<\/(?:div|td|li)>/gi;
      
      while ((match = entryPattern.exec(cleanHtml)) !== null) {
        const entryHtml = match[0];
        const party = extractPartyFromEntry(entryHtml);
        if (party && party.name) {
          parties.push(party);
        }
      }
    }
    
  } catch (error) {
    console.error('Error parsing HTML:', error);
  }
  
  return parties;
}

function extractPartyFromRow(rowHtml: string): MinatParty | null {
  try {
    // Extract text content from table cells
    const cells = rowHtml.match(/<td[^>]*>([\s\S]*?)<\/td>/gi) || [];
    
    if (cells.length < 2) return null;
    
    const name = extractTextContent(cells[0] || '').trim();
    const president = extractTextContent(cells[1] || '').trim();
    
    if (!name) return null;
    
    // Try to extract acronym from parentheses
    const acronymMatch = name.match(/\(([A-Z]{2,8})\)/);
    const cleanName = name.replace(/\([A-Z]{2,8}\)/, '').trim();
    
    const party: MinatParty = {
      name: cleanName || name,
      acronym: acronymMatch ? acronymMatch[1] : undefined,
      president: president || undefined
    };
    
    // Look for additional info in remaining cells
    if (cells[2]) {
      const contact = extractTextContent(cells[2]);
      const emailMatch = contact.match(/([a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,})/);
      if (emailMatch) party.email = emailMatch[1];
    }
    
    return party;
    
  } catch (error) {
    console.error('Error extracting party from row:', error);
    return null;
  }
}

function extractPartyFromDiv(divHtml: string): MinatParty | null {
  try {
    const textContent = extractTextContent(divHtml);
    const lines = textContent.split('\n').map(line => line.trim()).filter(line => line);
    
    if (lines.length === 0) return null;
    
    const name = lines[0];
    if (!name) return null;
    
    const party: MinatParty = { name };
    
    // Look for president information
    const presidentLine = lines.find(line => 
      line.toLowerCase().includes('président') || 
      line.toLowerCase().includes('president')
    );
    if (presidentLine) {
      party.president = presidentLine.replace(/président[e]?[:\s]*/i, '').trim();
    }
    
    // Look for email
    const emailMatch = textContent.match(/([a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,})/);
    if (emailMatch) party.email = emailMatch[1];
    
    return party;
    
  } catch (error) {
    console.error('Error extracting party from div:', error);
    return null;
  }
}

function extractPartyFromEntry(entryHtml: string): MinatParty | null {
  try {
    const textContent = extractTextContent(entryHtml);
    
    // Look for party name (usually the first significant text)
    const nameMatch = textContent.match(/^([A-Z][A-Za-z\s\-]{5,})/);
    if (!nameMatch) return null;
    
    const name = nameMatch[1].trim();
    const party: MinatParty = { name };
    
    // Extract president
    const presidentMatch = textContent.match(/(?:Président|President)[e]?[:\s]*([A-Za-z\s\-\.]{3,})/i);
    if (presidentMatch) {
      party.president = presidentMatch[1].trim();
    }
    
    // Extract founding date
    const foundedMatch = textContent.match(/(?:Fondé|Founded)[e]?[:\s]*(\d{1,2}\/\d{1,2}\/\d{4}|\d{4})/i);
    if (foundedMatch) {
      party.founded = foundedMatch[1];
    }
    
    // Extract email
    const emailMatch = textContent.match(/([a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,})/);
    if (emailMatch) {
      party.email = emailMatch[1];
    }
    
    return party;
    
  } catch (error) {
    console.error('Error extracting party from entry:', error);
    return null;
  }
}

function extractTextContent(html: string): string {
  // Remove HTML tags and decode entities
  return html
    .replace(/<[^>]+>/g, ' ')
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/\s+/g, ' ')
    .trim();
}