-- Phase 2: Verification setup (whitelist, keep-list, review queue) and preparation function

-- Create tables if not exists
CREATE TABLE IF NOT EXISTS public.cleanup_whitelist_patterns (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  pattern text NOT NULL,
  description text,
  active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.cleanup_keep_ids (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  table_name text NOT NULL,
  record_id uuid NOT NULL,
  reason text,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(table_name, record_id)
);

CREATE TABLE IF NOT EXISTS public.cleanup_review_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  run_id uuid NOT NULL REFERENCES public.cleanup_scan_runs(id) ON DELETE CASCADE,
  table_name text NOT NULL,
  record_id uuid NOT NULL,
  reason text NOT NULL, -- 'pattern' | 'orphan' | 'duplicate'
  matched_column text,
  matched_text text,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(run_id, table_name, record_id, reason)
);

-- Helpful indexes
CREATE INDEX IF NOT EXISTS idx_cleanup_review_items_run ON public.cleanup_review_items(run_id);
CREATE INDEX IF NOT EXISTS idx_cleanup_review_items_table_record ON public.cleanup_review_items(table_name, record_id);

-- Enable RLS and restrict to admins
ALTER TABLE public.cleanup_whitelist_patterns ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cleanup_keep_ids ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cleanup_review_items ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='cleanup_whitelist_patterns' AND policyname='Admins can manage cleanup whitelist'
  ) THEN
    CREATE POLICY "Admins can manage cleanup whitelist"
    ON public.cleanup_whitelist_patterns
    FOR ALL
    USING (EXISTS (
      SELECT 1 FROM public.user_roles ur
      WHERE ur.user_id = auth.uid() AND ur.role = 'admin'::app_role
    ))
    WITH CHECK (EXISTS (
      SELECT 1 FROM public.user_roles ur
      WHERE ur.user_id = auth.uid() AND ur.role = 'admin'::app_role
    ));
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='cleanup_keep_ids' AND policyname='Admins can manage cleanup keep ids'
  ) THEN
    CREATE POLICY "Admins can manage cleanup keep ids"
    ON public.cleanup_keep_ids
    FOR ALL
    USING (EXISTS (
      SELECT 1 FROM public.user_roles ur
      WHERE ur.user_id = auth.uid() AND ur.role = 'admin'::app_role
    ))
    WITH CHECK (EXISTS (
      SELECT 1 FROM public.user_roles ur
      WHERE ur.user_id = auth.uid() AND ur.role = 'admin'::app_role
    ));
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='cleanup_review_items' AND policyname='Admins can manage cleanup review items'
  ) THEN
    CREATE POLICY "Admins can manage cleanup review items"
    ON public.cleanup_review_items
    FOR ALL
    USING (EXISTS (
      SELECT 1 FROM public.user_roles ur
      WHERE ur.user_id = auth.uid() AND ur.role = 'admin'::app_role
    ))
    WITH CHECK (EXISTS (
      SELECT 1 FROM public.user_roles ur
      WHERE ur.user_id = auth.uid() AND ur.role = 'admin'::app_role
    ));
  END IF;
END $$;

-- Seed common whitelist patterns (idempotent)
INSERT INTO public.cleanup_whitelist_patterns (pattern, description)
VALUES
  ('%testimony%', 'Word contains test but is legitimate'),
  ('%protest%', 'Contains test substring in a valid word')
ON CONFLICT DO NOTHING;

-- Function to prepare review items based on latest scan
CREATE OR REPLACE FUNCTION public.cleanup_prepare_review(p_run_id uuid DEFAULT NULL)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_run_id uuid;
  v_patterns text[];
  v_whitelist text[];
  r_report record;
  text_cols text[];
  json_cols text[];
  cond text := '';
  wl_cond text := '';
  pk_type text;
  inserted int := 0;
  total_inserted int := 0;
  sql_txt text;
  first_text_col text;
