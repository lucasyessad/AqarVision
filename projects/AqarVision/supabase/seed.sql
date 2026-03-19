-- ============================================
-- AqarVision — Seed Data for Testing
-- Run via: psql or Supabase SQL Editor
-- ============================================

-- ──────────────────────────────────────────────
-- 1. Communes (sample for Alger, Oran, Constantine)
-- ──────────────────────────────────────────────
insert into public.communes (wilaya_code, name_fr, name_ar, name_en, location) values
  ('16', 'Bab El Oued',      'باب الوادي',     'Bab El Oued',      ST_MakePoint(3.0456, 36.7900)::geography),
  ('16', 'Hydra',             'حيدرة',          'Hydra',             ST_MakePoint(3.0200, 36.7500)::geography),
  ('16', 'El Biar',           'الأبيار',        'El Biar',           ST_MakePoint(3.0300, 36.7600)::geography),
  ('16', 'Bir Mourad Raïs',   'بئر مراد رايس',  'Bir Mourad Rais',   ST_MakePoint(3.0450, 36.7400)::geography),
  ('16', 'Bouzareah',         'بوزريعة',        'Bouzareah',         ST_MakePoint(3.0100, 36.7800)::geography),
  ('16', 'Kouba',             'القبة',          'Kouba',             ST_MakePoint(3.0800, 36.7200)::geography),
  ('16', 'Dar El Beïda',      'الدار البيضاء',  'Dar El Beida',      ST_MakePoint(3.2100, 36.7100)::geography),
  ('31', 'Oran Centre',       'وهران المركز',   'Oran Center',       ST_MakePoint(-0.6300, 35.6970)::geography),
  ('31', 'Bir El Djir',       'بئر الجير',      'Bir El Djir',       ST_MakePoint(-0.5800, 35.7200)::geography),
  ('31', 'Es Sénia',          'السانية',        'Es Senia',          ST_MakePoint(-0.6100, 35.6500)::geography),
  ('25', 'Constantine Centre','قسنطينة المركز',  'Constantine Center', ST_MakePoint(6.6147, 36.3650)::geography),
  ('25', 'El Khroub',         'الخروب',         'El Khroub',         ST_MakePoint(6.6900, 36.2600)::geography),
  ('09', 'Blida Centre',      'البليدة المركز', 'Blida Center',      ST_MakePoint(2.8300, 36.4700)::geography),
  ('06', 'Béjaïa Centre',     'بجاية المركز',   'Bejaia Center',     ST_MakePoint(5.0840, 36.7510)::geography),
  ('15', 'Tizi Ouzou Centre', 'تيزي وزو المركز','Tizi Ouzou Center', ST_MakePoint(4.0500, 36.7117)::geography)
on conflict do nothing;

-- ──────────────────────────────────────────────
-- 2. Plans (Starter, Pro, Enterprise)
-- ──────────────────────────────────────────────
insert into public.plans (name, slug, price_monthly, max_listings, max_media_per_listing, max_team_members, features) values
  ('Starter',    'starter',    2900,     10,  3,   2,  '{"analytics": false, "priority_support": false}'::jsonb),
  ('Pro',        'pro',        6900,     30,  10,  10, '{"analytics": true, "priority_support": false}'::jsonb),
  ('Enterprise', 'enterprise', 12900,    -1,  20,  -1, '{"analytics": true, "priority_support": true}'::jsonb)
on conflict (slug) do nothing;

-- ──────────────────────────────────────────────
-- 3. Agencies
-- ──────────────────────────────────────────────
insert into public.agencies (id, name, slug, description, phone, email, is_verified, whatsapp_phone, facebook_url, instagram_url) values
  ('a0000000-0000-0000-0000-000000000001', 'Immobilière El Djazair',   'immobiliere-el-djazair',   'Agence leader à Alger, spécialisée dans les biens résidentiels haut de gamme.', '+213 21 74 55 00', 'contact@eldjazair-immo.dz', true,  '+213 555 74 55 00', 'https://facebook.com/eldjazair.immo', 'https://instagram.com/eldjazair_immo'),
  ('a0000000-0000-0000-0000-000000000002', 'Oran Realty',              'oran-realty',              'Première agence immobilière à Oran. Vente, location et gestion locative.',       '+213 41 33 22 11', 'info@oran-realty.dz',       true,  '+213 555 33 22 11', 'https://facebook.com/oran.realty', null),
  ('a0000000-0000-0000-0000-000000000003', 'Constantine Immobilier',   'constantine-immobilier',   'Expert immobilier à Constantine et ses environs depuis 2010.',                   '+213 31 88 99 00', 'contact@constantine-immo.dz', false, null, null, null),
  ('a0000000-0000-0000-0000-000000000004', 'Blida Habitat',            'blida-habitat',            'Solutions immobilières complètes pour la wilaya de Blida.',                      '+213 25 44 33 22', 'info@blida-habitat.dz',     true,  '+213 555 44 33 22', null, null),
  ('a0000000-0000-0000-0000-000000000005', 'Kabylie Properties',       'kabylie-properties',       'Immobilier en Kabylie : Tizi Ouzou et Béjaïa.',                                 '+213 26 11 22 33', 'contact@kabylie-prop.dz',   false, null, null, null)
