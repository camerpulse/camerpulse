-- Law & Policy Intelligence Core Database Schema

-- Legal documents registry
CREATE TABLE public.legal_documents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  document_title TEXT NOT NULL,
  document_type TEXT NOT NULL CHECK (document_type IN ('law', 'bill', 'decree', 'constitutional_amendment', 'policy', 'regulation')),
  document_number TEXT,
  original_language TEXT NOT NULL DEFAULT 'french',
  jurisdiction TEXT NOT NULL DEFAULT 'national',
  ministry_department TEXT,
  status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'proposed', 'under_review', 'passed', 'rejected', 'enforced', 'repealed')),
  introduction_date DATE,
  passed_date DATE,
  enforcement_date DATE,
  expiry_date DATE,
  original_text TEXT,
  simplified_summary TEXT,
  pidgin_summary TEXT,
  english_summary TEXT,
  key_provisions TEXT[],
  affected_sectors TEXT[],
  affected_regions TEXT[],
  penalties_summary TEXT,
  document_url TEXT,
  source_official BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  created_by UUID,
  metadata JSONB DEFAULT '{}'
);

-- Constitutional articles reference
CREATE TABLE public.constitutional_articles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  article_number TEXT NOT NULL,
  chapter_title TEXT,
  article_title TEXT,
  article_text TEXT NOT NULL,
  article_summary TEXT,
  category TEXT NOT NULL CHECK (category IN ('rights', 'powers', 'governance', 'judiciary', 'regional', 'amendment')),
  is_fundamental_right BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Policy tracking
CREATE TABLE public.policy_tracker (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  policy_title TEXT NOT NULL,
  policy_type TEXT NOT NULL CHECK (policy_type IN ('bill', 'decree', 'cabinet_action', 'parliamentary_vote', 'executive_order')),
  initiator_name TEXT,
  initiator_type TEXT CHECK (initiator_type IN ('mp', 'minister', 'president', 'cabinet', 'party', 'civil_society')),
  initiator_party TEXT,
  proposed_date DATE,
  status TEXT NOT NULL DEFAULT 'proposed' CHECK (status IN ('proposed', 'committee_review', 'first_reading', 'second_reading', 'third_reading', 'passed', 'rejected', 'withdrawn', 'amended')),
  vote_results JSONB,
  supporting_parties TEXT[],
  opposing_parties TEXT[],
  abstaining_parties TEXT[],
  affected_sectors TEXT[],
  affected_regions TEXT[],
  policy_summary TEXT,
  legal_document_id UUID REFERENCES public.legal_documents(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  metadata JSONB DEFAULT '{}'
);

-- Constitutional violation alerts
CREATE TABLE public.constitutional_violations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  legal_document_id UUID REFERENCES public.legal_documents(id),
  policy_id UUID REFERENCES public.policy_tracker(id),
  violation_type TEXT NOT NULL CHECK (violation_type IN ('human_rights', 'separation_powers', 'regional_overreach', 'due_process', 'equality', 'freedom_expression', 'other')),
  constitutional_article_id UUID REFERENCES public.constitutional_articles(id),
  severity_level TEXT NOT NULL DEFAULT 'medium' CHECK (severity_level IN ('low', 'medium', 'high', 'critical')),
  violation_description TEXT NOT NULL,
  legal_analysis TEXT,
  confidence_score NUMERIC(3,2) DEFAULT 0.5,
  auto_detected BOOLEAN DEFAULT true,
  reviewed_by_legal_expert BOOLEAN DEFAULT false,
  expert_opinion TEXT,
  resolution_status TEXT DEFAULT 'pending' CHECK (resolution_status IN ('pending', 'investigating', 'confirmed', 'dismissed', 'resolved')),
  public_alert_issued BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  flagged_by UUID,
  metadata JSONB DEFAULT '{}'
);

-- Civic law explanations
CREATE TABLE public.civic_law_explanations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  legal_document_id UUID REFERENCES public.legal_documents(id),
  question_asked TEXT NOT NULL,
  simple_explanation TEXT NOT NULL,
  pidgin_explanation TEXT,
  french_explanation TEXT,
  key_points TEXT[],
  examples TEXT[],
  related_laws UUID[],
  citizen_impact TEXT,
  auto_generated BOOLEAN DEFAULT true,
  expert_reviewed BOOLEAN DEFAULT false,
  upvotes INTEGER DEFAULT 0,
  downvotes INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  created_by UUID,
  metadata JSONB DEFAULT '{}'
);

