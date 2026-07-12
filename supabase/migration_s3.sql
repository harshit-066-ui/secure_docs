-- Migration: switch from Supabase Storage (storage_path) to Amazon S3 (s3_key)
-- Run this in the Supabase SQL Editor if you already have the old schema

ALTER TABLE public.documents
  ADD COLUMN IF NOT EXISTS s3_key TEXT;

UPDATE public.documents
SET s3_key = storage_path
WHERE s3_key IS NULL AND storage_path IS NOT NULL;

ALTER TABLE public.documents
  ALTER COLUMN s3_key SET NOT NULL;

ALTER TABLE public.documents
  DROP COLUMN IF EXISTS storage_path;