on conflict do nothing;

-- ──────────────────────────────────────────────
-- 4. Branches
-- ──────────────────────────────────────────────
insert into public.agency_branches (agency_id, name, wilaya_code, address_text, location) values
  ('a0000000-0000-0000-0000-000000000001', 'Siège Hydra',       '16', '12 Rue Didouche Mourad, Hydra, Alger', ST_MakePoint(3.0200, 36.7500)::geography),
  ('a0000000-0000-0000-0000-000000000001', 'Agence Kouba',      '16', '45 Boulevard Krim Belkacem, Kouba',    ST_MakePoint(3.0800, 36.7200)::geography),
  ('a0000000-0000-0000-0000-000000000002', 'Siège Oran Centre', '31', '8 Place du 1er Novembre, Oran',        ST_MakePoint(-0.6300, 35.6970)::geography),
  ('a0000000-0000-0000-0000-000000000003', 'Siège Constantine', '25', '22 Rue Larbi Ben M''hidi, Constantine', ST_MakePoint(6.6147, 36.3650)::geography),
  ('a0000000-0000-0000-0000-000000000004', 'Siège Blida',       '09', '5 Avenue de l''ALN, Blida',            ST_MakePoint(2.8300, 36.4700)::geography),
  ('a0000000-0000-0000-0000-000000000005', 'Agence Tizi Ouzou', '15', '10 Rue Abane Ramdane, Tizi Ouzou',     ST_MakePoint(4.0500, 36.7117)::geography),
  ('a0000000-0000-0000-0000-000000000005', 'Agence Béjaïa',     '06', '3 Boulevard Amirouche, Béjaïa',        ST_MakePoint(5.0840, 36.7510)::geography);

-- ──────────────────────────────────────────────
-- 4b. Listing Features (30 équipements)
-- ──────────────────────────────────────────────
insert into public.listing_features (key, label_fr, label_ar, label_en, icon, category, sort_order) values
  -- Extérieur
  ('has_parking',        'Parking',              'موقف سيارات',    'Parking',            'Car',          'exterior', 1),
  ('has_garden',         'Jardin',               'حديقة',          'Garden',             'Trees',        'exterior', 2),
  ('has_pool',           'Piscine',              'مسبح',           'Swimming pool',      'Waves',        'exterior', 3),
  ('has_balcony',        'Balcon',               'شرفة',           'Balcony',            'Fence',        'exterior', 4),
  ('sea_view',           'Vue mer',              'إطلالة بحرية',    'Sea view',           'Sailboat',     'exterior', 5),
  ('has_terrace',        'Terrasse',             'تراس',           'Terrace',            'Sun',          'exterior', 6),
  ('beach_access',       'Accès plage',          'وصول للشاطئ',     'Beach access',       'Palmtree',     'exterior', 7),
  ('has_garage',         'Garage',               'مرآب',           'Garage',             'Warehouse',    'exterior', 8),
  ('has_court',          'Cour',                 'فناء',           'Courtyard',          'Shrub',        'exterior', 9),
  ('separate_entrance',  'Entrée indépendante',  'مدخل مستقل',     'Separate entrance',  'DoorOpen',     'exterior', 10),
  -- Intérieur
  ('has_elevator',       'Ascenseur',            'مصعد',           'Elevator',           'ArrowUpDown',  'interior', 1),
  ('furnished',          'Meublé',               'مفروش',          'Furnished',          'Sofa',         'interior', 2),
  ('has_ac',             'Climatisation',        'تكييف',          'Air conditioning',   'Snowflake',    'interior', 3),
  ('has_heating',        'Chauffage central',    'تدفئة مركزية',    'Central heating',    'Flame',        'interior', 4),
  ('equipped_kitchen',   'Cuisine équipée',      'مطبخ مجهز',      'Equipped kitchen',   'CookingPot',   'interior', 5),
  ('modern_bathroom',    'Salle de bain moderne','حمام عصري',      'Modern bathroom',    'ShowerHead',   'interior', 6),
  ('has_internet',       'Internet / Fibre',     'إنترنت / ألياف',  'Internet / Fiber',   'Wifi',         'interior', 7),
  ('has_satellite',      'Parabole',             'طبق فضائي',      'Satellite dish',     'Satellite',    'interior', 8),
  ('has_intercom',       'Interphone',           'اتصال داخلي',    'Intercom',           'BellRing',     'interior', 9),
  ('double_glazing',     'Double vitrage',       'زجاج مزدوج',     'Double glazing',     'PanelTop',     'interior', 10),
  -- Infrastructure
  ('has_water_source',   'Eau courante',         'مياه جارية',     'Running water',      'Droplets',     'infrastructure', 1),
  ('has_electricity',    'Électricité',          'كهرباء',         'Electricity',        'Zap',          'infrastructure', 2),
  ('has_city_gas',       'Gaz de ville',         'غاز المدينة',    'City gas',           'Flame',        'infrastructure', 3),
  ('has_sewer',          'Tout-à-l''égout',      'صرف صحي',        'Sewerage',           'Pipette',      'infrastructure', 4),
  ('has_fiber',          'Fibre optique',        'ألياف بصرية',    'Fiber optic',        'Cable',        'infrastructure', 5),
  -- Sécurité
  ('has_cctv',           'Vidéosurveillance',    'كاميرات مراقبة',  'CCTV',               'Camera',       'security', 1),
  ('has_guard',          'Gardien',              'حارس',           'Guard',              'ShieldCheck',  'security', 2),
  ('armored_door',       'Porte blindée',        'باب مصفح',       'Armored door',       'ShieldAlert',  'security', 3),
  ('has_digicode',       'Digicode',             'رمز رقمي',       'Digicode',           'KeyRound',     'security', 4),
  ('gated_community',    'Résidence fermée',     'مجمع سكني مغلق', 'Gated community',    'Building2',    'security', 5)
