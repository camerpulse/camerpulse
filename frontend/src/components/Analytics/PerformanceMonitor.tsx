import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useAnalytics } from '@/hooks/useAnalytics';
import { DatePickerWithRange } from '@/components/ui/date-range-picker';
import { DateRange } from 'react-day-picker';
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, AreaChart, Area } from 'recharts';
import { Activity, Zap, Clock, TrendingUp, RefreshCw, AlertTriangle } from 'lucide-react';
import { addDays, format } from 'date-fns';
import { supabase } from '@/integrations/supabase/client';
import { Badge } from '@/components/ui/badge';

interface PerformanceMetric {
  id: string;
  metric_name: string;
  metric_category: string;
  metric_value: number;
  metric_unit: string;
  dimensions: any;
  timestamp: string;
}

export const PerformanceMonitor: React.FC = () => {
  const { trackPerformance } = useAnalytics();
  const [metrics, setMetrics] = useState<PerformanceMetric[]>([]);
  const [loading, setLoading] = useState(false);
  const [dateRange, setDateRange] = useState<DateRange | undefined>({
    from: addDays(new Date(), -7),
    to: new Date()
  });

  const fetchMetrics = async () => {
    if (!dateRange?.from || !dateRange?.to) return;

    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('performance_metrics')
        .select('*')
        .gte('timestamp', dateRange.from.toISOString())
        .lte('timestamp', dateRange.to.toISOString())
        .order('timestamp', { ascending: false })
        .limit(1000);

      if (error) throw error;
      setMetrics(data || []);
    } catch (error) {
      console.error('Error fetching performance metrics:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMetrics();
  }, [dateRange]);

  const trackCurrentPerformance = async () => {
    // Track current page performance
    if ('performance' in window) {
      const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
      
      if (navigation) {
        await trackPerformance({
          metric_name: 'page_load_time',
          metric_category: 'page_load',
          metric_value: navigation.loadEventEnd - navigation.fetchStart,
          metric_unit: 'ms',
          dimensions: {
            page: window.location.pathname,
            connection_type: (navigator as any).connection?.effectiveType || 'unknown'
          }
        });

        await trackPerformance({
          metric_name: 'dom_content_loaded',
          metric_category: 'page_load',
          metric_value: navigation.domContentLoadedEventEnd - navigation.fetchStart,
          metric_unit: 'ms',
          dimensions: { page: window.location.pathname }
        });

        await trackPerformance({
          metric_name: 'first_contentful_paint',
          metric_category: 'page_load',
          metric_value: navigation.responseEnd - navigation.fetchStart,
          metric_unit: 'ms',
          dimensions: { page: window.location.pathname }
        });
      }

      // Track memory usage if available
      if ('memory' in performance) {
        const memory = (performance as any).memory;
        await trackPerformance({
          metric_name: 'memory_usage',
          metric_category: 'memory',
          metric_value: memory.usedJSHeapSize,
          metric_unit: 'bytes',
          dimensions: {
            total_heap: memory.totalJSHeapSize,
            heap_limit: memory.jsHeapSizeLimit
          }
        });
      }
    }

    fetchMetrics();
  };

  // Calculate performance summaries
  const pageLoadMetrics = metrics.filter(m => m.metric_category === 'page_load');
  const apiMetrics = metrics.filter(m => m.metric_category === 'api_response');
  const memoryMetrics = metrics.filter(m => m.metric_category === 'memory');

  const avgPageLoad = pageLoadMetrics.length > 0 
    ? pageLoadMetrics.reduce((sum, m) => sum + m.metric_value, 0) / pageLoadMetrics.length 
    : 0;

  const avgApiResponse = apiMetrics.length > 0
    ? apiMetrics.reduce((sum, m) => sum + m.metric_value, 0) / apiMetrics.length
    : 0;

  // Prepare chart data
  const performanceData = metrics
    .filter(m => m.metric_category === 'page_load')
    .map(m => ({
      time: format(new Date(m.timestamp), 'MMM dd HH:mm'),
      value: m.metric_value,
      name: m.metric_name
    }))
    .slice(0, 50)
    .reverse();

  const apiResponseData = metrics
    .filter(m => m.metric_category === 'api_response')
    .map(m => ({
      time: format(new Date(m.timestamp), 'MMM dd HH:mm'),
      value: m.metric_value,
      endpoint: m.dimensions?.endpoint || 'unknown'
    }))
    .slice(0, 50)
    .reverse();

  const getPerformanceStatus = (avgTime: number, category: string) => {
    if (category === 'page_load') {
      if (avgTime < 1000) return { status: 'excellent', color: 'text-green-500' };
      if (avgTime < 3000) return { status: 'good', color: 'text-yellow-500' };
      return { status: 'needs improvement', color: 'text-red-500' };
    }
    if (category === 'api_response') {
      if (avgTime < 200) return { status: 'excellent', color: 'text-green-500' };
      if (avgTime < 500) return { status: 'good', color: 'text-yellow-500' };
      return { status: 'needs improvement', color: 'text-red-500' };
    }
    return { status: 'unknown', color: 'text-gray-500' };
  };

  const pageLoadStatus = getPerformanceStatus(avgPageLoad, 'page_load');
  const apiStatus = getPerformanceStatus(avgApiResponse, 'api_response');

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <DatePickerWithRange
            date={dateRange}
            onDateChange={setDateRange}
          />
          <Button onClick={trackCurrentPerformance} variant="outline" size="sm">
            <Activity className="h-4 w-4 mr-2" />
            Track Current
          </Button>
          <Button onClick={fetchMetrics} variant="outline" size="sm">
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
        </div>
      </div>

      {/* Performance Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg Page Load</CardTitle>
            <Zap className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{Math.round(avgPageLoad)}ms</div>
            <p className={`text-xs ${pageLoadStatus.color}`}>
              {pageLoadStatus.status}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg API Response</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{Math.round(avgApiResponse)}ms</div>
            <p className={`text-xs ${apiStatus.color}`}>
              {apiStatus.status}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Metrics</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics.length}</div>
            <p className="text-xs text-muted-foreground">
              Tracked in period
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Performance Score</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {avgPageLoad < 1000 ? '95' : avgPageLoad < 3000 ? '75' : '45'}
            </div>
            <p className="text-xs text-muted-foreground">
              Overall score
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Performance Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Page Load Performance */}
        <Card>
          <CardHeader>
            <CardTitle>Page Load Performance</CardTitle>
            <CardDescription>Page loading times over time</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart data={performanceData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="time" />
                <YAxis />
                <Tooltip formatter={(value) => [`${value}ms`, 'Load Time']} />
                <Area
                  type="monotone"
                  dataKey="value"
                  stroke="hsl(var(--primary))"
                  fill="hsl(var(--primary))"
                  fillOpacity={0.3}
                />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* API Response Times */}
        <Card>
          <CardHeader>
            <CardTitle>API Response Times</CardTitle>
            <CardDescription>API endpoint response times</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={apiResponseData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="time" />
                <YAxis />
                <Tooltip formatter={(value) => [`${value}ms`, 'Response Time']} />
                <Line
                  type="monotone"
                  dataKey="value"
                  stroke="hsl(var(--accent))"
                  strokeWidth={2}
                  dot={false}
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Performance Recommendations */}
      <Card>
        <CardHeader>
          <CardTitle>Performance Recommendations</CardTitle>
          <CardDescription>Suggestions to improve your application performance</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          {avgPageLoad > 3000 && (
            <div className="flex items-start gap-3 p-3 bg-red-50 border border-red-200 rounded-lg">
              <AlertTriangle className="h-5 w-5 text-red-500 mt-0.5" />
              <div>
                <div className="font-medium text-red-800">Slow Page Loading</div>
                <div className="text-sm text-red-700">
                  Your pages are loading slower than recommended. Consider optimizing images, 
                  reducing bundle size, or implementing code splitting.
                </div>
              </div>
            </div>
          )}

          {avgApiResponse > 1000 && (
            <div className="flex items-start gap-3 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
              <AlertTriangle className="h-5 w-5 text-yellow-500 mt-0.5" />
              <div>
                <div className="font-medium text-yellow-800">API Response Time</div>
                <div className="text-sm text-yellow-700">
                  API responses are taking longer than optimal. Consider implementing caching, 
                  database optimization, or API endpoint optimization.
                </div>
              </div>
            </div>
          )}

          {avgPageLoad <= 1000 && avgApiResponse <= 500 && (
            <div className="flex items-start gap-3 p-3 bg-green-50 border border-green-200 rounded-lg">
              <TrendingUp className="h-5 w-5 text-green-500 mt-0.5" />
              <div>
                <div className="font-medium text-green-800">Great Performance!</div>
                <div className="text-sm text-green-700">
                  Your application is performing well. Keep monitoring to maintain this performance level.
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Recent Metrics Table */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Performance Metrics</CardTitle>
          <CardDescription>Latest performance measurements</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="border-b">
                  <th className="text-left p-2">Metric</th>
                  <th className="text-left p-2">Category</th>
                  <th className="text-left p-2">Value</th>
                  <th className="text-left p-2">Unit</th>
                  <th className="text-left p-2">Time</th>
                </tr>
              </thead>
              <tbody>
                {metrics.slice(0, 10).map((metric) => (
                  <tr key={metric.id} className="border-b">
                    <td className="p-2">{metric.metric_name}</td>
                    <td className="p-2">
                      <Badge variant="outline">{metric.metric_category}</Badge>
                    </td>
                    <td className="p-2 font-mono">{metric.metric_value.toFixed(2)}</td>
                    <td className="p-2">{metric.metric_unit}</td>
                    <td className="p-2">{new Date(metric.timestamp).toLocaleString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};