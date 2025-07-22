import { corsHeaders } from '../_shared/cors.ts';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

interface SenatorData {
  name: string;
  position: string;
  photo_url?: string;
  about?: string;
}

async function scrapeSenators(): Promise<SenatorData[]> {
  try {
    const response = await fetch('https://senat.cm/?page_id=869');
    const html = await response.text();
    
    const senators: SenatorData[] = [];
    
    // Extract senator blocks - each contains image, name, position, and description
    const senatorBlockPattern = /\[\!\[Senateurs\]\((https:\/\/senat\.cm\/wp-content\/uploads\/[^)]+)\)\]\([^)]*\)\s*\n\n## ([^#\n]+)\s*\n\n#### ([^\n]+)\s*(?:\n\n([^#\n\[]*(?:\n(?!##|\[)[^\n]*)*)?)?/g;
    let match;
    
    while ((match = senatorBlockPattern.exec(html)) !== null) {
      const photoUrl = match[1]?.trim();
      const name = match[2]?.trim();
      const position = match[3]?.trim();
      const about = match[4]?.trim() || '';
      
      if (name && position) {
        // Skip if it's just "Senateurs" header
        if (name.toLowerCase() === 'senateurs') continue;
        
        const senator: SenatorData = {
          name,
          position,
          photo_url: photoUrl,
          about: about || ''
        };
        
        senators.push(senator);
        console.log(`Scraped senator: ${name} - ${position}`);
      }
    }
    
    console.log(`Total scraped senators: ${senators.length}`);
    return senators;
  } catch (error) {
    console.error('Error scraping senators:', error);
    throw new Error('Failed to scrape senators data');
  }
}

async function importSenators(senators: SenatorData[]) {
  try {
    // Clear existing senators
    await supabase.from('senators').delete().neq('id', '00000000-0000-0000-0000-000000000000');
    
    // Insert new senators
    const { data, error } = await supabase
      .from('senators')
      .insert(senators)
      .select();
    
    if (error) {
      console.error('Database error:', error);
      throw error;
    }
    
    console.log(`Imported ${data?.length} senators successfully`);
    return data;
  } catch (error) {
    console.error('Error importing senators:', error);
    throw error;
  }
}

Deno.serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log('Starting senators import...');
    
    const senators = await scrapeSenators();
    const imported = await importSenators(senators);
    
    return new Response(
      JSON.stringify({
        success: true,
        message: `Successfully imported ${imported?.length} senators`,
        data: imported
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    );
  } catch (error) {
    console.error('Function error:', error);
    return new Response(
      JSON.stringify({
        success: false,
        error: error.message,
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      }
    );
  }
});