on conflict (key) do nothing;

-- ──────────────────────────────────────────────
-- 4c. Filter Options (valeurs des selects)
-- ──────────────────────────────────────────────
insert into public.filter_options (filter_key, value, label_fr, label_en, sort_order) values
  -- Prix vente
  ('price_sale', '1000000',   '1 000 000 DZD',   '1,000,000 DZD',   1),
  ('price_sale', '2000000',   '2 000 000 DZD',   '2,000,000 DZD',   2),
  ('price_sale', '5000000',   '5 000 000 DZD',   '5,000,000 DZD',   3),
  ('price_sale', '10000000',  '10 000 000 DZD',  '10,000,000 DZD',  4),
  ('price_sale', '15000000',  '15 000 000 DZD',  '15,000,000 DZD',  5),
  ('price_sale', '20000000',  '20 000 000 DZD',  '20,000,000 DZD',  6),
  ('price_sale', '30000000',  '30 000 000 DZD',  '30,000,000 DZD',  7),
  ('price_sale', '50000000',  '50 000 000 DZD',  '50,000,000 DZD',  8),
  ('price_sale', '100000000', '100 000 000 DZD', '100,000,000 DZD', 9),
  ('price_sale', '200000000', '200 000 000 DZD', '200,000,000 DZD', 10),
  -- Prix location
  ('price_rent', '10000',  '10 000 DZD/mois',  '10,000 DZD/mo',  1),
  ('price_rent', '20000',  '20 000 DZD/mois',  '20,000 DZD/mo',  2),
  ('price_rent', '30000',  '30 000 DZD/mois',  '30,000 DZD/mo',  3),
  ('price_rent', '50000',  '50 000 DZD/mois',  '50,000 DZD/mo',  4),
  ('price_rent', '80000',  '80 000 DZD/mois',  '80,000 DZD/mo',  5),
  ('price_rent', '100000', '100 000 DZD/mois', '100,000 DZD/mo', 6),
  ('price_rent', '150000', '150 000 DZD/mois', '150,000 DZD/mo', 7),
  ('price_rent', '200000', '200 000 DZD/mois', '200,000 DZD/mo', 8),
  ('price_rent', '300000', '300 000 DZD/mois', '300,000 DZD/mo', 9),
  -- Pièces
  ('rooms', '1', '1', '1', 1),
  ('rooms', '2', '2', '2', 2),
  ('rooms', '3', '3', '3', 3),
  ('rooms', '4', '4', '4', 4),
  ('rooms', '5', '5+', '5+', 5),
  -- Salles de bain
  ('bathrooms', '1', '1', '1', 1),
  ('bathrooms', '2', '2', '2', 2),
  ('bathrooms', '3', '3', '3', 3),
  ('bathrooms', '4', '4+', '4+', 4),
  -- Surface m²
  ('surface', '30',   '30 m²',   '30 m²',   1),
  ('surface', '50',   '50 m²',   '50 m²',   2),
  ('surface', '80',   '80 m²',   '80 m²',   3),
  ('surface', '100',  '100 m²',  '100 m²',  4),
  ('surface', '150',  '150 m²',  '150 m²',  5),
  ('surface', '200',  '200 m²',  '200 m²',  6),
  ('surface', '300',  '300 m²',  '300 m²',  7),
  ('surface', '500',  '500 m²',  '500 m²',  8),
  ('surface', '1000', '1 000 m²', '1,000 m²', 9),
  -- Année de construction
  ('year', '2020', 'Après 2020', 'After 2020', 1),
  ('year', '2015', 'Après 2015', 'After 2015', 2),
  ('year', '2010', 'Après 2010', 'After 2010', 3),
  ('year', '2005', 'Après 2005', 'After 2005', 4),
  ('year', '2000', 'Après 2000', 'After 2000', 5),
  ('year', '1990', 'Après 1990', 'After 1990', 6),
  ('year', '1980', 'Après 1980', 'After 1980', 7),
  -- Étage
  ('floor', '0',  'RDC', 'Ground floor', 1),
  ('floor', '1',  '1er', '1st', 2),
  ('floor', '2',  '2ème', '2nd', 3),
  ('floor', '3',  '3ème', '3rd', 4),
  ('floor', '4',  '4ème', '4th', 5),
  ('floor', '5',  '5ème+', '5th+', 6)
