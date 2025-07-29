import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  TrendingUp, 
  TrendingDown, 
  Minus,
  Calendar,
  Download,
  BarChart3
} from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Area, AreaChart } from 'recharts';
import { supabase } from '@/integrations/supabase/client';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';

interface TimelineData {
  month: string;
  overall_score: number;
  transparency_score: number;
  citizen_satisfaction: number;
  votes_count: number;
  reports_count: number;
}

interface VillageReputationTimelineProps {
  villageId: string;
  villageName: string;
}

export function VillageReputationTimeline({ villageId, villageName }: VillageReputationTimelineProps) {
  const [timelineData, setTimelineData] = useState<TimelineData[]>([]);
  const [loading, setLoading] = useState(true);
  const [trend, setTrend] = useState<'up' | 'down' | 'stable'>('stable');

  useEffect(() => {
    loadTimelineData();
  }, [villageId]);

  const loadTimelineData = async () => {
    try {
      // Get last 12 months of data
      const startDate = new Date();
      startDate.setMonth(startDate.getMonth() - 11);
      const endDate = new Date();

      const months = [];
      for (let d = new Date(startDate); d <= endDate; d.setMonth(d.getMonth() + 1)) {
        months.push(d.toISOString().slice(0, 7) + '-01');
      }

      const timelinePromises = months.map(async (month) => {
        // Get votes for this month
        const { data: votes } = await supabase
          .from('village_monthly_votes')
          .select('overall_satisfaction_rating')
          .eq('village_id', villageId)
          .eq('vote_month', month);

        // Get corruption reports for this month
        const { data: reports } = await supabase
          .from('village_corruption_reports')
          .select('id')
          .eq('village_id', villageId)
          .gte('created_at', month)
          .lt('created_at', new Date(new Date(month).getTime() + 30 * 24 * 60 * 60 * 1000).toISOString());

        // Calculate scores
        const votesCount = votes?.length || 0;
        const avgSatisfaction = votes?.length ? 
          votes.reduce((sum, v) => sum + (v.overall_satisfaction_rating || 0), 0) / votes.length * 20 : 0;

        return {
          month: month.slice(0, 7),
          overall_score: Math.max(0, avgSatisfaction - (reports?.length || 0) * 5),
          transparency_score: Math.max(0, 100 - (reports?.length || 0) * 10),
          citizen_satisfaction: avgSatisfaction,
          votes_count: votesCount,
          reports_count: reports?.length || 0
        };
      });

      const results = await Promise.all(timelinePromises);
      setTimelineData(results);

      // Determine trend
      if (results.length >= 2) {
        const recent = results.slice(-3).reduce((sum, d) => sum + d.overall_score, 0) / 3;
        const earlier = results.slice(0, 3).reduce((sum, d) => sum + d.overall_score, 0) / 3;
        const difference = recent - earlier;
        
        if (difference > 5) setTrend('up');
        else if (difference < -5) setTrend('down');
        else setTrend('stable');
      }
    } catch (error) {
      console.error('Error loading timeline data:', error);
    } finally {
      setLoading(false);
    }
  };

  const generatePDFReport = async () => {
    try {
      const element = document.getElementById('reputation-timeline');
      if (!element) return;

      const canvas = await html2canvas(element, {
        scale: 2,
        useCORS: true,
        backgroundColor: '#ffffff'
      });

      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF();
      
      // Add title
      pdf.setFontSize(20);
      pdf.text(`${villageName} - Reputation Report`, 20, 30);
      
      // Add date
      pdf.setFontSize(12);
      pdf.text(`Generated: ${new Date().toLocaleDateString()}`, 20, 45);
      
      // Add chart
      const imgWidth = 170;
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      pdf.addImage(imgData, 'PNG', 20, 60, imgWidth, imgHeight);
      
      // Add summary
      pdf.setFontSize(14);
      pdf.text('Summary:', 20, imgHeight + 80);
      
      const latestData = timelineData[timelineData.length - 1];
      if (latestData) {
        pdf.setFontSize(10);
        pdf.text(`Current Overall Score: ${latestData.overall_score.toFixed(1)}%`, 25, imgHeight + 95);
        pdf.text(`Transparency Score: ${latestData.transparency_score.toFixed(1)}%`, 25, imgHeight + 105);
        pdf.text(`Citizen Satisfaction: ${latestData.citizen_satisfaction.toFixed(1)}%`, 25, imgHeight + 115);
        pdf.text(`Total Votes This Month: ${latestData.votes_count}`, 25, imgHeight + 125);
        pdf.text(`Corruption Reports: ${latestData.reports_count}`, 25, imgHeight + 135);
      }
      
      pdf.save(`${villageName}-reputation-report.pdf`);
    } catch (error) {
      console.error('Error generating PDF:', error);
    }
  };

  const getTrendIcon = () => {
    switch (trend) {
      case 'up': return <TrendingUp className="h-4 w-4 text-green-600" />;
      case 'down': return <TrendingDown className="h-4 w-4 text-red-600" />;
      default: return <Minus className="h-4 w-4 text-gray-600" />;
    }
  };

  const getTrendColor = () => {
    switch (trend) {
      case 'up': return 'text-green-600';
      case 'down': return 'text-red-600';
      default: return 'text-gray-600';
    }
  };

  const formatMonth = (month: string) => {
    const date = new Date(month + '-01');
    return date.toLocaleDateString('en-US', { month: 'short', year: '2-digit' });
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Reputation Timeline</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-80 bg-muted animate-pulse rounded"></div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card id="reputation-timeline">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5" />
            Reputation Timeline (12 months)
          </CardTitle>
          <div className="flex items-center gap-4">
            <div className={`flex items-center gap-1 ${getTrendColor()}`}>
              {getTrendIcon()}
              <span className="text-sm font-medium">
                {trend === 'up' ? 'Improving' : trend === 'down' ? 'Declining' : 'Stable'}
              </span>
            </div>
            <Button onClick={generatePDFReport} variant="outline" size="sm">
              <Download className="h-4 w-4 mr-2" />
              Export PDF
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          {/* Main Chart */}
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={timelineData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis 
                  dataKey="month" 
                  tickFormatter={formatMonth}
                  tick={{ fontSize: 12 }}
                />
                <YAxis 
                  domain={[0, 100]}
                  tick={{ fontSize: 12 }}
                  label={{ value: 'Score (%)', angle: -90, position: 'insideLeft' }}
                />
                <Tooltip 
                  formatter={(value: number, name: string) => [
                    `${value.toFixed(1)}%`,
                    name.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())
                  ]}
                  labelFormatter={(label) => formatMonth(label)}
                />
                <Area
                  type="monotone"
                  dataKey="overall_score"
                  stroke="#3b82f6"
                  fill="#3b82f6"
                  fillOpacity={0.2}
                  name="Overall Score"
                />
                <Line
                  type="monotone"
                  dataKey="transparency_score"
                  stroke="#10b981"
                  strokeWidth={2}
                  name="Transparency"
                />
                <Line
                  type="monotone"
                  dataKey="citizen_satisfaction"
                  stroke="#f59e0b"
                  strokeWidth={2}
                  name="Citizen Satisfaction"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>

          {/* Key Metrics */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center p-4 bg-muted/50 rounded-lg">
              <div className="text-2xl font-bold text-blue-600">
                {timelineData[timelineData.length - 1]?.overall_score?.toFixed(1) || '0'}%
              </div>
              <div className="text-sm text-muted-foreground">Overall Score</div>
            </div>
            <div className="text-center p-4 bg-muted/50 rounded-lg">
              <div className="text-2xl font-bold text-green-600">
                {timelineData[timelineData.length - 1]?.transparency_score?.toFixed(1) || '0'}%
              </div>
              <div className="text-sm text-muted-foreground">Transparency</div>
            </div>
            <div className="text-center p-4 bg-muted/50 rounded-lg">
              <div className="text-2xl font-bold text-yellow-600">
                {timelineData[timelineData.length - 1]?.citizen_satisfaction?.toFixed(1) || '0'}%
              </div>
              <div className="text-sm text-muted-foreground">Satisfaction</div>
            </div>
            <div className="text-center p-4 bg-muted/50 rounded-lg">
              <div className="text-2xl font-bold text-purple-600">
                {timelineData.reduce((sum, d) => sum + d.votes_count, 0)}
              </div>
              <div className="text-sm text-muted-foreground">Total Votes</div>
            </div>
          </div>

          {/* Recent Activity */}
          <div className="border-t pt-4">
            <h4 className="font-semibold mb-3 flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              Recent Activity
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {timelineData.slice(-3).reverse().map((data, index) => (
                <div key={data.month} className="p-3 border rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <div className="font-medium">{formatMonth(data.month)}</div>
                    <Badge variant={index === 0 ? 'default' : 'secondary'}>
                      {index === 0 ? 'Latest' : `${index + 1} month ago`}
                    </Badge>
                  </div>
                  <div className="space-y-1 text-sm">
                    <div className="flex justify-between">
                      <span>Score:</span>
                      <span className="font-medium">{data.overall_score.toFixed(1)}%</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Votes:</span>
                      <span className="font-medium">{data.votes_count}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Reports:</span>
                      <span className={`font-medium ${data.reports_count > 0 ? 'text-red-600' : 'text-green-600'}`}>
                        {data.reports_count}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}