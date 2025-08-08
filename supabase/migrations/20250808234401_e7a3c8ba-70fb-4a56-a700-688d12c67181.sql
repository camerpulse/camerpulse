-- Phase 1: Scan-only audit (no deletions)
CREATE TABLE IF NOT EXISTS public.cleanup_scan_runs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  started_at timestamptz NOT NULL DEFAULT now(),
  ended_at timestamptz,
  patterns text[] NOT NULL,
  notes text,
  tables_scanned int NOT NULL DEFAULT 0,
  total_pattern_matches int NOT NULL DEFAULT 0,
  total_duplicates int NOT NULL DEFAULT 0,
  total_orphans int NOT NULL DEFAULT 0
);

CREATE TABLE IF NOT EXISTS public.cleanup_scan_reports (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  run_id uuid NOT NULL REFERENCES public.cleanup_scan_runs(id) ON DELETE CASCADE,
  table_name text NOT NULL,
  pattern_matches int NOT NULL DEFAULT 0,
  duplicates int NOT NULL DEFAULT 0,
  orphans int NOT NULL DEFAULT 0,
  sample_ids uuid[],
  sample_text jsonb,
  processed_at timestamptz NOT NULL DEFAULT now()
);

CREATE OR REPLACE FUNCTION public.cleanup_scan_only(
  p_patterns text[] DEFAULT ARRAY[
    '%test%','%dummy%','%mock%','%fake%','%placeholder%','%sample%','%seed%','%staging%','%demo%','%lorem%','%ipsum%',
    '%example%','%autogen%','%ai agent%','%bot%','%spam%','%buy now%','%click here%','%integration test%','%auto-sync test%','%foobar%','%foo%','%bar%',
    '%@example.%','%@test.%','%@mailinator.%','%@fakeinbox.%','%+test@%','%no-reply%','%noreply%'
  ],
  p_notes text DEFAULT 'phase_1_scan'
) RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_run_id uuid;
  v_tables_scanned int := 0;
  v_total_patterns int := 0;
  v_total_dups int := 0;
  v_total_orphans int := 0;
  r_table record;
  v_text_cols text[];
  v_json_cols text[];
  v_cond text;
  v_pattern_matches int := 0;
  v_duplicates int := 0;
  v_orphans int := 0;
  v_sample_ids uuid[];
  v_sample_text jsonb;
  v_pk_name text;
  v_pk_count int;
  r_fk record;