on conflict (filter_key, value) do nothing;

-- ──────────────────────────────────────────────
-- 5. Listings (30 biens variés)
-- ──────────────────────────────────────────────

-- Alger — Immobilière El Djazair
insert into public.listings (id, agency_id, current_status, current_price, listing_type, property_type, surface_m2, rooms, bathrooms, wilaya_code, location, details, published_at) values
  ('b0000000-0000-0000-0000-000000000001', 'a0000000-0000-0000-0000-000000000001', 'published', 35000000,  'sale', 'apartment', 120, 4, 2, '16', ST_MakePoint(3.0200, 36.7500)::geography, '{"floor": 3, "has_elevator": true, "has_parking": true, "has_balcony": true, "year_built": 2018, "furnished": false}'::jsonb, now() - interval '5 days'),
  ('b0000000-0000-0000-0000-000000000002', 'a0000000-0000-0000-0000-000000000001', 'published', 85000000,  'sale', 'villa',     350, 6, 3, '16', ST_MakePoint(3.0300, 36.7600)::geography, '{"has_garden": true, "has_pool": true, "has_parking": true, "year_built": 2015, "furnished": true}'::jsonb, now() - interval '3 days'),
  ('b0000000-0000-0000-0000-000000000003', 'a0000000-0000-0000-0000-000000000001', 'published', 120000,    'rent', 'apartment', 80,  3, 1, '16', ST_MakePoint(3.0456, 36.7900)::geography, '{"floor": 5, "has_elevator": true, "furnished": true}'::jsonb, now() - interval '1 day'),
  ('b0000000-0000-0000-0000-000000000004', 'a0000000-0000-0000-0000-000000000001', 'published', 22000000,  'sale', 'apartment', 95,  3, 1, '16', ST_MakePoint(3.0450, 36.7400)::geography, '{"floor": 2, "has_elevator": false, "has_balcony": true, "year_built": 2020}'::jsonb, now() - interval '7 days'),
  ('b0000000-0000-0000-0000-000000000005', 'a0000000-0000-0000-0000-000000000001', 'draft',     45000000,  'sale', 'apartment', 180, 5, 3, '16', ST_MakePoint(3.0200, 36.7500)::geography, '{"floor": 8, "has_elevator": true, "has_parking": true, "has_pool": false, "year_built": 2023}'::jsonb, null),
  ('b0000000-0000-0000-0000-000000000006', 'a0000000-0000-0000-0000-000000000001', 'published', 15000000,  'sale', 'terrain',   500, null, null, '16', ST_MakePoint(3.2100, 36.7100)::geography, '{"zoning": "residential"}'::jsonb, now() - interval '10 days'),

-- Oran — Oran Realty
  ('b0000000-0000-0000-0000-000000000007', 'a0000000-0000-0000-0000-000000000002', 'published', 18000000,  'sale', 'apartment', 110, 4, 2, '31', ST_MakePoint(-0.6300, 35.6970)::geography, '{"floor": 4, "has_elevator": true, "has_parking": false, "year_built": 2019}'::jsonb, now() - interval '2 days'),
  ('b0000000-0000-0000-0000-000000000008', 'a0000000-0000-0000-0000-000000000002', 'published', 55000000,  'sale', 'villa',     280, 5, 3, '31', ST_MakePoint(-0.5800, 35.7200)::geography, '{"has_garden": true, "has_pool": false, "has_parking": true, "year_built": 2017}'::jsonb, now() - interval '6 days'),
  ('b0000000-0000-0000-0000-000000000009', 'a0000000-0000-0000-0000-000000000002', 'published', 80000,     'rent', 'apartment', 65,  2, 1, '31', ST_MakePoint(-0.6300, 35.6970)::geography, '{"floor": 2, "has_elevator": false, "furnished": true}'::jsonb, now() - interval '4 days'),
  ('b0000000-0000-0000-0000-000000000010', 'a0000000-0000-0000-0000-000000000002', 'published', 250000,    'rent', 'commercial', 200, null, 2, '31', ST_MakePoint(-0.6100, 35.6500)::geography, '{"has_parking": true, "commercial_type": "showroom"}'::jsonb, now() - interval '8 days'),
  ('b0000000-0000-0000-0000-000000000011', 'a0000000-0000-0000-0000-000000000002', 'pending_review', 28000000, 'sale', 'apartment', 140, 4, 2, '31', ST_MakePoint(-0.5800, 35.7200)::geography, '{"floor": 6, "has_elevator": true, "has_parking": true, "year_built": 2022}'::jsonb, null),
  ('b0000000-0000-0000-0000-000000000012', 'a0000000-0000-0000-0000-000000000002', 'published', 8500000,   'sale', 'terrain',   300, null, null, '31', ST_MakePoint(-0.6100, 35.6500)::geography, '{}'::jsonb, now() - interval '15 days'),

