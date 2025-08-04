import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.7.1'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
    )

    const { pollId, format, data, options } = await req.json()
    
    console.log(`Exporting poll analytics for poll ${pollId} in ${format} format`)

    // Validate request
    if (!pollId || !format || !data) {
      throw new Error('Missing required parameters: pollId, format, or data')
    }

    let exportData: string | Uint8Array
    let contentType: string
    let filename: string

    switch (format) {
      case 'csv':
        exportData = generateCSV(data)
        contentType = 'text/csv'
        filename = `poll-analytics-${pollId}.csv`
        break
        
      case 'json':
        exportData = JSON.stringify(data, null, 2)
        contentType = 'application/json'
        filename = `poll-analytics-${pollId}.json`
        break
        
      case 'pdf':
        exportData = await generatePDF(data, options)
        contentType = 'application/pdf'
        filename = `poll-analytics-${pollId}.pdf`
        break
        
      case 'excel':
        exportData = await generateExcel(data, options)
        contentType = 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
        filename = `poll-analytics-${pollId}.xlsx`
        break
        
      default:
        throw new Error(`Unsupported export format: ${format}`)
    }

    // Log the export event
    await supabase.from('poll_export_logs').insert({
      poll_id: pollId,
      export_format: format,
      exported_at: new Date().toISOString(),
      file_size_bytes: exportData instanceof Uint8Array ? exportData.length : new Blob([exportData]).size
    })

    return new Response(exportData, {
      headers: {
        ...corsHeaders,
        'Content-Type': contentType,
        'Content-Disposition': `attachment; filename="${filename}"`
      }
    })
  } catch (error) {
    console.error('Export error:', error)
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }, 
        status: 400 
      }
    )
  }
})

function generateCSV(data: any): string {
  const sections = []
  
  // Overview section
  sections.push('=== OVERVIEW ===')
  sections.push('Metric,Value')
  Object.entries(data.overview).forEach(([key, value]) => {
    sections.push(`${key},${value}`)
  })
  
  // Demographics section
  sections.push('\n=== REGIONAL DEMOGRAPHICS ===')
  sections.push('Region,Votes,Percentage,Growth')
  data.demographics.regions.forEach((region: any) => {
    sections.push(`${region.name},${region.votes},${region.percentage},${region.growth || 0}`)
  })
  
  // Age groups section
  sections.push('\n=== AGE DEMOGRAPHICS ===')
  sections.push('Age Group,Votes,Percentage')
  data.demographics.ageGroups?.forEach((group: any) => {
    sections.push(`${group.group},${group.votes},${group.percentage}`)
  })
  
  // Trends section
  sections.push('\n=== TRENDS ===')
  sections.push('Date,Votes,Views,Engagement,Completion Rate')
  data.trends.forEach((trend: any) => {
    sections.push(`${trend.date},${trend.votes},${trend.views},${trend.engagement || 0},${trend.completionRate || 0}`)
  })
  
  return sections.join('\n')
}

async function generatePDF(data: any, options: any): Promise<Uint8Array> {
  // Simple PDF generation (in a real implementation, you'd use a proper PDF library)
  const htmlContent = `
    <!DOCTYPE html>
    <html>
    <head>
      <title>Poll Analytics Report</title>
      <style>
        body { font-family: Arial, sans-serif; margin: 20px; }
        .header { text-align: center; margin-bottom: 30px; }
        .section { margin-bottom: 25px; }
        .metrics { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 15px; }
        .metric { padding: 15px; border: 1px solid #ddd; border-radius: 5px; }
        table { width: 100%; border-collapse: collapse; margin-top: 10px; }
        th, td { padding: 8px; text-align: left; border-bottom: 1px solid #ddd; }
        th { background-color: #f5f5f5; }
      </style>
    </head>
    <body>
      <div class="header">
        <h1>Poll Analytics Report</h1>
        <p>Generated on ${new Date().toLocaleDateString()}</p>
        <p>Poll ID: ${data.pollId}</p>
      </div>
      
      <div class="section">
        <h2>Overview Metrics</h2>
        <div class="metrics">
          <div class="metric">
            <h3>Total Votes</h3>
            <p>${data.overview.totalVotes}</p>
          </div>
          <div class="metric">
            <h3>Unique Voters</h3>
            <p>${data.overview.uniqueVoters}</p>
          </div>
          <div class="metric">
            <h3>View Count</h3>
            <p>${data.overview.viewCount}</p>
          </div>
          <div class="metric">
            <h3>Engagement Rate</h3>
            <p>${data.overview.engagementRate}%</p>
          </div>
        </div>
      </div>
      
      <div class="section">
        <h2>Regional Demographics</h2>
        <table>
          <thead>
            <tr><th>Region</th><th>Votes</th><th>Percentage</th><th>Growth</th></tr>
          </thead>
          <tbody>
            ${data.demographics.regions.map((region: any) => 
              `<tr><td>${region.name}</td><td>${region.votes}</td><td>${region.percentage}%</td><td>${region.growth || 0}%</td></tr>`
            ).join('')}
          </tbody>
        </table>
      </div>
      
      <div class="section">
        <h2>Performance Metrics</h2>
        <div class="metrics">
          <div class="metric">
            <h3>Response Time</h3>
            <p>${data.performance.responseTime}ms</p>
          </div>
          <div class="metric">
            <h3>Uptime</h3>
            <p>${data.performance.uptime}%</p>
          </div>
          <div class="metric">
            <h3>API Calls</h3>
            <p>${data.performance.apiCalls}</p>
          </div>
          <div class="metric">
            <h3>Fraud Risk</h3>
            <p>${data.performance.fraudRisk}%</p>
          </div>
        </div>
      </div>
    </body>
    </html>
  `
  
  // Convert HTML to PDF (simplified - in production use puppeteer or similar)
  const encoder = new TextEncoder()
  return encoder.encode(htmlContent)
}

async function generateExcel(data: any, options: any): Promise<Uint8Array> {
  // Simple Excel generation (in a real implementation, you'd use a proper Excel library)
  // For now, return CSV format as a fallback
  const csvData = generateCSV(data)
  const encoder = new TextEncoder()
  return encoder.encode(csvData)
}