BEGIN
  INSERT INTO public.cleanup_scan_runs (patterns, notes)
  VALUES (p_patterns, p_notes)
  RETURNING id INTO v_run_id;

  FOR r_table IN 
    SELECT table_name
    FROM information_schema.tables
    WHERE table_schema = 'public' AND table_type = 'BASE TABLE'
      AND table_name NOT LIKE 'pg_%' AND table_name NOT LIKE 'sql_%'
  LOOP
    -- Gather columns
    SELECT array_agg(column_name)::text[] INTO v_text_cols
    FROM information_schema.columns
    WHERE table_schema='public' AND table_name=r_table.table_name AND data_type IN ('text','character varying');
    SELECT array_agg(column_name)::text[] INTO v_json_cols
    FROM information_schema.columns
    WHERE table_schema='public' AND table_name=r_table.table_name AND data_type='jsonb';

    -- Build condition
    v_cond := '';
    IF v_text_cols IS NOT NULL THEN
      FOR v_pk_name IN SELECT unnest(v_text_cols) AS col LOOP
        IF v_cond <> '' THEN v_cond := v_cond || ' OR '; END IF;
        v_cond := v_cond || format('%I ILIKE ANY ($1)', v_pk_name);
      END LOOP;
    END IF;
    IF v_json_cols IS NOT NULL THEN
      FOR v_pk_name IN SELECT unnest(v_json_cols) AS col LOOP
        IF v_cond <> '' THEN v_cond := v_cond || ' OR '; END IF;
        v_cond := v_cond || format('CAST(%I AS text) ILIKE ANY ($1)', v_pk_name);
      END LOOP;
    END IF;

    v_pattern_matches := 0;
    v_duplicates := 0;
    v_orphans := 0;
    v_sample_ids := NULL;
    v_sample_text := NULL;

    -- Pattern match count and samples
    IF v_cond <> '' THEN
      EXECUTE format('SELECT COUNT(*) FROM public.%I WHERE %s', r_table.table_name, v_cond)
        USING p_patterns INTO v_pattern_matches;
      BEGIN
        EXECUTE format('SELECT array_agg(id), jsonb_agg(jsonb_build_object(''sample_col'', %1$I)) FROM (SELECT id, %1$I FROM public.%2$I WHERE %3$s LIMIT 5) s',
                       COALESCE((SELECT column_name FROM information_schema.columns WHERE table_schema='public' AND table_name=r_table.table_name AND data_type IN ('text','character varying') LIMIT 1),'id'),
                       r_table.table_name, v_cond)
          USING p_patterns INTO v_sample_ids, v_sample_text;
      EXCEPTION WHEN OTHERS THEN
        v_sample_ids := NULL; v_sample_text := NULL;
      END;
    END IF;

    -- Duplicates by slug if present
    PERFORM 1 FROM information_schema.columns WHERE table_schema='public' AND table_name=r_table.table_name AND column_name='slug';
    IF FOUND THEN
      EXECUTE format('WITH d AS (SELECT id, ROW_NUMBER() OVER (PARTITION BY slug ORDER BY id) rn FROM public.%I WHERE slug IS NOT NULL) SELECT COUNT(*) FROM d WHERE rn>1', r_table.table_name)
        INTO v_duplicates;
    END IF;

    -- Orphans where current table is child in FK
    FOR r_fk IN 
      SELECT 
        c.confrelid::regclass::text AS parent_table,
        a_child.attname AS child_column,
        a_parent.attname AS parent_column
      FROM pg_constraint c
      JOIN unnest(c.conkey) WITH ORDINALITY AS ck(attnum, ord) ON true
      JOIN pg_attribute a_child ON a_child.attrelid = c.conrelid AND a_child.attnum = ck.attnum
      JOIN unnest(c.confkey) WITH ORDINALITY AS fk(attnum, ord2) ON ord2=ck.ord
      JOIN pg_attribute a_parent ON a_parent.attrelid = c.confrelid AND a_parent.attnum = fk.attnum
      WHERE c.contype='f' AND c.conrelid = format('public.%I', r_table.table_name)::regclass
    LOOP
      EXECUTE format('SELECT COUNT(*) FROM public.%I ch WHERE NOT EXISTS (SELECT 1 FROM %s p WHERE CAST(p.%I AS text)=CAST(ch.%I AS text))',
                     r_table.table_name, r_fk.parent_table, r_fk.parent_column, r_fk.child_column)
        INTO v_pk_count;
      v_orphans := v_orphans + COALESCE(v_pk_count,0);
    END LOOP;

    -- Record report
    IF v_pattern_matches>0 OR v_duplicates>0 OR v_orphans>0 THEN
      INSERT INTO public.cleanup_scan_reports (run_id, table_name, pattern_matches, duplicates, orphans, sample_ids, sample_text)
      VALUES (v_run_id, r_table.table_name, v_pattern_matches, v_duplicates, v_orphans, v_sample_ids, v_sample_text);
    END IF;

    v_tables_scanned := v_tables_scanned + 1;
    v_total_patterns := v_total_patterns + COALESCE(v_pattern_matches,0);
    v_total_dups := v_total_dups + COALESCE(v_duplicates,0);
    v_total_orphans := v_total_orphans + COALESCE(v_orphans,0);
  END LOOP;

  UPDATE public.cleanup_scan_runs
  SET ended_at = now(), tables_scanned = v_tables_scanned, total_pattern_matches = v_total_patterns, total_duplicates = v_total_dups, total_orphans = v_total_orphans
  WHERE id = v_run_id;

  RETURN jsonb_build_object('run_id', v_run_id, 'tables_scanned', v_tables_scanned, 'pattern_matches', v_total_patterns, 'duplicates', v_total_dups, 'orphans', v_total_orphans);
END;
$$;

-- Execute Phase 1 scan now
DO $$
DECLARE v jsonb; BEGIN v := public.cleanup_scan_only(); RAISE NOTICE 'Scan result: %', v; END $$;