-- Constantine — Constantine Immobilier
  ('b0000000-0000-0000-0000-000000000013', 'a0000000-0000-0000-0000-000000000003', 'published', 12000000,  'sale', 'apartment', 85,  3, 1, '25', ST_MakePoint(6.6147, 36.3650)::geography, '{"floor": 3, "has_elevator": false, "year_built": 2016}'::jsonb, now() - interval '4 days'),
  ('b0000000-0000-0000-0000-000000000014', 'a0000000-0000-0000-0000-000000000003', 'published', 42000000,  'sale', 'villa',     220, 5, 2, '25', ST_MakePoint(6.6900, 36.2600)::geography, '{"has_garden": true, "has_parking": true, "year_built": 2014}'::jsonb, now() - interval '9 days'),
  ('b0000000-0000-0000-0000-000000000015', 'a0000000-0000-0000-0000-000000000003', 'published', 60000,     'rent', 'apartment', 55,  2, 1, '25', ST_MakePoint(6.6147, 36.3650)::geography, '{"floor": 1, "furnished": false}'::jsonb, now() - interval '2 days'),
  ('b0000000-0000-0000-0000-000000000016', 'a0000000-0000-0000-0000-000000000003', 'sold',      25000000,  'sale', 'apartment', 130, 4, 2, '25', ST_MakePoint(6.6147, 36.3650)::geography, '{"floor": 5, "has_elevator": true, "year_built": 2021}'::jsonb, now() - interval '30 days'),
  ('b0000000-0000-0000-0000-000000000017', 'a0000000-0000-0000-0000-000000000003', 'published', 180000,    'rent', 'office',    150, null, 1, '25', ST_MakePoint(6.6147, 36.3650)::geography, '{"floor": 2, "has_elevator": true, "has_parking": false}'::jsonb, now() - interval '5 days'),

-- Blida — Blida Habitat
  ('b0000000-0000-0000-0000-000000000018', 'a0000000-0000-0000-0000-000000000004', 'published', 16000000,  'sale', 'apartment', 100, 3, 1, '09', ST_MakePoint(2.8300, 36.4700)::geography, '{"floor": 4, "has_elevator": true, "has_balcony": true, "year_built": 2019}'::jsonb, now() - interval '3 days'),
  ('b0000000-0000-0000-0000-000000000019', 'a0000000-0000-0000-0000-000000000004', 'published', 38000000,  'sale', 'villa',     250, 5, 2, '09', ST_MakePoint(2.8300, 36.4700)::geography, '{"has_garden": true, "has_parking": true, "year_built": 2012}'::jsonb, now() - interval '12 days'),
  ('b0000000-0000-0000-0000-000000000020', 'a0000000-0000-0000-0000-000000000004', 'published', 70000,     'rent', 'apartment', 70,  2, 1, '09', ST_MakePoint(2.8300, 36.4700)::geography, '{"floor": 3, "furnished": true}'::jsonb, now() - interval '1 day'),
  ('b0000000-0000-0000-0000-000000000021', 'a0000000-0000-0000-0000-000000000004', 'published', 350000,    'rent', 'warehouse', 800, null, 1, '09', ST_MakePoint(2.8300, 36.4700)::geography, '{"has_parking": true}'::jsonb, now() - interval '20 days'),

