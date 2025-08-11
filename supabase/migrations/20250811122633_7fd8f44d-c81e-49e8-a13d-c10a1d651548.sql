-- Add user ownership to categories and enforce uniqueness per user
ALTER TABLE public.categories
ADD COLUMN IF NOT EXISTS user_id uuid;

-- Indexes for performance and uniqueness
CREATE INDEX IF NOT EXISTS idx_categories_user_id ON public.categories(user_id);
CREATE UNIQUE INDEX IF NOT EXISTS categories_user_name_unique ON public.categories (user_id, lower(name));

-- Ensure RLS policies for write operations (keep existing public SELECT policies for transparency)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'public' AND tablename = 'categories' AND policyname = 'Users can create their own categories'
  ) THEN
    CREATE POLICY "Users can create their own categories"
    ON public.categories
    FOR INSERT
    WITH CHECK (auth.uid() = user_id);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'public' AND tablename = 'categories' AND policyname = 'Users can update their own categories'
  ) THEN
    CREATE POLICY "Users can update their own categories"
    ON public.categories
    FOR UPDATE
    USING (auth.uid() = user_id);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'public' AND tablename = 'categories' AND policyname = 'Users can delete their own categories'
  ) THEN
    CREATE POLICY "Users can delete their own categories"
    ON public.categories
    FOR DELETE
    USING (auth.uid() = user_id);
  END IF;
END $$;