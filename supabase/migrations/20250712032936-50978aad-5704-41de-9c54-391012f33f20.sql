-- Create storage buckets for marketplace
insert into storage.buckets (id, name, public) values ('kyc-documents', 'kyc-documents', false);
insert into storage.buckets (id, name, public) values ('product-images', 'product-images', true);

-- Create storage policies for KYC documents (private)
create policy "KYC documents are only accessible by the owner" 
on storage.objects 
for select 
using (bucket_id = 'kyc-documents' AND auth.uid()::text = (storage.foldername(name))[1]);

create policy "Users can upload their own KYC documents" 
on storage.objects 
for insert 
with check (bucket_id = 'kyc-documents' AND auth.uid()::text = (storage.foldername(name))[1]);

-- Create storage policies for product images (public)
create policy "Product images are publicly accessible" 
on storage.objects 
for select 
using (bucket_id = 'product-images');

create policy "Vendors can upload product images" 
on storage.objects 
for insert 
with check (bucket_id = 'product-images' AND auth.uid() is not null);