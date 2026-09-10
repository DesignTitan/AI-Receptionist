-- Public roadmap data is accessed only through trusted server routes. Visitor IDs are
-- opaque hashes, never account IDs; pending suggestions and visitor hashes stay private.
BEGIN;

CREATE TABLE IF NOT EXISTS public.roadmap_suggestions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  voter_id text NOT NULL CHECK (voter_id ~ '^[a-zA-Z0-9_-]{1,200}$'),
  title text NOT NULL CHECK (length(btrim(title)) BETWEEN 1 AND 180),
  title_key text NOT NULL UNIQUE,
  description text NOT NULL CHECK (length(btrim(description)) BETWEEN 1 AND 2000),
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'declined')),
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS roadmap_suggestion_voter_date ON public.roadmap_suggestions(voter_id, created_at);
CREATE TABLE IF NOT EXISTS public.roadmap_features (
  id text PRIMARY KEY CHECK (length(id) BETWEEN 1 AND 160),
  title text NOT NULL CHECK (length(btrim(title)) BETWEEN 1 AND 180),
  description text NOT NULL CHECK (length(btrim(description)) BETWEEN 1 AND 2000),
  status text NOT NULL CHECK (status IN ('planned', 'pilot', 'exploring')),
  source text NOT NULL CHECK (source IN ('team', 'community')),
  active boolean NOT NULL DEFAULT true,
  position integer NOT NULL DEFAULT 0,
  suggestion_id uuid UNIQUE REFERENCES public.roadmap_suggestions(id),
  created_at timestamptz NOT NULL DEFAULT now(),
  CHECK ((source = 'team' AND suggestion_id IS NULL) OR (source = 'community' AND suggestion_id IS NOT NULL))
);
CREATE TABLE IF NOT EXISTS public.roadmap_votes (
  feature_id text NOT NULL REFERENCES public.roadmap_features(id),
  voter_id text NOT NULL CHECK (voter_id ~ '^[a-zA-Z0-9_-]{1,200}$'),
  created_at timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY (feature_id, voter_id)
);

ALTER TABLE public.roadmap_suggestions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.roadmap_features ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.roadmap_votes ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON public.roadmap_suggestions, public.roadmap_features, public.roadmap_votes FROM PUBLIC, anon, authenticated;
GRANT ALL ON public.roadmap_suggestions, public.roadmap_features, public.roadmap_votes TO service_role;

-- A small, shared transaction lock serializes catalogue updates, vote intents, and
-- moderation. The per-visitor submission cap and duplicate checks cannot race.
CREATE OR REPLACE FUNCTION public.roadmap_sync_seeds(p_seeds jsonb)
RETURNS void LANGUAGE plpgsql SECURITY DEFINER SET search_path = '' AS $$
DECLARE seed jsonb; ordinal bigint;
BEGIN
  PERFORM pg_catalog.pg_advisory_xact_lock(710109, 20260910);
  IF jsonb_typeof(p_seeds) IS DISTINCT FROM 'array' OR jsonb_array_length(p_seeds) > 100 THEN
    RAISE EXCEPTION 'Invalid canonical roadmap catalogue.';
  END IF;
  IF (SELECT count(*) <> count(DISTINCT value->>'id') FROM jsonb_array_elements(p_seeds)) THEN
    RAISE EXCEPTION 'Invalid canonical roadmap catalogue.';
  END IF;
  UPDATE public.roadmap_features SET active = false WHERE source = 'team';
  FOR seed, ordinal IN SELECT value, ordinality FROM jsonb_array_elements(p_seeds) WITH ORDINALITY LOOP
    IF COALESCE(seed->>'id', '') !~ '^[a-z0-9][a-z0-9-]{0,119}$' OR seed->>'id' LIKE 'community-%'
      OR COALESCE(length(btrim(seed->>'title')), 0) NOT BETWEEN 1 AND 180
      OR COALESCE(length(btrim(seed->>'description')), 0) NOT BETWEEN 1 AND 2000
      OR COALESCE(seed->>'status', '') NOT IN ('planned', 'pilot', 'exploring') THEN
      RAISE EXCEPTION 'Invalid canonical roadmap catalogue.';
    END IF;
    INSERT INTO public.roadmap_features(id, title, description, status, source, active, position)
    VALUES (seed->>'id', seed->>'title', seed->>'description', seed->>'status', 'team', true, ordinal::integer)
    ON CONFLICT(id) DO UPDATE SET title = EXCLUDED.title, description = EXCLUDED.description,
      status = EXCLUDED.status, active = true, position = EXCLUDED.position
      WHERE public.roadmap_features.source = 'team';
  END LOOP;
