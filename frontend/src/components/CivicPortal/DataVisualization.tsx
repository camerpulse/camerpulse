import React, { useRef } from 'react';
import { 
  LineChart, 
  Line, 
  AreaChart, 
  Area, 
  BarChart, 
  Bar, 
  PieChart, 
  Pie, 
  Cell, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar
} from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Download, FileImage, FileText } from 'lucide-react';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import { useToast } from '@/hooks/use-toast';

interface DataVisualizationProps {
  sentimentData?: Array<{ date: string; sentiment: number; volume: number; }>;
  regionalData?: Array<{ region: string; sentiment: number; population: number; }>;
  politicalData?: Array<{ party: string; approval: number; seats: number; }>;
  trendingTopics?: Array<{ topic: string; volume: number; sentiment: number; }>;
  emotionData?: Array<{ emotion: string; value: number; }>;
}

export const DataVisualization: React.FC<DataVisualizationProps> = ({
  sentimentData = [],
  regionalData = [],
  politicalData = [],
  trendingTopics = [],
  emotionData = []
}) => {
  const chartRefs = {
    sentiment: useRef<HTMLDivElement>(null),
    regional: useRef<HTMLDivElement>(null),
    political: useRef<HTMLDivElement>(null),
    trending: useRef<HTMLDivElement>(null),
    emotion: useRef<HTMLDivElement>(null),
  };

  const { toast } = useToast();

  // Color schemes
  const colors = {
    primary: '#22c55e',
    secondary: '#ef4444', 
    accent: '#f59e0b',
    muted: '#6b7280',
    gradient: ['#22c55e', '#16a34a', '#15803d', '#166534']
  };

  const RADIAN = Math.PI / 180;
  const renderCustomizedLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent }: any) => {
    const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
    const x = cx + radius * Math.cos(-midAngle * RADIAN);
    const y = cy + radius * Math.sin(-midAngle * RADIAN);

    return (
      <text x={x} y={y} fill="white" textAnchor={x > cx ? 'start' : 'end'} dominantBaseline="central">
        {`${(percent * 100).toFixed(0)}%`}
      </text>
    );
  };

  const exportChart = async (chartRef: React.RefObject<HTMLDivElement>, filename: string, format: 'png' | 'pdf') => {
    if (!chartRef.current) return;

    try {
      const canvas = await html2canvas(chartRef.current, {
        backgroundColor: '#ffffff',
        scale: 2,
        logging: false,
      });

      if (format === 'png') {
        const link = document.createElement('a');
        link.download = `${filename}.png`;
        link.href = canvas.toDataURL();
        link.click();
      } else if (format === 'pdf') {
        const pdf = new jsPDF('l', 'mm', 'a4');
        const imgData = canvas.toDataURL('image/png');
        const imgWidth = 280;
        const imgHeight = (canvas.height * imgWidth) / canvas.width;
        
        pdf.addImage(imgData, 'PNG', 10, 10, imgWidth, imgHeight);
        pdf.save(`${filename}.pdf`);
      }

      toast({
        title: "Export Successful",
        description: `Chart exported as ${format.toUpperCase()}`,
      });
    } catch (error) {
      console.error('Export failed:', error);
      toast({
        title: "Export Failed",
        description: "Failed to export chart. Please try again.",
        variant: "destructive",
      });
    }
  };

  const ExportButtons = ({ chartKey, title }: { chartKey: keyof typeof chartRefs; title: string }) => (
    <div className="flex space-x-2">
      <Button
        variant="outline"
        size="sm"
        onClick={() => exportChart(chartRefs[chartKey], title, 'png')}
        className="flex items-center space-x-1"
      >
        <FileImage className="h-4 w-4" />
        <span>PNG</span>
      </Button>
      <Button
        variant="outline"
        size="sm"
        onClick={() => exportChart(chartRefs[chartKey], title, 'pdf')}
        className="flex items-center space-x-1"
      >
        <FileText className="h-4 w-4" />
        <span>PDF</span>
      </Button>
    </div>
  );

  return (
    <div className="space-y-6">
      {/* Sentiment Trend Line Chart */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>National Sentiment Trends</CardTitle>
          <ExportButtons chartKey="sentiment" title="sentiment-trends" />
        </CardHeader>
        <CardContent>
          <div ref={chartRefs.sentiment} className="w-full">
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart data={sentimentData}>
                <defs>
                  <linearGradient id="sentimentGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor={colors.primary} stopOpacity={0.8}/>
                    <stop offset="95%" stopColor={colors.primary} stopOpacity={0.1}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis domain={[-1, 1]} />
                <Tooltip />
                <Legend />
                <Area 
                  type="monotone" 
                  dataKey="sentiment" 
                  stroke={colors.primary}
                  fillOpacity={1}
                  fill="url(#sentimentGradient)"
                  name="Sentiment Score"
                />
                <Line 
                  type="monotone" 
                  dataKey="volume" 
                  stroke={colors.accent}
                  name="Volume"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      {/* Regional Sentiment Heatmap */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Regional Sentiment Analysis</CardTitle>
          <ExportButtons chartKey="regional" title="regional-sentiment" />
        </CardHeader>
        <CardContent>
          <div ref={chartRefs.regional} className="w-full">
            <ResponsiveContainer width="100%" height={400}>
              <BarChart data={regionalData} layout="horizontal">
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis type="number" domain={[-1, 1]} />
                <YAxis dataKey="region" type="category" width={80} />
                <Tooltip />
                <Legend />
                <Bar 
                  dataKey="sentiment" 
                  fill={colors.primary}
                  name="Sentiment Score"
                  radius={[0, 4, 4, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      {/* Political Party Performance */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Political Party Approval Ratings</CardTitle>
          <ExportButtons chartKey="political" title="political-approval" />
        </CardHeader>
        <CardContent>
          <div ref={chartRefs.political} className="w-full">
            <ResponsiveContainer width="100%" height={350}>
              <BarChart data={politicalData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="party" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar 
                  dataKey="approval" 
                  fill={colors.primary}
                  name="Approval Rating (%)"
                  radius={[4, 4, 0, 0]}
                />
                <Bar 
                  dataKey="seats" 
                  fill={colors.accent}
                  name="Seats Won"
                  radius={[4, 4, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Trending Topics Bubble Chart */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Trending Topics</CardTitle>
            <ExportButtons chartKey="trending" title="trending-topics" />
          </CardHeader>
          <CardContent>
            <div ref={chartRefs.trending} className="w-full">
              <ResponsiveContainer width="100%" height={300}>
                <AreaChart data={trendingTopics}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="topic" />
                  <YAxis />
                  <Tooltip />
                  <Area 
                    type="monotone" 
                    dataKey="volume" 
                    stroke={colors.secondary}
                    fill={colors.secondary}
                    fillOpacity={0.6}
                    name="Discussion Volume"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Emotion Radar Chart */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Emotional Analysis</CardTitle>
            <ExportButtons chartKey="emotion" title="emotion-analysis" />
          </CardHeader>
          <CardContent>
            <div ref={chartRefs.emotion} className="w-full">
              <ResponsiveContainer width="100%" height={300}>
                <RadarChart data={emotionData}>
                  <PolarGrid />
                  <PolarAngleAxis dataKey="emotion" />
                  <PolarRadiusAxis angle={60} domain={[0, 100]} />
                  <Radar
                    name="Emotion Intensity"
                    dataKey="value"
                    stroke={colors.primary}
                    fill={colors.primary}
                    fillOpacity={0.3}
                    strokeWidth={2}
                  />
                  <Tooltip />
                </RadarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Export All Button */}
      <div className="flex justify-center">
        <Button
          onClick={async () => {
            for (const [key, title] of Object.entries({
              sentiment: 'sentiment-trends',
              regional: 'regional-sentiment',
              political: 'political-approval',
              trending: 'trending-topics',
              emotion: 'emotion-analysis'
            })) {
              await exportChart(chartRefs[key as keyof typeof chartRefs], title, 'pdf');
              await new Promise(resolve => setTimeout(resolve, 1000)); // Delay between exports
            }
          }}
          className="flex items-center space-x-2"
        >
          <Download className="h-4 w-4" />
          <span>Export All Charts</span>
        </Button>
      </div>
    </div>
  );
};