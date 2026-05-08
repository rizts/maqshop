-- 1. Create or Update the Seeding Function
CREATE OR REPLACE FUNCTION seed_default_coa()
RETURNS TRIGGER AS $$
BEGIN
  -- Insert default COA records for the new organization
  INSERT INTO public.chart_of_accounts (org_id, kode, nama, tipe, is_system, urutan, aktif)
  VALUES 
    (NEW.id, '1000', 'Kas & Bank', 'asset', true, 10, true),
    (NEW.id, '1001', 'Kas Kecil Maqshof', 'asset', true, 11, true),
    (NEW.id, '1100', 'Persediaan Barang', 'asset', true, 12, true),
    (NEW.id, '2000', 'Dana Tabungan Santri', 'liability', true, 20, true),
    (NEW.id, '3000', 'Modal', 'equity', true, 30, true),
    (NEW.id, '4000', 'Pendapatan', 'revenue', true, 40, true),
    (NEW.id, '4001', 'Penjualan Maqshof', 'revenue', true, 41, true),
    (NEW.id, '5000', 'HPP', 'cogs', true, 50, true),
    (NEW.id, '5001', 'HPP Maqshof', 'cogs', true, 51, true),
    (NEW.id, '6000', 'Beban Operasional', 'expense', true, 60, true);
    
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 2. Ensure the Trigger exists on the organizations table
DROP TRIGGER IF EXISTS trg_seed_default_coa ON public.organizations;
CREATE TRIGGER trg_seed_default_coa
AFTER INSERT ON public.organizations
FOR EACH ROW
EXECUTE FUNCTION seed_default_coa();

-- 3. Backfill Existing Organizations
INSERT INTO public.chart_of_accounts (org_id, kode, nama, tipe, is_system, urutan, aktif)
SELECT o.id, t.kode, t.nama, t.tipe, t.is_system, t.urutan, t.aktif
FROM public.organizations o
CROSS JOIN (
  VALUES 
    ('1000', 'Kas & Bank', 'asset', true, 10, true),
    ('1001', 'Kas Kecil Maqshof', 'asset', true, 11, true),
    ('1100', 'Persediaan Barang', 'asset', true, 12, true),
    ('2000', 'Dana Tabungan Santri', 'liability', true, 20, true),
    ('3000', 'Modal', 'equity', true, 30, true),
    ('4000', 'Pendapatan', 'revenue', true, 40, true),
    ('4001', 'Penjualan Maqshof', 'revenue', true, 41, true),
    ('5000', 'HPP', 'cogs', true, 50, true),
    ('5001', 'HPP Maqshof', 'cogs', true, 51, true),
    ('6000', 'Beban Operasional', 'expense', true, 60, true)
) AS t(kode, nama, tipe, is_system, urutan, aktif)
WHERE NOT EXISTS (
  SELECT 1 FROM public.chart_of_accounts coa 
  WHERE coa.org_id = o.id AND coa.kode = t.kode
);
