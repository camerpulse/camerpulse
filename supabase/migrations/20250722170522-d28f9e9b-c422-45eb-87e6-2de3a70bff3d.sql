-- Create investigation requests table
CREATE TABLE IF NOT EXISTS audit_investigation_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  audit_id UUID NOT NULL REFERENCES audit_registry(id) ON DELETE CASCADE,
  requester_id UUID NOT NULL,
  request_type TEXT NOT NULL CHECK (request_type IN ('full_investigation', 'follow_up', 'verification', 'additional_evidence')),
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  priority TEXT NOT NULL DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high', 'urgent')),
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'under_review', 'approved', 'rejected', 'in_progress', 'completed')),
  assigned_to UUID,
  evidence_files JSONB DEFAULT '[]'::jsonb,
  investigation_notes TEXT,
  findings TEXT,
  recommendations TEXT,
  estimated_duration_days INTEGER,
  actual_duration_days INTEGER,
  budget_estimate DECIMAL(15,2),
  budget_approved DECIMAL(15,2),
  approval_notes TEXT,
  rejection_reason TEXT,
  completed_at TIMESTAMP WITH TIME ZONE,
  due_date TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  metadata JSONB DEFAULT '{}'::jsonb
);

-- Enable RLS
ALTER TABLE audit_investigation_requests ENABLE ROW LEVEL SECURITY;

-- Investigation request policies
CREATE POLICY "Users can create investigation requests" 
ON audit_investigation_requests 
FOR INSERT 
WITH CHECK (auth.uid() = requester_id);

CREATE POLICY "Users can view their own requests" 
ON audit_investigation_requests 
FOR SELECT 
USING (auth.uid() = requester_id);

CREATE POLICY "Admins can manage all investigation requests" 
ON audit_investigation_requests 
FOR ALL 
USING (EXISTS (
  SELECT 1 FROM user_roles 
  WHERE user_id = auth.uid() AND role = 'admin'
));

CREATE POLICY "Assigned investigators can view and update their cases" 
ON audit_investigation_requests 
FOR ALL 
USING (auth.uid() = assigned_to);

