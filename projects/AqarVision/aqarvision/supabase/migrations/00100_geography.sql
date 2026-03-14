-- M01 Auth & Identity — Geography tables
-- wilayas (provinces) and communes (municipalities) of Algeria

-- ──────────────────────────────────────────────
-- wilayas: 58 Algerian provinces
-- ──────────────────────────────────────────────
create table public.wilayas (
  code    text primary key,
  name_fr text not null,
  name_ar text not null,
  name_en text
);

comment on table public.wilayas is 'Algerian wilayas (provinces). Code is the official 2-digit number as text.';

-- ──────────────────────────────────────────────
-- communes: municipalities within wilayas
-- ──────────────────────────────────────────────
create table public.communes (
  id          bigint primary key generated always as identity,
  wilaya_code text not null references public.wilayas (code) on delete restrict,
  name_fr     text not null,
  name_ar     text,
  name_en     text,
  location    geography(point, 4326)
);

create index idx_communes_wilaya_code on public.communes (wilaya_code);

comment on table public.communes is 'Algerian communes (municipalities), each belonging to a wilaya.';

-- ──────────────────────────────────────────────
-- Seed: all 58 wilayas
-- ──────────────────────────────────────────────
insert into public.wilayas (code, name_fr, name_ar, name_en) values
  ('01', 'Adrar',             'أدرار',             'Adrar'),
  ('02', 'Chlef',             'الشلف',             'Chlef'),
  ('03', 'Laghouat',          'الأغواط',           'Laghouat'),
  ('04', 'Oum El Bouaghi',    'أم البواقي',        'Oum El Bouaghi'),
  ('05', 'Batna',             'باتنة',             'Batna'),
  ('06', 'Béjaïa',            'بجاية',             'Bejaia'),
  ('07', 'Biskra',            'بسكرة',             'Biskra'),
  ('08', 'Béchar',            'بشار',              'Bechar'),
  ('09', 'Blida',             'البليدة',           'Blida'),
  ('10', 'Bouira',            'البويرة',           'Bouira'),
  ('11', 'Tamanrasset',       'تمنراست',           'Tamanrasset'),
  ('12', 'Tébessa',           'تبسة',              'Tebessa'),
  ('13', 'Tlemcen',           'تلمسان',            'Tlemcen'),
  ('14', 'Tiaret',            'تيارت',             'Tiaret'),
  ('15', 'Tizi Ouzou',        'تيزي وزو',          'Tizi Ouzou'),
  ('16', 'Alger',             'الجزائر',           'Algiers'),
  ('17', 'Djelfa',            'الجلفة',            'Djelfa'),
  ('18', 'Jijel',             'جيجل',              'Jijel'),
  ('19', 'Sétif',             'سطيف',              'Setif'),
  ('20', 'Saïda',             'سعيدة',             'Saida'),
  ('21', 'Skikda',            'سكيكدة',            'Skikda'),
  ('22', 'Sidi Bel Abbès',    'سيدي بلعباس',       'Sidi Bel Abbes'),
  ('23', 'Annaba',            'عنابة',             'Annaba'),
  ('24', 'Guelma',            'قالمة',             'Guelma'),
  ('25', 'Constantine',       'قسنطينة',           'Constantine'),
  ('26', 'Médéa',             'المدية',            'Medea'),
  ('27', 'Mostaganem',        'مستغانم',           'Mostaganem'),
  ('28', 'M''Sila',           'المسيلة',           'M''Sila'),
  ('29', 'Mascara',           'معسكر',             'Mascara'),
  ('30', 'Ouargla',           'ورقلة',             'Ouargla'),
  ('31', 'Oran',              'وهران',             'Oran'),
  ('32', 'El Bayadh',         'البيض',             'El Bayadh'),
  ('33', 'Illizi',            'إليزي',             'Illizi'),
  ('34', 'Bordj Bou Arréridj','برج بوعريريج',      'Bordj Bou Arreridj'),
  ('35', 'Boumerdès',         'بومرداس',           'Boumerdes'),
  ('36', 'El Tarf',           'الطارف',            'El Tarf'),
  ('37', 'Tindouf',           'تندوف',             'Tindouf'),
  ('38', 'Tissemsilt',        'تيسمسيلت',          'Tissemsilt'),
  ('39', 'El Oued',           'الوادي',            'El Oued'),
  ('40', 'Khenchela',         'خنشلة',             'Khenchela'),
  ('41', 'Souk Ahras',        'سوق أهراس',         'Souk Ahras'),
  ('42', 'Tipaza',            'تيبازة',            'Tipaza'),
  ('43', 'Mila',              'ميلة',              'Mila'),
  ('44', 'Aïn Defla',         'عين الدفلى',        'Ain Defla'),
  ('45', 'Naâma',             'النعامة',           'Naama'),
  ('46', 'Aïn Témouchent',    'عين تموشنت',        'Ain Temouchent'),
  ('47', 'Ghardaïa',          'غرداية',            'Ghardaia'),
  ('48', 'Relizane',          'غليزان',            'Relizane'),
  ('49', 'Timimoun',          'تيميمون',           'Timimoun'),
  ('50', 'Bordj Badji Mokhtar','برج باجي مختار',   'Bordj Badji Mokhtar'),
  ('51', 'Ouled Djellal',     'أولاد جلال',        'Ouled Djellal'),
  ('52', 'Béni Abbès',        'بني عباس',          'Beni Abbes'),
  ('53', 'In Salah',          'عين صالح',          'In Salah'),
  ('54', 'In Guezzam',        'عين قزام',          'In Guezzam'),
  ('55', 'Touggourt',         'تقرت',              'Touggourt'),
  ('56', 'Djanet',            'جانت',              'Djanet'),
  ('57', 'El M''Ghair',       'المغير',            'El M''Ghair'),
  ('58', 'El Meniaa',         'المنيعة',           'El Meniaa');