-- Legal document processing logs
CREATE TABLE public.legal_document_processing (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  legal_document_id UUID REFERENCES public.legal_documents(id),
  processing_type TEXT NOT NULL CHECK (processing_type IN ('text_extraction', 'summarization', 'translation', 'constitutional_check', 'simplification')),
  processing_status TEXT NOT NULL DEFAULT 'pending' CHECK (processing_status IN ('pending', 'processing', 'completed', 'failed')),
  input_format TEXT,
  output_format TEXT,
  processing_notes TEXT,
  error_message TEXT,
  confidence_score NUMERIC(3,2),
  processing_duration_ms INTEGER,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  completed_at TIMESTAMP WITH TIME ZONE,
  processed_by TEXT DEFAULT 'ashen_legal_ai'
);

-- Enable RLS
ALTER TABLE public.legal_documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.constitutional_articles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.policy_tracker ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.constitutional_violations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.civic_law_explanations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.legal_document_processing ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
CREATE POLICY "Public can view active legal documents" ON public.legal_documents
  FOR SELECT USING (status IN ('passed', 'enforced') OR source_official = true);

CREATE POLICY "Admins can manage legal documents" ON public.legal_documents
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.user_roles 
      WHERE user_id = auth.uid() AND role = 'admin'
    )
  );

CREATE POLICY "Public can view constitutional articles" ON public.constitutional_articles
  FOR SELECT USING (true);

CREATE POLICY "Admins can manage constitutional articles" ON public.constitutional_articles
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.user_roles 
      WHERE user_id = auth.uid() AND role = 'admin'
    )
  );

CREATE POLICY "Public can view policy tracker" ON public.policy_tracker
  FOR SELECT USING (true);

CREATE POLICY "Admins can manage policy tracker" ON public.policy_tracker
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.user_roles 
      WHERE user_id = auth.uid() AND role = 'admin'
    )
  );

CREATE POLICY "Public can view constitutional violations" ON public.constitutional_violations
  FOR SELECT USING (public_alert_issued = true);

CREATE POLICY "Admins can manage constitutional violations" ON public.constitutional_violations
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.user_roles 
      WHERE user_id = auth.uid() AND role = 'admin'
    )
  );

CREATE POLICY "Public can view civic explanations" ON public.civic_law_explanations
  FOR SELECT USING (true);

CREATE POLICY "Users can create civic explanations" ON public.civic_law_explanations
  FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Users can update their civic explanations" ON public.civic_law_explanations
  FOR UPDATE USING (created_by = auth.uid());

CREATE POLICY "Admins can view processing logs" ON public.legal_document_processing
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.user_roles 
      WHERE user_id = auth.uid() AND role = 'admin'
    )
  );

-- Create indexes
CREATE INDEX idx_legal_documents_status ON public.legal_documents(status);
CREATE INDEX idx_legal_documents_type ON public.legal_documents(document_type);
CREATE INDEX idx_legal_documents_date ON public.legal_documents(enforcement_date DESC);
CREATE INDEX idx_constitutional_articles_category ON public.constitutional_articles(category);
CREATE INDEX idx_policy_tracker_status ON public.policy_tracker(status);
CREATE INDEX idx_policy_tracker_date ON public.policy_tracker(proposed_date DESC);
CREATE INDEX idx_violations_severity ON public.constitutional_violations(severity_level);
CREATE INDEX idx_violations_status ON public.constitutional_violations(resolution_status);
CREATE INDEX idx_civic_explanations_document ON public.civic_law_explanations(legal_document_id);

-- Create triggers
CREATE TRIGGER update_legal_documents_updated_at
  BEFORE UPDATE ON public.legal_documents
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_constitutional_articles_updated_at
  BEFORE UPDATE ON public.constitutional_articles
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_policy_tracker_updated_at
  BEFORE UPDATE ON public.policy_tracker
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_constitutional_violations_updated_at
  BEFORE UPDATE ON public.constitutional_violations
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_civic_law_explanations_updated_at
  BEFORE UPDATE ON public.civic_law_explanations
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Insert sample constitutional articles for Cameroon
INSERT INTO public.constitutional_articles (article_number, chapter_title, article_title, article_text, article_summary, category, is_fundamental_right) VALUES
('Article 1', 'General Provisions', 'State and Sovereignty', 'Cameroon shall be a decentralised unitary State. It shall be one and indivisible, secular, democratic and dedicated to social justice.', 'Defines Cameroon as a unitary, secular, democratic state dedicated to social justice.', 'governance', false),
('Article 2', 'General Provisions', 'National Languages', 'The official languages of Cameroon shall be English and French, both having the same status. The State shall guarantee the promotion of bilingualism throughout the country.', 'Establishes English and French as official languages with equal status.', 'governance', false),
('Article 19', 'Rights and Freedoms', 'Freedom of Expression', 'Freedom of expression and of the press shall be guaranteed under the conditions fixed by law.', 'Guarantees freedom of expression and press under legal conditions.', 'rights', true),
('Article 20', 'Rights and Freedoms', 'Right to Life', 'Every person has a right to life, to physical and moral integrity and to security in accordance with the law.', 'Guarantees the fundamental right to life and physical integrity.', 'rights', true),
('Article 27', 'Rights and Freedoms', 'Right to Education', 'Every person has a right to education. Primary education shall be compulsory. The State shall guarantee equal access to education for all without discrimination.', 'Guarantees the right to education with compulsory primary education.', 'rights', true);