-- Create audit geographic coverage table
CREATE TABLE IF NOT EXISTS audit_geographic_coverage (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  audit_id UUID NOT NULL REFERENCES audit_registry(id) ON DELETE CASCADE,
  region TEXT NOT NULL,
  division TEXT,
  subdivision TEXT,
  latitude DECIMAL(10, 8),
  longitude DECIMAL(11, 8),
  coverage_type TEXT NOT NULL CHECK (coverage_type IN ('primary_location', 'affected_area', 'investigation_site', 'related_location')),
  description TEXT,
  impact_severity TEXT CHECK (impact_severity IN ('low', 'medium', 'high', 'critical')),
  affected_population INTEGER,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE audit_geographic_coverage ENABLE ROW LEVEL SECURITY;

-- Geographic coverage policies
CREATE POLICY "Geographic coverage is publicly viewable" 
ON audit_geographic_coverage 
FOR SELECT 
USING (EXISTS (
  SELECT 1 FROM audit_registry ar 
  WHERE ar.id = audit_geographic_coverage.audit_id 
  AND ar.document_status = 'approved'
));

CREATE POLICY "Admins can manage geographic coverage" 
ON audit_geographic_coverage 
FOR ALL 
USING (EXISTS (
  SELECT 1 FROM user_roles 
  WHERE user_id = auth.uid() AND role = 'admin'
));

-- Create analytics trends table
CREATE TABLE IF NOT EXISTS audit_analytics_trends (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  trend_type TEXT NOT NULL CHECK (trend_type IN ('corruption_index', 'transparency_score', 'accountability_rating', 'public_trust', 'investigation_frequency')),
  region TEXT NOT NULL,
  entity_type TEXT,
  time_period TEXT NOT NULL, -- 'monthly', 'quarterly', 'yearly'
  period_start DATE NOT NULL,
  period_end DATE NOT NULL,
  trend_value DECIMAL(10, 4) NOT NULL,
  previous_value DECIMAL(10, 4),
  change_percentage DECIMAL(6, 2),
  trend_direction TEXT CHECK (trend_direction IN ('improving', 'declining', 'stable', 'volatile')),
  confidence_level DECIMAL(3, 2) DEFAULT 0.75,
  data_points INTEGER DEFAULT 0,
  methodology TEXT,
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE audit_analytics_trends ENABLE ROW LEVEL SECURITY;

-- Analytics trends policies
CREATE POLICY "Analytics trends are publicly viewable" 
ON audit_analytics_trends 
FOR SELECT 
USING (true);

CREATE POLICY "Admins can manage analytics trends" 
ON audit_analytics_trends 
FOR ALL 
USING (EXISTS (
  SELECT 1 FROM user_roles 
  WHERE user_id = auth.uid() AND role = 'admin'
));

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_investigation_requests_audit_id ON audit_investigation_requests(audit_id);
CREATE INDEX IF NOT EXISTS idx_investigation_requests_requester_id ON audit_investigation_requests(requester_id);
CREATE INDEX IF NOT EXISTS idx_investigation_requests_status ON audit_investigation_requests(status);
CREATE INDEX IF NOT EXISTS idx_investigation_requests_assigned_to ON audit_investigation_requests(assigned_to);

CREATE INDEX IF NOT EXISTS idx_geographic_coverage_audit_id ON audit_geographic_coverage(audit_id);
CREATE INDEX IF NOT EXISTS idx_geographic_coverage_region ON audit_geographic_coverage(region);
CREATE INDEX IF NOT EXISTS idx_geographic_coverage_location ON audit_geographic_coverage(latitude, longitude);

CREATE INDEX IF NOT EXISTS idx_analytics_trends_type_region ON audit_analytics_trends(trend_type, region);
CREATE INDEX IF NOT EXISTS idx_analytics_trends_period ON audit_analytics_trends(period_start, period_end);

-- Add investigation count to audit registry
ALTER TABLE audit_registry ADD COLUMN IF NOT EXISTS investigation_count INTEGER DEFAULT 0;

-- Function to update investigation count
CREATE OR REPLACE FUNCTION update_audit_investigation_count()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE audit_registry 
    SET investigation_count = investigation_count + 1 
    WHERE id = NEW.audit_id;
    RETURN NEW;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE audit_registry 
    SET investigation_count = investigation_count - 1 
    WHERE id = OLD.audit_id;
    RETURN OLD;
  END IF;
  RETURN NULL;
END;
$$;

-- Trigger for investigation count
DROP TRIGGER IF EXISTS trigger_update_investigation_count ON audit_investigation_requests;
CREATE TRIGGER trigger_update_investigation_count
  AFTER INSERT OR DELETE ON audit_investigation_requests
  FOR EACH ROW
  EXECUTE FUNCTION update_audit_investigation_count();

-- Function to calculate corruption trends
CREATE OR REPLACE FUNCTION calculate_corruption_trends(
  p_region TEXT DEFAULT NULL,
  p_time_period TEXT DEFAULT 'monthly',
  p_lookback_months INTEGER DEFAULT 12
)
RETURNS TABLE(
  region TEXT,
  trend_type TEXT,
  current_value DECIMAL,
  previous_value DECIMAL,
  change_percentage DECIMAL,
  trend_direction TEXT
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  start_date DATE;
  end_date DATE;
BEGIN
  -- Calculate date ranges
  end_date := CURRENT_DATE;
  start_date := end_date - INTERVAL '1 month' * p_lookback_months;

  RETURN QUERY
  WITH regional_stats AS (
    SELECT 
      ar.region,
      COUNT(*) as total_audits,
      AVG(CASE WHEN ar.audit_score IS NOT NULL THEN ar.audit_score ELSE 50 END) as avg_audit_score,
      COUNT(*) FILTER (WHERE ar.audit_score < 60) as poor_audits,
      COUNT(*) FILTER (WHERE ar.source_type = 'whistleblower_leak') as whistleblower_count,
      COUNT(DISTINCT ar.entity_audited) as entities_audited
    FROM audit_registry ar
    WHERE ar.created_at >= start_date
      AND ar.created_at <= end_date
      AND (p_region IS NULL OR ar.region = p_region)
      AND ar.document_status = 'approved'
    GROUP BY ar.region
  ),
  corruption_metrics AS (
    SELECT 
      rs.region,
      -- Corruption Index (inverse of audit score)
      ROUND((100 - rs.avg_audit_score)::DECIMAL, 2) as corruption_index,
      -- Transparency Score (based on audit frequency and whistleblower reports)
      ROUND((rs.total_audits * 10 + rs.whistleblower_count * 5)::DECIMAL / GREATEST(rs.entities_audited, 1), 2) as transparency_score,
      -- Accountability Rating (based on poor audit percentage)
      ROUND((100 - (rs.poor_audits * 100.0 / GREATEST(rs.total_audits, 1)))::DECIMAL, 2) as accountability_rating
    FROM regional_stats rs
  )
  SELECT 
    cm.region,
    'corruption_index'::TEXT,
    cm.corruption_index,
    LAG(cm.corruption_index) OVER (PARTITION BY cm.region ORDER BY end_date) as prev_value,
    CASE 
      WHEN LAG(cm.corruption_index) OVER (PARTITION BY cm.region ORDER BY end_date) IS NOT NULL
      THEN ROUND(((cm.corruption_index - LAG(cm.corruption_index) OVER (PARTITION BY cm.region ORDER BY end_date)) / 
                   LAG(cm.corruption_index) OVER (PARTITION BY cm.region ORDER BY end_date) * 100)::DECIMAL, 2)
      ELSE NULL
    END as change_pct,
    CASE 
      WHEN LAG(cm.corruption_index) OVER (PARTITION BY cm.region ORDER BY end_date) IS NULL THEN 'stable'
      WHEN cm.corruption_index > LAG(cm.corruption_index) OVER (PARTITION BY cm.region ORDER BY end_date) THEN 'declining'
      WHEN cm.corruption_index < LAG(cm.corruption_index) OVER (PARTITION BY cm.region ORDER BY end_date) THEN 'improving'
      ELSE 'stable'
    END as direction
  FROM corruption_metrics cm
  
  UNION ALL
  
  SELECT 
    cm.region,
    'transparency_score'::TEXT,
    cm.transparency_score,
    LAG(cm.transparency_score) OVER (PARTITION BY cm.region ORDER BY end_date) as prev_value,
    CASE 
      WHEN LAG(cm.transparency_score) OVER (PARTITION BY cm.region ORDER BY end_date) IS NOT NULL
      THEN ROUND(((cm.transparency_score - LAG(cm.transparency_score) OVER (PARTITION BY cm.region ORDER BY end_date)) / 
                   LAG(cm.transparency_score) OVER (PARTITION BY cm.region ORDER BY end_date) * 100)::DECIMAL, 2)
      ELSE NULL
    END as change_pct,
    CASE 
      WHEN LAG(cm.transparency_score) OVER (PARTITION BY cm.region ORDER BY end_date) IS NULL THEN 'stable'
      WHEN cm.transparency_score > LAG(cm.transparency_score) OVER (PARTITION BY cm.region ORDER BY end_date) THEN 'improving'
      WHEN cm.transparency_score < LAG(cm.transparency_score) OVER (PARTITION BY cm.region ORDER BY end_date) THEN 'declining'
      ELSE 'stable'
    END as direction
  FROM corruption_metrics cm;
END;
$$;