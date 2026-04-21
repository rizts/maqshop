-- Function to seed default chart of accounts for a new organization
-- This should be called by a trigger when a new organization is created
CREATE OR REPLACE FUNCTION seed_default_coa()
RETURNS TRIGGER AS $$
BEGIN
  -- Insert default COA records for the new organization
  INSERT INTO public.chart_of_accounts (org_id, kode, nama, tipe, is_system, urutan, aktif)
  VALUES 
    (NEW.id, '1000', 'Kas & Bank', 'asset', true, 10, true),
    (NEW.id, '1001', 'Kas Kecil Maqshof', 'asset', true, 11, true),
    (NEW.id, '2000', 'Dana Tabungan Santri', 'liability', true, 20, true),
    (NEW.id, '3000', 'Modal', 'equity', true, 30, true),
    (NEW.id, '4000', 'Pendapatan', 'revenue', true, 40, true),
    (NEW.id, '4001', 'Penjualan Maqshof', 'revenue', true, 41, true),
    (NEW.id, '5000', 'HPP', 'cogs', true, 50, true),
    (NEW.id, '5001', 'HPP Maqshof', 'cogs', true, 51, true),
    (NEW.id, '6000', 'Beban Operasional', 'expense', true, 60, true),
    (NEW.id, '6001', 'Beban Listrik & Air', 'expense', false, 61, true),
    (NEW.id, '6002', 'Beban Gaji', 'expense', false, 62, true),
    (NEW.id, '6003', 'Beban Lain-lain', 'expense', false, 63, true);
    
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger on organizations table
DROP TRIGGER IF EXISTS trg_seed_default_coa ON public.organizations;
CREATE TRIGGER trg_seed_default_coa
AFTER INSERT ON public.organizations
FOR EACH ROW
EXECUTE FUNCTION seed_default_coa();