END;
$$;

CREATE OR REPLACE FUNCTION public.roadmap_items(p_voter text)
RETURNS jsonb LANGUAGE sql STABLE SECURITY DEFINER SET search_path = '' AS $$
  SELECT COALESCE(jsonb_agg(jsonb_build_object(
    'id', f.id, 'title', f.title, 'description', f.description, 'status', f.status, 'source', f.source,
    'votes', (SELECT count(*) FROM public.roadmap_votes v WHERE v.feature_id = f.id),
    'hasVoted', EXISTS(SELECT 1 FROM public.roadmap_votes v WHERE v.feature_id = f.id AND v.voter_id = p_voter)
  ) ORDER BY CASE f.source WHEN 'team' THEN 0 ELSE 1 END, f.position, f.created_at, f.id), '[]'::jsonb)
  FROM public.roadmap_features f
  WHERE f.active AND (f.source = 'team' OR EXISTS (
    SELECT 1 FROM public.roadmap_suggestions s WHERE s.id = f.suggestion_id AND s.status = 'approved'
  ));
$$;

CREATE OR REPLACE FUNCTION public.roadmap_get(p_seeds jsonb, p_voter text)
RETURNS jsonb LANGUAGE plpgsql SECURITY DEFINER SET search_path = '' AS $$
BEGIN
  IF COALESCE(p_voter, '') !~ '^[a-zA-Z0-9_-]{1,200}$' THEN RAISE EXCEPTION 'Invalid visitor identity.'; END IF;
  PERFORM public.roadmap_sync_seeds(p_seeds);
  RETURN public.roadmap_items(p_voter);
END;
$$;

CREATE OR REPLACE FUNCTION public.roadmap_vote(p_seeds jsonb, p_voter text, p_feature text, p_voted boolean)
RETURNS jsonb LANGUAGE plpgsql SECURITY DEFINER SET search_path = '' AS $$
BEGIN
  IF COALESCE(p_voter, '') !~ '^[a-zA-Z0-9_-]{1,200}$' OR p_voted IS NULL THEN RAISE EXCEPTION 'Invalid vote.'; END IF;
  PERFORM public.roadmap_sync_seeds(p_seeds);
  IF NOT EXISTS (SELECT 1 FROM public.roadmap_features f WHERE f.id = p_feature AND f.active
    AND (f.source = 'team' OR EXISTS (SELECT 1 FROM public.roadmap_suggestions s WHERE s.id = f.suggestion_id AND s.status = 'approved'))) THEN
    RAISE EXCEPTION 'This roadmap feature is not available.';
  END IF;
  IF p_voted THEN
    INSERT INTO public.roadmap_votes(feature_id, voter_id) VALUES(p_feature, p_voter)
    ON CONFLICT(feature_id, voter_id) DO NOTHING;
  ELSE
    DELETE FROM public.roadmap_votes WHERE feature_id = p_feature AND voter_id = p_voter;
  END IF;
  RETURN public.roadmap_items(p_voter);
END;
$$;