BEGIN
  -- Resolve run id and patterns
  IF p_run_id IS NULL THEN
    SELECT id, patterns INTO v_run_id, v_patterns FROM public.cleanup_scan_runs ORDER BY started_at DESC LIMIT 1;
  ELSE
    v_run_id := p_run_id;
    SELECT patterns INTO v_patterns FROM public.cleanup_scan_runs WHERE id = v_run_id;
  END IF;

  IF v_run_id IS NULL THEN RAISE EXCEPTION 'No scan run found'; END IF;

  SELECT COALESCE(array_agg(pattern), ARRAY[]::text[]) INTO v_whitelist
  FROM public.cleanup_whitelist_patterns WHERE active = true;

  FOR r_report IN 
    SELECT table_name, pattern_matches, duplicates, orphans
    FROM public.cleanup_scan_reports
    WHERE run_id = v_run_id
  LOOP
    -- Ensure single UUID PK named id exists; skip otherwise
    SELECT data_type INTO pk_type
    FROM information_schema.columns
    WHERE table_schema='public' AND table_name=r_report.table_name AND column_name='id';
    IF pk_type IS DISTINCT FROM 'uuid' THEN CONTINUE; END IF;

    -- Collect text/jsonb columns
    SELECT array_agg(column_name)::text[] INTO text_cols
    FROM information_schema.columns
    WHERE table_schema='public' AND table_name=r_report.table_name AND data_type IN ('text','character varying');

    SELECT array_agg(column_name)::text[] INTO json_cols
    FROM information_schema.columns
    WHERE table_schema='public' AND table_name=r_report.table_name AND data_type='jsonb';

    -- Build conditions for pattern search
    cond := '';
    IF text_cols IS NOT NULL THEN
      FOR first_text_col IN SELECT unnest(text_cols) AS col LOOP
        IF cond <> '' THEN cond := cond || ' OR '; END IF;
        cond := cond || format('%I ILIKE ANY ($1)', first_text_col);
      END LOOP;
    END IF;
    IF json_cols IS NOT NULL THEN
      FOR first_text_col IN SELECT unnest(json_cols) AS col LOOP
        IF cond <> '' THEN cond := cond || ' OR '; END IF;
        cond := cond || format('CAST(%I AS text) ILIKE ANY ($1)', first_text_col);
      END LOOP;
    END IF;

    -- Build whitelist exclusion
    wl_cond := '';
    IF text_cols IS NOT NULL AND array_length(v_whitelist,1) IS NOT NULL THEN
      FOR first_text_col IN SELECT unnest(text_cols) AS col LOOP
        IF wl_cond <> '' THEN wl_cond := wl_cond || ' AND '; END IF;
        wl_cond := wl_cond || format('NOT (%I ILIKE ANY ($2))', first_text_col);
      END LOOP;
    END IF;
    IF json_cols IS NOT NULL AND array_length(v_whitelist,1) IS NOT NULL THEN
      FOR first_text_col IN SELECT unnest(json_cols) AS col LOOP
        IF wl_cond <> '' THEN wl_cond := wl_cond || ' AND '; END IF;
        wl_cond := wl_cond || format('NOT (CAST(%I AS text) ILIKE ANY ($2))', first_text_col);
      END LOOP;
    END IF;

    -- Pattern-based candidates
    IF r_report.pattern_matches > 0 AND cond <> '' THEN
      sql_txt := format(
        'INSERT INTO public.cleanup_review_items (run_id, table_name, record_id, reason)
         SELECT $3, %L, id, ''pattern''
         FROM public.%I t
         WHERE (%s) %s
           AND NOT EXISTS (
             SELECT 1 FROM public.cleanup_keep_ids k WHERE k.table_name = %L AND k.record_id = t.id
           )
         ON CONFLICT DO NOTHING',
        r_report.table_name,
        r_report.table_name,
        cond,
        CASE WHEN wl_cond <> '' THEN 'AND ('||wl_cond||')' ELSE '' END,
        r_report.table_name
      );
      EXECUTE sql_txt USING v_patterns, v_whitelist, v_run_id;
      GET DIAGNOSTICS inserted = ROW_COUNT;
      total_inserted := total_inserted + COALESCE(inserted,0);
    END IF;

    -- Orphan-based candidates (best-effort; may skip complex FK)
    IF r_report.orphans > 0 THEN
      sql_txt := format(
        'WITH fk AS (
           SELECT c.confrelid::regclass::text AS parent_table,
                  (SELECT a_parent.attname FROM unnest(c.confkey) WITH ORDINALITY fk(attnum,ord)
                   JOIN pg_attribute a_parent ON a_parent.attrelid = c.confrelid AND a_parent.attnum = fk.attnum
                   ORDER BY ord LIMIT 1) AS parent_column,
                  (SELECT a_child.attname FROM unnest(c.conkey) WITH ORDINALITY ck(attnum,ord)
                   JOIN pg_attribute a_child ON a_child.attrelid = c.conrelid AND a_child.attnum = ck.attnum
                   ORDER BY ord LIMIT 1) AS child_column
           FROM pg_constraint c
           WHERE c.contype=''f'' AND c.conrelid = format(''public.%I'', %L)::regclass
           LIMIT 1
         )
         INSERT INTO public.cleanup_review_items (run_id, table_name, record_id, reason)
         SELECT $1, %L, ch.id, ''orphan''
         FROM public.%I ch, fk
         WHERE NOT EXISTS (
           SELECT 1 FROM (fk.parent_table)::regclass p WHERE CAST(p.(fk.parent_column) AS text) = CAST(ch.(fk.child_column) AS text)
         )
         AND NOT EXISTS (
           SELECT 1 FROM public.cleanup_keep_ids k WHERE k.table_name = %L AND k.record_id = ch.id
         )
         ON CONFLICT DO NOTHING',
        r_report.table_name, r_report.table_name,
        r_report.table_name,
        r_report.table_name
      );
      BEGIN
        EXECUTE sql_txt USING v_run_id;
        GET DIAGNOSTICS inserted = ROW_COUNT;
        total_inserted := total_inserted + COALESCE(inserted,0);
      EXCEPTION WHEN OTHERS THEN
        -- Ignore complex FK shapes during review prep
        NULL;
      END;
    END IF;
  END LOOP;

  RETURN jsonb_build_object('run_id', v_run_id, 'review_items', total_inserted);
END;
$$;

-- Prepare review items for the latest scan (no-op if none)
DO $$
DECLARE v jsonb; BEGIN 
  BEGIN
    v := public.cleanup_prepare_review();
    RAISE NOTICE 'Review prepared: %', v;
  EXCEPTION WHEN OTHERS THEN
    -- If there is no prior scan setup, skip gracefully
    RAISE NOTICE 'cleanup_prepare_review skipped: %', SQLERRM;
  END;
END $$;