-- Create storage bucket for receipts if it doesn't exist
INSERT INTO storage.buckets (id, name, public) 
VALUES ('receipts', 'receipts', true)
ON CONFLICT (id) DO NOTHING;

-- RLS policies for storage.objects in the receipts bucket
-- 1. Allow public to read receipts (since bucket is public)
CREATE POLICY "Public Access" 
ON storage.objects FOR SELECT 
USING (bucket_id = 'receipts');

-- 2. Allow authenticated users to upload their own receipts
CREATE POLICY "Authenticated Upload" 
ON storage.objects FOR INSERT 
WITH CHECK (
  bucket_id = 'receipts' AND 
  auth.role() = 'authenticated'
);

-- 3. Allow admins/staff to delete/update (optional, for management)
CREATE POLICY "Admin Manage Receipts" 
ON storage.objects FOR ALL 
USING (
  bucket_id = 'receipts' AND 
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE id = auth.uid() AND role IN ('superadmin', 'admin', 'staff')
  )
);
