// Run seed data via Supabase JS client (service_role)
// Usage: node supabase/run-seed.mjs

import { createRequire } from "module";
const require = createRequire(import.meta.url.replace("/supabase/", "/apps/web/"));
const { createClient } = require("@supabase/supabase-js");

const supabase = createClient(
  "https://tntiakqdvetdhdfzbzsn.supabase.co",
  process.env.SUPABASE_SERVICE_ROLE_KEY ||
    "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRudGlha3FkdmV0ZGhkZnpienNuIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3MzQzODM3OSwiZXhwIjoyMDg5MDE0Mzc5fQ.rJGds3cFyvcpDXvgYXvpaJ61mmWa3hwgPCMxW3_lKA8",
  { auth: { persistSession: false } }
);

async function seed() {
  console.log("🌱 Seeding AqarVision database...\n");

  // 1. Plans
  console.log("📋 Inserting plans...");
  const { error: plansErr } = await supabase.from("plans").upsert([
    { name: "Starter", slug: "starter", price_monthly: 0, max_listings: 10, max_media_per_listing: 5, max_team_members: 2, max_ai_jobs: 0, features: { analytics: false, ai: false, priority_support: false } },
    { name: "Pro", slug: "pro", price_monthly: 4900, max_listings: 50, max_media_per_listing: 20, max_team_members: 10, max_ai_jobs: 100, features: { analytics: true, ai: true, priority_support: false } },
    { name: "Enterprise", slug: "enterprise", price_monthly: 14900, max_listings: -1, max_media_per_listing: 50, max_team_members: -1, max_ai_jobs: -1, features: { analytics: true, ai: true, priority_support: true } },
  ], { onConflict: "slug" });
  if (plansErr) console.error("  ✗ plans:", plansErr.message);
  else console.log("  ✓ plans inserted");

  // 2. Agencies
  console.log("🏢 Inserting agencies...");
  const agencies = [
    { id: "a0000000-0000-0000-0000-000000000001", name: "Immobilière El Djazair", slug: "immobiliere-el-djazair", description: "Agence leader à Alger, spécialisée dans les biens résidentiels haut de gamme.", phone: "+213 21 74 55 00", email: "contact@eldjazair-immo.dz", is_verified: true },
    { id: "a0000000-0000-0000-0000-000000000002", name: "Oran Realty", slug: "oran-realty", description: "Première agence immobilière à Oran. Vente, location et gestion locative.", phone: "+213 41 33 22 11", email: "info@oran-realty.dz", is_verified: true },
    { id: "a0000000-0000-0000-0000-000000000003", name: "Constantine Immobilier", slug: "constantine-immobilier", description: "Expert immobilier à Constantine et ses environs depuis 2010.", phone: "+213 31 88 99 00", email: "contact@constantine-immo.dz", is_verified: false },
    { id: "a0000000-0000-0000-0000-000000000004", name: "Blida Habitat", slug: "blida-habitat", description: "Solutions immobilières complètes pour la wilaya de Blida.", phone: "+213 25 44 33 22", email: "info@blida-habitat.dz", is_verified: true },
    { id: "a0000000-0000-0000-0000-000000000005", name: "Kabylie Properties", slug: "kabylie-properties", description: "Immobilier en Kabylie : Tizi Ouzou et Béjaïa.", phone: "+213 26 11 22 33", email: "contact@kabylie-prop.dz", is_verified: false },
  ];
  const { error: agenciesErr } = await supabase.from("agencies").upsert(agencies, { onConflict: "slug" });
  if (agenciesErr) console.error("  ✗ agencies:", agenciesErr.message);
  else console.log("  ✓ 5 agencies inserted");

  // 3. Branches
  console.log("🏬 Inserting branches...");
  const branches = [
    { agency_id: "a0000000-0000-0000-0000-000000000001", name: "Siège Hydra", wilaya_code: "16", address_text: "12 Rue Didouche Mourad, Hydra, Alger" },
    { agency_id: "a0000000-0000-0000-0000-000000000001", name: "Agence Kouba", wilaya_code: "16", address_text: "45 Boulevard Krim Belkacem, Kouba" },
    { agency_id: "a0000000-0000-0000-0000-000000000002", name: "Siège Oran Centre", wilaya_code: "31", address_text: "8 Place du 1er Novembre, Oran" },
    { agency_id: "a0000000-0000-0000-0000-000000000003", name: "Siège Constantine", wilaya_code: "25", address_text: "22 Rue Larbi Ben M'hidi, Constantine" },
    { agency_id: "a0000000-0000-0000-0000-000000000004", name: "Siège Blida", wilaya_code: "09", address_text: "5 Avenue de l'ALN, Blida" },
    { agency_id: "a0000000-0000-0000-0000-000000000005", name: "Agence Tizi Ouzou", wilaya_code: "15", address_text: "10 Rue Abane Ramdane, Tizi Ouzou" },
    { agency_id: "a0000000-0000-0000-0000-000000000005", name: "Agence Béjaïa", wilaya_code: "06", address_text: "3 Boulevard Amirouche, Béjaïa" },
  ];
  const { error: branchesErr } = await supabase.from("agency_branches").insert(branches);
  if (branchesErr) console.error("  ✗ branches:", branchesErr.message);
  else console.log("  ✓ 7 branches inserted");

  // 4. Listings
  console.log("🏠 Inserting listings...");
  const now = new Date();
  const daysAgo = (d) => new Date(now - d * 86400000).toISOString();

  const listings = [
    // Alger — Immobilière El Djazair
    { id: "b0000000-0000-0000-0000-000000000001", agency_id: "a0000000-0000-0000-0000-000000000001", current_status: "published", current_price: 35000000, listing_type: "sale", property_type: "apartment", surface_m2: 120, rooms: 4, bathrooms: 2, wilaya_code: "16", details: { floor: 3, has_elevator: true, has_parking: true, has_balcony: true, year_built: 2018, furnished: false }, published_at: daysAgo(5) },
    { id: "b0000000-0000-0000-0000-000000000002", agency_id: "a0000000-0000-0000-0000-000000000001", current_status: "published", current_price: 85000000, listing_type: "sale", property_type: "villa", surface_m2: 350, rooms: 6, bathrooms: 3, wilaya_code: "16", details: { has_garden: true, has_pool: true, has_parking: true, year_built: 2015, furnished: true }, published_at: daysAgo(3) },
    { id: "b0000000-0000-0000-0000-000000000003", agency_id: "a0000000-0000-0000-0000-000000000001", current_status: "published", current_price: 120000, listing_type: "rent", property_type: "apartment", surface_m2: 80, rooms: 3, bathrooms: 1, wilaya_code: "16", details: { floor: 5, has_elevator: true, furnished: true }, published_at: daysAgo(1) },
    { id: "b0000000-0000-0000-0000-000000000004", agency_id: "a0000000-0000-0000-0000-000000000001", current_status: "published", current_price: 22000000, listing_type: "sale", property_type: "apartment", surface_m2: 95, rooms: 3, bathrooms: 1, wilaya_code: "16", details: { floor: 2, has_elevator: false, has_balcony: true, year_built: 2020 }, published_at: daysAgo(7) },
    { id: "b0000000-0000-0000-0000-000000000005", agency_id: "a0000000-0000-0000-0000-000000000001", current_status: "draft", current_price: 45000000, listing_type: "sale", property_type: "apartment", surface_m2: 180, rooms: 5, bathrooms: 3, wilaya_code: "16", details: { floor: 8, has_elevator: true, has_parking: true, year_built: 2023 } },
    { id: "b0000000-0000-0000-0000-000000000006", agency_id: "a0000000-0000-0000-0000-000000000001", current_status: "published", current_price: 15000000, listing_type: "sale", property_type: "terrain", surface_m2: 500, wilaya_code: "16", details: { zoning: "residential" }, published_at: daysAgo(10) },

    // Oran — Oran Realty
    { id: "b0000000-0000-0000-0000-000000000007", agency_id: "a0000000-0000-0000-0000-000000000002", current_status: "published", current_price: 18000000, listing_type: "sale", property_type: "apartment", surface_m2: 110, rooms: 4, bathrooms: 2, wilaya_code: "31", details: { floor: 4, has_elevator: true, has_parking: false, year_built: 2019 }, published_at: daysAgo(2) },
    { id: "b0000000-0000-0000-0000-000000000008", agency_id: "a0000000-0000-0000-0000-000000000002", current_status: "published", current_price: 55000000, listing_type: "sale", property_type: "villa", surface_m2: 280, rooms: 5, bathrooms: 3, wilaya_code: "31", details: { has_garden: true, has_pool: false, has_parking: true, year_built: 2017 }, published_at: daysAgo(6) },
    { id: "b0000000-0000-0000-0000-000000000009", agency_id: "a0000000-0000-0000-0000-000000000002", current_status: "published", current_price: 80000, listing_type: "rent", property_type: "apartment", surface_m2: 65, rooms: 2, bathrooms: 1, wilaya_code: "31", details: { floor: 2, has_elevator: false, furnished: true }, published_at: daysAgo(4) },
    { id: "b0000000-0000-0000-0000-000000000010", agency_id: "a0000000-0000-0000-0000-000000000002", current_status: "published", current_price: 250000, listing_type: "rent", property_type: "commercial", surface_m2: 200, bathrooms: 2, wilaya_code: "31", details: { has_parking: true, commercial_type: "showroom" }, published_at: daysAgo(8) },
    { id: "b0000000-0000-0000-0000-000000000011", agency_id: "a0000000-0000-0000-0000-000000000002", current_status: "pending_review", current_price: 28000000, listing_type: "sale", property_type: "apartment", surface_m2: 140, rooms: 4, bathrooms: 2, wilaya_code: "31", details: { floor: 6, has_elevator: true, has_parking: true, year_built: 2022 } },
    { id: "b0000000-0000-0000-0000-000000000012", agency_id: "a0000000-0000-0000-0000-000000000002", current_status: "published", current_price: 8500000, listing_type: "sale", property_type: "terrain", surface_m2: 300, wilaya_code: "31", details: {}, published_at: daysAgo(15) },

    // Constantine
    { id: "b0000000-0000-0000-0000-000000000013", agency_id: "a0000000-0000-0000-0000-000000000003", current_status: "published", current_price: 12000000, listing_type: "sale", property_type: "apartment", surface_m2: 85, rooms: 3, bathrooms: 1, wilaya_code: "25", details: { floor: 3, has_elevator: false, year_built: 2016 }, published_at: daysAgo(4) },
    { id: "b0000000-0000-0000-0000-000000000014", agency_id: "a0000000-0000-0000-0000-000000000003", current_status: "published", current_price: 42000000, listing_type: "sale", property_type: "villa", surface_m2: 220, rooms: 5, bathrooms: 2, wilaya_code: "25", details: { has_garden: true, has_parking: true, year_built: 2014 }, published_at: daysAgo(9) },
    { id: "b0000000-0000-0000-0000-000000000015", agency_id: "a0000000-0000-0000-0000-000000000003", current_status: "published", current_price: 60000, listing_type: "rent", property_type: "apartment", surface_m2: 55, rooms: 2, bathrooms: 1, wilaya_code: "25", details: { floor: 1, furnished: false }, published_at: daysAgo(2) },
    { id: "b0000000-0000-0000-0000-000000000016", agency_id: "a0000000-0000-0000-0000-000000000003", current_status: "sold", current_price: 25000000, listing_type: "sale", property_type: "apartment", surface_m2: 130, rooms: 4, bathrooms: 2, wilaya_code: "25", details: { floor: 5, has_elevator: true, year_built: 2021 }, published_at: daysAgo(30) },
    { id: "b0000000-0000-0000-0000-000000000017", agency_id: "a0000000-0000-0000-0000-000000000003", current_status: "published", current_price: 180000, listing_type: "rent", property_type: "office", surface_m2: 150, bathrooms: 1, wilaya_code: "25", details: { floor: 2, has_elevator: true, has_parking: false }, published_at: daysAgo(5) },

    // Blida
    { id: "b0000000-0000-0000-0000-000000000018", agency_id: "a0000000-0000-0000-0000-000000000004", current_status: "published", current_price: 16000000, listing_type: "sale", property_type: "apartment", surface_m2: 100, rooms: 3, bathrooms: 1, wilaya_code: "09", details: { floor: 4, has_elevator: true, has_balcony: true, year_built: 2019 }, published_at: daysAgo(3) },
    { id: "b0000000-0000-0000-0000-000000000019", agency_id: "a0000000-0000-0000-0000-000000000004", current_status: "published", current_price: 38000000, listing_type: "sale", property_type: "villa", surface_m2: 250, rooms: 5, bathrooms: 2, wilaya_code: "09", details: { has_garden: true, has_parking: true, year_built: 2012 }, published_at: daysAgo(12) },
    { id: "b0000000-0000-0000-0000-000000000020", agency_id: "a0000000-0000-0000-0000-000000000004", current_status: "published", current_price: 70000, listing_type: "rent", property_type: "apartment", surface_m2: 70, rooms: 2, bathrooms: 1, wilaya_code: "09", details: { floor: 3, furnished: true }, published_at: daysAgo(1) },
    { id: "b0000000-0000-0000-0000-000000000021", agency_id: "a0000000-0000-0000-0000-000000000004", current_status: "published", current_price: 350000, listing_type: "rent", property_type: "warehouse", surface_m2: 800, bathrooms: 1, wilaya_code: "09", details: { has_parking: true }, published_at: daysAgo(20) },

    // Kabylie
    { id: "b0000000-0000-0000-0000-000000000022", agency_id: "a0000000-0000-0000-0000-000000000005", current_status: "published", current_price: 14000000, listing_type: "sale", property_type: "apartment", surface_m2: 90, rooms: 3, bathrooms: 1, wilaya_code: "15", details: { floor: 2, has_balcony: true, year_built: 2020 }, published_at: daysAgo(6) },
    { id: "b0000000-0000-0000-0000-000000000023", agency_id: "a0000000-0000-0000-0000-000000000005", current_status: "published", current_price: 30000000, listing_type: "sale", property_type: "villa", surface_m2: 200, rooms: 4, bathrooms: 2, wilaya_code: "15", details: { has_garden: true, has_parking: true, year_built: 2018 }, published_at: daysAgo(8) },
    { id: "b0000000-0000-0000-0000-000000000024", agency_id: "a0000000-0000-0000-0000-000000000005", current_status: "published", current_price: 55000, listing_type: "rent", property_type: "apartment", surface_m2: 60, rooms: 2, bathrooms: 1, wilaya_code: "06", details: { floor: 1, furnished: false }, published_at: daysAgo(3) },
    { id: "b0000000-0000-0000-0000-000000000025", agency_id: "a0000000-0000-0000-0000-000000000005", current_status: "published", current_price: 9000000, listing_type: "sale", property_type: "terrain", surface_m2: 400, wilaya_code: "15", details: { zoning: "residential" }, published_at: daysAgo(14) },
    { id: "b0000000-0000-0000-0000-000000000026", agency_id: "a0000000-0000-0000-0000-000000000005", current_status: "published", current_price: 20000000, listing_type: "sale", property_type: "farm", surface_m2: 2000, wilaya_code: "06", details: { has_water_source: true, has_electricity: true }, published_at: daysAgo(11) },
    { id: "b0000000-0000-0000-0000-000000000027", agency_id: "a0000000-0000-0000-0000-000000000005", current_status: "draft", current_price: 50000000, listing_type: "sale", property_type: "building", surface_m2: 600, wilaya_code: "15", details: { floors: 5, units: 10 } },

    // Vacations
    { id: "b0000000-0000-0000-0000-000000000028", agency_id: "a0000000-0000-0000-0000-000000000001", current_status: "published", current_price: 25000, listing_type: "vacation", property_type: "apartment", surface_m2: 75, rooms: 2, bathrooms: 1, wilaya_code: "16", details: { floor: 3, furnished: true, has_balcony: true, sea_view: true }, published_at: daysAgo(2) },
    { id: "b0000000-0000-0000-0000-000000000029", agency_id: "a0000000-0000-0000-0000-000000000002", current_status: "published", current_price: 18000, listing_type: "vacation", property_type: "villa", surface_m2: 180, rooms: 4, bathrooms: 2, wilaya_code: "31", details: { has_garden: true, has_pool: true, furnished: true }, published_at: daysAgo(1) },
    { id: "b0000000-0000-0000-0000-000000000030", agency_id: "a0000000-0000-0000-0000-000000000005", current_status: "published", current_price: 12000, listing_type: "vacation", property_type: "villa", surface_m2: 150, rooms: 3, bathrooms: 2, wilaya_code: "06", details: { has_garden: true, furnished: true, sea_view: true }, published_at: daysAgo(4) },
  ];
  const { error: listingsErr } = await supabase.from("listings").upsert(listings, { onConflict: "id" });
  if (listingsErr) console.error("  ✗ listings:", listingsErr.message);
  else console.log("  ✓ 30 listings inserted");

  // 5. Listing translations
  console.log("🌍 Inserting translations...");
  const translations = [
    { listing_id: "b0000000-0000-0000-0000-000000000001", locale: "fr", title: "Appartement F4 lumineux à Hydra", description: "Superbe appartement de 120m² au 3ème étage avec ascenseur, parking et balcon. Quartier calme et résidentiel à Hydra.", slug: "appartement-f4-lumineux-hydra" },
    { listing_id: "b0000000-0000-0000-0000-000000000001", locale: "ar", title: "شقة F4 مضيئة في حيدرة", description: "شقة رائعة مساحتها 120 متر مربع في الطابق الثالث مع مصعد وموقف سيارات وشرفة. حي هادئ وسكني في حيدرة.", slug: "شقة-f4-حيدرة" },
    { listing_id: "b0000000-0000-0000-0000-000000000002", locale: "fr", title: "Villa de luxe avec piscine à El Biar", description: "Magnifique villa de 350m² avec jardin, piscine et garage. Entièrement meublée, construite en 2015.", slug: "villa-luxe-piscine-el-biar" },
    { listing_id: "b0000000-0000-0000-0000-000000000003", locale: "fr", title: "F3 meublé en location à Bab El Oued", description: "Appartement F3 de 80m² entièrement meublé et équipé. Idéal pour jeune couple ou colocation.", slug: "f3-meuble-location-bab-el-oued" },
    { listing_id: "b0000000-0000-0000-0000-000000000004", locale: "fr", title: "Appartement F3 avec balcon à Bir Mourad Raïs", description: "Bel appartement de 95m² au 2ème étage avec grand balcon. Construction récente 2020.", slug: "appartement-f3-balcon-bir-mourad-rais" },
    { listing_id: "b0000000-0000-0000-0000-000000000005", locale: "fr", title: "Penthouse F5 vue mer à Hydra", description: "Exceptionnel penthouse de 180m² au 8ème étage. Vue imprenable sur la baie.", slug: "penthouse-f5-vue-mer-hydra" },
    { listing_id: "b0000000-0000-0000-0000-000000000006", locale: "fr", title: "Terrain constructible à Dar El Beïda", description: "Terrain de 500m² en zone résidentielle à Dar El Beïda.", slug: "terrain-constructible-dar-el-beida" },
    { listing_id: "b0000000-0000-0000-0000-000000000007", locale: "fr", title: "Appartement F4 standing à Oran Centre", description: "Appartement haut standing de 110m² au centre-ville d'Oran. Construction 2019.", slug: "appartement-f4-standing-oran-centre" },
    { listing_id: "b0000000-0000-0000-0000-000000000007", locale: "ar", title: "شقة F4 راقية في وسط وهران", description: "شقة راقية مساحتها 110 متر مربع في وسط مدينة وهران.", slug: "شقة-f4-وسط-وهران" },
    { listing_id: "b0000000-0000-0000-0000-000000000008", locale: "fr", title: "Villa avec jardin à Bir El Djir", description: "Belle villa de 280m² avec grand jardin et garage double.", slug: "villa-jardin-bir-el-djir" },
    { listing_id: "b0000000-0000-0000-0000-000000000009", locale: "fr", title: "Studio meublé à Oran Centre", description: "Studio de 65m² entièrement meublé au centre-ville.", slug: "studio-meuble-oran-centre" },
    { listing_id: "b0000000-0000-0000-0000-000000000010", locale: "fr", title: "Local commercial showroom Es Sénia", description: "Grand local commercial de 200m² avec parking.", slug: "local-commercial-showroom-es-senia" },
    { listing_id: "b0000000-0000-0000-0000-000000000011", locale: "fr", title: "Appartement F4 neuf à Bir El Djir", description: "Appartement neuf de 140m² jamais habité. Livraison clé en main.", slug: "appartement-f4-neuf-bir-el-djir" },
    { listing_id: "b0000000-0000-0000-0000-000000000012", locale: "fr", title: "Terrain à bâtir Es Sénia", description: "Terrain de 300m² dans quartier en développement.", slug: "terrain-batir-es-senia" },
    { listing_id: "b0000000-0000-0000-0000-000000000013", locale: "fr", title: "Appartement F3 à Constantine Centre", description: "Appartement de 85m² au 3ème étage dans le centre de Constantine.", slug: "appartement-f3-constantine-centre" },
    { listing_id: "b0000000-0000-0000-0000-000000000014", locale: "fr", title: "Villa familiale à El Khroub", description: "Spacieuse villa de 220m² avec jardin et garage à El Khroub.", slug: "villa-familiale-el-khroub" },
    { listing_id: "b0000000-0000-0000-0000-000000000015", locale: "fr", title: "F2 en location à Constantine", description: "Appartement F2 de 55m² au RDC. Proche université et commerces.", slug: "f2-location-constantine" },
    { listing_id: "b0000000-0000-0000-0000-000000000016", locale: "fr", title: "Appartement F4 vendu à Constantine", description: "Appartement de standing de 130m² au 5ème étage avec ascenseur.", slug: "appartement-f4-vendu-constantine" },
    { listing_id: "b0000000-0000-0000-0000-000000000017", locale: "fr", title: "Bureau à louer Constantine Centre", description: "Bureau professionnel de 150m² au 2ème étage.", slug: "bureau-louer-constantine-centre" },
    { listing_id: "b0000000-0000-0000-0000-000000000018", locale: "fr", title: "Appartement F3 à Blida Centre", description: "Appartement de 100m² au 4ème étage avec ascenseur et balcon.", slug: "appartement-f3-blida-centre" },
    { listing_id: "b0000000-0000-0000-0000-000000000019", locale: "fr", title: "Villa avec jardin à Blida", description: "Grande villa de 250m² avec jardin arboré et garage.", slug: "villa-jardin-blida" },
    { listing_id: "b0000000-0000-0000-0000-000000000020", locale: "fr", title: "F2 meublé à Blida", description: "Appartement F2 meublé de 70m² au 3ème étage.", slug: "f2-meuble-blida" },
    { listing_id: "b0000000-0000-0000-0000-000000000021", locale: "fr", title: "Entrepôt à louer Blida zone industrielle", description: "Grand entrepôt de 800m² avec parking poids lourds.", slug: "entrepot-louer-blida-zone-industrielle" },
    { listing_id: "b0000000-0000-0000-0000-000000000022", locale: "fr", title: "Appartement F3 à Tizi Ouzou", description: "Appartement de 90m² au 2ème étage avec balcon.", slug: "appartement-f3-tizi-ouzou" },
    { listing_id: "b0000000-0000-0000-0000-000000000023", locale: "fr", title: "Villa traditionnelle à Tizi Ouzou", description: "Belle villa de 200m² avec jardin et garage. Style kabyle moderne.", slug: "villa-traditionnelle-tizi-ouzou" },
    { listing_id: "b0000000-0000-0000-0000-000000000024", locale: "fr", title: "F2 à louer à Béjaïa", description: "Petit appartement F2 de 60m² au RDC à Béjaïa centre.", slug: "f2-louer-bejaia" },
    { listing_id: "b0000000-0000-0000-0000-000000000025", locale: "fr", title: "Terrain résidentiel Tizi Ouzou", description: "Terrain de 400m² en zone résidentielle. Vue sur montagne.", slug: "terrain-residentiel-tizi-ouzou" },
    { listing_id: "b0000000-0000-0000-0000-000000000026", locale: "fr", title: "Ferme avec terrain à Béjaïa", description: "Exploitation agricole de 2000m² avec source d'eau et électricité.", slug: "ferme-terrain-bejaia" },
    { listing_id: "b0000000-0000-0000-0000-000000000027", locale: "fr", title: "Immeuble de rapport à Tizi Ouzou", description: "Immeuble de 5 étages avec 10 appartements.", slug: "immeuble-rapport-tizi-ouzou" },
    { listing_id: "b0000000-0000-0000-0000-000000000028", locale: "fr", title: "Appartement vue mer pour vacances Alger", description: "F2 meublé avec vue sur mer pour location vacances.", slug: "appartement-vue-mer-vacances-alger" },
    { listing_id: "b0000000-0000-0000-0000-000000000029", locale: "fr", title: "Villa avec piscine vacances Oran", description: "Villa de vacances avec piscine et jardin. 4 chambres.", slug: "villa-piscine-vacances-oran" },
    { listing_id: "b0000000-0000-0000-0000-000000000030", locale: "fr", title: "Villa bord de mer vacances Béjaïa", description: "Villa de vacances avec vue sur mer à Béjaïa.", slug: "villa-bord-mer-vacances-bejaia" },
  ];
  const { error: transErr } = await supabase.from("listing_translations").upsert(translations, { onConflict: "listing_id,locale" });
  if (transErr) console.error("  ✗ translations:", transErr.message);
  else console.log("  ✓ 32 translations inserted");

  // 6. Subscriptions
  console.log("💳 Inserting subscriptions...");
  const { data: plans } = await supabase.from("plans").select("id, slug");
  const planMap = Object.fromEntries((plans || []).map((p) => [p.slug, p.id]));

  const subs = [
    { agency_id: "a0000000-0000-0000-0000-000000000001", plan_id: planMap.enterprise, status: "active", current_period_start: daysAgo(15), current_period_end: daysAgo(-15) },
    { agency_id: "a0000000-0000-0000-0000-000000000002", plan_id: planMap.pro, status: "active", current_period_start: daysAgo(10), current_period_end: daysAgo(-20) },
    { agency_id: "a0000000-0000-0000-0000-000000000003", plan_id: planMap.starter, status: "active", current_period_start: daysAgo(20), current_period_end: daysAgo(-10) },
    { agency_id: "a0000000-0000-0000-0000-000000000004", plan_id: planMap.pro, status: "active", current_period_start: daysAgo(5), current_period_end: daysAgo(-25) },
    { agency_id: "a0000000-0000-0000-0000-000000000005", plan_id: planMap.starter, status: "trialing", current_period_start: new Date().toISOString(), current_period_end: daysAgo(-14) },
  ];
  const { error: subsErr } = await supabase.from("subscriptions").insert(subs);
  if (subsErr) console.error("  ✗ subscriptions:", subsErr.message);
  else console.log("  ✓ 5 subscriptions inserted");

  // 7. AI Prompts
  console.log("🤖 Inserting AI prompts...");
  const { error: aiErr } = await supabase.from("ai_prompts").upsert([
    { name: "generate_listing_description", description: "Génère une description immobilière professionnelle", system_prompt: "Tu es un expert en rédaction immobilière en Algérie.", user_prompt_template: "Génère une description pour : Type: {{property_type}}, Surface: {{surface_m2}}m²", model: "claude-sonnet-4-20250514" },
    { name: "translate_listing", description: "Traduit une annonce immobilière", system_prompt: "Tu es un traducteur professionnel spécialisé en immobilier.", user_prompt_template: "Traduis de {{source_locale}} vers {{target_locale}} :\n{{title}}\n{{description}}", model: "claude-sonnet-4-20250514" },
  ], { onConflict: "name" });
  if (aiErr) console.error("  ✗ ai_prompts:", aiErr.message);
  else console.log("  ✓ 2 AI prompts inserted");

  // 8. Agency stats
  console.log("📊 Inserting agency stats...");
  const stats = [];
  for (let d = 6; d >= 0; d--) {
    const date = new Date(now - d * 86400000).toISOString().split("T")[0];
    stats.push({ agency_id: "a0000000-0000-0000-0000-000000000001", stat_date: date, total_views: 30 + Math.floor(Math.random() * 40), total_leads: Math.floor(Math.random() * 7), total_listings: 7 });
    stats.push({ agency_id: "a0000000-0000-0000-0000-000000000002", stat_date: date, total_views: 20 + Math.floor(Math.random() * 30), total_leads: Math.floor(Math.random() * 5), total_listings: 6 });
  }
  const { error: statsErr } = await supabase.from("agency_stats_daily").upsert(stats, { onConflict: "agency_id,stat_date" });
  if (statsErr) console.error("  ✗ stats:", statsErr.message);
  else console.log("  ✓ 14 daily stats inserted");

  console.log("\n✅ Seed complete!");
}

seed().catch(console.error);