-- Database functions for legal operations
CREATE OR REPLACE FUNCTION public.process_legal_document(
  p_document_id UUID,
  p_processing_type TEXT,
  p_result_data JSONB DEFAULT '{}'
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  processing_id UUID;
BEGIN
  INSERT INTO public.legal_document_processing (
    legal_document_id,
    processing_type,
    processing_status,
    processing_notes
  ) VALUES (
    p_document_id,
    p_processing_type,
    'completed',
    'Processed via API'
  ) RETURNING id INTO processing_id;
  
  RETURN processing_id;
END;
$$;

CREATE OR REPLACE FUNCTION public.check_constitutional_compliance(
  p_document_id UUID,
  p_document_text TEXT
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  violations JSONB := '[]';
  article_record RECORD;
  violation_id UUID;
BEGIN
  -- Basic constitutional compliance checks
  -- This would be enhanced with AI/ML in the actual implementation
  
  -- Check for human rights violations
  FOR article_record IN
    SELECT * FROM public.constitutional_articles 
    WHERE category = 'rights' AND is_fundamental_right = true
  LOOP
    -- Simplified check - would use AI analysis in real implementation
    IF p_document_text ILIKE '%restrict%' OR p_document_text ILIKE '%prohibit%' THEN
      INSERT INTO public.constitutional_violations (
        legal_document_id,
        violation_type,
        constitutional_article_id,
        severity_level,
        violation_description,
        confidence_score,
        auto_detected
      ) VALUES (
        p_document_id,
        'human_rights',
        article_record.id,
        'medium',
        'Potential restriction of fundamental rights detected',
        0.7,
        true
      ) RETURNING id INTO violation_id;
      
      violations := violations || jsonb_build_object(
        'violation_id', violation_id,
        'article', article_record.article_number,
        'type', 'human_rights'
      );
    END IF;
  END LOOP;
  
  RETURN jsonb_build_object(
    'violations_found', jsonb_array_length(violations),
    'violations', violations,
    'compliance_score', CASE 
      WHEN jsonb_array_length(violations) = 0 THEN 1.0
      ELSE 1.0 - (jsonb_array_length(violations) * 0.2)
    END,
    'checked_at', now()
  );
END;
$$;

CREATE OR REPLACE FUNCTION public.get_legal_dashboard_stats()
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  result JSONB := '{}';
  active_laws INTEGER;
  pending_policies INTEGER;
  constitutional_alerts INTEGER;
  recent_laws INTEGER;
BEGIN
  -- Count active laws
  SELECT COUNT(*) INTO active_laws
  FROM public.legal_documents
  WHERE status IN ('passed', 'enforced');
  
  -- Count pending policies
  SELECT COUNT(*) INTO pending_policies
  FROM public.policy_tracker
  WHERE status IN ('proposed', 'committee_review', 'first_reading', 'second_reading');
  
  -- Count constitutional alerts
  SELECT COUNT(*) INTO constitutional_alerts
  FROM public.constitutional_violations
  WHERE resolution_status = 'pending' AND severity_level IN ('high', 'critical');
  
  -- Count recent laws (last 30 days)
  SELECT COUNT(*) INTO recent_laws
  FROM public.legal_documents
  WHERE status = 'enforced' 
  AND enforcement_date >= CURRENT_DATE - INTERVAL '30 days';
  
  result := jsonb_build_object(
    'active_laws', active_laws,
    'pending_policies', pending_policies,
    'constitutional_alerts', constitutional_alerts,
    'recent_laws', recent_laws,
    'last_updated', now()
  );
  
  RETURN result;
END;
$$;