-- Fix FK parent column resolution to avoid type mismatches
CREATE OR REPLACE FUNCTION public.cleanup_mock_data(
  p_patterns text[] DEFAULT ARRAY[
    '%test%', '%dummy%', '%mock%', '%fake%', '%placeholder%', '%lorem%', '%example%', '%ai generated%', '%auto-sync test%', '%demo%',
    '%@example.%', '%@test.%', '%+test@%', '%no-reply%', '%noreply%'
  ],
  p_exclude_verified boolean DEFAULT true
) RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_run_id uuid;
  v_tables_processed int := 0;
  v_total_deleted int := 0;
  r_table record;
  v_pk_name text;
  v_pk_count int;
  v_text_cols text[];
  v_json_cols text[];
  v_cond text;
  v_excl text := 'TRUE';
  v_not_refd text := '';
  v_where text;
  v_match_count int;
  v_deleted int;
  v_sample_ids uuid[];
  v_sample_text jsonb;
  v_backup_table text;
  v_sql text;
  v_has_verification_status boolean := false;
  v_has_verified boolean := false;
  v_has_is_verified boolean := false;
  v_has_is_verified_vendor boolean := false;
  r_ref record;
BEGIN
  -- Start run
  INSERT INTO public.cleanup_backup__cleanup_runs (patterns, excluded_verified)
  VALUES (p_patterns, p_exclude_verified)
  RETURNING id INTO v_run_id;

  -- Iterate public base tables
  FOR r_table IN 
    SELECT table_name
    FROM information_schema.tables
    WHERE table_schema = 'public' AND table_type = 'BASE TABLE'
      AND table_name NOT LIKE 'pg_%' AND table_name NOT LIKE 'sql_%'
      AND table_name NOT LIKE 'test_%'
  LOOP
    -- Determine primary key (single-column only)
    SELECT COUNT(*) INTO v_pk_count
    FROM (
      SELECT a.attname
      FROM pg_index i
      JOIN pg_attribute a ON a.attrelid = i.indrelid AND a.attnum = ANY (i.indkey)
      WHERE i.indrelid = format('public.%I', r_table.table_name)::regclass
        AND i.indisprimary
    ) t;

    IF v_pk_count <> 1 THEN
      CONTINUE; -- skip tables without a simple PK
    END IF;

    SELECT a.attname INTO v_pk_name
    FROM pg_index i
    JOIN pg_attribute a ON a.attrelid = i.indrelid AND a.attnum = ANY (i.indkey)
    WHERE i.indrelid = format('public.%I', r_table.table_name)::regclass
      AND i.indisprimary
    LIMIT 1;

    -- Collect text and jsonb columns
    SELECT array_agg(column_name)::text[] INTO v_text_cols
    FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = r_table.table_name
      AND data_type IN ('text','character varying');

    SELECT array_agg(column_name)::text[] INTO v_json_cols
    FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = r_table.table_name
      AND data_type IN ('jsonb');

    IF (v_text_cols IS NULL OR array_length(v_text_cols,1) IS NULL)
       AND (v_json_cols IS NULL OR array_length(v_json_cols,1) IS NULL) THEN
      CONTINUE; -- nothing to match on
    END IF;

    -- Build condition over text/jsonb columns using patterns
    v_cond := '';
    IF v_text_cols IS NOT NULL THEN
      FOR v_sql IN SELECT unnest(v_text_cols) AS col LOOP
        IF v_cond <> '' THEN v_cond := v_cond || ' OR '; END IF;
        v_cond := v_cond || format('%I ILIKE ANY ($1)', v_sql);
      END LOOP;
    END IF;
    IF v_json_cols IS NOT NULL THEN
      FOR v_sql IN SELECT unnest(v_json_cols) AS col LOOP
        IF v_cond <> '' THEN v_cond := v_cond || ' OR '; END IF;
        v_cond := v_cond || format('CAST(%I AS text) ILIKE ANY ($1)', v_sql);
      END LOOP;
    END IF;

    -- Exclusion rules for verified content if requested
    v_excl := 'TRUE';
    IF p_exclude_verified THEN
      SELECT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema='public' AND table_name=r_table.table_name AND column_name='verification_status'
      ) INTO v_has_verification_status;
      SELECT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema='public' AND table_name=r_table.table_name AND column_name='verified'
      ) INTO v_has_verified;
      SELECT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema='public' AND table_name=r_table.table_name AND column_name='is_verified'
      ) INTO v_has_is_verified;
      SELECT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema='public' AND table_name=r_table.table_name AND column_name='is_verified_vendor'
      ) INTO v_has_is_verified_vendor;

      IF v_has_verification_status THEN
        v_excl := v_excl || ' AND COALESCE(verification_status, '''') <> ''verified''';
      END IF;
      IF v_has_verified THEN
        v_excl := v_excl || ' AND COALESCE(verified, false) = false';
      END IF;
      IF v_has_is_verified THEN
        v_excl := v_excl || ' AND COALESCE(is_verified, false) = false';
      END IF;
      IF v_has_is_verified_vendor THEN
        v_excl := v_excl || ' AND COALESCE(is_verified_vendor, false) = false';
      END IF;
    END IF;

    -- Avoid FK violations by ensuring target rows are not referenced by children
    v_not_refd := '';
    FOR r_ref IN 
      SELECT 
        c.conrelid::regclass::text AS child_table,
        a_child.attname AS child_column,
        a_parent.attname AS parent_column
      FROM pg_constraint c
      JOIN unnest(c.conkey) WITH ORDINALITY AS ck(attnum, ord) ON true
      JOIN pg_attribute a_child ON a_child.attrelid = c.conrelid AND a_child.attnum = ck.attnum
      JOIN unnest(c.confkey) WITH ORDINALITY AS fk(attnum, ord2) ON ord2 = ck.ord
      JOIN pg_attribute a_parent ON a_parent.attrelid = c.confrelid AND a_parent.attnum = fk.attnum
      WHERE c.confrelid = format('public.%I', r_table.table_name)::regclass
        AND c.contype = 'f'
    LOOP
      IF v_not_refd = '' THEN
        v_not_refd := ' AND TRUE';
      END IF;
      v_not_refd := v_not_refd || format(' AND NOT EXISTS (SELECT 1 FROM public.%I c WHERE c.%I = %I.%I)', 
                        r_ref.child_table, r_ref.child_column, r_table.table_name, r_ref.parent_column);
    END LOOP;

    v_where := format('(%s) AND (%s)%s', v_cond, v_excl, v_not_refd);

    -- Count deletable matches
    v_sql := format('SELECT COUNT(*) FROM %I.%I WHERE %s', 'public', r_table.table_name, v_where);
    EXECUTE v_sql USING p_patterns INTO v_match_count;

    IF v_match_count IS NULL OR v_match_count = 0 THEN
      CONTINUE;
    END IF;

    -- Ensure backup table exists
    v_backup_table := format('cleanup_backup__%s', r_table.table_name);
    v_sql := format('CREATE TABLE IF NOT EXISTS public.%I (LIKE public.%I INCLUDING DEFAULTS)', v_backup_table, r_table.table_name);
    EXECUTE v_sql;

    -- Backup rows
    v_sql := format('INSERT INTO public.%I SELECT * FROM public.%I WHERE %s', v_backup_table, r_table.table_name, v_where);
    EXECUTE v_sql USING p_patterns;

    -- Collect sample ids and text via subquery with LIMIT 5
    IF v_text_cols IS NOT NULL AND array_length(v_text_cols,1) > 0 THEN
      v_sql := format(
        'SELECT array_agg(%1$I), jsonb_agg(jsonb_build_object(''sample_col'', %2$I)) FROM (
           SELECT %1$I, %2$I FROM public.%3$I WHERE %4$s LIMIT 5
         ) s',
        v_pk_name, v_text_cols[1], r_table.table_name, v_where
      );
    ELSE
      v_sql := format(
        'SELECT array_agg(%1$I), jsonb_build_array() FROM (
           SELECT %1$I FROM public.%2$I WHERE %3$s LIMIT 5
         ) s',
        v_pk_name, r_table.table_name, v_where
      );
    END IF;
    EXECUTE v_sql USING p_patterns INTO v_sample_ids, v_sample_text;

    -- Delete rows (safe subset only)
    v_sql := format('DELETE FROM public.%I WHERE %s', r_table.table_name, v_where);
    EXECUTE v_sql USING p_patterns;
    GET DIAGNOSTICS v_deleted = ROW_COUNT;

    v_tables_processed := v_tables_processed + 1;
    v_total_deleted := v_total_deleted + COALESCE(v_deleted,0);

    -- Report per table
    INSERT INTO public.cleanup_backup__cleanup_reports (
      run_id, table_name, deleted_count, backed_up, backup_table, sample_ids, sample_text
    ) VALUES (
      v_run_id, r_table.table_name, COALESCE(v_deleted,0), true, v_backup_table, v_sample_ids, v_sample_text
    );
  END LOOP;

  -- Finalize run
  UPDATE public.cleanup_backup__cleanup_runs
  SET run_ended_at = now(), tables_processed = v_tables_processed, total_deleted = v_total_deleted
  WHERE id = v_run_id;

  RETURN jsonb_build_object(
    'run_id', v_run_id,
    'tables_processed', v_tables_processed,
    'total_deleted', v_total_deleted
  );
END;
$$;

-- Execute cleanup once now
DO $$
DECLARE v_result jsonb; BEGIN
  v_result := public.cleanup_mock_data();
  RAISE NOTICE 'Cleanup run result: %', v_result;
END $$;