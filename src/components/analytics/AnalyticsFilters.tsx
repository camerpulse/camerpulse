import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Calendar, Download, Mail, BarChart3 } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

interface AnalyticsFiltersProps {
  timeRange: string;
  onTimeRangeChange: (range: string) => void;
  onDownloadReport: () => void;
  onEmailDigest: () => void;
  comparisonMode: boolean;
  onComparisonToggle: () => void;
  institutionType: string;
}

export const AnalyticsFilters: React.FC<AnalyticsFiltersProps> = ({
  timeRange,
  onTimeRangeChange,
  onDownloadReport,
  onEmailDigest,
  comparisonMode,
  onComparisonToggle,
  institutionType
}) => {
  const timeRanges = [
    { value: '7d', label: 'Last 7 days' },
    { value: '30d', label: 'Last 30 days' },
    { value: '90d', label: 'Last 3 months' },
    { value: 'custom', label: 'Custom range' }
  ];

  return (
    <Card className="analytics-card">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <BarChart3 className="h-5 w-5" />
          Analytics Controls
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex flex-wrap gap-4 items-center">
          {/* Time Range Filter */}
          <div className="flex items-center gap-2">
            <Calendar className="h-4 w-4 text-muted-foreground" />
            <Select value={timeRange} onValueChange={onTimeRangeChange}>
              <SelectTrigger className="w-40">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {timeRanges.map((range) => (
                  <SelectItem key={range.value} value={range.value}>
                    {range.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Comparison Toggle */}
          <Button
            variant={comparisonMode ? "default" : "outline"}
            size="sm"
            onClick={onComparisonToggle}
            className="analytics-btn-comparison"
          >
            {comparisonMode ? 'Exit Comparison' : 'Compare with Similar'}
          </Button>

          {/* Institution Type Badge */}
          <Badge variant="secondary" className="capitalize">
            {institutionType}
          </Badge>

          <div className="flex-1" />

          {/* Action Buttons */}
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={onEmailDigest}
              className="analytics-btn-email"
            >
              <Mail className="h-4 w-4 mr-2" />
              Email Digest
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={onDownloadReport}
              className="analytics-btn-download"
            >
              <Download className="h-4 w-4 mr-2" />
              Download Report
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};