-- Kabylie — Kabylie Properties
  ('b0000000-0000-0000-0000-000000000022', 'a0000000-0000-0000-0000-000000000005', 'published', 14000000,  'sale', 'apartment', 90,  3, 1, '15', ST_MakePoint(4.0500, 36.7117)::geography, '{"floor": 2, "has_balcony": true, "year_built": 2020}'::jsonb, now() - interval '6 days'),
  ('b0000000-0000-0000-0000-000000000023', 'a0000000-0000-0000-0000-000000000005', 'published', 30000000,  'sale', 'villa',     200, 4, 2, '15', ST_MakePoint(4.0500, 36.7117)::geography, '{"has_garden": true, "has_parking": true, "year_built": 2018}'::jsonb, now() - interval '8 days'),
  ('b0000000-0000-0000-0000-000000000024', 'a0000000-0000-0000-0000-000000000005', 'published', 55000,     'rent', 'apartment', 60,  2, 1, '06', ST_MakePoint(5.0840, 36.7510)::geography, '{"floor": 1, "furnished": false}'::jsonb, now() - interval '3 days'),
  ('b0000000-0000-0000-0000-000000000025', 'a0000000-0000-0000-0000-000000000005', 'published', 9000000,   'sale', 'terrain',   400, null, null, '15', ST_MakePoint(4.0500, 36.7117)::geography, '{"zoning": "residential"}'::jsonb, now() - interval '14 days'),
  ('b0000000-0000-0000-0000-000000000026', 'a0000000-0000-0000-0000-000000000005', 'published', 20000000,  'sale', 'farm',      2000, null, null, '06', ST_MakePoint(5.0840, 36.7510)::geography, '{"has_water_source": true, "has_electricity": true}'::jsonb, now() - interval '11 days'),
  ('b0000000-0000-0000-0000-000000000027', 'a0000000-0000-0000-0000-000000000005', 'draft',     50000000,  'sale', 'building',  600, null, null, '15', ST_MakePoint(4.0500, 36.7117)::geography, '{"floors": 5, "units": 10}'::jsonb, null),

-- Vacation rentals
  ('b0000000-0000-0000-0000-000000000028', 'a0000000-0000-0000-0000-000000000001', 'published', 25000,     'vacation', 'apartment', 75, 2, 1, '16', ST_MakePoint(3.0456, 36.7900)::geography, '{"floor": 3, "furnished": true, "has_balcony": true, "sea_view": true}'::jsonb, now() - interval '2 days'),
  ('b0000000-0000-0000-0000-000000000029', 'a0000000-0000-0000-0000-000000000002', 'published', 18000,     'vacation', 'villa',     180, 4, 2, '31', ST_MakePoint(-0.6300, 35.6970)::geography, '{"has_garden": true, "has_pool": true, "furnished": true}'::jsonb, now() - interval '1 day'),
  ('b0000000-0000-0000-0000-000000000030', 'a0000000-0000-0000-0000-000000000005', 'published', 12000,     'vacation', 'villa',     150, 3, 2, '06', ST_MakePoint(5.0840, 36.7510)::geography, '{"has_garden": true, "furnished": true, "sea_view": true}'::jsonb, now() - interval '4 days');

