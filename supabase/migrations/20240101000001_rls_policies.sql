-- ============================================================
-- RLS POLICIES FOR DEPOSANTRI
-- ============================================================

-- Function to get current user's organization_id from profiles
CREATE OR REPLACE FUNCTION get_user_org_id() 
RETURNS UUID 
LANGUAGE sql 
STABLE SECURITY DEFINER AS $$
  SELECT org_id FROM public.profiles WHERE id = auth.uid();
$$;

-- Function to check if user is superadmin
CREATE OR REPLACE FUNCTION is_superadmin() 
RETURNS BOOLEAN 
LANGUAGE sql 
STABLE SECURITY DEFINER AS $$
  SELECT role = 'superadmin' FROM public.profiles WHERE id = auth.uid();
$$;

-- Function to check if user is admin
CREATE OR REPLACE FUNCTION is_admin() 
RETURNS BOOLEAN 
LANGUAGE sql 
STABLE SECURITY DEFINER AS $$
  SELECT role IN ('superadmin', 'admin') FROM public.profiles WHERE id = auth.uid();
$$;

-- Function to get user role
CREATE OR REPLACE FUNCTION get_user_role() 
RETURNS TEXT 
LANGUAGE sql 
STABLE SECURITY DEFINER AS $$
  SELECT role FROM public.profiles WHERE id = auth.uid();
$$;

-- Function to get user division
CREATE OR REPLACE FUNCTION get_user_division() 
RETURNS TEXT 
LANGUAGE sql 
STABLE SECURITY DEFINER AS $$
  SELECT division FROM public.profiles WHERE id = auth.uid();
$$;

-- Enable RLS on all tables
ALTER TABLE public.organizations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.santri ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.guardian_santri ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tabungan ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.topup_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.transaksi_tabungan ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.kategori_produk ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.produk ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.stok_log ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.pos_transaksi ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.pos_transaksi_detail ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.chart_of_accounts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.jurnal ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.jurnal_detail ENABLE ROW LEVEL SECURITY;

-- ============================================================
-- POLICIES
-- ============================================================

-- 1. Organizations
-- Superadmin can do everything.
-- Users can read their own organization.
-- Public can read active organizations for login/registration (if needed by slug).

CREATE POLICY "Anyone can view active organizations" 
  ON public.organizations FOR SELECT 
  USING (status = 'active');

CREATE POLICY "Superadmin can manage organizations" 
  ON public.organizations FOR ALL 
  USING (is_superadmin());

CREATE POLICY "Org admins can update their org" 
  ON public.organizations FOR UPDATE 
  USING (id = get_user_org_id() AND is_admin());

-- 2. Profiles
-- Users can see profiles in their own org. Superadmin sees all.
-- Users can update their own profile. Admin can update profiles in their org.

CREATE POLICY "Users can view profiles in their org" 
  ON public.profiles FOR SELECT 
  USING (org_id = get_user_org_id() OR is_superadmin() OR id = auth.uid());

CREATE POLICY "Users can update their own profile" 
  ON public.profiles FOR UPDATE 
  USING (id = auth.uid());

CREATE POLICY "Admins can manage profiles in their org" 
  ON public.profiles FOR ALL 
  USING ((org_id = get_user_org_id() AND is_admin()) OR is_superadmin());

-- 3. Santri
-- Superadmin sees all. Admin/Staff sees santri in their org based on division.
-- Ortu sees only their own children.

CREATE POLICY "Staff/Admin can view santri in org based on division" 
  ON public.santri FOR SELECT 
  USING (
    is_superadmin() OR 
    (org_id = get_user_org_id() AND 
     get_user_role() IN ('admin', 'staff') AND 
     (get_user_division() = 'all' OR 
      (get_user_division() = 'banin' AND gender = 'male') OR 
      (get_user_division() = 'banat' AND gender = 'female')))
  );

CREATE POLICY "Ortu can view their own children" 
  ON public.santri FOR SELECT 
  USING (
    id IN (SELECT santri_id FROM public.guardian_santri WHERE guardian_id = auth.uid())
  );

CREATE POLICY "Admins can manage santri in their org" 
  ON public.santri FOR ALL 
  USING ((org_id = get_user_org_id() AND is_admin()) OR is_superadmin());

-- 4. Guardian_Santri
CREATE POLICY "Users can view guardian relations in their org" 
  ON public.guardian_santri FOR SELECT 
  USING (org_id = get_user_org_id() OR is_superadmin());

CREATE POLICY "Admins can manage guardian relations" 
  ON public.guardian_santri FOR ALL 
  USING ((org_id = get_user_org_id() AND is_admin()) OR is_superadmin());

-- 5. Tabungan
CREATE POLICY "Staff/Admin can view tabungan based on division" 
  ON public.tabungan FOR SELECT 
  USING (
    is_superadmin() OR 
    (org_id = get_user_org_id() AND 
     get_user_role() IN ('admin', 'staff') AND 
     santri_id IN (
       SELECT id FROM public.santri WHERE 
       get_user_division() = 'all' OR 
       (get_user_division() = 'banin' AND gender = 'male') OR 
       (get_user_division() = 'banat' AND gender = 'female')
     ))
  );

CREATE POLICY "Ortu can view tabungan of their children" 
  ON public.tabungan FOR SELECT 
  USING (
    santri_id IN (SELECT santri_id FROM public.guardian_santri WHERE guardian_id = auth.uid())
  );

CREATE POLICY "Staff/Admin can update tabungan" 
  ON public.tabungan FOR ALL 
  USING ((org_id = get_user_org_id() AND get_user_role() IN ('admin', 'staff')) OR is_superadmin());

