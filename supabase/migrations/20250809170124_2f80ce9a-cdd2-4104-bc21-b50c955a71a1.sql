-- Create public access policy for transparency portal
CREATE POLICY "Public access for transparency portal" 
ON public.transactions 
FOR SELECT 
TO anon, authenticated
USING (true);

-- Create public access policy for categories
CREATE POLICY "Public access for categories in transparency" 
ON public.categories 
FOR SELECT 
TO anon, authenticated
USING (true);