-- ──────────────────────────────────────────────
-- 6. Listing translations (FR for all, AR for some)
-- ──────────────────────────────────────────────
insert into public.listing_translations (listing_id, locale, title, description, slug) values
  -- Alger
  ('b0000000-0000-0000-0000-000000000001', 'fr', 'Appartement F4 lumineux à Hydra', 'Superbe appartement de 120m² au 3ème étage avec ascenseur, parking et balcon. Quartier calme et résidentiel à Hydra. Proche des commodités.', 'appartement-f4-lumineux-hydra'),
  ('b0000000-0000-0000-0000-000000000001', 'ar', 'شقة F4 مضيئة في حيدرة', 'شقة رائعة مساحتها 120 متر مربع في الطابق الثالث مع مصعد وموقف سيارات وشرفة. حي هادئ وسكني في حيدرة.', 'شقة-f4-حيدرة'),
  ('b0000000-0000-0000-0000-000000000002', 'fr', 'Villa de luxe avec piscine à El Biar', 'Magnifique villa de 350m² avec jardin, piscine et garage. Entièrement meublée, construite en 2015. Cadre exceptionnel.', 'villa-luxe-piscine-el-biar'),
  ('b0000000-0000-0000-0000-000000000003', 'fr', 'F3 meublé en location à Bab El Oued', 'Appartement F3 de 80m² entièrement meublé et équipé. Idéal pour jeune couple ou colocation. 5ème étage avec ascenseur.', 'f3-meuble-location-bab-el-oued'),
  ('b0000000-0000-0000-0000-000000000004', 'fr', 'Appartement F3 avec balcon à Bir Mourad Raïs', 'Bel appartement de 95m² au 2ème étage avec grand balcon. Construction récente 2020. Proche des transports.', 'appartement-f3-balcon-bir-mourad-rais'),
  ('b0000000-0000-0000-0000-000000000005', 'fr', 'Penthouse F5 vue mer à Hydra', 'Exceptionnel penthouse de 180m² au 8ème étage. 5 pièces, 3 salles de bain, parking et ascenseur. Vue imprenable sur la baie.', 'penthouse-f5-vue-mer-hydra'),
  ('b0000000-0000-0000-0000-000000000006', 'fr', 'Terrain constructible à Dar El Beïda', 'Terrain de 500m² en zone résidentielle à Dar El Beïda. Idéal pour construction villa ou petit immeuble.', 'terrain-constructible-dar-el-beida'),

  -- Oran
  ('b0000000-0000-0000-0000-000000000007', 'fr', 'Appartement F4 standing à Oran Centre', 'Appartement haut standing de 110m² au centre-ville d''Oran. 4ème étage avec ascenseur et parking. Construction 2019.', 'appartement-f4-standing-oran-centre'),
  ('b0000000-0000-0000-0000-000000000007', 'ar', 'شقة F4 راقية في وسط وهران', 'شقة راقية مساحتها 110 متر مربع في وسط مدينة وهران. الطابق الرابع مع مصعد وموقف سيارات.', 'شقة-f4-وسط-وهران'),
  ('b0000000-0000-0000-0000-000000000008', 'fr', 'Villa avec jardin à Bir El Djir', 'Belle villa de 280m² avec grand jardin et garage double. Quartier résidentiel calme à Bir El Djir.', 'villa-jardin-bir-el-djir'),
  ('b0000000-0000-0000-0000-000000000009', 'fr', 'Studio meublé à Oran Centre', 'Studio de 65m² entièrement meublé au centre-ville. Idéal pour étudiant ou professionnel. 2ème étage.', 'studio-meuble-oran-centre'),
  ('b0000000-0000-0000-0000-000000000010', 'fr', 'Local commercial showroom Es Sénia', 'Grand local commercial de 200m² avec parking. Idéal showroom ou espace de vente. Bonne visibilité.', 'local-commercial-showroom-es-senia'),
  ('b0000000-0000-0000-0000-000000000011', 'fr', 'Appartement F4 neuf à Bir El Djir', 'Appartement neuf de 140m² jamais habité. 6ème étage, ascenseur, parking. Livraison clé en main.', 'appartement-f4-neuf-bir-el-djir'),
  ('b0000000-0000-0000-0000-000000000012', 'fr', 'Terrain à bâtir Es Sénia', 'Terrain de 300m² dans quartier en développement à Es Sénia. Acte notarié disponible.', 'terrain-batir-es-senia'),

  -- Constantine
  ('b0000000-0000-0000-0000-000000000013', 'fr', 'Appartement F3 à Constantine Centre', 'Appartement de 85m² au 3ème étage dans le centre de Constantine. Bon état général.', 'appartement-f3-constantine-centre'),
  ('b0000000-0000-0000-0000-000000000014', 'fr', 'Villa familiale à El Khroub', 'Spacieuse villa de 220m² avec jardin et garage à El Khroub. 5 pièces, idéale famille nombreuse.', 'villa-familiale-el-khroub'),
  ('b0000000-0000-0000-0000-000000000015', 'fr', 'F2 en location à Constantine', 'Appartement F2 de 55m² au RDC. Location vide. Proche université et commerces.', 'f2-location-constantine'),
  ('b0000000-0000-0000-0000-000000000016', 'fr', 'Appartement F4 vendu à Constantine', 'Appartement de standing de 130m² au 5ème étage avec ascenseur. Bien vendu.', 'appartement-f4-vendu-constantine'),
  ('b0000000-0000-0000-0000-000000000017', 'fr', 'Bureau à louer Constantine Centre', 'Bureau professionnel de 150m² au 2ème étage avec ascenseur. Centre-ville, idéal cabinet ou société.', 'bureau-louer-constantine-centre'),

  -- Blida
  ('b0000000-0000-0000-0000-000000000018', 'fr', 'Appartement F3 à Blida Centre', 'Appartement de 100m² au 4ème étage avec ascenseur et balcon. Construction 2019, bon quartier.', 'appartement-f3-blida-centre'),
  ('b0000000-0000-0000-0000-000000000019', 'fr', 'Villa avec jardin à Blida', 'Grande villa de 250m² avec jardin arboré et garage. 5 pièces sur 2 niveaux. Quartier résidentiel.', 'villa-jardin-blida'),
  ('b0000000-0000-0000-0000-000000000020', 'fr', 'F2 meublé à Blida', 'Appartement F2 meublé de 70m² au 3ème étage. Location courte ou longue durée.', 'f2-meuble-blida'),
  ('b0000000-0000-0000-0000-000000000021', 'fr', 'Entrepôt à louer Blida zone industrielle', 'Grand entrepôt de 800m² avec parking poids lourds. Zone industrielle de Blida.', 'entrepot-louer-blida-zone-industrielle'),

  -- Kabylie
  ('b0000000-0000-0000-0000-000000000022', 'fr', 'Appartement F3 à Tizi Ouzou', 'Appartement de 90m² au 2ème étage avec balcon. Construction récente 2020. Centre de Tizi Ouzou.', 'appartement-f3-tizi-ouzou'),
  ('b0000000-0000-0000-0000-000000000023', 'fr', 'Villa traditionnelle à Tizi Ouzou', 'Belle villa de 200m² avec jardin et garage. Style kabyle moderne. 4 pièces, 2 SDB.', 'villa-traditionnelle-tizi-ouzou'),
  ('b0000000-0000-0000-0000-000000000024', 'fr', 'F2 à louer à Béjaïa', 'Petit appartement F2 de 60m² au RDC à Béjaïa centre. Location vide, bon état.', 'f2-louer-bejaia'),
  ('b0000000-0000-0000-0000-000000000025', 'fr', 'Terrain résidentiel Tizi Ouzou', 'Terrain de 400m² en zone résidentielle. Vue sur montagne. Acte de propriété clair.', 'terrain-residentiel-tizi-ouzou'),
  ('b0000000-0000-0000-0000-000000000026', 'fr', 'Ferme avec terrain à Béjaïa', 'Exploitation agricole de 2000m² avec source d''eau et électricité. Idéal agriculture ou agrotourisme.', 'ferme-terrain-bejaia'),
  ('b0000000-0000-0000-0000-000000000027', 'fr', 'Immeuble de rapport à Tizi Ouzou', 'Immeuble de 5 étages avec 10 appartements. Excellent investissement locatif.', 'immeuble-rapport-tizi-ouzou'),

  -- Vacances
  ('b0000000-0000-0000-0000-000000000028', 'fr', 'Appartement vue mer pour vacances Alger', 'F2 meublé avec vue sur mer pour location vacances. Balcon, 3ème étage, tout équipé.', 'appartement-vue-mer-vacances-alger'),
  ('b0000000-0000-0000-0000-000000000029', 'fr', 'Villa avec piscine vacances Oran', 'Villa de vacances avec piscine et jardin. 4 chambres, entièrement meublée et équipée.', 'villa-piscine-vacances-oran'),
  ('b0000000-0000-0000-0000-000000000030', 'fr', 'Villa bord de mer vacances Béjaïa', 'Villa de vacances avec vue sur mer à Béjaïa. 3 chambres, jardin, tout confort.', 'villa-bord-mer-vacances-bejaia');