-- 6. Transaksi Tabungan
CREATE POLICY "Staff/Admin can view transaksi based on division" 
  ON public.transaksi_tabungan FOR SELECT 
  USING (
    is_superadmin() OR 
    (org_id = get_user_org_id() AND 
     get_user_role() IN ('admin', 'staff') AND 
     santri_id IN (
       SELECT id FROM public.santri WHERE 
       get_user_division() = 'all' OR 
       (get_user_division() = 'banin' AND gender = 'male') OR 
       (get_user_division() = 'banat' AND gender = 'female')
     ))
  );

CREATE POLICY "Ortu can view transaksi of their children" 
  ON public.transaksi_tabungan FOR SELECT 
  USING (
    santri_id IN (SELECT santri_id FROM public.guardian_santri WHERE guardian_id = auth.uid())
  );

CREATE POLICY "Staff/Admin can insert transaksi" 
  ON public.transaksi_tabungan FOR INSERT 
  WITH CHECK ((org_id = get_user_org_id() AND get_user_role() IN ('admin', 'staff')) OR is_superadmin());

-- 7. Topup Requests
CREATE POLICY "Staff/Admin can view topup requests based on division" 
  ON public.topup_requests FOR SELECT 
  USING (
    is_superadmin() OR 
    (org_id = get_user_org_id() AND 
     get_user_role() IN ('admin', 'staff') AND 
     santri_id IN (
       SELECT id FROM public.santri WHERE 
       get_user_division() = 'all' OR 
       (get_user_division() = 'banin' AND gender = 'male') OR 
       (get_user_division() = 'banat' AND gender = 'female')
     ))
  );

CREATE POLICY "Ortu can view their own topup requests" 
  ON public.topup_requests FOR SELECT 
  USING (pengaju_id = auth.uid());

CREATE POLICY "Ortu can insert topup requests for their children" 
  ON public.topup_requests FOR INSERT 
  WITH CHECK (
    pengaju_id = auth.uid() AND 
    santri_id IN (SELECT santri_id FROM public.guardian_santri WHERE guardian_id = auth.uid())
  );

CREATE POLICY "Staff can insert topup requests" 
  ON public.topup_requests FOR INSERT 
  WITH CHECK (org_id = get_user_org_id() AND get_user_role() = 'staff');

CREATE POLICY "Admin can update topup requests" 
  ON public.topup_requests FOR UPDATE 
  USING ((org_id = get_user_org_id() AND is_admin()) OR is_superadmin());

-- 8. Kategori & Produk (Public to org members)
CREATE POLICY "Org members can view produk" 
  ON public.produk FOR SELECT 
  USING (org_id = get_user_org_id() OR is_superadmin());

CREATE POLICY "Admin can manage produk" 
  ON public.produk FOR ALL 
  USING ((org_id = get_user_org_id() AND is_admin()) OR is_superadmin());

CREATE POLICY "Org members can view kategori" 
  ON public.kategori_produk FOR SELECT 
  USING (org_id = get_user_org_id() OR is_superadmin());

CREATE POLICY "Admin can manage kategori" 
  ON public.kategori_produk FOR ALL 
  USING ((org_id = get_user_org_id() AND is_admin()) OR is_superadmin());

-- 9. Stok Log
CREATE POLICY "Admin can view stok log" 
  ON public.stok_log FOR SELECT 
  USING ((org_id = get_user_org_id() AND is_admin()) OR is_superadmin());

CREATE POLICY "Staff/Admin can insert stok log" 
  ON public.stok_log FOR INSERT 
  WITH CHECK ((org_id = get_user_org_id() AND get_user_role() IN ('admin', 'staff')) OR is_superadmin());

-- 10. POS Transaksi
CREATE POLICY "Staff/Admin can view pos transaksi based on division" 
  ON public.pos_transaksi FOR SELECT 
  USING (
    is_superadmin() OR 
    (org_id = get_user_org_id() AND 
     get_user_role() IN ('admin', 'staff') AND 
     santri_id IN (
       SELECT id FROM public.santri WHERE 
       get_user_division() = 'all' OR 
       (get_user_division() = 'banin' AND gender = 'male') OR 
       (get_user_division() = 'banat' AND gender = 'female')
     ))
  );

CREATE POLICY "Staff/Admin can insert pos transaksi" 
  ON public.pos_transaksi FOR INSERT 
  WITH CHECK ((org_id = get_user_org_id() AND get_user_role() IN ('admin', 'staff')) OR is_superadmin());

CREATE POLICY "Admin can update pos transaksi (void)" 
  ON public.pos_transaksi FOR UPDATE 
  USING ((org_id = get_user_org_id() AND is_admin()) OR is_superadmin());

-- POS Transaksi Detail
CREATE POLICY "Staff/Admin can view and insert pos detail" 
  ON public.pos_transaksi_detail FOR ALL 
  USING (
    pos_transaksi_id IN (SELECT id FROM public.pos_transaksi WHERE org_id = get_user_org_id()) OR is_superadmin()
  );

-- 11. Accounting
CREATE POLICY "Admin can view and manage accounting" 
  ON public.chart_of_accounts FOR ALL 
  USING ((org_id = get_user_org_id() AND is_admin()) OR is_superadmin());

CREATE POLICY "Admin can view and manage jurnal" 
  ON public.jurnal FOR ALL 
  USING ((org_id = get_user_org_id() AND is_admin()) OR is_superadmin());

CREATE POLICY "Admin can view and manage jurnal detail" 
  ON public.jurnal_detail FOR ALL 
  USING (
    jurnal_id IN (SELECT id FROM public.jurnal WHERE org_id = get_user_org_id()) OR is_superadmin()
  );

-- Function to handle new user registration triggers for Supabase Auth
-- Not added yet, can be added later if needed.
