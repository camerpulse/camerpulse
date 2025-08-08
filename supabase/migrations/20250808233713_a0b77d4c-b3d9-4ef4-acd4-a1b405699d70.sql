-- Residual sweep: orphans + duplicates cleanup with backups
CREATE OR REPLACE FUNCTION public.cleanup_residuals()
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_run_id uuid;
  v_tables_processed int := 0;
  v_total_deleted int := 0;
  v_note text := 'residual_sweep';
  r_child_fk record;
  v_has_deleted_at boolean;
  v_has_is_deleted boolean;
  v_has_verified boolean;
  v_has_is_verified boolean;
  v_has_verification_status boolean;
  v_backup_table text;
  v_sql text;
  v_deleted int;
  v_sample_ids uuid[];
  v_text_cols text[];
  v_has_created_at boolean;
  r_slug record;
BEGIN
  -- Start run record
  INSERT INTO public.cleanup_backup__cleanup_runs (patterns, excluded_verified, notes)
  VALUES (ARRAY['residual_sweep'], true, v_note)
  RETURNING id INTO v_run_id;

  -- 1) Orphan cleanup across all FKs (public schema)
  FOR r_child_fk IN
    SELECT 
      c.conrelid::regclass::text AS child_table,
      c.confrelid::regclass::text AS parent_table,
      a_child.attname AS child_column,
      a_parent.attname AS parent_column
    FROM pg_constraint c
    JOIN unnest(c.conkey) WITH ORDINALITY AS ck(attnum, ord) ON true
    JOIN pg_attribute a_child ON a_child.attrelid = c.conrelid AND a_child.attnum = ck.attnum
    JOIN unnest(c.confkey) WITH ORDINALITY AS fk(attnum, ord2) ON ord2 = ck.ord
    JOIN pg_attribute a_parent ON a_parent.attrelid = c.confrelid AND a_parent.attnum = fk.attnum
    WHERE c.contype = 'f'
      AND split_part(c.conrelid::regclass::text, '.', 1) = 'public'
      AND split_part(c.confrelid::regclass::text, '.', 1) = 'public'
  LOOP
    -- Flags
    SELECT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name=split_part(r_child_fk.child_table, '.', 2) AND column_name='deleted_at') INTO v_has_deleted_at;
    SELECT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name=split_part(r_child_fk.child_table, '.', 2) AND column_name='is_deleted') INTO v_has_is_deleted;
    SELECT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name=split_part(r_child_fk.child_table, '.', 2) AND column_name='verified') INTO v_has_verified;
    SELECT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name=split_part(r_child_fk.child_table, '.', 2) AND column_name='is_verified') INTO v_has_is_verified;
    SELECT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name=split_part(r_child_fk.child_table, '.', 2) AND column_name='verification_status') INTO v_has_verification_status;

    -- Ensure backup table exists
    v_backup_table := format('cleanup_backup__%s', split_part(r_child_fk.child_table, '.', 2));
    v_sql := format('CREATE TABLE IF NOT EXISTS public.%I (LIKE %s INCLUDING DEFAULTS)', v_backup_table, r_child_fk.child_table);
    EXECUTE v_sql;

    -- Backup orphans
    v_sql := format(
      'INSERT INTO public.%I
       SELECT * FROM %s ch
       WHERE NOT EXISTS (
         SELECT 1 FROM %s p
         WHERE CAST(p.%I AS text) = CAST(ch.%I AS text)
       )%s',
      v_backup_table,
      r_child_fk.child_table,
      r_child_fk.parent_table,
      r_child_fk.parent_column,
      r_child_fk.child_column,
      CASE 
        WHEN v_has_verification_status THEN ' AND COALESCE((ch.verification_status)::text, '''') <> ''verified''' 
        WHEN v_has_verified THEN ' AND COALESCE(ch.verified, false) = false'
        WHEN v_has_is_verified THEN ' AND COALESCE(ch.is_verified, false) = false'
        ELSE ''
      END
    );
    EXECUTE v_sql;

    -- Sample ids for report
    v_sql := format(
      'SELECT array_agg(ch.%I) FROM (
         SELECT %I FROM %s ch
         WHERE NOT EXISTS (SELECT 1 FROM %s p WHERE CAST(p.%I AS text) = CAST(ch.%I AS text))
         LIMIT 5
       ) s',
      'id', 'id', r_child_fk.child_table, r_child_fk.parent_table, r_child_fk.parent_column, r_child_fk.child_column
    );
    BEGIN EXECUTE v_sql INTO v_sample_ids; EXCEPTION WHEN OTHERS THEN v_sample_ids := NULL; END;

    -- Delete or soft-delete
    IF v_has_deleted_at OR v_has_is_deleted THEN
      v_sql := format(
        'UPDATE %s ch SET %s WHERE NOT EXISTS (
           SELECT 1 FROM %s p WHERE CAST(p.%I AS text) = CAST(ch.%I AS text)
         )%s',
        r_child_fk.child_table,
        CASE WHEN v_has_deleted_at THEN 'deleted_at = now()' ELSE 'is_deleted = true' END,
        r_child_fk.parent_table,
        r_child_fk.parent_column,
        r_child_fk.child_column,
        CASE 
          WHEN v_has_verification_status THEN ' AND COALESCE((ch.verification_status)::text, '''') <> ''verified''' 
          WHEN v_has_verified THEN ' AND COALESCE(ch.verified, false) = false'
          WHEN v_has_is_verified THEN ' AND COALESCE(ch.is_verified, false) = false'
          ELSE ''
        END
      );
    ELSE
      v_sql := format(
        'DELETE FROM %s ch WHERE NOT EXISTS (
           SELECT 1 FROM %s p WHERE CAST(p.%I AS text) = CAST(ch.%I AS text)
         )%s',
        r_child_fk.child_table,
        r_child_fk.parent_table,
        r_child_fk.parent_column,
        r_child_fk.child_column,
        CASE 
          WHEN v_has_verification_status THEN ' AND COALESCE((ch.verification_status)::text, '''') <> ''verified''' 
          WHEN v_has_verified THEN ' AND COALESCE(ch.verified, false) = false'
          WHEN v_has_is_verified THEN ' AND COALESCE(ch.is_verified, false) = false'
          ELSE ''
        END
      );
    END IF;
    EXECUTE v_sql;
    GET DIAGNOSTICS v_deleted = ROW_COUNT;

    IF v_deleted > 0 THEN
      v_tables_processed := v_tables_processed + 1;
      v_total_deleted := v_total_deleted + v_deleted;
      INSERT INTO public.cleanup_backup__cleanup_reports (run_id, table_name, deleted_count, backed_up, backup_table, sample_ids)
      VALUES (v_run_id, split_part(r_child_fk.child_table, '.', 2), v_deleted, true, v_backup_table, v_sample_ids);
    END IF;
  END LOOP;

  -- 2) Duplicate cleanup for tables with a slug column (keep earliest)
  FOR r_slug IN
    SELECT table_name
    FROM information_schema.columns
    WHERE table_schema='public' AND column_name='slug' AND data_type IN ('text','character varying')
  LOOP
    SELECT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name=r_slug.table_name AND column_name='deleted_at') INTO v_has_deleted_at;
    SELECT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name=r_slug.table_name AND column_name='is_deleted') INTO v_has_is_deleted;
    SELECT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name=r_slug.table_name AND column_name='verified') INTO v_has_verified;
    SELECT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name=r_slug.table_name AND column_name='is_verified') INTO v_has_is_verified;
    SELECT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name=r_slug.table_name AND column_name='verification_status') INTO v_has_verification_status;
    SELECT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name=r_slug.table_name AND column_name='created_at') INTO v_has_created_at;

    v_backup_table := format('cleanup_backup__%s', r_slug.table_name);
    v_sql := format('CREATE TABLE IF NOT EXISTS public.%I (LIKE public.%I INCLUDING DEFAULTS)', v_backup_table, r_slug.table_name);
    EXECUTE v_sql;

    -- Backup duplicates (rn>1)
    v_sql := format(
      'WITH d AS (
         SELECT id, ROW_NUMBER() OVER (PARTITION BY slug ORDER BY %s, id) rn
         FROM public.%I
         WHERE slug IS NOT NULL %s
       )
       INSERT INTO public.%I
       SELECT t.* FROM public.%I t JOIN d ON d.id = t.id WHERE d.rn > 1',
      CASE WHEN v_has_created_at THEN 'COALESCE(created_at, ''epoch''::timestamptz)' ELSE 'id' END,
      r_slug.table_name,
      CASE 
        WHEN v_has_verification_status THEN ' AND COALESCE((verification_status)::text, '''') <> ''verified''' 
        WHEN v_has_verified THEN ' AND COALESCE(verified, false) = false'
        WHEN v_has_is_verified THEN ' AND COALESCE(is_verified, false) = false'
        ELSE ''
      END,
      v_backup_table,
      r_slug.table_name
    );
    EXECUTE v_sql;

    -- Delete/soft-delete duplicates
    IF v_has_deleted_at OR v_has_is_deleted THEN
      v_sql := format(
        'WITH d AS (
           SELECT id, ROW_NUMBER() OVER (PARTITION BY slug ORDER BY %s, id) rn
           FROM public.%I
           WHERE slug IS NOT NULL %s
         )
         UPDATE public.%I t SET %s FROM d WHERE d.id = t.id AND d.rn > 1',
        CASE WHEN v_has_created_at THEN 'COALESCE(created_at, ''epoch''::timestamptz)' ELSE 'id' END,
        r_slug.table_name,
        CASE 
          WHEN v_has_verification_status THEN ' AND COALESCE((verification_status)::text, '''') <> ''verified''' 
          WHEN v_has_verified THEN ' AND COALESCE(verified, false) = false'
          WHEN v_has_is_verified THEN ' AND COALESCE(is_verified, false) = false'
          ELSE ''
        END,
        r_slug.table_name,
        CASE WHEN v_has_deleted_at THEN 'deleted_at = now()' ELSE 'is_deleted = true' END
      );
    ELSE
      v_sql := format(
        'WITH d AS (
           SELECT id, ROW_NUMBER() OVER (PARTITION BY slug ORDER BY %s, id) rn
           FROM public.%I
           WHERE slug IS NOT NULL %s
         )
         DELETE FROM public.%I t USING d WHERE d.id = t.id AND d.rn > 1',
        CASE WHEN v_has_created_at THEN 'COALESCE(created_at, ''epoch''::timestamptz)' ELSE 'id' END,
        r_slug.table_name,
        CASE 
          WHEN v_has_verification_status THEN ' AND COALESCE((verification_status)::text, '''') <> ''verified''' 
          WHEN v_has_verified THEN ' AND COALESCE(verified, false) = false'
          WHEN v_has_is_verified THEN ' AND COALESCE(is_verified, false) = false'
          ELSE ''
        END,
        r_slug.table_name
      );
    END IF;
    EXECUTE v_sql;
    GET DIAGNOSTICS v_deleted = ROW_COUNT;

    IF v_deleted > 0 THEN
      v_tables_processed := v_tables_processed + 1;
      v_total_deleted := v_total_deleted + v_deleted;
      INSERT INTO public.cleanup_backup__cleanup_reports (run_id, table_name, deleted_count, backed_up, backup_table)
      VALUES (v_run_id, r_slug.table_name, v_deleted, true, v_backup_table);
    END IF;
  END LOOP;

  -- Finish
  UPDATE public.cleanup_backup__cleanup_runs
  SET run_ended_at = now(), tables_processed = v_tables_processed, total_deleted = v_total_deleted
  WHERE id = v_run_id;

  RETURN jsonb_build_object('run_id', v_run_id, 'tables_processed', v_tables_processed, 'total_deleted', v_total_deleted);
END;
$$;

-- Execute the residual sweep now
DO $$
DECLARE v jsonb; BEGIN v := public.cleanup_residuals(); RAISE NOTICE 'Residual result: %', v; END $$;