-- ──────────────────────────────────────────────
-- 7. Subscriptions (link agencies to plans)
-- ──────────────────────────────────────────────
insert into public.subscriptions (agency_id, plan_id, status, current_period_start, current_period_end) values
  ('a0000000-0000-0000-0000-000000000001', (select id from public.plans where slug = 'enterprise'), 'active', now() - interval '15 days', now() + interval '15 days'),
  ('a0000000-0000-0000-0000-000000000002', (select id from public.plans where slug = 'pro'),        'active', now() - interval '10 days', now() + interval '20 days'),
  ('a0000000-0000-0000-0000-000000000003', (select id from public.plans where slug = 'starter'),    'active', now() - interval '20 days', now() + interval '10 days'),
  ('a0000000-0000-0000-0000-000000000004', (select id from public.plans where slug = 'pro'),        'active', now() - interval '5 days',  now() + interval '25 days'),
  ('a0000000-0000-0000-0000-000000000005', (select id from public.plans where slug = 'starter'),    'trialing', now(), now() + interval '14 days');

-- ──────────────────────────────────────────────
-- 8. Agency stats (sample daily stats)
-- ──────────────────────────────────────────────
insert into public.agency_stats_daily (agency_id, stat_date, total_views, total_leads, total_listings) values
  ('a0000000-0000-0000-0000-000000000001', current_date - 6, 45, 3, 7),
  ('a0000000-0000-0000-0000-000000000001', current_date - 5, 52, 5, 7),
  ('a0000000-0000-0000-0000-000000000001', current_date - 4, 38, 2, 7),
  ('a0000000-0000-0000-0000-000000000001', current_date - 3, 61, 4, 7),
  ('a0000000-0000-0000-0000-000000000001', current_date - 2, 55, 6, 7),
  ('a0000000-0000-0000-0000-000000000001', current_date - 1, 48, 3, 7),
  ('a0000000-0000-0000-0000-000000000001', current_date,     30, 2, 7),
  ('a0000000-0000-0000-0000-000000000002', current_date - 6, 32, 2, 6),
  ('a0000000-0000-0000-0000-000000000002', current_date - 5, 28, 1, 6),
  ('a0000000-0000-0000-0000-000000000002', current_date - 4, 35, 3, 6),
  ('a0000000-0000-0000-0000-000000000002', current_date - 3, 41, 2, 6),
  ('a0000000-0000-0000-0000-000000000002', current_date - 2, 38, 4, 6),
  ('a0000000-0000-0000-0000-000000000002', current_date - 1, 44, 3, 6),
  ('a0000000-0000-0000-0000-000000000002', current_date,     22, 1, 6)
on conflict (agency_id, stat_date) do nothing;