CREATE OR REPLACE FUNCTION public.roadmap_suggest(p_voter text, p_title text, p_description text)
RETURNS jsonb LANGUAGE plpgsql SECURITY DEFINER SET search_path = '' AS $$
DECLARE record public.roadmap_suggestions%ROWTYPE; normalized_title text; normalized_key text;
BEGIN
  PERFORM pg_catalog.pg_advisory_xact_lock(710109, 20260910);
  normalized_title := regexp_replace(btrim(p_title), '[[:space:]]+', ' ', 'g');
  normalized_key := lower(normalized_title);
  IF COALESCE(p_voter, '') !~ '^[a-zA-Z0-9_-]{1,200}$'
    OR COALESCE(length(normalized_title), 0) NOT BETWEEN 1 AND 180
    OR COALESCE(length(btrim(p_description)), 0) NOT BETWEEN 1 AND 2000 THEN
    RAISE EXCEPTION 'Invalid suggestion.';
  END IF;
  IF EXISTS (SELECT 1 FROM public.roadmap_suggestions WHERE title_key = normalized_key) THEN
    RAISE EXCEPTION 'That idea has already been submitted.';
  END IF;
  IF (SELECT count(*) FROM public.roadmap_suggestions WHERE voter_id = p_voter AND created_at >= now() - interval '24 hours') >= 3 THEN
    RAISE EXCEPTION 'You can suggest up to three features in 24 hours. Please try again tomorrow.';
  END IF;
  INSERT INTO public.roadmap_suggestions(voter_id, title, title_key, description)
  VALUES(p_voter, normalized_title, normalized_key, btrim(p_description)) RETURNING * INTO record;
  RETURN jsonb_build_object('id', record.id, 'title', record.title, 'description', record.description,
    'status', record.status, 'createdAt', record.created_at);
END;
$$;

CREATE OR REPLACE FUNCTION public.roadmap_list_suggestions()
RETURNS jsonb LANGUAGE sql STABLE SECURITY DEFINER SET search_path = '' AS $$
  SELECT COALESCE(jsonb_agg(jsonb_build_object('id', id, 'title', title, 'description', description,
    'status', status, 'createdAt', created_at) ORDER BY created_at DESC, id), '[]'::jsonb)
  FROM public.roadmap_suggestions;
$$;

CREATE OR REPLACE FUNCTION public.roadmap_review(p_id uuid, p_status text)
RETURNS void LANGUAGE plpgsql SECURITY DEFINER SET search_path = '' AS $$
DECLARE record public.roadmap_suggestions%ROWTYPE;
BEGIN
  PERFORM pg_catalog.pg_advisory_xact_lock(710109, 20260910);
  IF p_status IS NULL OR p_status NOT IN ('approved', 'declined') THEN RAISE EXCEPTION 'Invalid suggestion review.'; END IF;
  SELECT * INTO record FROM public.roadmap_suggestions WHERE id = p_id FOR UPDATE;
  IF NOT FOUND THEN RAISE EXCEPTION 'That suggestion could not be found.'; END IF;
  UPDATE public.roadmap_suggestions SET status = p_status WHERE id = p_id;
  IF p_status = 'approved' THEN
    INSERT INTO public.roadmap_features(id, title, description, status, source, active, suggestion_id, created_at)
    VALUES('community-' || record.id, record.title, record.description, 'exploring', 'community', true, record.id, record.created_at)
    ON CONFLICT(id) DO UPDATE SET active = true, title = EXCLUDED.title, description = EXCLUDED.description;
  ELSE
    UPDATE public.roadmap_features SET active = false WHERE suggestion_id = p_id;
  END IF;
END;
$$;

REVOKE ALL ON FUNCTION public.roadmap_sync_seeds(jsonb), public.roadmap_items(text),
  public.roadmap_get(jsonb,text), public.roadmap_vote(jsonb,text,text,boolean),
  public.roadmap_suggest(text,text,text), public.roadmap_list_suggestions(), public.roadmap_review(uuid,text)
  FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.roadmap_sync_seeds(jsonb), public.roadmap_items(text),
  public.roadmap_get(jsonb,text), public.roadmap_vote(jsonb,text,text,boolean),
  public.roadmap_suggest(text,text,text), public.roadmap_list_suggestions(), public.roadmap_review(uuid,text)
  TO service_role;
COMMIT;
